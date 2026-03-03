/**
 * Utility functions for update configuration.
 * These are shared between the main process, build scripts, and potentially the renderer.
 */

/**
 * Checks if the current execution is for a test release.
 */
export const getIsTestRelease = () => {
  if (typeof process === 'undefined') return false;
  return (
    process.env.IS_TEST_RELEASE === 'true' || (typeof process.argv !== 'undefined' && process.argv.includes('--test'))
  );
};

/**
 * Gets the appropriate update URL based on whether it's a test release.
 */
export const getUpdateUrl = (env: Record<string, string | undefined>) => {
  return getIsTestRelease() ? env.TEST_UPDATE_SERVER_URL || '' : env.PROD_UPDATE_SERVER_URL || '';
};

/**
 * Gets the appropriate remote root for release upload based on whether it's a test release.
 */
export const getRemoteRoot = (env: Record<string, string | undefined>) => {
  return getIsTestRelease()
    ? env.TEST_REMOTE_ROOT || '/var/www/updates/test'
    : env.RELEASE_REMOTE_ROOT || '/var/www/updates';
};
