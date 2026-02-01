import { useState } from 'react'
import type { AlgorithmInfo } from '@/types'
import { useAppTranslation } from '@/hooks/useTranslation'

// 算法图标映射
const getAlgorithmIcon = (name: string) => {
  if (name.includes('RTS') || name.includes('平滑')) {
    return 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  }
  if (name.includes('样条') || name.includes('插值')) {
    return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  }
  if (name.includes('Douglas') || name.includes('DP') || name.includes('简化')) {
    return 'M4 6h16M4 10h16M4 14h16M4 18h16'
  }
  if (name.includes('速度') || name.includes('Speed')) {
    return 'M13 10V3L4 14h7v7l9-11h-7z'
  }
  if (name.includes('跳变') || name.includes('Jump')) {
    return 'M5 11l7-7 7 7M5 19l7-7 7 7'
  }
  if (name.includes('离群') || name.includes('Outlier')) {
    return 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
  }
  if (name.includes('加速度') || name.includes('Accel')) {
    return 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
  if (name.includes('密度') || name.includes('Density')) {
    return 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
  }
  return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
}

// 算法颜色映射
const getAlgorithmColor = (name: string) => {
  if (name.includes('RTS') || name.includes('平滑')) return 'cyan'
  if (name.includes('样条') || name.includes('插值')) return 'emerald'
  if (name.includes('Douglas') || name.includes('DP') || name.includes('简化')) return 'purple'
  if (name.includes('速度') || name.includes('Speed')) return 'red'
  if (name.includes('跳变') || name.includes('Jump')) return 'yellow'
  if (name.includes('离群') || name.includes('Outlier')) return 'indigo'
  if (name.includes('加速度') || name.includes('Accel')) return 'orange'
  if (name.includes('密度') || name.includes('Density')) return 'pink'
  return 'slate'
}

interface AlgorithmListProps {
  algorithms: AlgorithmInfo[]
}

export function AlgorithmList({ algorithms }: AlgorithmListProps) {
  const { t } = useAppTranslation()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-700/50 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{t('algorithmList.title')}</h3>
        <div className="text-sm text-slate-500">
          {t('algorithmList.count', { count: algorithms.length })}
        </div>
      </div>

      <div className="space-y-4">
        {algorithms.map((algorithm, index) => {
          const color = getAlgorithmColor(algorithm.name)
          const isExpanded = expandedIndex === index
          const hasFixedPoints = algorithm.fixedPoints > 0

          return (
            <div
              key={index}
              className={`backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded ? 'ring-1 ring-cyan-500/30' : ''
              }`}
            >
              {/* Header - always visible */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-700/30 transition-colors min-h-[44px]"
                aria-expanded={isExpanded}
                aria-controls={`algo-content-${index}`}
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`} aria-hidden="true">
                    <svg className={`w-6 h-6 text-${color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={getAlgorithmIcon(algorithm.name)} />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="text-left">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-white">{algorithm.name}</span>
                      {hasFixedPoints && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                          {t('algorithmList.fixed', { count: algorithm.fixedPoints })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{algorithm.description}</p>
                  </div>
                </div>

                {/* Expand arrow */}
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div id={`algo-content-${index}`} className="border-t border-slate-700/50 p-5 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                      <div className="text-2xl font-bold text-white">{algorithm.processedPoints}</div>
                      <div className="text-xs text-slate-500 mt-1">{t('algorithmList.processedPoints')}</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-400">{algorithm.fixedPoints}</div>
                      <div className="text-xs text-slate-500 mt-1">{t('algorithmList.fixedPoints')}</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-400">
                        {algorithm.processedPoints > 0 ? Math.round((algorithm.fixedPoints / algorithm.processedPoints) * 100) : 0}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{t('algorithmList.fixRate')}</div>
                    </div>
                  </div>

                  {/* Parameters */}
                  {Object.keys(algorithm.parameters).length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-slate-400 mb-2">{t('algorithmList.params')}</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(algorithm.parameters).map(([key, value]) => (
                          <div
                            key={key}
                            className="px-3 py-1.5 bg-slate-900/50 rounded-lg text-xs"
                          >
                            <span className="text-slate-500">{key}:</span>{' '}
                            <span className="text-cyan-400 font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fixed indices */}
                  {hasFixedPoints && algorithm.fixedIndices && (
                    <div>
                      <div className="text-sm font-medium text-slate-400 mb-2">
                        {t('algorithmList.fixedIndices', { count: algorithm.fixedIndices.length })}
                      </div>
                      <div className="p-3 bg-slate-900/50 rounded-xl max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-1.5">
                          {algorithm.fixedIndices.map((idx, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-xs font-mono"
                            >
                              {idx}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No fixed points message */}
                  {!hasFixedPoints && (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      {t('algorithmList.noFixes')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span>{t('algorithms.adaptiveRTS.shortName')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <span>{t('algorithms.splineInterpolation.shortName')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>{t('algorithms.speedDetection.shortName')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>{t('algorithms.jumpDetection.shortName')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
            <span>{t('algorithms.outlierRemoval.shortName')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span>{t('algorithms.accelerationDetection.shortName')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-pink-400"></div>
            <span>{t('algorithms.densityAnalysis.shortName')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
