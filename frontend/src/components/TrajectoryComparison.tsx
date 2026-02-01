import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore } from '@/hooks/useStore'
import { useAppTranslation } from '@/hooks/useTranslation'
import type { Point, PointStatus } from '@/types'

// 修复 Leaflet 默认图标问题
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// @ts-ignore - 修复 Leaflet 类型问题
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

// 异常类型颜色映射 - 与面板颜色保持一致
const ANOMALY_COLORS: Record<PointStatus, string> = {
  'drift': '#f97316',              // 橙色 - GPS 漂移
  'jump': '#ef4444',              // 红色 - 位置跳跃
  'speed_anomaly': '#eab308',     // 黄色 - 速度异常
  'acceleration_anomaly': '#8b5cf6', // 紫色 - 加速度异常
  'missing': '#64748b',           // 灰色 - 数据丢失
  'density_anomaly': '#06b6d4',   // 青色 - 密度异常
  'outlier': '#ec4899',           // 粉色 - 离群点
  'interpolated': '#10b981',      // 绿色 - 插值点（修复点）
  'normal': '#22c55e',            // 浅绿 - 正常
}

// 获取异常点的颜色
function getAnomalyColor(status: PointStatus): string {
  return ANOMALY_COLORS[status] || '#ef4444' // 默认红色
}

interface TrajectoryComparisonProps {
  className?: string
}

const TIANDITU_KEY = import.meta.env.VITE_TIANDITU_KEY || '0aa9dc622539832d78c124d17bb13fff'

// 天地图瓦片 URL (中文)
const TIANDITU_VEC_URL = `https://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`
const TIANDITU_CVA_URL = `https://t0.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`

// Google Maps 瓦片 URL (英文，快速，无需 API key)
const GOOGLE_MAPS_URL = 'http://mt{s}.googleapis.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}'

export function TrajectoryComparison({ className = '' }: TrajectoryComparisonProps) {
  const { resultData } = useStore()
  const { t, language } = useAppTranslation()

  // DOM 容器引用
  const containerOriginalRef = useRef<HTMLDivElement>(null)
  const containerCorrectedRef = useRef<HTMLDivElement>(null)

  // 地图实例引用
  const mapOriginalRef = useRef<L.Map | null>(null)
  const mapCorrectedRef = useRef<L.Map | null>(null)

  // 图层引用
  const staticLineOriginalRef = useRef<L.Polyline | null>(null)  // 静态原始轨迹
  const staticLineCorrectedRef = useRef<L.Polyline | null>(null)  // 静态修复轨迹
  const drawingLineOriginalRef = useRef<L.Polyline | null>(null)  // 动态绘制原始轨迹
  const drawingLineCorrectedRef = useRef<L.Polyline | null>(null) // 动态绘制修复轨迹
  const playbackMarkerOriginalRef = useRef<L.CircleMarker | null>(null)
  const playbackMarkerCorrectedRef = useRef<L.CircleMarker | null>(null)
  const anomaliesLayerRef = useRef<L.LayerGroup | null>(null)
  const tileLayerOriginalRef = useRef<L.TileLayer | null>(null)
  const tileLayerCorrectedRef = useRef<L.TileLayer | null>(null)
  const annotationLayerOriginalRef = useRef<L.TileLayer | null>(null)
  const annotationLayerCorrectedRef = useRef<L.TileLayer | null>(null)

  // 同步状态引用
  const isSyncingRef = useRef(false)
  const isTrackingRef = useRef(false)  // 标记是否正在追踪播放中

  // 使用 ref 存储播放状态，避免闭包陷阱和异步 state 问题
  const playbackRef = useRef({
    isPlaying: false,
    currentIndex: 0,
    speed: 1,
    pointsCount: 0,
    accumulatedFrame: 0,
    trackMarker: true,  // 实时追踪开关，默认开启
    coordinates: {
      original: [] as [number, number][],
      corrected: [] as [number, number][],
    },
  })

  // UI 状态 - 用于显示
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [mapReady, setMapReady] = useState(false)
  const [trackMarker, setTrackMarker] = useState(true)  // 追踪按钮状态

  // 进度条和计数器 DOM 引用 - 直接更新避免重渲染
  const progressBarRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  const animationFrameRef = useRef<number | null>(null)
  const autoPlayTriggeredRef = useRef(false)
  const lastFrameTimeRef = useRef<number | null>(null)

  // 使用 useMemo 缓存数据处理结果
  const processedData = useMemo(() => {
    if (!resultData?.points?.length) return null

    const points = resultData.points
    const validPoints = points.filter(
      (p: Point) => p.status !== 'missing' && !isNaN(p.lat) && !isNaN(p.lon)
    )

    if (validPoints.length === 0) return null

    // 计算边界
    let minLat = validPoints[0].lat, maxLat = validPoints[0].lat
    let minLon = validPoints[0].lon, maxLon = validPoints[0].lon

    for (const p of validPoints) {
      if (p.lat < minLat) minLat = p.lat
      if (p.lat > maxLat) maxLat = p.lat
      if (p.lon < minLon) minLon = p.lon
      if (p.lon > maxLon) maxLon = p.lon
    }

    const bounds = [
      [minLat, minLon] as [number, number],
      [maxLat, maxLon] as [number, number],
    ]

    const center: [number, number] = [
      (minLon + maxLon) / 2,
      (minLat + maxLat) / 2,
    ]

    // 准备坐标数据
    const originalCoords = validPoints.map((p) => [
      p.originalLat || p.lat,
      p.originalLon || p.lon,
    ]) as [number, number][]

    const correctedCoords = validPoints.map((p) => [
      p.lat,
      p.lon,
    ]) as [number, number][]

    // 异常点
    const anomalies = validPoints.filter(
      (p) => p.status && p.status !== 'normal' && p.status !== 'interpolated'
    )

    return {
      reportId: resultData.reportId,
      points: validPoints,
      bounds,
      center,
      originalCoords,
      correctedCoords,
      anomalies,
    }
  }, [resultData?.reportId, resultData?.points])

  // 地图同步函数
  const syncOriginalToCorrected = useCallback(() => {
    if (
      isSyncingRef.current ||
      isTrackingRef.current ||  // 追踪播放时跳过同步
      !mapOriginalRef.current ||
      !mapCorrectedRef.current
    ) {
      return
    }

    isSyncingRef.current = true

    const mapOrig = mapOriginalRef.current
    const mapCorr = mapCorrectedRef.current

    const center = mapOrig.getCenter()
    const zoom = mapOrig.getZoom()

    mapCorr.setView([center.lat, center.lng], zoom, { animate: false })

    requestAnimationFrame(() => {
      isSyncingRef.current = false
    })
  }, [])

  const syncCorrectedToOriginal = useCallback(() => {
    if (
      isSyncingRef.current ||
      isTrackingRef.current ||  // 追踪播放时跳过同步
      !mapCorrectedRef.current ||
      !mapOriginalRef.current
    ) {
      return
    }

    isSyncingRef.current = true

    const mapCorr = mapCorrectedRef.current
    const mapOrig = mapOriginalRef.current

    const center = mapCorr.getCenter()
    const zoom = mapCorr.getZoom()

    mapOrig.setView([center.lat, center.lng], zoom, { animate: false })

    requestAnimationFrame(() => {
      isSyncingRef.current = false
    })
  }, [])

  // 更新播放标记位置 - 直接更新 DOM 和地图标记
  const updatePlaybackMarkers = useCallback((index: number) => {
    const pb = playbackRef.current
    if (index >= pb.pointsCount || index < 0) return

    const origCoord = pb.coordinates.original[index]
    const corrCoord = pb.coordinates.corrected[index]

    // 更新地图标记
    if (playbackMarkerOriginalRef.current && origCoord) {
      playbackMarkerOriginalRef.current.setLatLng(origCoord)
    }

    if (playbackMarkerCorrectedRef.current && corrCoord) {
      playbackMarkerCorrectedRef.current.setLatLng(corrCoord)
    }

    // 实时追踪：地图中心跟随标记点
    if (pb.trackMarker && pb.isPlaying && corrCoord) {
      const mapOrig = mapOriginalRef.current
      const mapCorr = mapCorrectedRef.current

      if (mapOrig && origCoord) {
        mapOrig.panTo(origCoord, { animate: true, duration: 0.1 })
      }
      if (mapCorr && corrCoord) {
        mapCorr.panTo(corrCoord, { animate: true, duration: 0.1 })
      }
    }

    // 直接更新 DOM，避免 React 重渲染
    if (progressBarRef.current) {
      const progress = (index / (pb.pointsCount - 1)) * 100
      progressBarRef.current.style.width = `${progress}%`
    }

    if (counterRef.current) {
      counterRef.current.textContent = String(Math.floor(index) + 1)
    }

    // 更新 React state 用于按钮图标显示
    setCurrentIndex(index)
  }, [])

  // 动画循环 - 基于时间的播放控制，带平滑插值
  const animateLoop = useCallback((timestamp: number) => {
    const pb = playbackRef.current

    if (!pb.isPlaying) {
      animationFrameRef.current = null
      lastFrameTimeRef.current = null
      return
    }

    // 初始化上一帧时间
    if (lastFrameTimeRef.current === null) {
      lastFrameTimeRef.current = timestamp
    }

    // 计算时间差（毫秒）
    const deltaTime = timestamp - lastFrameTimeRef.current
    lastFrameTimeRef.current = timestamp

    // 基础间隔：每个点的播放时间（毫秒）
    // 速度 1x = 500ms/点（2点/秒），0.5x = 1000ms/点（1点/秒）
    const baseInterval = 500  // 1x 速度时每点 500ms
    const pointInterval = baseInterval / pb.speed  // 速度越快，间隔越短

    // 累积时间（转换为点的进度）
    const progressDelta = deltaTime / pointInterval
    pb.accumulatedFrame += progressDelta

    // 当前浮点索引
    const currentFloatIndex = pb.currentIndex + pb.accumulatedFrame
    const indexFloor = Math.floor(currentFloatIndex)
    const indexCeil = Math.min(indexFloor + 1, pb.pointsCount - 1)
    const t = currentFloatIndex - indexFloor  // 插值因子 0-1

    // 平滑插值计算当前标记位置
    const origCoord = pb.coordinates.original[indexFloor]
    const nextOrigCoord = pb.coordinates.original[indexCeil]
    const corrCoord = pb.coordinates.corrected[indexFloor]
    const nextCorrCoord = pb.coordinates.corrected[indexCeil]

    // 插值位置
    let currentOrigLat = origCoord[0]
    let currentOrigLng = origCoord[1]
    let currentCorrLat = corrCoord[0]
    let currentCorrLng = corrCoord[1]

    if (nextOrigCoord && t > 0) {
      currentOrigLat = origCoord[0] + (nextOrigCoord[0] - origCoord[0]) * t
      currentOrigLng = origCoord[1] + (nextOrigCoord[1] - origCoord[1]) * t
    }
    if (nextCorrCoord && t > 0) {
      currentCorrLat = corrCoord[0] + (nextCorrCoord[0] - corrCoord[0]) * t
      currentCorrLng = corrCoord[1] + (nextCorrCoord[1] - corrCoord[1]) * t
    }

    // 更新标记到插值位置
    if (playbackMarkerOriginalRef.current) {
      playbackMarkerOriginalRef.current.setLatLng([currentOrigLat, currentOrigLng])
    }
    if (playbackMarkerCorrectedRef.current) {
      playbackMarkerCorrectedRef.current.setLatLng([currentCorrLat, currentCorrLng])
    }

    // 实时追踪：地图中心跟随插值位置
    if (pb.trackMarker) {
      const mapOrig = mapOriginalRef.current
      const mapCorr = mapCorrectedRef.current

      // 设置追踪标志，防止 panTo 触发的 move 事件导致同步冲突
      isTrackingRef.current = true

      if (mapOrig) {
        mapOrig.panTo([currentOrigLat, currentOrigLng], { animate: false })
      }
      if (mapCorr) {
        mapCorr.panTo([currentCorrLat, currentCorrLng], { animate: false })
      }

      // 重置追踪标志
      isTrackingRef.current = false
    }

    // 更新绘制轨迹 - 每帧都包含当前插值位置，保持与标记同步
    const mapOrig = mapOriginalRef.current
    const mapCorr = mapCorrectedRef.current

    if (mapOrig && drawingLineOriginalRef.current) {
      // 包含所有已完成的点 + 当前插值位置
      const originalCoords = pb.coordinates.original.slice(0, indexFloor + 1)
      // 如果有插值，添加当前插值位置
      if (t > 0 && indexCeil > indexFloor) {
        originalCoords.push([currentOrigLat, currentOrigLng] as [number, number])
      }
      drawingLineOriginalRef.current.setLatLngs(originalCoords)
    }

    if (mapCorr && drawingLineCorrectedRef.current) {
      const correctedCoords = pb.coordinates.corrected.slice(0, indexFloor + 1)
      // 如果有插值，添加当前插值位置
      if (t > 0 && indexCeil > indexFloor) {
        correctedCoords.push([currentCorrLat, currentCorrLng] as [number, number])
      }
      drawingLineCorrectedRef.current.setLatLngs(correctedCoords)
    }

    // 更新进度条和计数器（使用浮点索引）
    const progress = (currentFloatIndex / (pb.pointsCount - 1)) * 100
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${Math.min(progress, 100)}%`
    }
    if (counterRef.current) {
      counterRef.current.textContent = String(Math.floor(currentFloatIndex) + 1)
    }
    setCurrentIndex(currentFloatIndex)

    // 检查是否结束
    if (currentFloatIndex >= pb.pointsCount - 1) {
      pb.currentIndex = pb.pointsCount - 1
      pb.accumulatedFrame = 0
      pb.isPlaying = false
      setIsPlaying(false)
      // 确保标记在最后位置
      const lastIndex = pb.pointsCount - 1
      if (playbackMarkerOriginalRef.current) {
        playbackMarkerOriginalRef.current.setLatLng(pb.coordinates.original[lastIndex])
      }
      if (playbackMarkerCorrectedRef.current) {
        playbackMarkerCorrectedRef.current.setLatLng(pb.coordinates.corrected[lastIndex])
      }
      animationFrameRef.current = null
      lastFrameTimeRef.current = null
      return
    }

    // 更新当前索引（用于下次计算）
    if (pb.accumulatedFrame >= 1) {
      pb.currentIndex += Math.floor(pb.accumulatedFrame)
      pb.accumulatedFrame %= 1
    }

    // 继续动画
    if (pb.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animateLoop)
    } else {
      animationFrameRef.current = null
      lastFrameTimeRef.current = null
    }
  }, [])

  // 初始化地图
  useEffect(() => {
    const data = processedData
    const currentReportId = data?.reportId || ''

    // 如果数据未准备好，直接返回
    if (!data || !containerOriginalRef.current || !containerCorrectedRef.current) {
      return
    }

    // 清理旧的地图实例
    if (mapOriginalRef.current) {
      mapOriginalRef.current.off('move', syncOriginalToCorrected)
      mapOriginalRef.current.remove()
      mapOriginalRef.current = null
    }

    if (mapCorrectedRef.current) {
      mapCorrectedRef.current.off('move', syncCorrectedToOriginal)
      mapCorrectedRef.current.remove()
      mapCorrectedRef.current = null
    }

    // 停止动画
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // 重置自动播放标记
    autoPlayTriggeredRef.current = false

    // 重置播放状态
    playbackRef.current.isPlaying = false
    playbackRef.current.currentIndex = 0
    playbackRef.current.speed = 1  // 默认 1x 速度
    playbackRef.current.accumulatedFrame = 0
    playbackRef.current.pointsCount = data.points.length
    playbackRef.current.coordinates.original = data.originalCoords
    playbackRef.current.coordinates.corrected = data.correctedCoords

    // 重置 UI 状态
    setMapReady(false)
    setIsPlaying(false)
    setCurrentIndex(0)
    setSpeed(1)  // 默认 1x 速度
    setTrackMarker(true)  // 重置追踪状态为开启

    // 创建原始地图
    const mapOriginal = L.map(containerOriginalRef.current, {
      center: data.center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })

    // 创建修复地图
    const mapCorrected = L.map(containerCorrectedRef.current, {
      center: data.center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })

    mapOriginalRef.current = mapOriginal
    mapCorrectedRef.current = mapCorrected

    // 根据语言选择瓦片源
    const useChineseTiles = language === 'zh'
    const baseUrl = useChineseTiles ? TIANDITU_VEC_URL : GOOGLE_MAPS_URL
    const annotationUrl = useChineseTiles ? TIANDITU_CVA_URL : null
    const subdomains = useChineseTiles ? ['0', '1', '2', '3', '4', '5', '6', '7'] : ['0', '1', '2', '3']

    // 添加瓦片层 - 原始地图
    const tileLayerOriginal = L.tileLayer(baseUrl, {
      maxZoom: 18,
      subdomains,
    }).addTo(mapOriginal)
    tileLayerOriginalRef.current = tileLayerOriginal

    // 添加瓦片层 - 修复地图
    const tileLayerCorrected = L.tileLayer(baseUrl, {
      maxZoom: 18,
      subdomains,
    }).addTo(mapCorrected)
    tileLayerCorrectedRef.current = tileLayerCorrected

    // 添加注记层 (仅中文)
    if (annotationUrl) {
      const annotationLayerOriginal = L.tileLayer(annotationUrl, {
        maxZoom: 18,
        subdomains,
      }).addTo(mapOriginal)
      annotationLayerOriginalRef.current = annotationLayerOriginal

      const annotationLayerCorrected = L.tileLayer(annotationUrl, {
        maxZoom: 18,
        subdomains,
      }).addTo(mapCorrected)
      annotationLayerCorrectedRef.current = annotationLayerCorrected
    }

    // ========== 关键：静态轨迹层（初始显示） ==========
    const staticLineOriginal = L.polyline(data.originalCoords, {
      color: '#64748b',
      weight: 3,
      dashArray: '5, 5',
      opacity: 0.7,
    }).addTo(mapOriginal)

    staticLineOriginalRef.current = staticLineOriginal

    // 绘制异常点 - 根据异常类型使用不同颜色
    const anomaliesGroup = L.layerGroup().addTo(mapOriginal)
    anomaliesLayerRef.current = anomaliesGroup

    data.anomalies.forEach((p) => {
      const coord: L.LatLngExpression = [
        p.originalLat || p.lat,
        p.originalLon || p.lon,
      ]
      // 根据异常类型选择颜色
      const anomalyColor = getAnomalyColor(p.status)
      L.circleMarker(coord, {
        radius: 6,
        fillColor: anomalyColor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(anomaliesGroup)
    })

    // ========== 关键：静态修复轨迹层（初始显示） ==========
    const staticLineCorrected = L.polyline(data.correctedCoords, {
      color: '#22d3ee',
      weight: 3,
      opacity: 0.9,
    }).addTo(mapCorrected)

    staticLineCorrectedRef.current = staticLineCorrected

    // 发光效果
    L.polyline(data.correctedCoords, {
      color: '#22d3ee',
      weight: 8,
      opacity: 0.2,
    }).addTo(mapCorrected)

    // ========== 关键：动态绘制层（初始隐藏） ==========
    // 原始轨迹动态绘制层
    const drawingLineOriginal = L.polyline([], {
      color: '#64748b',
      weight: 4,
      dashArray: '5, 5',
      opacity: 0,
      lineCap: 'round',
    }).addTo(mapOriginal)

    drawingLineOriginalRef.current = drawingLineOriginal

    // 修复轨迹动态绘制层
    const drawingLineCorrected = L.polyline([], {
      color: '#22d3ee',
      weight: 4,
      opacity: 0,
      lineCap: 'round',
    }).addTo(mapCorrected)

    drawingLineCorrectedRef.current = drawingLineCorrected

    // 原始地图播放标记
    const playbackMarkerOriginal = L.circleMarker(data.originalCoords[0], {
      radius: 10,
      fillColor: '#f97316',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(mapOriginal)
    // 添加标签 - 橙色霓虹
    playbackMarkerOriginal.bindTooltip(t('playback.originalTrack'), {
      permanent: true,
      direction: 'right',
      className: 'playback-marker-label playback-label-orange',
      offset: [12, 0]
    })

    playbackMarkerOriginalRef.current = playbackMarkerOriginal

    // 修复地图播放标记
    const playbackMarkerCorrected = L.circleMarker(data.correctedCoords[0], {
      radius: 10,
      fillColor: '#22d3ee',  // 青色，与标签一致
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 1,
    }).addTo(mapCorrected)
    // 添加标签 - 青色霓虹
    playbackMarkerCorrected.bindTooltip(t('playback.repairedTrack'), {
      permanent: true,
      direction: 'right',
      className: 'playback-marker-label playback-label-cyan',
      offset: [12, 0]
    })

    playbackMarkerCorrectedRef.current = playbackMarkerCorrected

    // 调整视野
    mapOriginal.fitBounds(data.bounds, { padding: [50, 50] })
    mapCorrected.fitBounds(data.bounds, { padding: [50, 50] })

    // 放大3级
    setTimeout(() => {
      const currentZoomOrig = mapOriginal.getZoom()
      const currentZoomCorr = mapCorrected.getZoom()
      mapOriginal.setZoom(currentZoomOrig + 3)
      mapCorrected.setZoom(currentZoomCorr + 3)
    }, 500)

    // 添加地图同步事件监听
    mapOriginal.on('move', syncOriginalToCorrected)
    mapCorrected.on('move', syncCorrectedToOriginal)

    // 标记地图准备完成
    setMapReady(true)

    // Cleanup 函数
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      if (mapOriginalRef.current) {
        mapOriginalRef.current.off('move', syncOriginalToCorrected)
        mapOriginalRef.current.remove()
        mapOriginalRef.current = null
      }

      if (mapCorrectedRef.current) {
        mapCorrectedRef.current.off('move', syncCorrectedToOriginal)
        mapCorrectedRef.current.remove()
        mapCorrectedRef.current = null
      }

      staticLineOriginalRef.current = null
      staticLineCorrectedRef.current = null
      drawingLineOriginalRef.current = null
      drawingLineCorrectedRef.current = null
      playbackMarkerOriginalRef.current = null
      playbackMarkerCorrectedRef.current = null
      anomaliesLayerRef.current = null
      tileLayerOriginalRef.current = null
      tileLayerCorrectedRef.current = null
      annotationLayerOriginalRef.current = null
      annotationLayerCorrectedRef.current = null
    }
  }, [processedData?.reportId, processedData, syncOriginalToCorrected, syncCorrectedToOriginal, language])

  // 语言变化时更新瓦片图层
  useEffect(() => {
    const mapOrig = mapOriginalRef.current
    const mapCorr = mapCorrectedRef.current
    if (!mapOrig || !mapCorr) return

    const useChineseTiles = language === 'zh'
    const baseUrl = useChineseTiles ? TIANDITU_VEC_URL : GOOGLE_MAPS_URL
    const annotationUrl = useChineseTiles ? TIANDITU_CVA_URL : null
    const subdomains = useChineseTiles ? ['0', '1', '2', '3', '4', '5', '6', '7'] : ['0', '1', '2', '3']

    // 移除旧的瓦片层
    if (tileLayerOriginalRef.current) {
      mapOrig.removeLayer(tileLayerOriginalRef.current)
    }
    if (tileLayerCorrectedRef.current) {
      mapCorr.removeLayer(tileLayerCorrectedRef.current)
    }
    if (annotationLayerOriginalRef.current) {
      mapOrig.removeLayer(annotationLayerOriginalRef.current)
    }
    if (annotationLayerCorrectedRef.current) {
      mapCorr.removeLayer(annotationLayerCorrectedRef.current)
    }

    // 添加新的瓦片层
    const tileLayerOriginal = L.tileLayer(baseUrl, {
      maxZoom: 18,
      subdomains,
    }).addTo(mapOrig)
    tileLayerOriginalRef.current = tileLayerOriginal

    const tileLayerCorrected = L.tileLayer(baseUrl, {
      maxZoom: 18,
      subdomains,
    }).addTo(mapCorr)
    tileLayerCorrectedRef.current = tileLayerCorrected

    // 添加注记层 (仅中文)
    if (annotationUrl) {
      const annotationLayerOriginal = L.tileLayer(annotationUrl, {
        maxZoom: 18,
        subdomains,
      }).addTo(mapOrig)
      annotationLayerOriginalRef.current = annotationLayerOriginal

      const annotationLayerCorrected = L.tileLayer(annotationUrl, {
        maxZoom: 18,
        subdomains,
      }).addTo(mapCorr)
      annotationLayerCorrectedRef.current = annotationLayerCorrected
    }
  }, [language])

  // 语言变化时更新标记标签
  useEffect(() => {
    if (playbackMarkerOriginalRef.current) {
      playbackMarkerOriginalRef.current.setTooltipContent(t('playback.originalTrack'))
    }
    if (playbackMarkerCorrectedRef.current) {
      playbackMarkerCorrectedRef.current.setTooltipContent(t('playback.repairedTrack'))
    }
  }, [language, t])

  // 切换轨迹显示模式（静态 vs 动态绘制）
  const switchToDrawingMode = useCallback((isDrawing: boolean) => {
    if (!mapOriginalRef.current || !mapCorrectedRef.current) return

    // 切换原始轨迹
    if (staticLineOriginalRef.current) {
      staticLineOriginalRef.current.setStyle({ opacity: isDrawing ? 0 : 0.7 })
    }
    if (drawingLineOriginalRef.current) {
      drawingLineOriginalRef.current.setStyle({ opacity: isDrawing ? 0.9 : 0 })
    }

    // 切换修复轨迹
    if (staticLineCorrectedRef.current) {
      staticLineCorrectedRef.current.setStyle({ opacity: isDrawing ? 0 : 0.9 })
    }
    if (drawingLineCorrectedRef.current) {
      drawingLineCorrectedRef.current.setStyle({ opacity: isDrawing ? 1 : 0 })
    }

    // 切换异常点（绘制模式时隐藏）
    if (anomaliesLayerRef.current) {
      const opacity = isDrawing ? 0 : 1
      anomaliesLayerRef.current.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
          layer.setStyle({ opacity })
        }
      })
    }

    // 切换修复点（绘制模式时隐藏）
    // Fixed points removed - no longer needed
  }, [])

  // 播放控制函数
  const togglePlay = useCallback(() => {
    if (!mapReady) return

    const pb = playbackRef.current

    if (!pb.isPlaying) {
      // ========== 开始播放 / 继续播放 ==========
      // 如果是首次播放（currentIndex为0且没有绘制轨迹），从头开始
      const isStartingFromBeginning = pb.currentIndex === 0 && (
        !drawingLineOriginalRef.current?.getLatLngs()?.length ||
        drawingLineOriginalRef.current.getLatLngs().length === 0
      )

      if (isStartingFromBeginning) {
        // 首次播放：隐藏静态轨迹，显示绘制层
        switchToDrawingMode(true)
        // 重置绘制轨迹为空
        if (drawingLineOriginalRef.current) {
          drawingLineOriginalRef.current.setLatLngs([])
        }
        if (drawingLineCorrectedRef.current) {
          drawingLineCorrectedRef.current.setLatLngs([])
        }
        // 从头开始
        pb.currentIndex = 0
      }
      // 否则从当前位置继续播放

      pb.accumulatedFrame = 0
      pb.isPlaying = true
      lastFrameTimeRef.current = null  // 重置时间戳
      setIsPlaying(true)

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(animateLoop)
      }
    } else {
      // ========== 暂停播放 ==========
      pb.isPlaying = false
      setIsPlaying(false)
      lastFrameTimeRef.current = null  // 重置时间戳

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      // 注意：暂停时保持绘制轨迹显示，不切回静态模式
    }
  }, [mapReady, animateLoop, updatePlaybackMarkers, switchToDrawingMode])

  const resetPlayback = useCallback(() => {
    const pb = playbackRef.current
    pb.isPlaying = false
    pb.currentIndex = 0
    pb.accumulatedFrame = 0
    pb.speed = 1  // 重置为 1x

    setIsPlaying(false)
    setSpeed(1)
    lastFrameTimeRef.current = null  // 重置时间戳

    // ========== 切换回静态模式 ==========
    switchToDrawingMode(false)

    // 重置绘制轨迹为空
    if (drawingLineOriginalRef.current) {
      drawingLineOriginalRef.current.setLatLngs([])
    }
    if (drawingLineCorrectedRef.current) {
      drawingLineCorrectedRef.current.setLatLngs([])
    }

    updatePlaybackMarkers(0)
  }, [updatePlaybackMarkers, switchToDrawingMode])

  // 自动播放：当地图准备完成后自动开始播放
  useEffect(() => {
    if (mapReady && !autoPlayTriggeredRef.current) {
      autoPlayTriggeredRef.current = true
      // 延迟一小段时间确保地图完全渲染
      const timer = setTimeout(() => {
        const pb = playbackRef.current
        // 切换到绘制模式
        switchToDrawingMode(true)

        // 重置绘制轨迹
        if (drawingLineOriginalRef.current) {
          drawingLineOriginalRef.current.setLatLngs([])
        }
        if (drawingLineCorrectedRef.current) {
          drawingLineCorrectedRef.current.setLatLngs([])
        }

        // 开始播放
        pb.currentIndex = 0
        pb.accumulatedFrame = 0
        pb.isPlaying = true
        lastFrameTimeRef.current = null  // 重置时间戳
        setIsPlaying(true)
        updatePlaybackMarkers(0)

        if (animationFrameRef.current === null) {
          animationFrameRef.current = requestAnimationFrame(animateLoop)
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [mapReady]) // 只在 mapReady 变化时触发

  // 切换实时追踪
  const toggleTracking = useCallback(() => {
    const newState = !playbackRef.current.trackMarker
    playbackRef.current.trackMarker = newState
    setTrackMarker(newState)
  }, [])

  const changeSpeed = useCallback(() => {
    const speeds = [1, 3, 5, 10]  // 播放倍数选项
    const idx = speeds.indexOf(speed)
    const newSpeed = speeds[(idx + 1) % speeds.length]
    playbackRef.current.speed = newSpeed
    setSpeed(newSpeed)
  }, [speed])

  const seekTo = useCallback((progress: number) => {
    const data = processedData
    if (!mapReady || !data) return

    const index = Math.floor((progress / 100) * (data.points.length - 1))

    // 切换到绘制模式（如果还没切换）
    switchToDrawingMode(true)

    // 更新绘制轨迹到目标位置
    if (drawingLineOriginalRef.current) {
      const newOriginalCoords = data.originalCoords.slice(0, index + 1)
      drawingLineOriginalRef.current.setLatLngs(newOriginalCoords)
    }
    if (drawingLineCorrectedRef.current) {
      const newCorrectedCoords = data.correctedCoords.slice(0, index + 1)
      drawingLineCorrectedRef.current.setLatLngs(newCorrectedCoords)
    }

    playbackRef.current.currentIndex = index
    playbackRef.current.accumulatedFrame = 0
    updatePlaybackMarkers(index)

    // 如果启用了追踪，地图跟随到新位置
    if (playbackRef.current.trackMarker) {
      const origCoord = data.originalCoords[index]
      const corrCoord = data.correctedCoords[index]
      const mapOrig = mapOriginalRef.current
      const mapCorr = mapCorrectedRef.current

      if (mapOrig && origCoord) {
        mapOrig.panTo(origCoord, { animate: true, duration: 0.1 })
      }
      if (mapCorr && corrCoord) {
        mapCorr.panTo(corrCoord, { animate: true, duration: 0.1 })
      }
    }
  }, [mapReady, processedData, updatePlaybackMarkers, switchToDrawingMode])

  // 没有数据时的显示
  if (!processedData) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-slate-400">{t('map.noData')}</div>
      </div>
    )
  }

  const { points } = processedData
  const progress = points.length > 0 ? (currentIndex / (points.length - 1)) * 100 : 0

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 地图区域 - 纵向堆叠，自适应高度 */}
      <div className="flex-1 grid grid-rows-2 gap-2 p-2 min-h-0">
        {/* 原始轨迹地图 */}
        <div className="bg-slate-800 rounded-xl overflow-hidden relative min-h-0">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg border border-red-500/30">
            {t('playback.originalTrack')}
          </div>
          <div
            ref={containerOriginalRef}
            className="w-full h-full"
            style={{ background: '#1a1a2e' }}
          />
        </div>

        {/* 修复轨迹地图 */}
        <div className="bg-slate-800 rounded-xl overflow-hidden relative min-h-0">
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg border border-cyan-500/30">
            {t('playback.repairedTrack')}
          </div>
          <div
            ref={containerCorrectedRef}
            className="w-full h-full"
            style={{ background: '#1a1a2e' }}
          />
        </div>
      </div>

      {/* 播放控制 */}
      <div className="border-t border-slate-700/50 px-4 py-3 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* 播放/暂停按钮 */}
          <button
            onClick={togglePlay}
            disabled={!mapReady}
            className="min-h-[44px] min-w-[44px] w-12 sm:w-12 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
            aria-label={isPlaying ? t('playback.pause') : t('playback.play')}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* 进度条 */}
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              disabled={!mapReady}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
            />
            <div
              ref={progressBarRef}
              className="absolute top-1/2 left-0 h-1 bg-cyan-500 rounded-full pointer-events-none -translate-y-1/2"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 速度控制 */}
          <button
            onClick={changeSpeed}
            disabled={!mapReady}
            className="px-3 py-2 text-sm font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors duration-200 border border-slate-600/50 disabled:opacity-50"
          >
            {speed}x
          </button>

          {/* 重置按钮 */}
          <button
            onClick={resetPlayback}
            disabled={!mapReady}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            aria-label={t('playback.reset')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* 实时追踪按钮 */}
          <button
            onClick={toggleTracking}
            disabled={!mapReady}
            className={`p-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
              trackMarker
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            aria-label={trackMarker ? t('playback.disableTracking') : t('playback.enableTracking')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* 计数器 */}
          <div className="text-sm text-slate-400 min-w-[100px] text-right">
            <span ref={counterRef} className="text-white font-medium">1</span>
            <span className="text-slate-500"> / {points.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
