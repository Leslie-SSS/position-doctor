import type { AlgorithmInfo } from '@/types'
import { useAppTranslation } from '@/hooks/useTranslation'

interface AlgorithmEffectProps {
  algorithms: AlgorithmInfo[]
  compact?: boolean
}

// 所有可能的算法列表（固定顺序和名称）
const ALL_ALGORITHMS = [
  { id: 'adaptive_rts', key: 'adaptiveRTS' },
  { id: 'spline_interpolation', key: 'splineInterpolation' },
  { id: 'simplification', key: 'douglasPeucker' },
  { id: 'outlier_removal', key: 'outlierRemoval' },
] as const

// 根据算法名称匹配ID
function matchAlgorithmId(name: string): string | null {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('rtf') || lowerName.includes('rts') || lowerName.includes('平滑') || lowerName.includes('smoothing')) {
    return 'adaptive_rts'
  }
  if (lowerName.includes('样条') || lowerName.includes('插值') || lowerName.includes('spline')) {
    return 'spline_interpolation'
  }
  if (lowerName.includes('douglas') || lowerName.includes('peucker') || lowerName.includes('简化') || lowerName.includes('simplif')) {
    return 'simplification'
  }
  if (lowerName.includes('离群') || lowerName.includes('outlier')) {
    return 'outlier_removal'
  }
  return null
}

function getAlgorithmType(algorithm: AlgorithmInfo): 'fix' | 'remove' | 'detect' {
  if (algorithm.removedPoints && algorithm.removedPoints > 0) return 'remove'
  if (algorithm.fixedPoints && algorithm.fixedPoints > 0) return 'fix'
  return 'detect'
}

export function AlgorithmEffect({ algorithms, compact = false }: AlgorithmEffectProps) {
  const { t } = useAppTranslation()

  // 构建算法ID到数据的映射
  const algorithmMap = new Map<string, AlgorithmInfo>()
  for (const algo of algorithms) {
    const id = matchAlgorithmId(algo.name)
    if (id) {
      algorithmMap.set(id, algo)
    }
  }

  if (compact) {
    return (
      <div className="border border-slate-700/50 rounded-xl p-3">
        <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t('algorithmEffect.title')}
        </h3>
        <div className="space-y-1.5">
          {ALL_ALGORITHMS.map((def) => {
            const algo = algorithmMap.get(def.id)
            const hasData = algo && (
              algo.processedPoints > 0 ||
              algo.fixedPoints > 0 ||
              (algo.removedPoints && algo.removedPoints > 0)
            )

            if (!hasData) {
              // 健康 - 未击中
              return (
                <div
                  key={def.id}
                  className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg"
                >
                  <span className="text-slate-300 truncate flex-1 mr-3">
                    {t(`algorithms.${def.key}.shortName`)}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('algorithmEffect.healthy')}
                  </span>
                </div>
              )
            }

            // 有数据 - 显示修复点数
            const algoType = getAlgorithmType(algo!)
            const effectivePoints = algoType === 'remove' ? (algo!.removedPoints || 0) : algo!.fixedPoints

            const getColor = () => {
              switch (algoType) {
                case 'remove': return 'text-yellow-400'
                case 'fix': return 'text-cyan-400'
                default: return 'text-slate-400'
              }
            }

            const getBgColor = () => {
              switch (algoType) {
                case 'remove': return 'bg-yellow-500/10'
                case 'fix': return 'bg-cyan-500/10'
                default: return 'bg-slate-700/30'
              }
            }

            return (
              <div
                key={def.id}
                className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-slate-300 truncate flex-1 mr-3" title={algo!.name}>
                  {t(`algorithms.${def.key}.shortName`)}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getColor()} ${getBgColor()}`}>
                  {effectivePoints}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 完整卡片模式
  const totalFixed = algorithms.reduce((sum, algo) => sum + algo.fixedPoints, 0)
  const totalRemoved = algorithms.reduce((sum, algo) => sum + (algo.removedPoints || 0), 0)

  return (
    <div className="border border-slate-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">{t('algorithmEffect.totalTitle')}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('algorithmList.totalAlgorithms', { count: ALL_ALGORITHMS.length })}
          </p>
        </div>
        <div className="flex gap-4">
          {totalFixed > 0 && (
            <div className="text-right">
              <div className="text-xl font-bold text-cyan-400">{totalFixed}</div>
              <div className="text-xs text-slate-500">{t('algorithmEffect.fixedPoints')}</div>
            </div>
          )}
          {totalRemoved > 0 && (
            <div className="text-right">
              <div className="text-xl font-bold text-yellow-400">{totalRemoved}</div>
              <div className="text-xs text-slate-500">{t('algorithmEffect.removedPoints')}</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {ALL_ALGORITHMS.map((def) => {
          const algo = algorithmMap.get(def.id)
          const hasData = algo && (
            algo.processedPoints > 0 ||
            algo.fixedPoints > 0 ||
            (algo.removedPoints && algo.removedPoints > 0)
          )

          if (!hasData) {
            // 健康 - 未击中
            return (
              <div
                key={def.id}
                className="border border-emerald-500/20 rounded-xl p-3 bg-emerald-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium text-emerald-400 text-sm">{t(`algorithms.${def.key}.shortName`)}</span>
                  </div>
                  <span className="text-sm text-emerald-400">{t('algorithmEffect.healthy')}</span>
                </div>
              </div>
            )
          }

          // 有数据
          const algoType = getAlgorithmType(algo!)
          const effectivePoints = algoType === 'remove' ? (algo!.removedPoints || 0) : algo!.fixedPoints

          const getColorAndText = () => {
            switch (algoType) {
              case 'remove':
                return { color: 'text-yellow-400', barColor: 'bg-yellow-500', text: t('algorithmEffect.removedPoints') }
              case 'fix':
                return { color: 'text-cyan-400', barColor: 'bg-cyan-500', text: t('algorithmEffect.fixedPoints') }
              default:
                return { color: 'text-slate-400', barColor: 'bg-slate-600', text: t('algorithmEffect.detectedPoints') }
            }
          }

          const { color, barColor, text } = getColorAndText()

          return (
            <div
              key={def.id}
              className="border border-slate-700/50 rounded-xl p-3 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800" aria-hidden="true">
                    <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{t(`algorithms.${def.key}.shortName`)}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{algo!.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-semibold ${color}`}>
                    {algoType === 'remove' ? (algo!.removedPoints || 0) : effectivePoints}
                  </div>
                  <div className="text-xs text-slate-500">{text}</div>
                </div>
              </div>
              {algoType !== 'detect' && (
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: '2px' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
