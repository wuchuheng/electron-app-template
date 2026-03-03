import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import { parseDocument } from 'yaml';
import { PLATFORM_MAP } from '../src/shared/platform-utils';
import { getIsTestRelease, getRemoteRoot } from '../src/shared/update-config';
import packageJson from '../package.json';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ===========================================
// Configuration & Types
// ===========================================

// Detect test release from command line flag --test
const isTestRelease = getIsTestRelease();
if (isTestRelease) {
  process.env.IS_TEST_RELEASE = 'true';
}

const SSH_ALIAS = process.env.RELEASE_SSH_ALIAS || 'tc';
const REMOTE_ROOT = getRemoteRoot(process.env);
const RELEASE_FILE_PATTERNS = [
  '.exe',
  '.dmg',
  '.AppImage',
  '.snap',
  '.deb',
  '.rpm',
  '.blockmap',
  'latest.yml',
  'latest-mac.yml',
  'latest-linux.yml',
];

interface FileStatus {
  name: string;
  localPath: string;
  hash: string;
  isYml: boolean;
  needsUpload: boolean;
}

interface ReleaseContext {
  version: string;
  platform: string;
  arch: string;
  distDir: string;
  remotePath: string;
}

// ===========================================
// Utility Functions
// ===========================================

function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function log(level: 'info' | 'success' | 'warn' | 'error' | 'step', message: string) {
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const colors = {
    info: '\x1b[34m', // Blue
    success: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    step: '\x1b[35m', // Magenta
  };

  const levelName = level.toUpperCase();
  const coloredLevel = `${bold}${colors[level]}${levelName}${reset}`;

  console.log(`[${getTimestamp()}] ${coloredLevel}: ${message}`);
}

function runCommand(cmd: string, silent = false) {
  if (!silent) log('info', `Executing: ${cmd}`);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return execSync(cmd, { stdio: silent ? 'pipe' : 'inherit', shell: true as any, encoding: 'utf-8' });
  } catch (error) {
    if (!silent) log('error', `Command failed: ${cmd}`);
    throw error;
  }
}

function getFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// ===========================================
// Core Logic Functions
// ===========================================

/**
 * Extract release notes from CHANGELOG.md
 */
async function extractReleaseNotes(version: string): Promise<string> {
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
  const defaultNotes = `### Version ${version}\n- Bug fixes and performance improvements.`;

  if (!fs.existsSync(changelogPath)) return defaultNotes;

  try {
    const content = fs.readFileSync(changelogPath, 'utf-8');
    const escapedVersion = version.replace(/\./g, '\\.');
    const versionRegex = new RegExp(`^##\\s+\\[?v?${escapedVersion}\\]?\\s+-\\s+\\d{4}-\\d{2}-\\d{2}`, 'm');

    const match = content.match(versionRegex);
    if (!match || match.index === undefined) return defaultNotes;

    const startIndex = match.index + match[0].length;
    const remainingContent = content.slice(startIndex);
    const nextMatch = remainingContent.match(/^##\\s+/m);

    let body = nextMatch ? remainingContent.slice(0, nextMatch.index).trim() : remainingContent.trim();
    body = body.split(/^---/m)[0].trim();

    return body || defaultNotes;
  } catch {
    return defaultNotes;
  }
}

/**
 * Update YML files in dist directory with release notes
 */
async function updateYmlFiles(distDir: string, version: string) {
  log('step', 'Processing manifest files...');
  const ymlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.yml'));
  const releaseNotes = await extractReleaseNotes(version);
  log('info', `Extracted release notes for ${version} (${releaseNotes.length} chars)`);

  for (const ymlFile of ymlFiles) {
    const ymlPath = path.join(distDir, ymlFile);
    const doc = parseDocument(fs.readFileSync(ymlPath, 'utf-8'));
    doc.set('releaseNotes', releaseNotes);
    fs.writeFileSync(ymlPath, doc.toString());
    log('info', `Updated ${ymlFile}`);
  }
}

/**
 * Scan dist directory and identify files to upload
 */
function scanFiles(ctx: ReleaseContext): FileStatus[] {
  const files = fs
    .readdirSync(ctx.distDir)
    .filter(f => RELEASE_FILE_PATTERNS.some(pattern => f.endsWith(pattern) || f === pattern.replace('.', '')));

  return files.map(name => ({
    name,
    localPath: path.join(ctx.distDir, name),
    hash: getFileHash(path.join(ctx.distDir, name)),
    isYml: name.endsWith('.yml'),
    needsUpload: true,
  }));
}

/**
 * Batch check remote file hashes via SSH
 */
function checkRemoteStatus(files: FileStatus[], ctx: ReleaseContext) {
  log('step', `Checking ${files.length} file(s) on remote...`);

  try {
    const fileNamesQuery = files.map(f => `'${f.name}'`).join(' ');
    const remoteHashesRaw = runCommand(
      `ssh ${SSH_ALIAS} "cd '${ctx.remotePath}' && sha256sum ${fileNamesQuery} 2>/dev/null || true"`,
      true
    ) as string;

    const remoteHashMap = new Map<string, string>();
    remoteHashesRaw.split('\n').forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const hash = parts[0];
        let name = parts.slice(1).join(' ');
        if (name.startsWith('*')) name = name.slice(1);
        remoteHashMap.set(name, hash);
      }
    });

    const upToDate: string[] = [];
    const pending: string[] = [];

    for (const file of files) {
      const remoteHash = remoteHashMap.get(file.name);
      if (remoteHash === file.hash) {
        file.needsUpload = false;
        upToDate.push(file.name);
      } else {
        const reason = remoteHash ? 'changed (hash mismatch)' : 'missing on remote';
        pending.push(`${file.name} - ${reason}`);
      }
    }

    if (upToDate.length > 0) {
      log('info', `Up-to-date files (${upToDate.length}):`);
      upToDate.forEach(f => console.log(`    - ${f}`));
    }

    if (pending.length > 0) {
      log('warn', `Pending changes (${pending.length}):`);
      pending.forEach(f => console.log(`    - ${f}`));
    }
  } catch {
    log('warn', 'Could not batch check remote hashes. Uploading all.');
  }
}

/**
 * Upload a subset of files
 */
function uploadFiles(files: FileStatus[], ctx: ReleaseContext, label: string) {
  const toUpload = files.filter(f => f.needsUpload);
  if (toUpload.length === 0) {
    log('success', `No ${label} need uploading.`);
    return;
  }

  log('step', `Uploading ${label} (${toUpload.length} files)...`);
  for (const file of toUpload) {
    log('info', `Transferring ${file.name}...`);
    const relativePath = path.relative(process.cwd(), file.localPath).replace(/\\/g, '/');
    runCommand(`scp "${relativePath}" ${SSH_ALIAS}:"${ctx.remotePath}/"`);
  }
}

/**
 * Update local dev configuration
 */
function updateDevAppUpdateYml() {
  const devUpdateUrl = process.env.DEV_UPDATE_SERVER_URL || 'https://static.example.com';
  const devAppUpdatePath = path.resolve(__dirname, '../dev-app-update.yml');
  const content = `provider: generic\nurl: ${devUpdateUrl}\nupdaterCacheDirName: ${packageJson.name}-updater\n`;
  fs.writeFileSync(devAppUpdatePath, content);
  log('success', 'dev-app-update.yml updated');
}

// ===========================================
// Main Execution
// ===========================================

async function main() {
  log('info', 'Starting Release Update Process');

  const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
  const version = packageJson.version;
  const platform = PLATFORM_MAP.get(process.platform) ?? process.platform;
  const arch = process.arch;
  const remotePath = `${REMOTE_ROOT}/${platform}/${arch}`;

  const ctx: ReleaseContext = {
    version,
    platform,
    arch,
    distDir: path.resolve(__dirname, '../dist', platform, arch),
    remotePath,
  };

  log('info', `Version: ${version} | Platform: ${platform}/${arch}`);
  log('info', `Remote: ${SSH_ALIAS}:${remotePath}`);
  if (isTestRelease) log('info', 'Mode: TEST RELEASE');

  // 1. Build
  log('step', 'Building Package...');
  runCommand('npm run manage package');

  if (!fs.existsSync(ctx.distDir)) {
    log('error', `Dist directory not found: ${ctx.distDir}`);
    process.exit(1);
  }

  // 2. Process YML
  await updateYmlFiles(ctx.distDir, version);

  // 3. Scan and Check Status
  runCommand(`ssh ${SSH_ALIAS} "mkdir -p '${remotePath}'"`, true);
  const allFiles = scanFiles(ctx);
  checkRemoteStatus(allFiles, ctx);

  // 4. Upload Part 1: Binaries & Assets
  uploadFiles(
    allFiles.filter(f => !f.isYml),
    ctx,
    'binaries'
  );

  // 5. Upload Part 2: Manifests (latest.yml)
  uploadFiles(
    allFiles.filter(f => f.isYml),
    ctx,
    'manifests'
  );

  // 6. Finalize
  updateDevAppUpdateYml();

  log('success', 'Release Complete!');
  log('info', `Remote Path: ${SSH_ALIAS}:${remotePath}`);
  log('info', 'Test locally: npm start');
  log('info', 'Revert version: git checkout package.json');
}

main().catch(error => {
  console.error('\n❌ Release failed:');
  console.error(error);
  process.exit(1);
});
