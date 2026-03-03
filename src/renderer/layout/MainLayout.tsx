import React, { useMemo, useCallback } from 'react';
import TitleBar from './TitleBar';
import { ConfigProvider, theme as antdThemeEngine, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Bootloading } from './Bootloading';
import { useLocation, Outlet } from 'react-router-dom';
import { useAppTheme } from '../hooks/useAppTheme';
import { messageApiContext } from '../context/MessageContext';

const MainLayoutContent: React.FC<{
  onToggleLanguage: () => void;
}> = ({ onToggleLanguage }) => {
  const location = useLocation();
  const isUpdateDialog = location.pathname.includes('/update-dialog');

  if (isUpdateDialog) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen flex-col bg-background-primary transition-colors duration-300">
      <TitleBar onToggleLanguage={onToggleLanguage} />
      <main className="flex-1 overflow-y-auto">
        <Bootloading>
          <Outlet />
        </Bootloading>
      </main>
    </div>
  );
};

export const MainLayout: React.FC = () => {
  const { isDarkMode } = useAppTheme();
  const [messageApi, contextHolder] = message.useMessage();
  const { i18n } = useTranslation();

  const onToggleLanguage = useCallback(() => {
    const newLang = i18n.language.startsWith('en') ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  }, [i18n]);

  const themeConfig = useMemo(
    () => ({
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 6,
      },
      algorithm: isDarkMode ? antdThemeEngine.darkAlgorithm : antdThemeEngine.defaultAlgorithm,
    }),
    [isDarkMode]
  );

  return (
    <ConfigProvider theme={themeConfig}>
      {contextHolder}
      <messageApiContext.Provider value={messageApi}>
        <MainLayoutContent onToggleLanguage={onToggleLanguage} />
      </messageApiContext.Provider>
    </ConfigProvider>
  );
};
