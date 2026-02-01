package parser

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"math"
	"strings"
	"time"

	"github.com/positiondoctor/backend/internal/model"
)

// GPXParser handles GPX file parsing
type GPXParser struct {
	strictMode bool
}

// NewGPXParser creates a new GPX parser
func NewGPXParser() *GPXParser {
	return &GPXParser{
		strictMode: false,
	}
}

// Parse parses GPX data from bytes
func (g *GPXParser) Parse(data []byte) ([]model.Point, error) {
	gpx := &GPX{}
	err := xml.Unmarshal(data, gpx)
	if err != nil {
		return nil, fmt.Errorf("failed to parse GPX: %w", err)
	}

	return g.ExtractPoints(gpx)
}

// ParseReader parses GPX data from reader
func (g *GPXParser) ParseReader(r io.Reader) ([]model.Point, error) {
	data, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("failed to read GPX: %w", err)
	}
	return g.Parse(data)
}

// ExtractPoints extracts points from GPX structure
func (g *GPXParser) ExtractPoints(gpx *GPX) ([]model.Point, error) {
	var allPoints []model.Point

	// Extract from tracks
	for _, track := range gpx.Tracks {
		for _, segment := range track.Segments {
			points := g.extractTrackPoints(segment.Points)
			allPoints = append(allPoints, points...)
		}
	}

	// Extract from routes if no tracks
	if len(allPoints) == 0 {
		for _, route := range gpx.Routes {
			points := g.extractRoutePoints(route.Points)
			allPoints = append(allPoints, points...)
		}
	}

	// Extract from waypoints if no tracks or routes
	if len(allPoints) == 0 {
		points := g.extractWaypoints(gpx.Waypoints)
		allPoints = append(allPoints, points...)
	}

	if len(allPoints) == 0 {
		return nil, fmt.Errorf("no points found in GPX file")
	}

	// Index points and calculate derived values
	for i := range allPoints {
		allPoints[i].Index = i
	}

	return allPoints, nil
}

// isValidCoordinate checks if coordinates are valid
func (g *GPXParser) isValidCoordinate(lat, lon float64) bool {
	// Check for NaN and Inf
	if math.IsNaN(lat) || math.IsInf(lat, 0) {
		return false
	}
	if math.IsNaN(lon) || math.IsInf(lon, 0) {
		return false
	}
	// Check valid ranges: latitude [-90, 90], longitude [-180, 180]
	if lat < -90 || lat > 90 {
		return false
	}
	if lon < -180 || lon > 180 {
		return false
	}
	return true
}

// parseTime attempts to parse time in multiple GPX formats
func (g *GPXParser) parseTime(timeStr string) (time.Time, bool) {
	if timeStr == "" {
		return time.Time{}, false
	}

	// Common GPX time formats in order of preference
	formats := []string{
		time.RFC3339Nano,        // 2008-10-03T16:14:35.123456789Z
		time.RFC3339,            // 2008-10-03T16:14:35Z
		"2006-01-02T15:04:05Z",  // GPX 1.0 format
		"2006-01-02T15:04:05",   // Without timezone
		"2006-01-02 15:04:05",   // Space separated
		"2006-01-02T15:04:05.000Z", // With milliseconds
		"2006-01-02T15:04:05-07:00", // With offset
		"2006-01-02T15:04:05+07:00",
	}

	// Clean whitespace
	timeStr = strings.TrimSpace(timeStr)

	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t, true
		}
	}

	return time.Time{}, false
}

// extractTrackPoints extracts points from track segment
func (g *GPXParser) extractTrackPoints(points []GPXPoint) []model.Point {
	result := make([]model.Point, 0, len(points))

	for _, p := range points {
		// Validate coordinates properly (not just zero check)
		if !g.isValidCoordinate(p.Lat, p.Lon) {
			continue
		}

		point := model.Point{
			Lat:       p.Lat,
			Lon:       p.Lon,
			Elevation: p.Elevation,
			Status:    model.StatusNormal,
		}

		// Try multiple time formats
		if t, ok := g.parseTime(p.Time); ok {
			point.Time = t
		}

		result = append(result, point)
	}

	return result
}

// extractRoutePoints extracts points from route
func (g *GPXParser) extractRoutePoints(points []GPXPoint) []model.Point {
	return g.extractTrackPoints(points)
}

// extractWaypoints extracts waypoints
func (g *GPXParser) extractWaypoints(waypoints []GPXPoint) []model.Point {
	return g.extractTrackPoints(waypoints)
}

// Validate validates GPX data with detailed error messages
func (g *GPXParser) Validate(data []byte) error {
	// Check for empty data
	if len(data) == 0 {
		return fmt.Errorf("GPX file is empty")
	}

	// Check minimum size (basic GPX header)
	if len(data) < 50 {
		return fmt.Errorf("file too small to be a valid GPX")
	}

	// Check for GPX root element
	content := strings.ToLower(string(data))
	if !strings.Contains(content, "<gpx") && !strings.Contains(content, "<?xml") {
		return fmt.Errorf("not a GPX file - missing GPX root element")
	}

	gpx := &GPX{}
	err := xml.Unmarshal(data, gpx)
	if err != nil {
		return fmt.Errorf("invalid GPX format: %w (hint: check if file is valid XML)", err)
	}

	// Count available data
	trackCount := 0
	routeCount := 0
	waypointCount := 0

	for _, t := range gpx.Tracks {
		trackCount++
		for _, seg := range t.Segments {
			waypointCount += len(seg.Points)
		}
	}
	routeCount = len(gpx.Routes)
	waypointCount += len(gpx.Waypoints)

	if trackCount == 0 && routeCount == 0 && len(gpx.Waypoints) == 0 {
		return fmt.Errorf("GPX file contains no tracks, routes, or waypoints")
	}

	// Check if file has actual point data
	if waypointCount == 0 {
		return fmt.Errorf("GPX file has structure but no track points or waypoints")
	}

	return nil
}

// GPX represents the root GPX element
type GPX struct {
	XMLName   xml.Name   `xml:"gpx"`
	Version   string     `xml:"version,attr"`
	Creator   string     `xml:"creator,attr"`
	Name      string     `xml:"name"`
	Tracks    []GPXTrack `xml:"trk"`
	Routes    []GPXRoute `xml:"rte"`
	Waypoints []GPXPoint `xml:"wpt"`
}

// GPXTrack represents a track
type GPXTrack struct {
	Name     string        `xml:"name"`
	Segments []GPXSegment  `xml:"trkseg"`
}

// GPXSegment represents a track segment
type GPXSegment struct {
	Points []GPXPoint `xml:"trkpt"`
}

// GPXRoute represents a route
type GPXRoute struct {
	Name   string     `xml:"name"`
	Points []GPXPoint `xml:"rtept"`
}

// GPXPoint represents a waypoint/track point
type GPXPoint struct {
	Lat       float64  `xml:"lat,attr"`
	Lon       float64  `xml:"lon,attr"`
	Elevation float64  `xml:"ele"`
	Time      string   `xml:"time"`
	Name      string   `xml:"name"`
	Speed     float64  `xml:"speed"`
	Extensions *GPXExtensions `xml:"extensions"`
}

// GPXExtensions represents GPX extensions
type GPXExtensions struct {
	// Can be extended for vendor-specific data
}

// ToGPX converts points to GPX format
func ToGPX(points []model.Point, name string) ([]byte, error) {
	gpx := GPX{
		Version: "1.1",
		Creator: "PositionDoctor",
		Name:    name,
		Tracks: []GPXTrack{
			{
				Name: name,
				Segments: []GPXSegment{
					{
						Points: makeGPXPoints(points),
					},
				},
			},
		},
	}

	data, err := xml.MarshalIndent(gpx, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal GPX: %w", err)
	}

	// Add XML header
	buf := bytes.Buffer{}
	buf.WriteString(`<?xml version="1.0" encoding="UTF-8"?>`)
	buf.Write(data)

	return buf.Bytes(), nil
}

// makeGPXPoints converts model points to GPX points
func makeGPXPoints(points []model.Point) []GPXPoint {
	result := make([]GPXPoint, len(points))

	for i, p := range points {
		result[i] = GPXPoint{
			Lat:       p.Lat,
			Lon:       p.Lon,
			Elevation: p.Elevation,
		}

		if !p.Time.IsZero() {
			result[i].Time = p.Time.Format(time.RFC3339)
		}
	}

	return result
}
