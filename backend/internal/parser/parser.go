package parser

import (
	"io"
	"path/filepath"
	"strings"

	"github.com/positiondoctor/backend/internal/model"
)

// Parser interface for trajectory file parsers
type Parser interface {
	Parse(data []byte) ([]model.Point, error)
	ParseReader(r io.Reader) ([]model.Point, error)
	Validate(data []byte) error
}

// ParserFactory creates appropriate parser for file type
type ParserFactory struct{}

// NewParserFactory creates a new parser factory
func NewParserFactory() *ParserFactory {
	return &ParserFactory{}
}

// CreateParser creates parser based on file extension
func (f *ParserFactory) CreateParser(filename string) (Parser, error) {
	ext := strings.ToLower(filepath.Ext(filename))

	switch ext {
	case ".gpx":
		return NewGPXParser(), nil
	case ".kml":
		return NewKMLParser(), nil
	default:
		return nil, ErrUnsupportedFormat
	}
}

// CreateParserByType creates parser by type string
func (f *ParserFactory) CreateParserByType(fileType string) (Parser, error) {
	switch strings.ToLower(fileType) {
	case "gpx":
		return NewGPXParser(), nil
	case "kml":
		return NewKMLParser(), nil
	default:
		return nil, ErrUnsupportedFormat
	}
}

// ParseFile parses file by detecting type from extension
func (f *ParserFactory) ParseFile(filename string, data []byte) ([]model.Point, error) {
	parser, err := f.CreateParser(filename)
	if err != nil {
		return nil, err
	}

	if err := parser.Validate(data); err != nil {
		return nil, err
	}

	return parser.Parse(data)
}

// DetectFormat detects file format from content
func DetectFormat(data []byte) string {
	// Check for GPX
	if len(data) > 100 {
		content := strings.ToLower(string(data[:100]))
		if strings.Contains(content, "<gpx") {
			return "gpx"
		}
		if strings.Contains(content, "<kml") {
			return "kml"
		}
	}
	return "unknown"
}

// CalculateSpeeds calculates speeds for points
func CalculateSpeeds(points []model.Point) {
	for i := 1; i < len(points); i++ {
		points[i].Speed = model.CalculateSpeed(points[i-1], points[i])
	}
}

// CalculateBearings calculates bearings for points
func CalculateBearings(points []model.Point) {
	for i := 1; i < len(points); i++ {
		points[i].Bearing = model.CalculateBearing(
			points[i-1].Lat, points[i-1].Lon,
			points[i].Lat, points[i].Lon,
		)
	}
}

// PostProcess post-processes parsed points
func PostProcess(points []model.Point) []model.Point {
	CalculateSpeeds(points)
	CalculateBearings(points)
	return points
}

// SupportedFormats returns list of supported formats
func SupportedFormats() []string {
	return []string{"gpx", "kml"}
}

// Errors
var (
	ErrUnsupportedFormat = &ParseError{Message: "unsupported file format"}
	ErrInvalidData       = &ParseError{Message: "invalid trajectory data"}
	ErrEmptyData         = &ParseError{Message: "no trajectory data found"}
)

// ParseError represents a parsing error
type ParseError struct {
	Message string
	File    string
}

func (e *ParseError) Error() string {
	if e.File != "" {
		return e.Message + ": " + e.File
	}
	return e.Message
}
