import type {
  DiagnoseOptions,
  DiagnoseResponse,
  ErrorResponse,
} from '@/types'
import { parseTrackFile } from './gpxParser'

const API_BASE = '/api/v1'

// Binary point format: [[lat, lon, time, ele?], ...]
export type BinaryPoint = [number, number, number, number?]

export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public details?: ErrorResponse['details']
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    const data = await response.json()

    if (!response.ok) {
      // Use backend's error message if available, otherwise provide a helpful fallback
      const errorMessage = data.message || getErrorMessageForCode(data.error, response.status)
      throw new ApiError(
        errorMessage,
        data.error || 'unknown_error',
        (data as ErrorResponse).details
      )
    }

    return data
  }

  if (!response.ok) {
    throw new ApiError(response.statusText, 'http_error', {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
      window: response.headers.get('X-RateLimit-Window') || undefined,
      retryAfter: parseInt(response.headers.get('Retry-After') || '0'),
    })
  }

  return response.json()
}

// Helper to provide user-friendly error messages based on status code
function getErrorMessageForCode(code: string, status: number): string {
  const statusMessages: Record<number, string> = {
    400: '请求参数错误，请检查文件格式',
    404: '资源未找到',
    413: '文件太大，请上传小于 50MB 的文件',
    429: '请求过于频繁，请稍后再试',
    500: '服务器错误，请稍后重试',
  }

  if (statusMessages[status]) {
    return statusMessages[status]
  }

  const codeMessages: Record<string, string> = {
    // File-based errors
    'invalid_file': '文件格式错误，请确保上传有效的 GPX 或 KML 文件',
    'file_too_large': '文件大小超过限制',
    'invalid_request': '请求参数错误',

    // Points API errors
    'invalid_json': 'JSON 格式错误，请检查请求格式',
    'too_many_points': '点数超过限制（最多 100,000 个点）',
    'too_few_points': '点数不足（至少需要 2 个点）',
    'invalid_points': '坐标数据无效，请检查纬度(-90~90)、经度(-180~180)和时间戳格式',

    // Common errors
    'rate_limit_exceeded': '请求过于频繁，请稍后再试',
    'internal_error': '服务器内部错误',
  }

  return codeMessages[code] || '处理失败，请重试'
}

/**
 * Diagnose a track file (GPX/KML)
 * Parses the file client-side and sends binary array to backend
 * @param file - Track file to diagnose (.gpx or .kml)
 * @param options - Algorithm options
 * @returns Diagnose response with analysis results
 */
export async function diagnoseTrack(
  file: File,
  options: DiagnoseOptions
): Promise<DiagnoseResponse> {
  // Parse file client-side
  const { points } = await parseTrackFile(file)

  // Send binary array to backend
  return diagnosePoints(points, options)
}

/**
 * Diagnose pre-parsed points
 * Sends binary array format directly to backend
 * @param points - Array of binary points [[lat, lon, time, ele?], ...]
 * @param options - Algorithm options
 * @returns Diagnose response with analysis results
 */
export async function diagnosePoints(
  points: BinaryPoint[],
  options: DiagnoseOptions
): Promise<DiagnoseResponse> {
  const payload = {
    points,
    options,
  }

  const response = await fetch(`${API_BASE}/diagnose/points`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse<DiagnoseResponse>(response)
}

export function getExportUrl(
  type: 'gpx' | 'kml' | 'json' | 'geojson',
  reportId: string
): string {
  return `${API_BASE}/export/${reportId}/${type}`
}

export async function downloadFile(
  type: 'gpx' | 'kml' | 'json' | 'geojson',
  reportId: string,
  filename?: string
): Promise<void> {
  const url = getExportUrl(type, reportId)
  const response = await fetch(url)

  if (!response.ok) {
    throw new ApiError(`Failed to download ${type} file`, 'download_failed')
  }

  const blob = await response.blob()
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl

  // Generate filename
  const defaultFilename = `position-doctor-${reportId.slice(0, 8)}.${type}`
  a.download = filename || defaultFilename

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

// Default options
export const defaultOptions: DiagnoseOptions = {
  algorithms: {
    adaptive_rts: true,
    spline_interpolation: true,
    simplification: true,
    outlierRemoval: true,
  },
  thresholds: {
    maxSpeed: 120.0,
    maxAcceleration: 10.0,
    maxJump: 500.0,
    driftThreshold: 0.0001,
  },
  output: {
    includePoints: true,
    simplifyEpsilon: 1.0,
  },
}
