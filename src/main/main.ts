import { app, BrowserWindow } from 'electron';
import path from 'path';
import * as dotenv from 'dotenv';
import * as childProcess from 'child_process';
import { setupAllIpcHandlers } from './ipc';
import { createWindow } from './windows/windowFactory';
import { initDB } from './database/data-source';
import { logger } from './utils/logger';
import { createTray } from './utils/tray-helper';
import { initUpdateService, checkForUpdates, handleAppQuitUpdate } from './services/update.service';
import { registerBootTask, runBootTasks } from './services/bootload.service';
import { getBaseDir } from './utils/path.util';

declare global {
  // eslint-disable-next-line no-var
  var isForceQuitting: boolean | undefined;
}

import { getCoreHello } from '@wuchuheng/electron-template-core';

// Ensure UTF-8 encoding on Windows
if (process.platform === 'win32') {
  process.env.LANG = 'en_US.UTF-8';
  // Force set console code page to UTF-8 for child processes and logging
  try {
    // Using child_process module directly
    childProcess.execSync('chcp 65001', { stdio: 'ignore' });
  } catch {
    // Fail silently if chcp is not available
  }
}

dotenv.config();

// Standardize application directory structure
// Move Chromium's internal system files into a subfolder to keep the root clean
app.setPath('userData', path.join(getBaseDir(), 'system'));

app.on('before-quit', () => {
  global.isForceQuitting = true;
  // Install pending update silently on quit (next launch will be new version)
  handleAppQuitUpdate();
});

let mainWindow: BrowserWindow | null = null;

export const getMainWindow = () => mainWindow;

/**
 * Recreates the main window if it has been closed.
 */
export const recreateMainWindow = async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  try {
    mainWindow = await createWindow();
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    return mainWindow;
  } catch (error) {
    logger.error(`Failed to recreate main window: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * Set up the single instance lock to prevent multiple instances of the app from running.
 */
const setupSingleInstanceLock = () => {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    return false;
  }

  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      recreateMainWindow();
    }
  });

  return true;
};

// Initialize single instance lock
if (setupSingleInstanceLock()) {
  app.on('ready', async () => {
    try {
      // 1. Initialize Tray
      createTray(getMainWindow, recreateMainWindow);
      logger.info(getCoreHello());

      // 2. Create the main window.
      mainWindow = await createWindow();
      mainWindow.on('closed', () => {
        mainWindow = null;
      });

      // 3. Setup all IPC handlers
      setupAllIpcHandlers();

      // 4. Initialize Update Service
      initUpdateService();
      checkForUpdates().catch(err => {
        logger.error('Initial update check failed:', err);
      });

      // 5. Bootload the application
      registerBootTask({ title: 'Initializing Database ...', load: initDB });
      await runBootTasks();
    } catch (error) {
      logger.error(`Startup failed: ${error instanceof Error ? error.message : String(error)}`);
      app.quit();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    recreateMainWindow();
  }
});
