import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateSystem } from '../hooks/useUpdateSystem';
import { useAppTheme } from '../hooks/useAppTheme';

import { Tag } from 'antd';
import { WindowControlButtons, WindowIcons } from '../components/WindowControlButtons';

const ThemeIcon = ({ isDark }: { isDark: boolean }) => (isDark ? WindowIcons.MoonIcon : WindowIcons.SunIcon);

interface TitleBarProps {
  onToggleLanguage: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ onToggleLanguage }) => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { status, info, openUpdateWindow } = useUpdateSystem();

  const handleMinimize = () => window.electron.window.minimize();
  const handleMaximize = () => window.electron.window.maximize();
  const handleClose = () => window.electron.window.close();

  const handleUpdateClick = () => {
    if (status === 'ready' && info) {
      openUpdateWindow();
    }
  };

  return (
    <div className="titlebar drag flex h-titlebar select-none items-center justify-between px-2 py-2 text-text-primary">
      {/* Left side: App name */}
      <div className="no-drag flex items-center space-x-3">
        <span className="text-sm font-medium opacity-80">{t('appName')}</span>
      </div>

      {/* Right side: Update tag, Language, Theme, Window controls */}
      <div className="no-drag flex items-center space-x-1">
        {status === 'ready' && info && (
          <Tag color="green" className="cursor-pointer text-xs" onClick={handleUpdateClick}>
            Update Ready: v{info.version}
          </Tag>
        )}

        <button
          onClick={onToggleLanguage}
          className="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary"
          aria-label="Switch Language"
        >
          {WindowIcons.LanguageIcon}
        </button>

        <button
          onClick={toggleTheme}
          className="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary"
          aria-label="Toggle Theme"
        >
          <ThemeIcon isDark={isDarkMode} />
        </button>

        <WindowControlButtons onMinimize={handleMinimize} onMaximize={handleMaximize} onClose={handleClose} />
      </div>
    </div>
  );
};

export default TitleBar;
