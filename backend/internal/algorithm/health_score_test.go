package algorithm

import (
	"testing"
	"time"

	"github.com/positiondoctor/backend/internal/model"
)

func TestHealthScorer_Calculate(t *testing.T) {
	scorer := NewHealthScorer()

	points := createHealthyTrajectory()
	anomalies := []model.Anomaly{}

	score := scorer.Calculate(points, anomalies)

	if score.Total < 0 || score.Total > 100 {
		t.Errorf("Expected score between 0-100, got %d", score.Total)
	}

	if score.Rating == "" {
		t.Error("Expected rating to be set")
	}

	// Check breakdown
	if len(score.Breakdown) == 0 {
		t.Error("Expected breakdown to be populated")
	}
}

func TestHealthScorer_CalculateWithAnomalies(t *testing.T) {
	scorer := NewHealthScorer()

	points := createHealthyTrajectory()
	anomalies := []model.Anomaly{
		{
			Type:     model.AnomalyDrift,
			Count:    10,
			Severity: model.SeverityMedium,
			Indices:  []int{5, 6, 7, 8, 9, 10, 11, 12, 13, 14},
		},
	}

	score := scorer.Calculate(points, anomalies)

	if score.Total >= 100 {
		t.Error("Expected score < 100 with anomalies")
	}
}

func TestHealthScorer_CalculateCompleteness(t *testing.T) {
	scorer := NewHealthScorer()

	// Complete trajectory
	points := createHealthyTrajectory()
	score1 := scorer.CalculateCompletenessScore(points)
	if score1 < 50 {
		t.Errorf("Expected decent completeness score, got %f", score1)
	}

	// Trajectory with missing data
	points[50].Status = model.StatusMissing
	score2 := scorer.CalculateCompletenessScore(points)
	if score2 >= score1 {
		t.Error("Expected lower score with missing data")
	}
}

func TestHealthScorer_CalculateAccuracy(t *testing.T) {
	scorer := NewHealthScorer()

	points := createHealthyTrajectory()
	anomalies := []model.Anomaly{}

	score := scorer.CalculateAccuracyScore(points, anomalies)
	if score < 0 || score > 100 {
		t.Errorf("Expected score between 0-100, got %f", score)
	}
}

func createHealthyTrajectory() []model.Point {
	baseTime := time.Now()
	points := make([]model.Point, 100)

	for i := 0; i < 100; i++ {
		points[i] = model.Point{
			Index:     i,
			Lat:       39.9042 + float64(i)*0.0001,
			Lon:       116.4074 + float64(i)*0.0001,
			Time:      baseTime.Add(time.Duration(i) * time.Second),
			Elevation: 50.0 + float64(i)*0.5,
			Status:    model.StatusNormal,
			Speed:     30.0,
		}
	}

	return points
}
