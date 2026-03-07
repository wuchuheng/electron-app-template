import { createLogger, getPaths, createI18n } from '@wuchuheng/electron-template-core';
import packageJson from '@/../package.json';
import { zhTranslations, enTranslations } from '../shared/locales';

/**
 * Initialize the core engines with project-specific configuration.
 */

// 1. Paths
export const appPaths = getPaths(packageJson.name);

// 2. Logger
export const logger = createLogger({
  logDir: appPaths.logs,
});

// 3. I18n
export const i18n = createI18n({
  translations: {
    zh: zhTranslations,
    en: enTranslations,
  },
});

export const t = i18n.t.bind(i18n);
