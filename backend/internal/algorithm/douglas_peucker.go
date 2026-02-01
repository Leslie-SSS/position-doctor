package algorithm

import (
	"math"
	"sync"

	"github.com/positiondoctor/backend/internal/model"
)

// ImprovedDouglasPeucker implements noise-aware trajectory simplification
type ImprovedDouglasPeucker struct {
	// Epsilon tolerance in meters
	Epsilon float64
	// Consider noise level in simplification
	ConsiderNoise bool
	// Minimum points to preserve
	MinPoints int
}

// NewImprovedDouglasPeucker creates a new improved Douglas-Peucker simplifier
func NewImprovedDouglasPeucker(epsilon float64) *ImprovedDouglasPeucker {
	return &ImprovedDouglasPeucker{
		Epsilon:       epsilon,
		ConsiderNoise: true,
		MinPoints:     2,
	}
}

// Simplify simplifies the trajectory using Douglas-Peucker algorithm
func (idp *ImprovedDouglasPeucker) Simplify(points []model.Point) []model.Point {
	if len(points) <= idp.MinPoints {
		return points
	}

	// Build list of indices to keep
	keep := make([]bool, len(points))
	keep[0] = true
	keep[len(points)-1] = true

	// Recursive simplification
	idp.simplifyRecursive(points, 0, len(points)-1, keep)

	// Build result from kept points
	result := make([]model.Point, 0, len(points))
	keptCount := 0
	for i, k := range keep {
		if k {
			result = append(result, points[i])
			keptCount++
		}
	}

	// Ensure minimum points
	if keptCount < idp.MinPoints {
		return points
	}

	return result
}

// simplifyRecursive recursively simplifies the trajectory
func (idp *ImprovedDouglasPeucker) simplifyRecursive(
	points []model.Point,
	first, last int,
	keep []bool,
) {
	if last-first <= 1 {
		return
	}

	// Find point with maximum distance
	maxDist, maxIdx := idp.findMaxDistance(points, first, last)

	// Adjust threshold based on noise if enabled
	threshold := idp.Epsilon
	if idp.ConsiderNoise {
		threshold = idp.adjustForNoise(points, first, last, threshold)
	}

	if maxDist > threshold {
		keep[maxIdx] = true
		// Recursively simplify left and right
		idp.simplifyRecursive(points, first, maxIdx, keep)
		idp.simplifyRecursive(points, maxIdx, last, keep)
	}
}

// findMaxDistance finds the point with maximum perpendicular distance
func (idp *ImprovedDouglasPeucker) findMaxDistance(
	points []model.Point,
	first, last int,
) (float64, int) {
	maxDist := 0.0
	maxIdx := first

	// Line from first to last
	p1 := points[first]
	p2 := points[last]

	for i := first + 1; i < last; i++ {
		dist := idp.perpendicularDistance(points[i], p1, p2)

		// Consider speed anomaly in distance calculation
		if points[i].Speed > 0 {
			// Higher speed points may need more precision
			speedFactor := points[i].Speed / 50.0 // Normalize around 50 km/h
			if speedFactor > 1.5 {
				dist *= 1.2 // Increase distance importance for high-speed points
			}
		}

		if dist > maxDist {
			maxDist = dist
			maxIdx = i
		}
	}

	return maxDist, maxIdx
}

// perpendicularDistance calculates perpendicular distance from point to line
func (idp *ImprovedDouglasPeucker) perpendicularDistance(
	point, lineStart, lineEnd model.Point,
) float64 {
	// Use Haversine distance for geospatial calculation
	// Approximate perpendicular distance using projection

	// Calculate line length
	lineLength := model.HaversineDistance(
		lineStart.Lat, lineStart.Lon,
		lineEnd.Lat, lineEnd.Lon,
	)

	if lineLength == 0 {
		return model.HaversineDistance(
			lineStart.Lat, lineStart.Lon,
			point.Lat, point.Lon,
		)
	}

	// Calculate distances from point to line endpoints
	d1 := model.HaversineDistance(
		lineStart.Lat, lineStart.Lon,
		point.Lat, point.Lon,
	)
	d2 := model.HaversineDistance(
		lineEnd.Lat, lineEnd.Lon,
		point.Lat, point.Lon,
	)

	// Use Heron's formula for area of triangle
	s := (d1 + d2 + lineLength) / 2
	area := math.Sqrt(s * (s - d1) * (s - d2) * (s - lineLength))

	// Height = 2 * area / base
	return 2 * area / lineLength
}

// adjustForNoise adjusts threshold based on noise level
func (idp *ImprovedDouglasPeucker) adjustForNoise(
	points []model.Point,
	first, last int,
	baseThreshold float64,
) float64 {
	// Calculate local noise level
	noiseLevel := idp.estimateNoise(points, first, last)

	// Adjust threshold: more noise = higher threshold
	adjustmentFactor := 1.0 + noiseLevel
	return baseThreshold * adjustmentFactor
}

// estimateNoise estimates noise level in segment
func (idp *ImprovedDouglasPeucker) estimateNoise(
	points []model.Point,
	first, last int,
) float64 {
	if last-first < 3 {
		return 0
	}

	// Calculate angular deviation as noise indicator
	sumDeviation := 0.0
	count := 0

	for i := first + 1; i < last; i++ {
		// Calculate angle change
		bearing1 := model.CalculateBearing(
			points[i-1].Lat, points[i-1].Lon,
			points[i].Lat, points[i].Lon,
		)
		bearing2 := model.CalculateBearing(
			points[i].Lat, points[i].Lon,
			points[i+1].Lat, points[i+1].Lon,
		)

		// Calculate angular difference
		angleDiff := math.Abs(bearing2 - bearing1)
		if angleDiff > 180 {
			angleDiff = 360 - angleDiff
		}

		// Small angle changes indicate straight-line motion
		// Large deviations may indicate noise or actual turns
		if angleDiff < 10 {
			sumDeviation += angleDiff
		}
		count++
	}

	if count == 0 {
		return 0
	}

	avgDeviation := sumDeviation / float64(count)

	// Normalize to 0-1 range
	// Low deviation = smooth (low noise)
	// High deviation = jittery (high noise)
	return math.Min(avgDeviation/45, 1.0)
}

// SimplifyWithPreservation simplifies while preserving key points
func (idp *ImprovedDouglasPeucker) SimplifyWithPreservation(
	points []model.Point,
	preserveIndices []int,
) []model.Point {
	if len(points) <= idp.MinPoints {
		return points
	}

	// Build preserve set
	preserve := make(map[int]bool)
	for _, idx := range preserveIndices {
		if idx >= 0 && idx < len(points) {
			preserve[idx] = true
		}
	}

	// Always preserve first and last
	preserve[0] = true
	preserve[len(points)-1] = true

	// Build list of indices to keep
	keep := make([]bool, len(points))
	for idx := range preserve {
		keep[idx] = true
	}

	// Simplify between preserved points
	sortedIndices := idp.sortKeys(preserve)
	for i := 0; i < len(sortedIndices)-1; i++ {
		first := sortedIndices[i]
		last := sortedIndices[i+1]

		if last-first > 1 {
			idp.simplifyRecursive(points, first, last, keep)
		}
	}

	// Build result
	result := make([]model.Point, 0, len(points))
	for i, k := range keep {
		if k {
			result = append(result, points[i])
		}
	}

	return result
}

// sortKeys sorts map keys
func (idp *ImprovedDouglasPeucker) sortKeys(m map[int]bool) []int {
	keys := make([]int, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}

	// Simple bubble sort (can be optimized)
	for i := 0; i < len(keys); i++ {
		for j := i + 1; j < len(keys); j++ {
			if keys[i] > keys[j] {
				keys[i], keys[j] = keys[j], keys[i]
			}
		}
	}

	return keys
}

// SimplifyParallel simplifies using parallel processing for large trajectories
func (idp *ImprovedDouglasPeucker) SimplifyParallel(points []model.Point, workers int) []model.Point {
	if len(points) <= 1000 || workers <= 1 {
		return idp.Simplify(points)
	}

	// Divide trajectory into segments
	segmentSize := len(points) / workers
	if segmentSize < 100 {
		segmentSize = 100
	}

	var wg sync.WaitGroup
	results := make([][]model.Point, workers)
	boundaries := make([][]int, workers)

	for i := 0; i < workers; i++ {
		start := i * segmentSize
		end := start + segmentSize
		if end > len(points) {
			end = len(points)
		}
		if i == workers-1 {
			end = len(points)
		}

		if start >= end {
			continue
		}

		wg.Add(1)
		go func(idx, s, e int) {
			defer wg.Done()

			// Simplify segment
			segmentPoints := points[s:e]
			results[idx] = idp.Simplify(segmentPoints)

			// Store boundaries for merging
			boundaries[idx] = []int{s, e}
		}(i, start, end)
	}

	wg.Wait()

	// Merge results
	result := make([]model.Point, 0)
	for i := range results {
		if len(results[i]) > 0 {
			// Avoid duplicate boundary points
			if i > 0 && len(result) > 0 {
				// Check if last point of previous segment equals first point of current segment
				lastPrev := result[len(result)-1]
				firstCurr := results[i][0]

				dist := model.HaversineDistance(
					lastPrev.Lat, lastPrev.Lon,
					firstCurr.Lat, firstCurr.Lon,
				)

				if dist < 1 { // Very close, likely duplicate
					results[i] = results[i][1:]
				}
			}
			result = append(result, results[i]...)
		}
	}

	return result
}

// CalculateCompressionRatio calculates the compression ratio
func (idp *ImprovedDouglasPeucker) CalculateCompressionRatio(
	original, simplified []model.Point,
) float64 {
	if len(original) == 0 {
		return 0
	}
	return float64(len(original)) / float64(len(simplified))
}

// CalculateSimplificationError calculates maximum simplification error
func (idp *ImprovedDouglasPeucker) CalculateSimplificationError(
	original, simplified []model.Point,
) float64 {
	if len(simplified) < 2 {
		return 0
	}

	maxError := 0.0

	// Find each original point's distance to simplified line
	for _, op := range original {
		minDist := math.MaxFloat64

		for i := 0; i < len(simplified)-1; i++ {
			dist := idp.perpendicularDistance(op, simplified[i], simplified[i+1])
			if dist < minDist {
				minDist = dist
			}
		}

		if minDist > maxError {
			maxError = minDist
		}
	}

	return maxError
}
