import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import uk from './uk.json'
import type { Language } from '../storage/types'

export function initI18n(language: Language) {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources: { en: { translation: en }, uk: { translation: uk } },
      lng: language,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    })
  } else {
    void i18n.changeLanguage(language)
  }
  document.documentElement.lang = language
  return i18n
}

export { i18n }
