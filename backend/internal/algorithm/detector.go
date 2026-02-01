package algorithm

import (
	"math"
	"sort"

	"github.com/positiondoctor/backend/internal/model"
)

// Detector detects anomalies in trajectory data
type Detector struct {
	// Thresholds
	MaxSpeed        float64
	MaxAcceleration float64
	MaxJump         float64
	DriftThreshold  float64
	// Adaptive thresholds
	UseAdaptive bool
}

// NewDetector creates a new anomaly detector
func NewDetector() *Detector {
	return &Detector{
		MaxSpeed:        120.0, // km/h
		MaxAcceleration: 10.0,  // m/s²
		MaxJump:         500.0, // meters
		DriftThreshold:  0.0001, // degrees
		UseAdaptive:     true,
	}
}

// DetectAll detects all types of anomalies
func (d *Detector) DetectAll(points []model.Point) []model.Anomaly {
	var anomalies []model.Anomaly

	// Speed anomalies
	if speedAnomalies := d.DetectSpeedAnomalies(points); len(speedAnomalies) > 0 {
		anomalies = append(anomalies, speedAnomalies...)
	}

	// Acceleration anomalies
	if accelAnomalies := d.DetectAccelerationAnomalies(points); len(accelAnomalies) > 0 {
		anomalies = append(anomalies, accelAnomalies...)
	}

	// Position jumps
	if jumpAnomalies := d.DetectJumps(points); len(jumpAnomalies) > 0 {
		anomalies = append(anomalies, jumpAnomalies...)
	}

	// GPS drift
	if driftAnomalies := d.DetectDrift(points); len(driftAnomalies) > 0 {
		anomalies = append(anomalies, driftAnomalies...)
	}

	// Missing data
	if missingAnomalies := d.DetectMissing(points); len(missingAnomalies) > 0 {
		anomalies = append(anomalies, missingAnomalies...)
	}

	// Density anomalies
	if densityAnomalies := d.DetectDensityAnomalies(points); len(densityAnomalies) > 0 {
		anomalies = append(anomalies, densityAnomalies...)
	}

	return anomalies
}

// DetectSpeedAnomalies detects abnormal speeds
func (d *Detector) DetectSpeedAnomalies(points []model.Point) []model.Anomaly {
	var indices []int

	threshold := d.MaxSpeed
	if d.UseAdaptive {
		threshold = d.calculateAdaptiveSpeedThreshold(points)
	}

	for i, p := range points {
		if p.Speed > threshold {
			indices = append(indices, i)
		}
	}

	if len(indices) == 0 {
		return nil
	}

	return []model.Anomaly{
		{
			Type:        model.AnomalySpeedAnomaly,
			Description: "Abnormal speed detected",
			Count:       len(indices),
			Severity:    d.calculateSpeedSeverity(indices, points, threshold),
			Indices:     indices,
		},
	}
}

// DetectAccelerationAnomalies detects abnormal acceleration
func (d *Detector) DetectAccelerationAnomalies(points []model.Point) []model.Anomaly {
	var indices []int

	for i := 2; i < len(points); i++ {
		accel := model.CalculateAcceleration(points[i-2], points[i-1], points[i])
		if math.Abs(accel) > d.MaxAcceleration {
			indices = append(indices, i-1)
		}
	}

	if len(indices) == 0 {
		return nil
	}

	return []model.Anomaly{
		{
			Type:        model.AnomalyAccelAnomaly,
			Description: "Abnormal acceleration detected",
			Count:       len(indices),
			Severity:    d.calculateAccelSeverity(indices, points),
			Indices:     indices,
		},
	}
}

// DetectJumps detects position jumps
func (d *Detector) DetectJumps(points []model.Point) []model.Anomaly {
	var indices []int

	threshold := d.MaxJump
	if d.UseAdaptive {
		threshold = d.calculateAdaptiveJumpThreshold(points)
	}

	for i := 1; i < len(points); i++ {
		dist := model.HaversineDistance(
			points[i-1].Lat, points[i-1].Lon,
			points[i].Lat, points[i].Lon,
		)

		// Check distance vs time
		if !points[i].Time.IsZero() && !points[i-1].Time.IsZero() {
			duration := points[i].Time.Sub(points[i-1].Time).Seconds()
			if duration > 0 {
				maxPossibleDist := (d.MaxSpeed / 3.6) * duration // m/s * s
				if dist > maxPossibleDist && dist > threshold {
					indices = append(indices, i)
				}
			} else if dist > threshold {
				indices = append(indices, i)
			}
		}
	}

	if len(indices) == 0 {
		return nil
	}

	return []model.Anomaly{
		{
			Type:        model.AnomalyJump,
			Description: "Position jump detected",
			Count:       len(indices),
			Severity:    d.calculateJumpSeverity(indices, points),
			Indices:     indices,
		},
	}
}

// DetectDrift detects GPS drift
func (d *Detector) DetectDrift(points []model.Point) []model.Anomaly {
	if len(points) < 5 {
		return nil
	}

	var driftIndices []int
	windowSize := 5

	// Use moving window to detect drift
	for i := windowSize; i < len(points); i++ {
		window := points[i-windowSize+1 : i+1]

		// Calculate expected position based on linear regression
		expectedLat, expectedLon := d.linearRegression(window)

		// Check if current point deviates significantly
		latDiff := points[i].Lat - expectedLat
		lonDiff := points[i].Lon - expectedLon

		// Check if deviation is consistent (drift) vs random (noise)
		if d.isConsistentDeviation(points[i-windowSize/2:i+1], expectedLat, expectedLon) {
			if math.Abs(latDiff) > d.DriftThreshold || math.Abs(lonDiff) > d.DriftThreshold {
				driftIndices = append(driftIndices, i)
			}
		}
	}

	if len(driftIndices) == 0 {
		return nil
	}

	return []model.Anomaly{
		{
			Type:        model.AnomalyDrift,
			Description: "GPS position drift detected",
			Count:       len(driftIndices),
			Severity:    d.calculateDriftSeverity(driftIndices, points),
			Indices:     driftIndices,
		},
	}
}

// DetectMissing detects missing data segments
func (d *Detector) DetectMissing(points []model.Point) []model.Anomaly {
	var gaps [][]int
	start := -1

	avgInterval := d.calculateAverageInterval(points)
	maxInterval := avgInterval * 5 // Consider gap if 5x average

	for i := 1; i < len(points); i++ {
		if !points[i].Time.IsZero() && !points[i-1].Time.IsZero() {
			interval := points[i].Time.Sub(points[i-1].Time).Seconds()
			if interval > maxInterval && interval > 10 { // At least 10 seconds
				if start == -1 {
					start = i - 1
				}
			} else if start != -1 {
				gaps = append(gaps, []int{start, i})
				start = -1
			}
		}
	}

	if start != -1 {
		gaps = append(gaps, []int{start, len(points) - 1})
	}

	if len(gaps) == 0 {
		return nil
	}

	return []model.Anomaly{
		{
			Type:        model.AnomalyMissing,
			Description: "Missing data segment",
			Count:       len(gaps),
			Severity:    d.calculateMissingSeverity(gaps, points),
			Gaps:        gaps,
		},
	}
}

// DetectDensityAnomalies detects abnormal point density
func (d *Detector) DetectDensityAnomalies(points []model.Point) []model.Anomaly {
	if len(points) < 20 {
		return nil
	}

	var sparseIndices, denseIndices []int

	// Calculate point density in sliding windows
	windowSize := 10
	for i := 0; i <= len(points)-windowSize; i++ {
		window := points[i : i+windowSize]

		// Calculate average distance between consecutive points
		totalDist := 0.0
		for j := 1; j < len(window); j++ {
			dist := model.HaversineDistance(
				window[j-1].Lat, window[j-1].Lon,
				window[j].Lat, window[j].Lon,
			)
			totalDist += dist
		}
		avgDist := totalDist / float64(windowSize-1)

		// Check for anomalies
		if avgDist > 100 { // Very sparse (>100m between points)
			sparseIndices = append(sparseIndices, i+windowSize/2)
		} else if avgDist < 0.1 { // Very dense (<0.1m between points)
			denseIndices = append(denseIndices, i+windowSize/2)
		}
	}

	var anomalies []model.Anomaly

	if len(sparseIndices) > 0 {
		anomalies = append(anomalies, model.Anomaly{
			Type:        model.AnomalyDensity,
			Description: "Sparse point density detected",
			Count:       len(sparseIndices),
			Severity:    d.calculateDensitySeverity(sparseIndices, points),
			Indices:     sparseIndices,
		})
	}

	if len(denseIndices) > 0 {
		anomalies = append(anomalies, model.Anomaly{
			Type:        model.AnomalyDensity,
			Description: "Dense point clustering detected",
			Count:       len(denseIndices),
			Severity:    model.SeverityLow,
			Indices:     denseIndices,
		})
	}

	return anomalies
}

// Helper functions

func (d *Detector) calculateAdaptiveSpeedThreshold(points []model.Point) float64 {
	speeds := make([]float64, 0)
	for _, p := range points {
		if p.Speed > 0 && p.Speed < 300 { // Filter invalid values
			speeds = append(speeds, p.Speed)
		}
	}

	if len(speeds) == 0 {
		return d.MaxSpeed
	}

	sort.Float64s(speeds)
	// Use 95th percentile as threshold, protect against index out of bounds
	idx := int(float64(len(speeds)) * 0.95)
	if idx >= len(speeds) {
		idx = len(speeds) - 1
	}
	p95 := speeds[idx]
	return math.Min(p95*1.5, d.MaxSpeed)
}

func (d *Detector) calculateAdaptiveJumpThreshold(points []model.Point) float64 {
	distances := make([]float64, 0)
	for i := 1; i < len(points); i++ {
		dist := model.HaversineDistance(
			points[i-1].Lat, points[i-1].Lon,
			points[i].Lat, points[i].Lon,
		)
		if dist > 0 && dist < 10000 {
			distances = append(distances, dist)
		}
	}

	if len(distances) == 0 {
		return d.MaxJump
	}

	sort.Float64s(distances)
	// Use 99th percentile, protect against index out of bounds
	idx := int(float64(len(distances)) * 0.99)
	if idx >= len(distances) {
		idx = len(distances) - 1
	}
	p99 := distances[idx]
	return math.Min(p99*10, d.MaxJump)
}

func (d *Detector) calculateAverageInterval(points []model.Point) float64 {
	var totalInterval float64
	count := 0

	for i := 1; i < len(points); i++ {
		if !points[i].Time.IsZero() && !points[i-1].Time.IsZero() {
			interval := points[i].Time.Sub(points[i-1].Time).Seconds()
			if interval > 0 && interval < 1000 {
				totalInterval += interval
				count++
			}
		}
	}

	if count == 0 {
		return 1.0
	}
	return totalInterval / float64(count)
}

func (d *Detector) linearRegression(points []model.Point) (float64, float64) {
	n := float64(len(points))
	if n < 2 {
		return points[0].Lat, points[0].Lon
	}

	// Simple linear regression for latitude
	sumX, sumY, sumXY, sumX2 := 0.0, 0.0, 0.0, 0.0
	for i, p := range points {
		x := float64(i)
		sumX += x
		sumY += p.Lat
		sumXY += x * p.Lat
		sumX2 += x * x
	}

	latSlope := (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
	latIntercept := (sumY - latSlope*sumX) / n

	// For longitude
	sumY = 0
	sumXY = 0
	for i, p := range points {
		x := float64(i)
		sumY += p.Lon
		sumXY += x * p.Lon
	}

	lonSlope := (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
	lonIntercept := (sumY - lonSlope*sumX) / n

	// Predict next point
	lastX := float64(len(points) - 1)
	return latSlope*lastX + latIntercept, lonSlope*lastX + lonIntercept
}

func (d *Detector) isConsistentDeviation(points []model.Point, expectedLat, expectedLon float64) bool {
	if len(points) < 3 {
		return false
	}

	positiveCount := 0
	negativeCount := 0

	for _, p := range points {
		latDiff := p.Lat - expectedLat
		if latDiff > d.DriftThreshold {
			positiveCount++
		} else if latDiff < -d.DriftThreshold {
			negativeCount++
		}
	}

	// Consistent deviation means most points deviate in same direction
	return positiveCount > len(points)/2 || negativeCount > len(points)/2
}

func (d *Detector) calculateSpeedSeverity(indices []int, points []model.Point, threshold float64) model.Severity {
	if len(indices) == 0 {
		return model.SeverityLow
	}

	maxSpeed := 0.0
	for _, idx := range indices {
		if idx < len(points) && points[idx].Speed > maxSpeed {
			maxSpeed = points[idx].Speed
		}
	}

	ratio := maxSpeed / threshold
	switch {
	case ratio > 2:
		return model.SeverityHigh
	case ratio > 1.5:
		return model.SeverityMedium
	default:
		return model.SeverityLow
	}
}

func (d *Detector) calculateAccelSeverity(indices []int, points []model.Point) model.Severity {
	if len(indices) == 0 {
		return model.SeverityLow
	}

	// Check if any are extremely high
	for _, idx := range indices {
		if idx >= 2 && idx < len(points) {
			accel := model.CalculateAcceleration(
				points[idx-2], points[idx-1], points[idx],
			)
			if math.Abs(accel) > d.MaxAcceleration*2 {
				return model.SeverityHigh
			}
		}
	}

	return model.SeverityMedium
}

func (d *Detector) calculateJumpSeverity(indices []int, points []model.Point) model.Severity {
	if len(indices) > len(points)/10 {
		return model.SeverityHigh // Too many jumps
	}

	// Check maximum jump
	for _, idx := range indices {
		if idx > 0 && idx < len(points) {
			dist := model.HaversineDistance(
				points[idx-1].Lat, points[idx-1].Lon,
				points[idx].Lat, points[idx].Lon,
			)
			if dist > d.MaxJump*2 {
				return model.SeverityHigh
			}
		}
	}

	return model.SeverityMedium
}

func (d *Detector) calculateDriftSeverity(indices []int, points []model.Point) model.Severity {
	if len(indices) > len(points)/5 {
		return model.SeverityHigh
	}
	if len(indices) > len(points)/10 {
		return model.SeverityMedium
	}
	return model.SeverityLow
}

func (d *Detector) calculateMissingSeverity(gaps [][]int, points []model.Point) model.Severity {
	totalMissing := 0
	for _, gap := range gaps {
		totalMissing += gap[1] - gap[0] - 1
	}

	if totalMissing > len(points)/5 {
		return model.SeverityHigh
	}
	if totalMissing > len(points)/10 {
		return model.SeverityMedium
	}
	return model.SeverityLow
}

func (d *Detector) calculateDensitySeverity(indices []int, points []model.Point) model.Severity {
	if len(indices) > len(points)/10 {
		return model.SeverityHigh
	}
	return model.SeverityMedium
}
