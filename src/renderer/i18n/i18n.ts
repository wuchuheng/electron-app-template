import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  home: {
    title: 'Welcome to App-name!',
    successMessage: 'Application running successfully!',
    description:
      'Thank you for installing our application. This desktop app is built with Electron, React, and Tailwind CSS.',
    gettingStarted: {
      title: 'Getting Started',
      description: 'Explore the features and functionality available in the application.',
    },
    needHelp: {
      title: 'Need Help?',
      description: 'Check out our documentation or contact support for assistance.',
    },
  },
};

// Chinese translations
const zhTranslations = {
  home: {
    title: '欢迎使用 App-name！',
    successMessage: '应用程序运行成功！',
    description: '感谢您安装我们的应用程序。这个桌面应用是使用 Electron、React 和 Tailwind CSS 构建的。',
    gettingStarted: {
      title: '开始使用',
      description: '探索应用程序中可用的功能和特性。',
    },
    needHelp: {
      title: '需要帮助？',
      description: '查看我们的文档或联系支持以获得帮助。',
    },
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
    },
    fallbackLng: 'zh',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

export default i18n;
