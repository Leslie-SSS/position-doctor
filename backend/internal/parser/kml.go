package parser

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/positiondoctor/backend/internal/model"
)

// KMLParser handles KML file parsing
type KMLParser struct {
	strictMode bool
}

// isValidCoordinate checks if coordinates are valid
func (k *KMLParser) isValidCoordinate(lat, lon float64) bool {
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

// NewKMLParser creates a new KML parser
func NewKMLParser() *KMLParser {
	return &KMLParser{
		strictMode: false,
	}
}

// Parse parses KML data from bytes
func (k *KMLParser) Parse(data []byte) ([]model.Point, error) {
	kml := &KML{}
	err := xml.Unmarshal(data, kml)
	if err != nil {
		return nil, fmt.Errorf("failed to parse KML: %w", err)
	}

	return k.ExtractPoints(kml)
}

// ParseReader parses KML data from reader
func (k *KMLParser) ParseReader(r io.Reader) ([]model.Point, error) {
	data, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("failed to read KML: %w", err)
	}
	return k.Parse(data)
}

// ExtractPoints extracts points from KML structure
func (k *KMLParser) ExtractPoints(kml *KML) ([]model.Point, error) {
	var allPoints []model.Point

	// Extract from LineString
	for _, doc := range kml.Documents {
		allPoints = append(allPoints, k.extractFromDocument(doc)...)
	}

	// Extract from Placemarks
	for _, pm := range kml.Placemarks {
		points := k.extractFromPlacemark(pm)
		allPoints = append(allPoints, points...)
	}

	if len(allPoints) == 0 {
		return nil, fmt.Errorf("no points found in KML file")
	}

	// Index points
	for i := range allPoints {
		allPoints[i].Index = i
	}

	return allPoints, nil
}

// extractFromDocument extracts points from a document
func (k *KMLParser) extractFromDocument(doc KMLDocument) []model.Point {
	var points []model.Point

	// From Placemarks
	for _, pm := range doc.Placemarks {
		points = append(points, k.extractFromPlacemark(pm)...)
	}

	// From nested documents
	for _, nestedDoc := range doc.Documents {
		points = append(points, k.extractFromDocument(nestedDoc)...)
	}

	// From folders
	for _, folder := range doc.Folders {
		points = append(points, k.extractFromFolder(folder)...)
	}

	return points
}

// extractFromFolder extracts points from a folder
func (k *KMLParser) extractFromFolder(folder KMLFolder) []model.Point {
	var points []model.Point

	for _, pm := range folder.Placemarks {
		points = append(points, k.extractFromPlacemark(pm)...)
	}

	for _, nestedFolder := range folder.Folders {
		points = append(points, k.extractFromFolder(nestedFolder)...)
	}

	return points
}

// extractFromPlacemark extracts points from a placemark
func (k *KMLParser) extractFromPlacemark(pm KMLPlacemark) []model.Point {
	var points []model.Point

	// From LineString
	if pm.LineString != nil {
		points = append(points, k.parseLineString(pm.LineString.Coordinates)...)
	}

	// From Track (if available)
	if pm.Track != nil {
		points = append(points, k.parseTrack(pm.Track)...)
	}

	// From Point
	if pm.Point != nil {
		if p := k.parsePoint(pm.Point); p != nil {
			points = append(points, *p)
		}
	}

	return points
}

// parseLineString parses coordinate string from LineString
func (k *KMLParser) parseLineString(coordStr string) []model.Point {
	return k.parseCoordinates(coordStr, false)
}

// parseTrack parses a GX track with timestamps
func (k *KMLParser) parseTrack(track *KMLTrack) []model.Point {
	if len(track.Coords) == 0 {
		return k.parseCoordinates(track.Coordinates, false)
	}

	points := make([]model.Point, 0, len(track.Coords))

	for _, tc := range track.Coords {
		// Use proper validation instead of zero check
		if !k.isValidCoordinate(tc.Lat, tc.Lon) {
			continue
		}

		point := model.Point{
			Lat:    tc.Lat,
			Lon:    tc.Lon,
			Status: model.StatusNormal,
		}

		// Accept elevation >= 0 (not just > 0, as 0 can be valid at sea level)
		if tc.Elevation != 0 || math.Abs(tc.Elevation) > 1e-9 {
			point.Elevation = tc.Elevation
		}

		if !tc.When.IsZero() {
			point.Time = tc.When
		}

		points = append(points, point)
	}

	return points
}

// parsePoint parses a single point
func (k *KMLParser) parsePoint(pt *KMLPoint) *model.Point {
	if pt.Coordinates == "" {
		return nil
	}

	coords := strings.Fields(strings.TrimSpace(pt.Coordinates))
	if len(coords) == 0 {
		return nil
	}

	parts := strings.Split(coords[0], ",")
	if len(parts) < 2 {
		return nil
	}

	lon, err1 := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
	lat, err2 := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)

	if err1 != nil || err2 != nil {
		return nil
	}

	point := &model.Point{
		Lat:    lat,
		Lon:    lon,
		Status: model.StatusNormal,
	}

	if len(parts) > 2 {
		if ele, err := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64); err == nil {
			point.Elevation = ele
		}
	}

	return point
}

// parseCoordinates parses coordinate string with improved robustness
func (k *KMLParser) parseCoordinates(coordStr string, hasTime bool) []model.Point {
	coordStr = strings.TrimSpace(coordStr)
	if coordStr == "" {
		return nil
	}

	// Normalize line endings and whitespace
	coordStr = strings.ReplaceAll(coordStr, "\r\n", " ")
	coordStr = strings.ReplaceAll(coordStr, "\r", " ")
	coordStr = strings.ReplaceAll(coordStr, "\n", " ")
	coordStr = strings.ReplaceAll(coordStr, "\t", " ")

	// Split by whitespace (handles multiple spaces, tabs, newlines)
	tuples := strings.Fields(coordStr)
	if len(tuples) == 0 {
		return nil
	}

	points := make([]model.Point, 0, len(tuples))

	for _, tuple := range tuples {
		tuple = strings.TrimSpace(tuple)
		if tuple == "" {
			continue
		}

		parts := strings.Split(tuple, ",")
		if len(parts) < 2 {
			continue
		}

		lon, err1 := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
		lat, err2 := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)

		// Use proper validation instead of zero check
		if err1 != nil || err2 != nil || !k.isValidCoordinate(lat, lon) {
			continue
		}

		point := model.Point{
			Lat:    lat,
			Lon:    lon,
			Status: model.StatusNormal,
		}

		if len(parts) > 2 {
			if ele, err := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64); err == nil {
				point.Elevation = ele
			}
		}

		points = append(points, point)
	}

	return points
}

// Validate validates KML data with detailed error messages
func (k *KMLParser) Validate(data []byte) error {
	// Check for empty data
	if len(data) == 0 {
		return fmt.Errorf("KML file is empty")
	}

	// Check minimum size
	if len(data) < 50 {
		return fmt.Errorf("file too small to be a valid KML")
	}

	// Check for KML root element
	content := strings.ToLower(string(data))
	if !strings.Contains(content, "<kml") && !strings.Contains(content, "<?xml") {
		return fmt.Errorf("not a KML file - missing KML root element")
	}

	kml := &KML{}
	err := xml.Unmarshal(data, kml)
	if err != nil {
		return fmt.Errorf("invalid KML format: %w (hint: check if file is valid XML)", err)
	}

	// Count available data (deep count)
	documentCount := len(kml.Documents)
	placemarkCount := len(kml.Placemarks)

	// Recursively count placemarks in documents
	for _, doc := range kml.Documents {
		placemarkCount += len(doc.Placemarks)
		for _, folder := range doc.Folders {
			placemarkCount += countPlacemarksInFolder(folder)
		}
	}

	if documentCount == 0 && placemarkCount == 0 {
		return fmt.Errorf("KML file contains no documents or placemarks")
	}

	// Check for coordinate data
	hasCoords := false
	for _, pm := range kml.Placemarks {
		if pm.LineString != nil && strings.TrimSpace(pm.LineString.Coordinates) != "" {
			hasCoords = true
			break
		}
		if pm.Point != nil && strings.TrimSpace(pm.Point.Coordinates) != "" {
			hasCoords = true
			break
		}
	}
	if !hasCoords {
		for _, doc := range kml.Documents {
			for _, pm := range doc.Placemarks {
				if pm.LineString != nil && strings.TrimSpace(pm.LineString.Coordinates) != "" {
					hasCoords = true
					break
				}
				if pm.Point != nil && strings.TrimSpace(pm.Point.Coordinates) != "" {
					hasCoords = true
					break
				}
			}
		}
	}

	if !hasCoords {
		return fmt.Errorf("KML file has structure but no coordinate data")
	}

	return nil
}

// countPlacemarksInFolder recursively counts placemarks in folders
func countPlacemarksInFolder(folder KMLFolder) int {
	count := len(folder.Placemarks)
	for _, nested := range folder.Folders {
		count += countPlacemarksInFolder(nested)
	}
	return count
}

// KML represents the root KML element
type KML struct {
	XMLName   xml.Name     `xml:"kml"`
	Documents []KMLDocument `xml:"Document"`
	Placemarks []KMLPlacemark `xml:"Placemark"`
}

// KMLDocument represents a KML document
type KMLDocument struct {
	Name       string          `xml:"name"`
	Placemarks []KMLPlacemark  `xml:"Placemark"`
	Documents  []KMLDocument   `xml:"Document"`
	Folders    []KMLFolder     `xml:"Folder"`
}

// KMLFolder represents a KML folder
type KMLFolder struct {
	Name       string          `xml:"name"`
	Placemarks []KMLPlacemark  `xml:"Placemark"`
	Folders    []KMLFolder     `xml:"Folder"`
}

// KMLPlacemark represents a KML placemark
type KMLPlacemark struct {
	Name       string        `xml:"name"`
	LineString *KMLLineString `xml:"LineString"`
	Point      *KMLPoint      `xml:"Point"`
	Track      *KMLTrack      `xml:"Track"`
}

// KMLLineString represents a line string
type KMLLineString struct {
	Coordinates string `xml:"coordinates"`
}

// KMLPoint represents a point
type KMLPoint struct {
	Coordinates string `xml:"coordinates"`
}

// KMLTrack represents a GX track
type KMLTrack struct {
	Coordinates string        `xml:"coordinates"`
	Coords      []KMLTrackCoord `xml:"coord"`
}

// KMLTrackCoord represents a track coordinate with time
type KMLTrackCoord struct {
	Lon       float64 `xml:"lon"`
	Lat       float64 `xml:"lat"`
	Elevation float64 `xml:"elevation,omitempty"`
	When      time.Time `xml:"when,omitempty"`
}

// ToKML converts points to KML format
func ToKML(points []model.Point, name string) ([]byte, error) {
	coordStrings := make([]string, len(points))
	for i, p := range points {
		if p.Elevation > 0 {
			coordStrings[i] = fmt.Sprintf("%.8f,%.8f,%.2f", p.Lon, p.Lat, p.Elevation)
		} else {
			coordStrings[i] = fmt.Sprintf("%.8f,%.8f", p.Lon, p.Lat)
		}
	}

	kml := KML{
		Placemarks: []KMLPlacemark{
			{
				Name: name,
				LineString: &KMLLineString{
					Coordinates: strings.Join(coordStrings, " \n "),
				},
			},
		},
	}

	data, err := xml.MarshalIndent(kml, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal KML: %w", err)
	}

	// Add XML header and KML namespace
	buf := bytes.Buffer{}
	buf.WriteString(`<?xml version="1.0" encoding="UTF-8"?>`)
	buf.WriteString(`<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">`)
	buf.Write(data)
	buf.WriteString(`</kml>`)

	return buf.Bytes(), nil
}
