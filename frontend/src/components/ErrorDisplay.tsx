import { useAppTranslation } from '@/hooks/useTranslation'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  suggestions?: string[]
}

export function ErrorDisplay({ error, onRetry, suggestions }: ErrorDisplayProps) {
  const { t } = useAppTranslation()

  const defaultSuggestions = [
    t('errors.suggestion1'),
    t('errors.suggestion2'),
    t('errors.suggestion3')
  ]

  const displaySuggestions = suggestions || defaultSuggestions

  return (
    <div className="border border-red-500/30 rounded-2xl p-6 bg-red-500/5" role="alert" aria-live="assertive">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400">{t('errors.title')}</h3>
          <p className="text-red-300 mt-1">{error}</p>
          {displaySuggestions && displaySuggestions.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="font-medium">{t('errors.suggestions')}</li>
              {displaySuggestions.map((s, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 text-red-400" aria-hidden="true">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium min-h-[44px] flex items-center justify-center"
            >
              {t('common.retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
