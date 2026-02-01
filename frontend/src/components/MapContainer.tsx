import { useAppTranslation } from '@/hooks/useTranslation'
import { TrajectoryComparison } from '@/components/TrajectoryComparison'

export function MapContainer() {
  const { t } = useAppTranslation()

  return (
    <div className="flex-1 flex flex-col bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden min-h-[500px]">
      {/* 地图标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
        <h2 className="text-sm font-medium text-white">{t('map.trajectoryCompare')}</h2>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
            <span>{t('map.originalTrack')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" aria-hidden="true" />
            <span>{t('map.repairedTrack')}</span>
          </span>
        </div>
      </div>

      {/* 地图区域 */}
      <div className="flex-1 min-h-[450px]">
        <TrajectoryComparison />
      </div>
    </div>
  )
}
