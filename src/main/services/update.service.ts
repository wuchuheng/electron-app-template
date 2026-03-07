import { autoUpdater, UpdateInfo } from 'electron-updater';
import { app, BrowserWindow, dialog } from 'electron';
import { logger } from '@/main/core';
import { onStatusChange } from '../ipc/update/onStatusChange.ipc';
import { createUpdateWindow } from '../windows/windowFactory';
import { PLATFORM_MAP } from '@/shared/platform-utils';
import { getUpdateUrl as getBaseUpdateUrl } from '@/shared/update-config';
import type { UpdateState } from '@/shared/update-types';
import packageJson from '../../../package.json';

// --- Internal State ---
let state: UpdateState = {
  status: 'idle',
  info: null,
  progress: null,
  error: null,
};
let updateWindowInstance: BrowserWindow | null = null;
let updateCheckInterval: NodeJS.Timeout | null = null;
let lastNotifiedVersion: string | null = null;

const setState = (partial: Partial<UpdateState>) => {
  state = { ...state, ...partial };
  onStatusChange(state);
};

const getUpdateUrl = (): string | null => {
  let baseUrl: string | undefined;

  if (app.isPackaged) {
    // In production, use the helper from shared config (supports --test flag via process.argv)
    baseUrl = getBaseUpdateUrl(process.env as Record<string, string | undefined>);
  } else {
    // In development, use DEV_UPDATE_SERVER_URL directly
    baseUrl = process.env.DEV_UPDATE_SERVER_URL;
  }

  if (!baseUrl) {
    return null;
  }

  const platform = PLATFORM_MAP.get(process.platform) ?? process.platform;
  return new URL(`${baseUrl}/${platform}/${process.arch}`).toString();
};

const setupListeners = () => {
  autoUpdater.on('checking-for-update', () => {
    setState({ status: 'checking', error: null });
    logger.info('Checking for updates...');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    setState({ status: 'downloading', info, error: null });
    logger.info(`Update v${info.version} found. Downloading...`);
    // Mandatory: Download starts immediately on discovery
    autoUpdater.downloadUpdate().catch(err => {
      setState({ status: 'error', error: err.message });
      logger.error(`Download failed: ${err.message}`);
    });
  });

  autoUpdater.on('update-not-available', () => {
    setState({ status: 'idle', info: null });
    logger.info('No update available.');
  });

  autoUpdater.on('download-progress', progress => {
    state = {
      ...state,
      progress: {
        percent: Math.round(progress.percent),
        transferred: progress.transferred,
        total: progress.total,
        bytesPerSecond: progress.bytesPerSecond,
      },
    };
    onStatusChange(state);
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    setState({
      status: 'ready',
      info,
      progress: {
        percent: 100,
        transferred: info.files?.[0]?.size || 0,
        total: info.files?.[0]?.size || 0,
        bytesPerSecond: 0,
      },
    });
    logger.info(`Update v${info.version} downloaded.`);

    // Only show dialog if we haven't notified for this version yet
    if (lastNotifiedVersion !== info.version) {
      lastNotifiedVersion = info.version;
      showUpdateDialog(info).catch(err => {
        logger.error(`Failed to show update dialog: ${err.message}`);
      });
    } else {
      logger.info(`Update v${info.version} already notified, skipping dialog.`);
    }
  });

  autoUpdater.on('error', (err: Error) => {
    setState({ status: 'error', error: err.message });
    logger.error(`Update error: ${err.message}`);
  });
};

const showUpdateDialog = async (info: UpdateInfo) => {
  try {
    await openUpdateWindow();
  } catch {
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded.`,
      detail: 'The application must restart to apply the mandatory update.',
      buttons: ['Restart Now'],
      defaultId: 0,
      cancelId: 0, // Prevent cancelling by closing the dialog
    });
    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  }
};

// --- Public API ---

export const initUpdateService = () => {
  autoUpdater.autoDownload = false;
  autoUpdater.logger = logger;

  const url = getUpdateUrl();
  if (!url) {
    logger.info('Update server URL not configured, update service will be disabled.');
    return;
  }

  // Use normalized app name for cache directory to ensure differential updates work.
  const cacheDirName = `${packageJson.name}-updater`;
  // @ts-expect-error - updaterCacheDirName is not in the type definition but works at runtime
  autoUpdater.updaterCacheDirName = cacheDirName;
  logger.info(`Update cache directory set to: ${cacheDirName}`);

  if (!app.isPackaged) autoUpdater.forceDevUpdateConfig = true;
  try {
    autoUpdater.setFeedURL({ provider: 'generic', url });
    setupListeners();
    logger.info('Update service initialized');

    // Setup periodic check (every 1 minute)
    if (updateCheckInterval) clearInterval(updateCheckInterval);
    updateCheckInterval = setInterval(() => {
      // Skip periodic check if an update is already ready or being downloaded
      if (state.status === 'ready' || state.status === 'downloading') {
        return;
      }

      logger.info('Performing periodic update check...');
      checkForUpdates().catch(err => {
        logger.error('Periodic update check failed:', err);
      });
    }, 1000 * 60);
  } catch (err) {
    logger.error(`Failed to initialize update service: ${err}`);
  }
};

export const handleAppQuitUpdate = () => {
  if (state.status === 'ready') {
    logger.info('Installing pending update on quit (silent mode)...');
    // Silent mode: quit without restart, user will get new version on next launch
    autoUpdater.quitAndInstall(true, false);
  }
};

export const getUpdateState = (): UpdateState => state;

export const openUpdateWindow = async () => {
  if (updateWindowInstance && !updateWindowInstance.isDestroyed()) {
    updateWindowInstance.show();
    updateWindowInstance.focus();
    return updateWindowInstance;
  }

  updateWindowInstance = await createUpdateWindow();
  updateWindowInstance.on('closed', () => {
    updateWindowInstance = null;
  });
  return updateWindowInstance;
};

export const checkForUpdates = async () => {
  if (!getUpdateUrl()) {
    logger.info('Skipping update check: No update server URL configured.');
    return;
  }
  try {
    return await autoUpdater.checkForUpdates();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setState({ status: 'error', error: message });
    throw err;
  }
};

export const quitAndInstall = () => {
  if (state.status === 'ready') {
    autoUpdater.quitAndInstall(false, true);
  } else {
    logger.warn('quitAndInstall called but no update is ready');
  }
};
