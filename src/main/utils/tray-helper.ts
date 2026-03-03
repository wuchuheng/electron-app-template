import { app, Menu, Tray, nativeImage, BrowserWindow } from 'electron';
import { logger } from './logger';
import { APP_NAME } from '@/shared/constants';
import { getAppIconPath } from './path.util';
import { t } from './i18n';

let tray: Tray | null = null;

declare global {
  // eslint-disable-next-line no-var
  var isForceQuitting: boolean | undefined;
}

export const createTray = (
  getMainWindow: () => BrowserWindow | null,
  recreateMainWindow: () => Promise<BrowserWindow | null>
) => {
  if (tray) return tray;

  try {
    const finalIconPath = getAppIconPath();
    const icon = nativeImage.createFromPath(finalIconPath);

    if (icon.isEmpty()) {
      logger.error(`Tray icon is empty at path: ${finalIconPath}`);
    }

    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: t('tray.showApp'),
        click: async () => {
          const mainWindow = getMainWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            await recreateMainWindow();
          }
        },
      },
      { type: 'separator' },
      {
        label: t('tray.quit'),
        click: () => {
          // Use a custom property or global variable to indicate force quit
          global.isForceQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip(APP_NAME);
    tray.setContextMenu(contextMenu);

    tray.on('click', async () => {
      const mainWindow = getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      } else {
        await recreateMainWindow();
      }
    });

    logger.info('System tray created successfully');
    return tray;
  } catch (error) {
    logger.error(`Failed to create tray: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};
