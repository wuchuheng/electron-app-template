import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enTranslations, zhTranslations } from '../../shared/locales';

// eslint-disable-next-line import/no-named-as-default-member
i18next.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    zh: { translation: zhTranslations },
  },
  lng: 'zh', // Force default language to zh
  fallbackLng: 'zh',
  debug: false,
  interpolation: { escapeValue: false },
});

export default i18next;
