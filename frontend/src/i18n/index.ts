import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import resources from './locales'

const saved = localStorage.getItem('lang') || 'en'

i18n.use(initReactI18next).init({
  resources,
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
