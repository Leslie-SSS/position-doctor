package parser

import (
	"strings"
	"testing"
	"time"
)

func TestGPXParser_Parse(t *testing.T) {
	parser := NewGPXParser()

	gpxData := []byte(`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PositionDoctor">
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="39.9042" lon="116.4074">
        <ele>50.5</ele>
        <time>2024-01-01T08:00:00Z</time>
      </trkpt>
      <trkpt lat="39.9052" lon="116.4084">
        <ele>51.0</ele>
        <time>2024-01-01T08:00:30Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`)

	points, err := parser.Parse(gpxData)
	if err != nil {
		t.Fatalf("Failed to parse GPX: %v", err)
	}

	if len(points) != 2 {
		t.Errorf("Expected 2 points, got %d", len(points))
	}

	if points[0].Lat != 39.9042 {
		t.Errorf("Expected lat 39.9042, got %f", points[0].Lat)
	}

	if points[0].Lon != 116.4074 {
		t.Errorf("Expected lon 116.4074, got %f", points[0].Lon)
	}
}

func TestGPXParser_Validate(t *testing.T) {
	parser := NewGPXParser()

	validGPX := []byte(`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
  <trk>
    <trkseg>
      <trkpt lat="39.9042" lon="116.4074"/>
    </trkseg>
  </trk>
</gpx>`)

	err := parser.Validate(validGPX)
	if err != nil {
		t.Errorf("Expected valid GPX, got error: %v", err)
	}

	invalidGPX := []byte(`not xml`)
	err = parser.Validate(invalidGPX)
	if err == nil {
		t.Error("Expected error for invalid GPX")
	}
}

func TestGPXParser_EmptyData(t *testing.T) {
	parser := NewGPXParser()

	_, err := parser.Parse([]byte(""))
	if err == nil {
		t.Error("Expected error for empty data")
	}
}

func TestToGPX(t *testing.T) {
	now := time.Now()

	points := []model.Point{
		{
			Index:     0,
			Lat:       39.9042,
			Lon:       116.4074,
			Elevation: 50.5,
			Time:      now,
			Status:    model.StatusNormal,
		},
		{
			Index:     1,
			Lat:       39.9052,
			Lon:       116.4084,
			Elevation: 51.0,
			Time:      now.Add(time.Second * 30),
			Status:    model.StatusNormal,
		},
	}

	data, err := ToGPX(points, "Test")
	if err != nil {
		t.Errorf("Failed to create GPX: %v", err)
	}

	if len(data) == 0 {
		t.Error("Expected non-empty GPX data")
	}

	// Check for GPX header
	gpxStr := string(data)
	if !contains(gpxStr, "<?xml") {
		t.Error("Expected XML header in GPX output")
	}
	if !contains(gpxStr, "<gpx") {
		t.Error("Expected <gpx> tag in GPX output")
	}
}

// Helper function for string contains
func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}
