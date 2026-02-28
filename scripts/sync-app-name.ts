/**
 * Sync App Name from package.json to all config files
 *
 * Single source of truth: package.json → productName
 *
 * Files updated:
 * - electron-builder.yml (protocols)
 * - dev-app-update.yml (updaterCacheDirName)
 * - app-update.yml (updaterCacheDirName)
 * - scripts/release-update.ts (updaterCacheDirName string)
 */

import fs from 'fs';
import path from 'path';
import { parseDocument } from 'yaml';

// ===========================================
// Types
// ===========================================

interface PackageJson {
  name: string;
  productName: string;
}

// ===========================================
// Functions
// ===========================================

/**
 * Convert app name to kebab-case for protocol/ID usage
 */
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Read package.json
 */
function readPackageJson(rootDir: string): PackageJson {
  const filePath = path.join(rootDir, 'package.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Update YAML file while preserving comments
 */
function updateYamlFile(
  filePath: string,
  updates: (doc: ReturnType<typeof parseDocument>) => void
): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const doc = parseDocument(content);

  updates(doc);

  fs.writeFileSync(filePath, doc.toString());
}

/**
 * Update electron-builder.yml protocols section
 */
function updateElectronBuilder(rootDir: string, kebabName: string): void {
  const filePath = path.join(rootDir, 'electron-builder.yml');

  updateYamlFile(filePath, doc => {
    // Ensure protocols exists
    if (!doc.has('protocols')) {
      doc.set('protocols', {});
    }

    const protocols = doc.get('protocols');
    if (typeof protocols === 'object' && protocols !== null) {
      const protocolsMap = protocols as Map<string, unknown>;
      protocolsMap.set('name', kebabName);
      protocolsMap.set('schemes', [kebabName]);
      doc.set('protocols', protocolsMap);
    }
  });

  console.log(`  ✓ Updated electron-builder.yml`);
}

/**
 * Update updater cache dir name in YAML file
 */
function updateUpdaterCacheDir(rootDir: string, relativePath: string, kebabName: string): void {
  const filePath = path.join(rootDir, relativePath);

  updateYamlFile(filePath, doc => {
    doc.set('updaterCacheDirName', `${kebabName}-updater`);
  });

  console.log(`  ✓ Updated ${relativePath}`);
}

/**
 * Update scripts/release-update.ts
 * Note: This is a TypeScript file with embedded YAML string, not a YAML file
 */
function updateReleaseScript(rootDir: string, kebabName: string): void {
  const filePath = path.join(rootDir, 'scripts/release-update.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find the embedded yaml template and update updaterCacheDirName
  const doc = parseDocument(content);

  // Use string replace for the template literal content
  // The pattern matches: updaterCacheDirName: <value>
  const lines = content.split('\n');
  const updatedLines = lines.map(line => {
    if (line.includes('updaterCacheDirName:')) {
      // Preserve indentation and everything before/after
      const match = line.match(/^(\s*updaterCacheDirName:\s*)[^\n]+$/);
      if (match) {
        return `${match[1]}${kebabName}-updater`;
      }
    }
    return line;
  });

  fs.writeFileSync(filePath, updatedLines.join('\n'));
  console.log(`  ✓ Updated scripts/release-update.ts`);
}

// ===========================================
// Main
// ===========================================

function main(): void {
  const rootDir = path.resolve(__dirname, '..');

  console.log('🔄 Syncing app name from package.json...\n');

  const pkg = readPackageJson(rootDir);
  const kebabName = toKebabCase(pkg.productName);

  console.log(`  Product Name: ${pkg.productName}`);
  console.log(`  Kebab Case: ${kebabName}\n`);

  // Update all files
  updateElectronBuilder(rootDir, kebabName);
  updateUpdaterCacheDir(rootDir, 'dev-app-update.yml', kebabName);
  updateUpdaterCacheDir(rootDir, 'app-update.yml', kebabName);
  updateReleaseScript(rootDir, kebabName);

  console.log('\n✅ App name synced successfully!');
}

main();