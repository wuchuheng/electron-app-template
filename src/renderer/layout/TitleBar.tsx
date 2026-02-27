import React from 'react';
import packageJson from '../../../package.json';
import { useUpdateSystem } from '../hooks/useUpdateSystem';
import { Tag } from 'antd';
import { WindowControlButtons, WindowIcons } from '../components/WindowControlButtons';

const ThemeIcon = ({ isDark }: { isDark: boolean }) =>
  isDark ? WindowIcons.MoonIcon : WindowIcons.SunIcon;

interface TitleBarProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ isDarkTheme, onToggleTheme, onToggleLanguage }) => {
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
    <div className="titlebar flex items-center justify-between px-2 py-2 h-titlebar select-none drag text-text-primary">
      {/* Left side: App name */}
      <div className="flex items-center space-x-3 no-drag">
        <span className="text-sm font-medium opacity-80">{packageJson.productName}</span>
      </div>

      {/* Right side: Update tag, Language, Theme, Window controls */}
      <div className="flex items-center space-x-1 no-drag">
        {status === 'ready' && info && (
          <Tag
            color="green"
            className="text-xs cursor-pointer"
            onClick={handleUpdateClick}
          >
            Update Ready: v{info.version}
          </Tag>
        )}

        <button
          onClick={onToggleLanguage}
          className="titlebar-button p-2 rounded-md hover:bg-hover hover:text-text-primary transition-all duration-200"
          aria-label="Switch Language"
        >
          {WindowIcons.LanguageIcon}
        </button>

        <button
          onClick={onToggleTheme}
          className="titlebar-button p-2 rounded-md hover:bg-hover hover:text-text-primary transition-all duration-200"
          aria-label="Toggle Theme"
        >
          <ThemeIcon isDark={isDarkTheme} />
        </button>

        <WindowControlButtons
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default TitleBar;