// Point status types
export type PointStatus =
  | 'normal'
  | 'drift'
  | 'jump'
  | 'speed_anomaly'
  | 'acceleration_anomaly'
  | 'missing'
  | 'interpolated'
  | 'density_anomaly'
  | 'outlier'

// Point interface
export interface Point {
  index: number
  lat: number
  lon: number
  time: string
  elevation?: number
  status: PointStatus
  isInterpolated?: boolean
  originalLat?: number
  originalLon?: number
  speed?: number
  bearing?: number
  acceleration?: number
}

// Bounds interface
export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

// Elevation stats
export interface ElevationStats {
  min: number
  max: number
  gain: number
  loss: number
  avg: number
}

// Trajectory stats
export interface TrajectoryStats {
  pointCount: number
  distance: number
  durationSeconds: number
  bounds: Bounds
  elevation: ElevationStats
  avgSpeed: number
  maxSpeed: number
}

// Anomaly severity
export type Severity = 'low' | 'medium' | 'high'

// Anomaly type
export type AnomalyType =
  | 'drift'
  | 'jump'
  | 'speed_anomaly'
  | 'acceleration_anomaly'
  | 'missing'
  | 'density_anomaly'
  | 'outlier'

// Anomaly interface
export interface Anomaly {
  type: AnomalyType
  description: string
  count: number
  severity: Severity
  indices: number[]
  gaps?: number[][]
}

// Health rating
export type Rating = 'excellent' | 'good' | 'fair' | 'poor'

// Score detail
export interface ScoreDetail {
  score: number
  weight: number
  description: string
}

// Health score
export interface HealthScore {
  total: number
  breakdown: Record<string, ScoreDetail>
  rating: Rating
}

// Algorithm info
export interface AlgorithmInfo {
  name: string
  description: string
  processedPoints: number
  fixedPoints: number
  removedPoints?: number  // For algorithms that remove points (DP, OutlierRemoval)
  fixedIndices?: number[]
  parameters: Record<string, unknown>
}

// Diagnostics info
export interface DiagnosticsInfo {
  normalPoints: number
  anomalyPoints: number
  fixedPoints: number       // 删除的异常点
  removedPoints: number     // 简化删除的点
  interpolatedPoints: number // 插值生成的点
  totalProcessed: number    // 总处理点数 = 异常点 + 简化点
  anomalies: Anomaly[]
  algorithms: AlgorithmInfo[]
  healthScore: HealthScore
}

// Data interface
export interface Data {
  reportId: string
  original: TrajectoryStats
  corrected: TrajectoryStats
  diagnostics: DiagnosticsInfo
  points?: Point[]
}

// API Response
export interface DiagnoseResponse {
  success: boolean
  data?: Data
  error?: string
  meta?: {
    version: string
    processedAt: string
    processingTimeMs: number
    requestId?: string
  }
}

// API Error Response
export interface ErrorResponse {
  success: false
  error: string
  message: string
  details?: {
    field?: string
    expectedFormats?: string[]
    receivedFormat?: string
    maxSizeBytes?: number
    receivedSize?: number
    limit?: number
    window?: string
    retryAfter?: number
  }
  meta?: {
    version: string
  }
}

// Health Response
export interface HealthResponse {
  status: string
  version: string
  uptime: number
  timestamp: string
}

// Upload state
export type UploadState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

// Algorithm options
export interface AlgorithmOptions {
  adaptive_rts: boolean
  spline_interpolation: boolean
  simplification: boolean
  outlierRemoval: boolean
}

// Threshold options
export interface ThresholdOptions {
  maxSpeed: number
  maxAcceleration: number
  maxJump: number
  driftThreshold: number
}

// Output options
export interface OutputOptions {
  includePoints: boolean
  simplifyEpsilon: number
}

// Diagnose request options
export interface DiagnoseOptions {
  algorithms: AlgorithmOptions
  thresholds: ThresholdOptions
  output: OutputOptions
}
