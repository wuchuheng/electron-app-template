import React, { useCallback, useState, useEffect, createContext, useMemo } from 'react';
import TitleBar from './TitleBar';
import { ConfigProvider, theme, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { Bootloading } from './Bootloading';
import { MessageInstance } from 'antd/es/message/interface';
import { useLocation } from 'react-router-dom';

export const MessageContext = createContext<MessageInstance | undefined>(undefined);

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayoutContent: React.FC<{
  children: React.ReactNode;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}> = ({ children, isDarkTheme, onToggleTheme, onToggleLanguage }) => {
  const location = useLocation();
  const isUpdateDialog = location.pathname.includes('/update-dialog');

  if (isUpdateDialog) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[100vh] flex-col bg-background-primary">
      <TitleBar isDarkTheme={isDarkTheme} onToggleTheme={onToggleTheme} onToggleLanguage={onToggleLanguage} />
      <main className="flex-1 overflow-y-auto">
        <Bootloading>{children}</Bootloading>
      </main>
    </div>
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    setIsDarkTheme(false);
  }, []);

  const onToggleTheme = useCallback(() => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
  }, []);

  const onToggleLanguage = useCallback(() => {
    const newLang = i18n.language.startsWith('en') ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  }, [i18n]);

  const antdTheme = useMemo(
    () => ({
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 6,
      },
      algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }),
    [isDarkTheme]
  );

  return (
    <ConfigProvider theme={antdTheme}>
      {contextHolder}
      <MessageContext.Provider value={messageApi}>
        <MainLayoutContent
          isDarkTheme={isDarkTheme}
          onToggleTheme={onToggleTheme}
          onToggleLanguage={onToggleLanguage}
        >
          {children}
        </MainLayoutContent>
      </MessageContext.Provider>
    </ConfigProvider>
  );
};