package algorithm

import (
	"math"

	"github.com/positiondoctor/backend/internal/model"
)

// HealthScorer calculates multi-dimensional trajectory health scores
type HealthScorer struct {
	// Weights for each dimension (sum = 1.0)
	CompletenessWeight float64
	AccuracyWeight     float64
	ConsistencyWeight  float64
	SmoothnessWeight   float64
}

// NewHealthScorer creates a new health scorer
func NewHealthScorer() *HealthScorer {
	return &HealthScorer{
		CompletenessWeight: 0.25,
		AccuracyWeight:     0.25,
		ConsistencyWeight:  0.25,
		SmoothnessWeight:   0.25,
	}
}

// Calculate calculates the overall health score
func (h *HealthScorer) Calculate(points []model.Point, anomalies []model.Anomaly) model.HealthScore {
	completeness := h.calculateCompleteness(points)
	accuracy := h.calculateAccuracy(points, anomalies)
	consistency := h.calculateConsistency(points)
	smoothness := h.calculateSmoothness(points)

	total := int(math.Round(
		completeness.Score*completeness.Weight +
			accuracy.Score*accuracy.Weight +
			consistency.Score*consistency.Weight +
			smoothness.Score*smoothness.Weight,
	))

	return model.HealthScore{
		Total: total,
		Breakdown: map[string]model.ScoreDetail{
			"completeness": completeness,
			"accuracy":     accuracy,
			"consistency":  consistency,
			"smoothness":   smoothness,
		},
		Rating: model.GetRating(total),
	}
}

// calculateCompleteness measures data completeness
func (h *HealthScorer) calculateCompleteness(points []model.Point) model.ScoreDetail {
	if len(points) == 0 {
		return model.ScoreDetail{
			Score:      0,
			Weight:     h.CompletenessWeight,
			Description: "No data available",
		}
	}

	// Count points with missing data
	missingCount := 0
	noTimeCount := 0
	noElevationCount := 0

	for _, p := range points {
		if p.Status == model.StatusMissing {
			missingCount++
		}
		if p.Time.IsZero() {
			noTimeCount++
		}
		if p.Elevation <= 0 {
			noElevationCount++
		}
	}

	// Calculate completeness ratio
	timeScore := 1.0 - float64(noTimeCount)/float64(len(points))
	elevationScore := 1.0 - float64(noElevationCount)/float64(len(points))
	gapsScore := 1.0 - float64(missingCount)/float64(len(points))

	score := (timeScore*0.4 + elevationScore*0.3 + gapsScore*0.3) * 100

	return model.ScoreDetail{
		Score:      math.Round(score),
		Weight:     h.CompletenessWeight,
		Description: "Data completeness ratio (time, elevation, gaps)",
	}
}

// calculateAccuracy measures position accuracy
func (h *HealthScorer) calculateAccuracy(points []model.Point, anomalies []model.Anomaly) model.ScoreDetail {
	if len(points) == 0 {
		return model.ScoreDetail{
			Score:      0,
			Weight:     h.AccuracyWeight,
			Description: "No data available",
		}
	}

	// Count anomalous points
	anomalyCount := 0
	highSeverityCount := 0

	for _, a := range anomalies {
		anomalyCount += a.Count
		if a.Severity == model.SeverityHigh {
			highSeverityCount += a.Count
		}
	}

	// Calculate accuracy score
	anomalyRatio := float64(anomalyCount) / float64(len(points))
	score := (1.0 - anomalyRatio) * 100

	// Penalize high severity anomalies more
	if highSeverityCount > 0 {
		score -= float64(highSeverityCount) * 2
	}

	// Calculate average deviation for points with original values
	avgDeviation := h.calculateAverageDeviation(points)
	if avgDeviation > 0 {
		// Penalize for large deviations (>10 meters)
		penalty := math.Min(avgDeviation/10, 20)
		score -= penalty
	}

	return model.ScoreDetail{
		Score:      math.Round(math.Max(0, math.Min(100, score))),
		Weight:     h.AccuracyWeight,
		Description: "Position accuracy assessment (anomalies, deviations)",
	}
}

// calculateConsistency measures temporal consistency
func (h *HealthScorer) calculateConsistency(points []model.Point) model.ScoreDetail {
	if len(points) < 2 {
		return model.ScoreDetail{
			Score:      50,
			Weight:     h.ConsistencyWeight,
			Description: "Insufficient data for consistency check",
		}
	}

	// Check time consistency
	outOfOrderCount := 0

	for i := 1; i < len(points); i++ {
		if !points[i].Time.IsZero() && !points[i-1].Time.IsZero() {
			if points[i].Time.Before(points[i-1].Time) {
				outOfOrderCount++
			}
		}
	}

	// Check speed consistency (abrupt changes)
	abruptSpeedChangeCount := 0
	for i := 2; i < len(points); i++ {
		if points[i].Speed > 0 && points[i-1].Speed > 0 {
			speedChange := math.Abs(points[i].Speed - points[i-1].Speed)
			// More than 30 km/h change in 1 interval is suspicious
			if speedChange > 30 {
				abruptSpeedChangeCount++
			}
		}
	}

	// Calculate consistency score
	timeOrderScore := (1.0 - float64(outOfOrderCount)/float64(len(points))) * 100
	speedConsistencyScore := (1.0 - float64(abruptSpeedChangeCount)/float64(len(points))) * 100

	score := (timeOrderScore*0.6 + speedConsistencyScore*0.4)

	return model.ScoreDetail{
		Score:      math.Round(math.Max(0, math.Min(100, score))),
		Weight:     h.ConsistencyWeight,
		Description: "Temporal consistency check (time order, speed changes)",
	}
}

// calculateSmoothness measures trajectory smoothness
func (h *HealthScorer) calculateSmoothness(points []model.Point) model.ScoreDetail {
	if len(points) < 3 {
		return model.ScoreDetail{
			Score:      50,
			Weight:     h.SmoothnessWeight,
			Description: "Insufficient data for smoothness check",
		}
	}

	// Calculate angular changes (bearing differences)
	angleChanges := make([]float64, 0)
	for i := 2; i < len(points); i++ {
		bearing1 := model.CalculateBearing(
			points[i-2].Lat, points[i-2].Lon,
			points[i-1].Lat, points[i-1].Lon,
		)
		bearing2 := model.CalculateBearing(
			points[i-1].Lat, points[i-1].Lon,
			points[i].Lat, points[i].Lon,
		)

		angleDiff := math.Abs(bearing2 - bearing1)
		if angleDiff > 180 {
			angleDiff = 360 - angleDiff
		}
		angleChanges = append(angleChanges, angleDiff)
	}

	// Calculate smoothness metrics
	if len(angleChanges) == 0 {
		return model.ScoreDetail{
			Score:      50,
			Weight:     h.SmoothnessWeight,
			Description: "Cannot calculate angle changes",
		}
	}

	// Average angle change
	sum := 0.0
	for _, ac := range angleChanges {
		sum += ac
	}
	avgAngleChange := sum / float64(len(angleChanges))

	// Variance of angle changes
	variance := 0.0
	for _, ac := range angleChanges {
		diff := ac - avgAngleChange
		variance += diff * diff
	}
	variance /= float64(len(angleChanges))
	stdDev := math.Sqrt(variance)

	// Lower stdDev = smoother trajectory
	// Typical values: 5-15 degrees for smooth, 20+ for jittery
	smoothnessScore := 100 - stdDev*3

	// Check for oscillations
	oscillationCount := h.countOscillations(angleChanges)
	oscillationPenalty := float64(oscillationCount) * 2
	smoothnessScore -= oscillationPenalty

	return model.ScoreDetail{
		Score:      math.Round(math.Max(0, math.Min(100, smoothnessScore))),
		Weight:     h.SmoothnessWeight,
		Description: "Trajectory smoothness score (angle changes, oscillations)",
	}
}

// calculateAverageDeviation calculates average deviation between original and corrected
func (h *HealthScorer) calculateAverageDeviation(points []model.Point) float64 {
	totalDeviation := 0.0
	count := 0

	for _, p := range points {
		if p.OriginalLat != 0 && p.OriginalLon != 0 {
			deviation := model.HaversineDistance(
				p.OriginalLat, p.OriginalLon,
				p.Lat, p.Lon,
			)
			totalDeviation += deviation
			count++
		}
	}

	if count == 0 {
		return 0
	}
	return totalDeviation / float64(count)
}

// countOscillations counts direction oscillations in trajectory
func (h *HealthScorer) countOscillations(angleChanges []float64) int {
	if len(angleChanges) < 3 {
		return 0
	}

	oscillations := 0
	for i := 2; i < len(angleChanges); i++ {
		// Check for zigzag pattern: left-right-left or right-left-right
		prev1 := angleChanges[i-2]
		prev2 := angleChanges[i-1]
		curr := angleChanges[i]

		// Simplified oscillation detection
		if prev1 < 10 && prev2 > 30 && curr < 10 {
			oscillations++
		} else if prev1 > 30 && prev2 < 10 && curr > 30 {
			oscillations++
		}
	}

	return oscillations
}

// CalculateCompletenessScore calculates only completeness score
func (h *HealthScorer) CalculateCompletenessScore(points []model.Point) float64 {
	result := h.calculateCompleteness(points)
	return result.Score
}

// CalculateAccuracyScore calculates only accuracy score
func (h *HealthScorer) CalculateAccuracyScore(points []model.Point, anomalies []model.Anomaly) float64 {
	result := h.calculateAccuracy(points, anomalies)
	return result.Score
}

// CalculateConsistencyScore calculates only consistency score
func (h *HealthScorer) CalculateConsistencyScore(points []model.Point) float64 {
	result := h.calculateConsistency(points)
	return result.Score
}

// CalculateSmoothnessScore calculates only smoothness score
func (h *HealthScorer) CalculateSmoothnessScore(points []model.Point) float64 {
	result := h.calculateSmoothness(points)
	return result.Score
}
