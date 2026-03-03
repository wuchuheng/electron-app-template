import path from 'path';
import fs from 'fs';
import parseChangelog from 'changelog-parser';
import packageJson from '../package.json';

// ===========================================
// Utility Functions
// ===========================================

export function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

export function log(level: 'info' | 'success' | 'warn' | 'error' | 'step', message: string) {
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

/**
 * Extract release notes from CHANGELOG.md using standard changelog-parser
 */
export async function extractReleaseNotes(version: string): Promise<string> {
  const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
  const defaultNotes = `### Version ${version}\n- Bug fixes and performance improvements.`;

  if (!fs.existsSync(changelogPath)) {
    log('warn', `CHANGELOG.md not found at ${changelogPath}`);
    return defaultNotes;
  }

  try {
    const content = fs.readFileSync(changelogPath, 'utf-8');
    const result = await parseChangelog({ text: content, removeMarkdown: false });

    // Find the specific version.
    // changelog-parser might return version as "1.0.5-beta.0" or with brackets.
    // Based on its code: this.current.version = semver.exec(line)[1]
    let versionData = result.versions.find(v => v.version === version || v.title.includes(version));

    // Fallback: If the exact version isn't found, use the latest version from the changelog
    if (!versionData && result.versions.length > 0) {
      log(
        'warn',
        `Version ${version} not found in CHANGELOG.md. Falling back to the latest version: ${result.versions[0].version}`
      );
      versionData = result.versions[0];
    }

    if (!versionData) {
      log('warn', `No version information found in CHANGELOG.md`);
      return defaultNotes;
    }

    if (!versionData.body) {
      log('warn', `Release body for ${version} is empty`);
      return defaultNotes;
    }

    return versionData.body.trim();
  } catch (error) {
    log('warn', `Failed to extract notes from CHANGELOG.md: ${error instanceof Error ? error.message : String(error)}`);
    return defaultNotes;
  }
}

async function main() {
  const version = packageJson.version || 'Unreleased';
  log('info', `Extracting release notes for version: ${version}`);
  try {
    const notes = await extractReleaseNotes(version);
    console.log('Release Notes:\n', notes);
  } catch (err) {
    log('error', `Failed to extract release notes: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// if the flag is --debug, run the main function directly
if (process.argv.includes('--debug')) {
  main();
}
