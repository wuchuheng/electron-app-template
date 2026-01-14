import { getMainWindow } from '../../main';

const minimize = async () => {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
};

export default minimize;
