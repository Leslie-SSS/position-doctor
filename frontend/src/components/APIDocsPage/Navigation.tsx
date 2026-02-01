import { useAppTranslation } from '@/hooks/useTranslation'

export interface NavItem {
  id: 'overview' | 'request' | 'response' | 'errors'
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'apiDocs.section.overview', icon: 'book' },
  { id: 'request', label: 'apiDocs.section.request', icon: 'send' },
  { id: 'response', label: 'apiDocs.section.response', icon: 'code' },
  { id: 'errors', label: 'apiDocs.section.errors', icon: 'server' },
]

function getIconPath(iconName: string): string {
  const icons: Record<string, string> = {
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    server: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  }
  return icons[iconName] || icons.code
}

interface NavigationProps {
  activeSection: string
  onSectionChange: (section: NavItem['id']) => void
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const { t } = useAppTranslation()

  return (
    <nav className="hidden lg:block w-56 flex-shrink-0">
      <div className="sticky top-20">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          {t('apiDocs.title')}
        </h2>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={getIconPath(item.icon)} />
                  </svg>
                  {t(item.label)}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
