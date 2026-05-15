import { createI18n } from 'vue-i18n'
import { enTranslations, zhTranslations } from '@/shared/locales'

export default createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: {
    en: enTranslations,
    zh: zhTranslations,
  },
})
