import { Suspense } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/config'
import { useStore } from '@/hooks/useStore'
import { useAppTranslation } from '@/hooks/useTranslation'
import { FileUploader } from '@/components/FileUploader'
import { ResultPanel } from '@/components/ResultPanel'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { APIModal } from '@/components/APIModal'
import { APIDocsPage } from '@/pages/APIDocsPage'

function AppContent() {
  const { t } = useAppTranslation()
  const { uploadState, currentView, setView } = useStore()

  // Show API Docs page
  if (currentView === 'api-docs') {
    return <APIDocsPage />
  }

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative">
      {/* Simplified background (reduced animations for accessibility) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/80" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14">
              {/* Left - Logo and Brand */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">
                  Position<span className="text-cyan-400">Doctor</span>
                </span>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Right - API Docs + Language */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('api-docs')}
                  className="group/api-btn relative flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold overflow-hidden transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 0 0 1px rgba(6, 182, 212, 0.1), 0 4px 20px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)'
                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)'
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(6, 182, 212, 0.3), 0 0 30px rgba(6, 182, 212, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(6, 182, 212, 0.1), 0 4px 20px rgba(0, 0, 0, 0.4)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Animated gradient border */}
                  <span className="absolute inset-0 rounded-lg opacity-50" style={{
                    background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.5), rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5), rgba(6, 182, 212, 0.5))',
                    backgroundSize: '250% 100%',
                    animation: 'border-flow 6s linear infinite'
                  }} />

                  {/* Inner highlight ring */}
                  <span className="absolute inset-[1px] rounded-lg opacity-30 group-hover/api-btn:opacity-60 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)'
                    }}
                  />

                  {/* Shimmer sweep on hover */}
                  <span className="absolute inset-0 opacity-0 group-hover/api-btn:opacity-100 transition-opacity duration-300" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 60%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer-slow 2.5s ease-in-out infinite'
                  }} />

                  {/* Corner glow dots */}
                  <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-cyan-400/0 group-hover/api-btn:bg-cyan-400/80 transition-all duration-300 shadow-cyan-400/50" style={{ boxShadow: '0 0 8px rgba(6,182,212,0.8)' }} />
                  <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-indigo-400/0 group-hover/api-btn:bg-indigo-400/80 transition-all duration-300 delay-75" style={{ boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
                  <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-purple-400/0 group-hover/api-btn:bg-purple-400/80 transition-all duration-300 delay-100" style={{ boxShadow: '0 0 8px rgba(168,85,247,0.8)' }} />
                  <span className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-cyan-400/0 group-hover/api-btn:bg-cyan-400/80 transition-all duration-300 delay-75" style={{ boxShadow: '0 0 8px rgba(6,182,212,0.8)' }} />

                  {/* Scan line effect */}
                  <span className="absolute inset-0 opacity-0 group-hover/api-btn:opacity-40" style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
                    backgroundSize: '100% 200%',
                    animation: 'scan-vertical 3s ease-in-out infinite'
                  }} />

                  {/* Icon */}
                  <span className="relative z-10 flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300 group-hover/api-btn:scale-110 group-hover/api-btn:rotate-[8deg]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
                    }}
                  >
                    <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </span>

                  {/* Text */}
                  <span className="relative z-10 hidden sm:inline">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-wide">
                      OPEN {t('api.title')}
                    </span>
                  </span>
                </button>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" role="main">
          {uploadState === 'idle' || uploadState === 'uploading' || uploadState === 'processing' ? (
            <FileUploader />
          ) : uploadState === 'completed' ? (
            <ResultPanel />
          ) : <LoadingSpinner />}
        </main>
      </div>

      {/* API Modal (kept for compatibility) */}
      <APIModal />
    </div>
  )
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<LoadingSpinner />}>
        <AppContent />
      </Suspense>
    </I18nextProvider>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default App
