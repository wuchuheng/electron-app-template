import { app, BrowserWindow } from 'electron';
import { setupAllIpcHandlers } from './ipc';
import { createWindow } from './windows/windowFactory';
import { bootload } from './services/bootload.service';
import { initDB } from './database/data-source';
import { logger } from './utils/logger';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

export const getMainWindow = () => mainWindow;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  try {
    // 2. Handle the logic.
    // 2.1 Create the main window.
    mainWindow = await createWindow();

    // 2.2 Setup all IPC handlers
    setupAllIpcHandlers();

    // 2.3 Bootload the application
    bootload.register({ title: 'Initializing Database ...', load: initDB });
    await bootload.boot();
  } catch (error) {
    logger.error(`Startup failed: ${error instanceof Error ? error.message : String(error)}`);
    app.quit();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
      .then(window => {
        mainWindow = window;
      })
      .catch(error => {
        logger.error(`Failed to re-create window: ${error instanceof Error ? error.message : String(error)}`);
      });
  }
});
