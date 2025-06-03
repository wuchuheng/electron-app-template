import React from 'react';
import TitleBar from './TitleBar';

type MainLayoutProps = {
  children: React.ReactNode;
};
export const MainLayout: React.FC<MainLayoutProps> = props => {
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [language, setLanguage] = React.useState<string>('en');
  const languageList = ['en', 'zh'];

  const onToggleLanguage = () => {
    const index = languageList.indexOf(language);
    if (index === languageList.length - 1) {
      setLanguage(languageList[0]);
    } else {
      setLanguage(languageList[index + 1]);
    }
  };

  return (
    <>
      <div>
        <TitleBar
          isDarkTheme={isDarkTheme}
          onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
          onToggleLanguage={onToggleLanguage}
        />
        {props.children}
      </div>
    </>
  );
};
