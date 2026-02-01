import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppTranslation } from '@/hooks/useTranslation'
import { downloadFile } from '@/utils/api'

type DownloadFormat = 'gpx' | 'kml' | 'json' | 'all'
type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error'

interface DownloadSectionProps {
  reportId: string
}

export function DownloadSection({ reportId }: DownloadSectionProps) {
  const { t } = useAppTranslation()
  const [downloadStates, setDownloadStates] = useState<Record<string, DownloadStatus>>({})
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const updateDownloadState = useCallback((format: string, status: DownloadStatus) => {
    setDownloadStates(prev => ({ ...prev, [format]: status }))
    if (status === 'success') {
      setTimeout(() => {
        setDownloadStates(prev => ({ ...prev, [format]: 'idle' }))
      }, 2000)
    }
    if (status === 'error') {
      setTimeout(() => {
        setDownloadStates(prev => ({ ...prev, [format]: 'idle' }))
      }, 3000)
    }
  }, [])

  const handleDownload = useCallback(async (format: DownloadFormat) => {
    setShowMenu(false)
    updateDownloadState(format, 'downloading')
    try {
      if (format === 'all') {
        await Promise.all([
          downloadFile('gpx', reportId),
          downloadFile('kml', reportId),
          downloadFile('json', reportId),
          downloadFile('geojson', reportId),
        ])
      } else {
        await downloadFile(format, reportId)
      }
      updateDownloadState(format, 'success')
    } catch {
      updateDownloadState(format, 'error')
    }
  }, [reportId, updateDownloadState])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const status = downloadStates['gpx'] || 'idle'

  return (
    <div className="flex-1 flex items-center gap-2 relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={status === 'downloading'}
        className="w-full min-h-[44px] px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2 disabled:bg-slate-700/50 disabled:cursor-not-allowed"
      >
        {status === 'downloading' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('common.downloading')}</span>
          </>
        ) : status === 'success' ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('common.complete')}</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>{t('common.download')}</span>
            <svg className={`w-3 h-3 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* 下拉菜单 */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {[
            { key: 'gpx', label: 'GPX' },
            { key: 'kml', label: 'KML' },
            { key: 'json', label: 'JSON' },
            { key: 'all', label: t('common.downloadAll'), primary: true },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleDownload(item.key as DownloadFormat)}
              className={`w-full min-h-[44px] px-4 py-2 text-sm text-left transition-colors ${
                item.primary ? 'text-cyan-400 hover:bg-slate-700/50' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
