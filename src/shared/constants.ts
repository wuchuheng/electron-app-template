import packageJson from '../../package.json';

// Single source of truth for app name
export const APP_NAME = packageJson.productName;

export type ThemeConfig = {
  mode: 'system' | 'light' | 'dark';
  backgroundColor: string; // Hex
  opacity: number; // 0-1
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'system',
  backgroundColor: '#ffffff',
  opacity: 0.8,
};

export const CONFIG_KEYS = {
  THEME: 'theme_config',
  HOTKEYS: 'app_hotkeys',
  APP: 'app_config',
} as const;

export type AppConfig = {
  runInBackground: boolean;
  autoStart: boolean;
};

export const DEFAULT_APP_CONFIG: AppConfig = {
  runInBackground: true,
  autoStart: false,
};