import { useAppTranslation } from '@/hooks/useTranslation'
import { useState, useEffect } from 'react'

interface HealthScoreProps {
  healthScore: {
    total: number
    rating: 'excellent' | 'good' | 'fair' | 'poor'
    breakdown?: Record<string, { score: number; weight: number; description: string }>
  }
  originalCount: number
  correctedCount: number
  anomalyRemoved: number
  simplifiedRemoved: number
  interpolatedAdded: number
  processingTimeMs?: number | null
}

// Entry animation hook
const useEntryAnimation = (delay: number = 0) => {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return isVisible
}

// Animated counter hook
const useCountUp = (target: number, duration: number = 600, delay: number = 0) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const startTimer = setTimeout(() => {
      let startTime: number
      let animationFrame: number

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 2)
        setCount(Math.round(eased * target))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          setCount(target)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [target, duration, delay])
  return count
}

export function HealthScoreCard({
  healthScore,
  originalCount,
  correctedCount,
  anomalyRemoved,
  simplifiedRemoved,
  interpolatedAdded,
  processingTimeMs
}: HealthScoreProps) {
  const { t } = useAppTranslation()

  // Entry animations
  const isVisible = useEntryAnimation(50)
  const showScore = useEntryAnimation(100)
  const showChart = useEntryAnimation(200)
  const showTime = useEntryAnimation(300)

  // Animated score
  const animatedScore = useCountUp(healthScore.total, 600, 150)

  // Get rating configuration
  const getRatingConfig = () => {
    switch (healthScore.rating) {
      case 'excellent': return {
        text: t('healthScore.ratingLabel.excellent'),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500',
        bgLight: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        shadow: 'shadow-emerald-500/20',
        ring: 'ring-emerald-500/30',
        gradient: 'from-emerald-400 to-cyan-500',
        solid: 'bg-emerald-500'
      }
      case 'good': return {
        text: t('healthScore.ratingLabel.good'),
        color: 'text-cyan-400',
        bg: 'bg-cyan-500',
        bgLight: 'bg-cyan-500/20',
        border: 'border-cyan-500/30',
        shadow: 'shadow-cyan-500/20',
        ring: 'ring-cyan-500/30',
        gradient: 'from-cyan-400 to-blue-500',
        solid: 'bg-cyan-500'
      }
      case 'fair': return {
        text: t('healthScore.ratingLabel.fair'),
        color: 'text-amber-400',
        bg: 'bg-amber-500',
        bgLight: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        shadow: 'shadow-amber-500/20',
        ring: 'ring-amber-500/30',
        gradient: 'from-amber-400 to-orange-500',
        solid: 'bg-amber-500'
      }
      case 'poor': return {
        text: t('healthScore.ratingLabel.poor'),
        color: 'text-red-400',
        bg: 'bg-red-500',
        bgLight: 'bg-red-500/20',
        border: 'border-red-500/30',
        shadow: 'shadow-red-500/20',
        ring: 'ring-red-500/30',
        gradient: 'from-red-400 to-pink-500',
        solid: 'bg-red-500'
      }
    }
  }

  const ratingConfig = getRatingConfig()

  return (
    <div className={`relative transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {/* Ambient glow */}
      <div className={`absolute -inset-1 rounded-2xl opacity-20 blur-xl transition-all duration-500 ${ratingConfig.shadow}`} />

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-xl">
        {/* Decorative top gradient line */}
        <div className={`absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r ${ratingConfig.gradient} rounded-full opacity-60`} />

        {/* Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-5 pt-1">

          {/* ============================================ */}
          {/* COLUMN 1: Health Score - Premium                */}
          {/* ============================================ */}
          <div className={`flex-shrink-0 flex flex-col transition-all duration-500 ${showScore ? 'opacity-100' : 'opacity-0'}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-slate-300">{t('healthScore.healthDiagnosis')}</span>
            </div>

            {/* Score display with premium design */}
            <div className="flex flex-col items-center pt-4">
              {/* Score Ring with enhanced glow */}
              <div className="relative">
                {/* Dashed decorative ring */}
                <div className={`absolute inset-[-4px] rounded-full border-2 border-dashed ${ratingConfig.ring} opacity-30`} />

                <svg className="w-28 h-28 -rotate-90 relative" viewBox="0 0 112 112">
                  {/* Background track */}
                  <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-800" opacity={0.3} />
                  {/* Inner track */}
                  <circle cx="56" cy="56" r="42" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-700" opacity={0.5} />

                  <defs>
                    <linearGradient id={`scoreGrad-${healthScore.rating}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={healthScore.rating === 'excellent' ? '#34d399' : healthScore.rating === 'good' ? '#22d3ee' : healthScore.rating === 'fair' ? '#fbbf24' : '#f87171'} />
                      <stop offset="100%" stopColor={healthScore.rating === 'excellent' ? '#06b6d4' : healthScore.rating === 'good' ? '#3b82f6' : healthScore.rating === 'fair' ? '#f97316' : '#ec4899'} />
                    </linearGradient>
                    <filter id={`scoreGlow-${healthScore.rating}`}>
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Progress circle */}
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    fill="none"
                    stroke={`url(#scoreGrad-${healthScore.rating})`}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - animatedScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    style={{ filter: `url(#scoreGlow-${healthScore.rating})` }}
                  />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-black tabular-nums ${ratingConfig.color} leading-none tracking-tight drop-shadow-lg`}>
                    {animatedScore}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 font-medium">SCORE</span>
                </div>
              </div>

              {/* Rating badge - New style */}
              <div className={`mt-5 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${ratingConfig.gradient} shadow-lg border border-white/10`}>
                {ratingConfig.text}
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-slate-700/50 to-transparent self-stretch" />

          {/* ============================================ */}
          {/* COLUMN 2: Data Flow Cards (New Design)       */}
          {/* ============================================ */}
          <div className={`flex-1 transition-all duration-500 ${showChart ? 'opacity-100' : 'opacity-0'}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium text-slate-300">{t('healthScore.dataChanges')}</span>
            </div>

            {/* Data Flow Cards */}
            <div className="flex items-center gap-2">
              {/* Original Card */}
              <div className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 min-w-0">
                <div className="text-xs text-slate-400 mb-1.5 font-medium">{t('healthScore.original')}</div>
                <div className="text-xl font-bold text-slate-200 tabular-nums">{originalCount.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">{t('healthScore.dataPoints')}</div>
              </div>

              {/* Arrow */}
              <svg className="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>

              {/* Changes Card - Enhanced */}
              <div className="flex-1 bg-gradient-to-br from-slate-800/80 to-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 min-w-0">
                <div className="mb-2">
                  <span className="text-xs text-slate-300 font-semibold">{t('healthScore.processingOperations')}</span>
                </div>
                <div className="space-y-1.5">
                  {/* Anomaly Row */}
                  {anomalyRemoved > 0 ? (
                    <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-xs text-red-200">{t('healthScore.anomaly')}</span>
                      </div>
                      <span className="text-sm font-bold text-red-400 tabular-nums">-{anomalyRemoved}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs text-emerald-400/60">{t('healthScore.anomaly')}</span>
                      </div>
                      <span className="text-sm text-emerald-400/60 tabular-nums">✓</span>
                    </div>
                  )}
                  {/* Simplified Row */}
                  {simplifiedRemoved > 0 ? (
                    <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-xs text-orange-200">{t('healthScore.simplified')}</span>
                      </div>
                      <span className="text-sm font-bold text-orange-400 tabular-nums">-{simplifiedRemoved}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-xs text-slate-500">{t('healthScore.simplified')}</span>
                      </div>
                      <span className="text-sm text-slate-500">0</span>
                    </div>
                  )}
                  {/* Interpolated Row */}
                  {interpolatedAdded > 0 ? (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs text-emerald-200">{t('healthScore.interpolated')}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">+{interpolatedAdded}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs text-slate-500">{t('healthScore.interpolated')}</span>
                      </div>
                      <span className="text-sm text-slate-500">0</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <svg className="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>

              {/* Final Card */}
              <div className="flex-1 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/30 rounded-xl p-3 min-w-0">
                <div className="text-xs text-emerald-300 mb-1.5 font-medium">{t('healthScore.final')}</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">{correctedCount.toLocaleString()}</div>
                <div className="text-xs text-emerald-400/70 mt-1">{t('healthScore.repairedPointCount')}</div>
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-slate-700/50 to-transparent self-stretch" />

          {/* ============================================ */}
          {/* COLUMN 3: Algorithm Time                       */}
          {/* ============================================ */}
          {processingTimeMs !== null && processingTimeMs !== undefined && (
            <div className={`flex-shrink-0 flex flex-col transition-all duration-500 ${showTime ? 'opacity-100' : 'opacity-0'}`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-slate-300">{t('healthScore.algorithmTime')}</span>
              </div>

              {/* Time Display Card - Compact */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/5 blur-lg" />

                <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/60 border border-violet-500/30">
                  {/* Time value */}
                  <div className="flex items-baseline justify-center gap-1.5 mb-3">
                    <span className="text-4xl font-bold text-violet-300 tabular-nums leading-none">
                      {processingTimeMs < 1000
                        ? processingTimeMs.toFixed(0)
                        : (processingTimeMs / 1000).toFixed(2)
                      }
                    </span>
                    <span className="text-sm text-violet-400/80 font-medium">
                      {processingTimeMs < 1000 ? 'ms' : 's'}
                    </span>
                  </div>

                  {/* Progress bar - Charging energy effect */}
                  <div className="mb-3">
                    <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden relative">
                      {/* Progress fill with pulsing animation */}
                      <div
                        className={`h-full bg-gradient-to-r ${ratingConfig.gradient} rounded-full transition-all duration-700 ease-out relative`}
                        style={{
                          width: `${Math.min(100, Math.max(30, 100 - (processingTimeMs / originalCount) * 30))}%`,
                          animation: 'energyPulse 1.5s ease-in-out infinite'
                        }}
                      >
                        {/* Bright leading edge glow */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/80 rounded-full blur-[1px]" />
                      </div>

                      {/* Moving energy packet - theme color */}
                      <div
                        className="absolute top-0 bottom-0 w-6 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${healthScore.rating === 'excellent' ? 'rgba(52, 211, 153, 0.8)' : healthScore.rating === 'good' ? 'rgba(34, 211, 238, 0.8)' : healthScore.rating === 'fair' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(248, 113, 113, 0.8)'}, white, ${healthScore.rating === 'excellent' ? 'rgba(52, 211, 153, 0.8)' : healthScore.rating === 'good' ? 'rgba(34, 211, 238, 0.8)' : healthScore.rating === 'fair' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(248, 113, 113, 0.8)'}, transparent)`,
                          animation: 'energyFlow 1.2s ease-in-out infinite'
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-slate-500">{t('healthScore.efficiencyLabel')}</span>
                      <span className="text-[9px] text-violet-400 font-medium">{Math.round(100 - (processingTimeMs / originalCount) * 30)}%</span>
                    </div>
                  </div>

                  {/* Speed indicator */}
                  {processingTimeMs > 0 && (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-semibold text-cyan-400 tabular-nums">
                        {(Math.round(originalCount / (processingTimeMs / 1000))).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">{t('healthScore.pointsPerSecond')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
