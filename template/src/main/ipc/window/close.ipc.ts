import { getMainWindow } from '../../main';

const closeWindow = async () => {
  const mainWindow = getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
};

export default closeWindow;
