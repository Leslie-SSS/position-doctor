import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translations
import zh from './zh'
import en from './en'

const resources = {
  zh: { translation: zh },
  en: { translation: en }
}

// Get saved language from localStorage
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('position-doctor-language')
    if (saved === 'zh' || saved === 'en') {
      return saved
    }
  }
  return 'zh' // 默认中文
}

// Save language to localStorage
export const saveLanguage = (lng: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('position-doctor-language', lng)
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(), // 从 localStorage 读取
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
