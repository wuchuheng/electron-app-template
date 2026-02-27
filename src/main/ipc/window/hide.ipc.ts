import { BrowserWindow } from 'electron';

/**
 * Hides the current window (used for update dialog minimize)
 */
const hideWindow = async () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow && !focusedWindow.isDestroyed()) {
    focusedWindow.hide();
  }
};

export default hideWindow;