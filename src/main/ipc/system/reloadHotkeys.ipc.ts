import { globalShortcut, BrowserWindow } from 'electron';
import { getDataSource } from '../../database/data-source';
import { Config } from '../../database/entities/config.entity';
import { CONFIG_KEYS } from '@/shared/constants';

const DEFAULT_HOTKEY = { toggleWindow: 'CommandOrControl+Alt+T' };

/**
 * Reloads global hotkeys from config.
 * Unregisters all existing shortcuts and registers the toggleWindow shortcut.
 */
const reloadHotkeys = async () => {
  // Unregister all existing shortcuts
  globalShortcut.unregisterAll();

  // Get hotkey config from database
  const repo = getDataSource().getRepository(Config);
  const configRow = await repo.findOneBy({ key: CONFIG_KEYS.HOTKEYS });
  const hotkeyConfig = configRow?.value ? JSON.parse(configRow.value) : DEFAULT_HOTKEY;

  // Register toggleWindow shortcut if defined
  if (hotkeyConfig?.toggleWindow) {
    try {
      globalShortcut.register(hotkeyConfig.toggleWindow, () => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      });
    } catch (error) {
      console.error(`Failed to register hotkey ${hotkeyConfig.toggleWindow}:`, error);
    }
  }

  return true;
};

export default reloadHotkeys;