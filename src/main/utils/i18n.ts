import { zhTranslations, enTranslations } from '../../shared/locales';

let currentLocale: 'zh' | 'en' = 'zh';

/**
 * Lightweight translation helper for the main process.
 * Reuses the same translation objects as the renderer.
 */
export const t = (key: string, options?: Record<string, string | number>): string => {
  const translations = currentLocale === 'zh' ? zhTranslations : enTranslations;

  // Navigate through the nested object using the dot-notation key (e.g., 'update.title')
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = translations;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Return the key itself if not found
    }
  }

  if (typeof result !== 'string') return key;

  // Basic placeholder replacement (e.g., {{version}} or {{appName}})
  if (options) {
    let finalString = result;
    for (const [optKey, optValue] of Object.entries(options)) {
      finalString = finalString.replace(new RegExp(`{{${optKey}}}`, 'g'), String(optValue));
    }
    return finalString;
  }

  return result;
};

/**
 * Set the locale for the main process translations.
 */
export const setLocale = (locale: 'zh' | 'en') => {
  currentLocale = locale;
};
