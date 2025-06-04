import React from 'react';
import TitleBar from './TitleBar';
import { ConfigProvider, theme } from 'antd';

type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout: React.FC<MainLayoutProps> = props => {
  const [language, setLanguage] = React.useState<string>('en');
  const languageList = ['en', 'zh'];
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(false);

  // Initialize theme on component mount - default to light theme
  React.useEffect(() => {
    // Remove any existing dark class to ensure light theme is default
    document.documentElement.classList.remove('dark');
    setIsDarkTheme(false);
    console.log('Initialize theme on component mount - default to light theme');
  }, []);

  const onToggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
  };

  const onToggleLanguage = () => {
    const index = languageList.indexOf(language);
    if (index === languageList.length - 1) {
      setLanguage(languageList[0]);
    } else {
      setLanguage(languageList[index + 1]);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
        algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="h-[100vh] bg-background-primary flex flex-col">
        <TitleBar isDarkTheme={isDarkTheme} onToggleTheme={onToggleTheme} onToggleLanguage={onToggleLanguage} />
        <main className="flex-1 overflow-y-auto">{props.children}</main>
      </div>
    </ConfigProvider>
  );
};
