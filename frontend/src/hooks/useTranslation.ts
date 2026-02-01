import { useTranslation } from 'react-i18next'
import { useStore } from '@/hooks/useStore'
import { saveLanguage } from '@/i18n/config'

export function useAppTranslation() {
  const { t, i18n } = useTranslation()
  const { language, setLanguage } = useStore()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setLanguage(lng as 'zh' | 'en')
    saveLanguage(lng) // 保存到 localStorage
  }

  return { t, i18n, language, changeLanguage }
}
