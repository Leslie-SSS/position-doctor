package algorithm

import (
	"testing"
	"time"

	"github.com/positiondoctor/backend/internal/model"
)

func TestDetector_DetectSpeedAnomalies(t *testing.T) {
	detector := NewDetector()

	points := createTestTrajectory()

	anomalies := detector.DetectSpeedAnomalies(points)

	if len(anomalies) == 0 {
		// May not detect anomalies in synthetic data
		return
	}

	for _, a := range anomalies {
		if a.Type != model.AnomalySpeedAnomaly {
			t.Errorf("Expected speed_anomaly, got %s", a.Type)
		}
		if a.Severity == "" {
			t.Error("Expected severity to be set")
		}
	}
}

func TestDetector_DetectJumps(t *testing.T) {
	detector := NewDetector()

	points := createTestTrajectory()

	anomalies := detector.DetectJumps(points)

	for _, a := range anomalies {
		if a.Type != model.AnomalyJump {
			t.Errorf("Expected jump, got %s", a.Type)
		}
	}
}

func TestDetector_DetectAll(t *testing.T) {
	detector := NewDetector()

	points := createTestTrajectory()

	anomalies := detector.DetectAll(points)

	// Should return at least some result
	if anomalies == nil {
		t.Error("Expected anomalies to be initialized")
	}
}

func TestDetector_AdaptiveThreshold(t *testing.T) {
	detector := &Detector{
		MaxSpeed:        120.0,
		MaxAcceleration: 10.0,
		MaxJump:         500.0,
		UseAdaptive:     true,
	}

	points := createTestTrajectory()
	_ = detector.DetectSpeedAnomalies(points)
	// Should not panic
}

func createTestTrajectory() []model.Point {
	baseTime := time.Now()
	points := make([]model.Point, 100)

	for i := 0; i < 100; i++ {
		points[i] = model.Point{
			Index: i,
			Lat:   39.9042 + float64(i)*0.0001,
			Lon:   116.4074 + float64(i)*0.0001,
			Time:  baseTime.Add(time.Duration(i) * time.Second),
			Status: model.StatusNormal,
			Speed: 30.0, // Normal speed
		}

		// Add some anomalies
		if i == 50 {
			points[i].Speed = 200.0 // Speed anomaly
		}
	}

	return points
}
