import { useStore } from '@/hooks/useStore'
import { useAppTranslation } from '@/hooks/useTranslation'
import { MapContainer } from '@/components/MapContainer'
import { HealthScoreCard } from '@/components/HealthScoreCard'
import { AlgorithmEffect } from '@/components/AlgorithmEffect'
import { DownloadSection } from '@/components/DownloadSection'
import type { Anomaly } from '@/types'

export function ResultPanel() {
  const { resultData, processingTimeMs, reset } = useStore()
  const { t } = useAppTranslation()

  if (!resultData) return null

  const { corrected, diagnostics, reportId } = resultData
  const { healthScore, anomalies, fixedPoints, removedPoints, interpolatedPoints } = diagnostics

  // 解构统计数据
  const anomalyRemoved = fixedPoints || 0       // 异常点删除
  const simplifiedRemoved = removedPoints || 0  // 简化删除
  const interpolatedAdded = interpolatedPoints || 0 // 插值生成

  // 所有异常类型定义（固定顺序）
  const ALL_ANOMALY_TYPES = [
    { type: 'drift', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { type: 'jump', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { type: 'speed_anomaly', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { type: 'acceleration_anomaly', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { type: 'missing', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { type: 'density_anomaly', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { type: 'outlier', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  ] as const

  // 构建异常类型到数据的映射
  const anomalyMap = new Map<string, Anomaly>()
  for (const anomaly of anomalies) {
    anomalyMap.set(anomaly.type, anomaly)
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1600px] mx-auto">
      {/* 顶部健康评分面板 - 全宽 */}
      <section aria-labelledby="health-heading" className="w-full">
        <h2 id="health-heading" className="sr-only">{t('results.healthScore')}</h2>
        <HealthScoreCard
          healthScore={healthScore}
          originalCount={resultData.original?.pointCount ?? 0}
          correctedCount={resultData.corrected?.pointCount ?? 0}
          anomalyRemoved={anomalyRemoved}
          simplifiedRemoved={simplifiedRemoved}
          interpolatedAdded={interpolatedAdded}
          processingTimeMs={processingTimeMs}
        />
      </section>

      {/* 主内容区：左侧面板 + 右侧地图 */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
        {/* 左侧信息面板 */}
        <aside className="flex flex-col space-y-4">
          {/* 操作按钮行 - 新建分析 + 下载 */}
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex-1 min-h-[44px] px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('results.newAnalysis')}</span>
            </button>
            <DownloadSection reportId={reportId} />
          </div>

          {/* 算法效果列表 */}
          <section aria-labelledby="algorithm-heading">
            <h2 id="algorithm-heading" className="sr-only">{t('results.algorithmResults')}</h2>
            <AlgorithmEffect algorithms={diagnostics.algorithms} compact />
          </section>

          {/* 异常检测面板 - 显示全部类型 */}
          <section aria-labelledby="anomalies-heading" className="border border-slate-700/50 rounded-xl">
            <h3 className="px-4 py-3 text-sm font-medium text-white border-b border-slate-700/50 flex items-center justify-between">
              <span>{t('results.anomalyDetection')}</span>
            </h3>
            <div className="p-3 space-y-1.5">
              {ALL_ANOMALY_TYPES.map((def) => {
                const anomaly = anomalyMap.get(def.type)

                if (!anomaly) {
                  // 健康 - 未检测到此异常
                  return (
                    <div
                      key={def.type}
                      className="flex items-center justify-between p-2 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-emerald-400">{t(`anomalies.${def.type}`)}</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {t('algorithms.healthy')}
                      </span>
                    </div>
                  )
                }

                // 检测到异常
                const getSeverityColor = () => {
                  switch (anomaly.severity) {
                    case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20'
                    case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }
                }

                return (
                  <div
                    key={def.type}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${def.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm text-slate-300">{t(`anomalies.${def.type}`)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor()}`}>
                        {t(`anomalies.severity.${anomaly.severity}`)}
                      </span>
                      <span className={`text-sm font-medium ${def.color}`}>{anomaly.count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </aside>

        {/* 右侧地图区域 */}
        <main className="min-h-[500px] flex flex-col" aria-label={t('map.trajectoryCompare')}>
          <MapContainer />
        </main>
      </div>
    </div>
  )
}
