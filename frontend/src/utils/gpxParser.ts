/**
 * GPX/KML Parser Utility
 *
 * Browser-based parsing of GPS trajectory files (GPX, KML)
 * Converts to binary array format: [[lat, lon, time, ele?], ...]
 */

/**
 * Binary point format: [lat, lon, time, ele?]
 * - lat: latitude in degrees (-90 to 90)
 * - lon: longitude in degrees (-180 to 180)
 * - time: Unix timestamp in seconds
 * - ele: optional elevation in meters
 */
export type BinaryPoint = [number, number, number, number?]

/**
 * Parse result metadata
 */
export interface ParseResult {
  points: BinaryPoint[]
  metadata: {
    name?: string
    description?: string
    pointCount: number
  }
}

/**
 * Parse error
 */
export class ParseError extends Error {
  constructor(message: string, public readonly details?: string) {
    super(message)
    this.name = 'ParseError'
  }
}

/**
 * Parse a GPX file
 * @param file - GPX file to parse
 * @returns ParseResult with points and metadata
 * @throws ParseError if file is invalid
 */
export async function parseGPX(file: File): Promise<ParseResult> {
  const text = await file.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'text/xml')

  // Check for parse errors
  const parseError = xml.querySelector('parsererror')
  if (parseError) {
    throw new ParseError('Invalid GPX file', parseError.textContent || undefined)
  }

  const points: BinaryPoint[] = []

  // Support multiple track segments (trkseg)
  const trackPoints = xml.querySelectorAll('trkpt')

  if (trackPoints.length === 0) {
    // Try route points (rtept)
    const routePoints = xml.querySelectorAll('rtept')
    if (routePoints.length === 0) {
      throw new ParseError('No track points found in GPX file')
    }
    routePoints.forEach((rtept) => parsePoint(rtept, points))
  } else {
    trackPoints.forEach((trkpt) => parsePoint(trkpt, points))
  }

  // Extract metadata
  const name = xml.querySelector('trk name, metadata name, name')?.textContent || undefined
  const desc = xml.querySelector('trk desc, metadata desc, desc')?.textContent || undefined

  return {
    points,
    metadata: {
      name,
      description: desc,
      pointCount: points.length,
    },
  }
}

/**
 * Parse a single point from GPX XML element
 */
function parsePoint(element: Element, points: BinaryPoint[]): void {
  const latStr = element.getAttribute('lat')
  const lonStr = element.getAttribute('lon')

  if (!latStr || !lonStr) return

  const lat = parseFloat(latStr)
  const lon = parseFloat(lonStr)

  // Validate coordinates
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return
  }

  // Parse time
  const timeEl = element.querySelector('time')
  let time = Date.now() / 1000

  if (timeEl?.textContent) {
    const parsedTime = new Date(timeEl.textContent).getTime() / 1000
    if (!isNaN(parsedTime)) {
      time = parsedTime
    }
  }

  // Parse elevation (optional)
  const eleEl = element.querySelector('ele')
  const ele = eleEl?.textContent ? parseFloat(eleEl.textContent) : undefined

  if (ele !== undefined && !isNaN(ele)) {
    points.push([lat, lon, time, ele])
  } else {
    points.push([lat, lon, time])
  }
}

/**
 * Parse a KML file
 * @param file - KML file to parse
 * @returns ParseResult with points and metadata
 * @throws ParseError if file is invalid
 */
export async function parseKML(file: File): Promise<ParseResult> {
  const text = await file.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'text/xml')

  // Check for parse errors
  const parseError = xml.querySelector('parsererror')
  if (parseError) {
    throw new ParseError('Invalid KML file', parseError.textContent || undefined)
  }

  const points: BinaryPoint[] = []

  // Support LineString coordinates
  const lineStrings = xml.querySelectorAll('LineString coordinates')
  lineStrings.forEach((coordsEl) => parseCoordinates(coordsEl.textContent || '', points))

  // Support GX Track (Google Earth extension)
  const gxTracks = xml.querySelectorAll('gx:Track')
  gxTracks.forEach((track) => parseGXTrack(track, points))

  if (points.length === 0) {
    throw new ParseError('No valid coordinates found in KML file')
  }

  // Extract metadata
  const name = xml.querySelector('Placemark name, Document name, name')?.textContent || undefined
  const desc = xml.querySelector('Placemark description, Document description, description')?.textContent || undefined

  return {
    points,
    metadata: {
      name,
      description: desc,
      pointCount: points.length,
    },
  }
}

/**
 * Parse KML coordinates string (space-separated tuples: lon,lat,ele)
 */
function parseCoordinates(coordStr: string, points: BinaryPoint[]): void {
  const coordStrs = coordStr.trim().split(/\s+/)
  const now = Date.now() / 1000

  coordStrs.forEach((str) => {
    const parts = str.split(',')
    if (parts.length >= 2) {
      const lon = parseFloat(parts[0])
      const lat = parseFloat(parts[1])
      const ele = parts.length >= 3 ? parseFloat(parts[2]) : undefined

      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        if (ele !== undefined && !isNaN(ele)) {
          points.push([lat, lon, now, ele])
        } else {
          points.push([lat, lon, now])
        }
      }
    }
  })
}

/**
 * Parse KML GX Track (Google Earth extension with when/coord pairs)
 */
function parseGXTrack(trackEl: Element, points: BinaryPoint[]): void {
  const whens = Array.from(trackEl.querySelectorAll('when')).map(el => el.textContent)
  const coords = Array.from(trackEl.querySelectorAll('gx:coord')).map(el => el.textContent)

  const count = Math.min(whens.length, coords.length)

  for (let i = 0; i < count; i++) {
    const when = whens[i]
    const coord = coords[i]

    if (!when || !coord) continue

    const time = new Date(when).getTime() / 1000
    if (isNaN(time)) continue

    const parts = coord.trim().split(/\s+/)
    if (parts.length >= 2) {
      const lon = parseFloat(parts[0])
      const lat = parseFloat(parts[1])
      const ele = parts.length >= 3 ? parseFloat(parts[2]) : undefined

      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        if (ele !== undefined && !isNaN(ele)) {
          points.push([lat, lon, time, ele])
        } else {
          points.push([lat, lon, time])
        }
      }
    }
  }
}

/**
 * Parse a track file (auto-detect format)
 * @param file - File to parse (GPX or KML)
 * @returns ParseResult with points and metadata
 * @throws ParseError if format is unsupported or file is invalid
 */
export async function parseTrackFile(file: File): Promise<ParseResult> {
  const ext = file.name.toLowerCase()

  if (ext.endsWith('.gpx')) {
    return parseGPX(file)
  } else if (ext.endsWith('.kml')) {
    return parseKML(file)
  } else {
    throw new ParseError(
      'Unsupported file format',
      'Please use .gpx or .kml files'
    )
  }
}
