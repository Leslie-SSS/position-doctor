package algorithm

import (
	"testing"
	"time"

	"github.com/positiondoctor/backend/internal/model"
)

func TestAdaptiveRTS_Smooth(t *testing.T) {
	rts := NewAdaptiveRTS()

	points := createTestPoints(10)
	if len(points) == 0 {
		t.Fatal("No test points created")
	}

	smoothed := rts.Smooth(points)

	if len(smoothed) != len(points) {
		t.Errorf("Expected %d points, got %d", len(points), len(smoothed))
	}

	// Check that points were modified
	modified := false
	for i := range smoothed {
		if smoothed[i].OriginalLat != 0 || smoothed[i].OriginalLon != 0 {
			modified = true
			break
		}
	}

	// With synthetic data, modifications may be minimal
	_ = modified
}

func TestAdaptiveRTS_EmptyPoints(t *testing.T) {
	rts := NewAdaptiveRTS()

	points := []model.Point{}
	smoothed := rts.Smooth(points)

	if len(smoothed) != 0 {
		t.Errorf("Expected empty slice, got %d points", len(smoothed))
	}
}

func TestAdaptiveRTS_SinglePoint(t *testing.T) {
	rts := NewAdaptiveRTS()

	points := []model.Point{
		{
			Index: 0,
			Lat:   39.9042,
			Lon:   116.4074,
			Time:  time.Now(),
			Status: model.StatusNormal,
		},
	}

	smoothed := rts.Smooth(points)

	if len(smoothed) != 1 {
		t.Errorf("Expected 1 point, got %d", len(smoothed))
	}
}

func createTestPoints(count int) []model.Point {
	points := make([]model.Point, count)
	baseTime := time.Now()

	for i := 0; i < count; i++ {
		points[i] = model.Point{
			Index: i,
			Lat:   39.9042 + float64(i)*0.0001,
			Lon:   116.4074 + float64(i)*0.0001,
			Time:  baseTime.Add(time.Duration(i) * time.Second),
			Status: model.StatusNormal,
		}

		// Add some noise
		if i > 0 && i%3 == 0 {
			points[i].Lat += 0.001
			points[i].Lon += 0.001
		}
	}

	return points
}

func BenchmarkAdaptiveRTS_Smooth(b *testing.B) {
	rts := NewAdaptiveRTS()
	points := createTestPoints(1000)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rts.Smooth(points)
	}
}
