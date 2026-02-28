/**
 * Platform utilities for cross-platform compatibility.
 *
 * Maps Node.js platform identifiers to electron-builder standard names.
 */

/**
 * Maps Node.js process.platform to electron-builder platform names.
 *
 * | Node.js platform | electron-builder |
 * |------------------|------------------|
 * | win32            | win              |
 * | darwin           | mac              |
 * | linux            | linux            |
 */
export const PLATFORM_MAP = new Map<NodeJS.Platform, string>([
  ['win32', 'win'],
  ['darwin', 'mac'],
  ['linux', 'linux'],
]);

/**
 * Gets the current platform name in electron-builder format.
 */
export function getBuilderPlatform(): string {
  return PLATFORM_MAP.get(process.platform) ?? process.platform;
}