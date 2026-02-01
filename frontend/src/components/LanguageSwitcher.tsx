import { useAppTranslation } from '@/hooks/useTranslation'

export function LanguageSwitcher() {
  const { t, language, changeLanguage } = useAppTranslation()

  return (
    <button
      onClick={() => changeLanguage(language === 'zh' ? 'en' : 'zh')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors duration-200"
      aria-label={t('language.switch')}
    >
      <span className={`text-sm font-medium ${language === 'zh' ? 'text-white' : 'text-slate-500'}`}>
        {t('language.zh')}
      </span>
      <span className="text-slate-600">/</span>
      <span className={`text-sm font-medium ${language === 'en' ? 'text-white' : 'text-slate-500'}`}>
        {t('language.en')}
      </span>
    </button>
  )
}
