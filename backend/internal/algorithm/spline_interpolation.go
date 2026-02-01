package algorithm

import (
	"time"

	"github.com/positiondoctor/backend/internal/model"
)

// SplineInterpolator implements cubic spline interpolation for filling gaps
type SplineInterpolator struct {
	// Maximum gap size to interpolate (in seconds)
	maxGapSeconds int
	// Minimum points for interpolation
	minPoints int
}

// Helper functions for min/max
func intMax(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func intMin(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// SplineCoeff represents cubic spline coefficients
type SplineCoeff struct {
	A, B, C, D float64
}

// NewSplineInterpolator creates a new spline interpolator
func NewSplineInterpolator() *SplineInterpolator {
	return &SplineInterpolator{
		maxGapSeconds: 60,  // Maximum 1 minute gap
		minPoints:     2,   // Need at least 2 points
	}
}

// Interpolate fills missing points in the trajectory
func (s *SplineInterpolator) Interpolate(points []model.Point) []model.Point {
	if len(points) < s.minPoints {
		return points
	}

	// Find gaps
	gaps := s.findGaps(points)
	if len(gaps) == 0 {
		return points
	}

	// Process each gap
	result := make([]model.Point, 0, len(points)+len(gaps)*10)
	result = append(result, points[:gaps[0][0]]...)

	for i, gap := range gaps {
		startIdx := gap[0]
		endIdx := gap[1]

		// Get boundary points
		prevPoint := points[startIdx]
		nextPoint := points[endIdx]

		// Check if gap is interpolatable
		gapDuration := nextPoint.Time.Sub(prevPoint.Time).Seconds()
		if gapDuration > float64(s.maxGapSeconds) || gapDuration <= 0 {
			// Gap too large or invalid, mark as missing
			for j := startIdx + 1; j < endIdx; j++ {
				p := points[j]
				p.Status = model.StatusMissing
				result = append(result, p)
			}
			result = append(result, points[endIdx])
			continue
		}

		// Calculate number of points to interpolate
			avgInterval := s.calculateAverageInterval(points, intMax(0, startIdx-5), intMin(len(points)-1, endIdx+5))
		if avgInterval <= 0 {
			avgInterval = 1.0
		}

		numPoints := int(gapDuration / avgInterval)
		if numPoints < 1 {
			numPoints = 1
		}
		if numPoints > 100 { // Limit interpolation points
			numPoints = 100
		}

		// Perform interpolation
		interpolated := s.interpolateSegment(prevPoint, nextPoint, numPoints, startIdx)
		result = append(result, interpolated...)

		// Add next point if not last gap
		if i < len(gaps)-1 || endIdx < len(points)-1 {
			result = append(result, points[endIdx])
		}
	}

	return result
}

// findGaps finds missing data segments
func (s *SplineInterpolator) findGaps(points []model.Point) [][]int {
	var gaps [][]int
	start := -1

	for i := 1; i < len(points); i++ {
		// Check for time gap
		if !points[i].Time.IsZero() && !points[i-1].Time.IsZero() {
			gap := points[i].Time.Sub(points[i-1].Time).Seconds()

			// If gap is larger than expected (more than 3x average interval)
			if gap > 10 { // More than 10 seconds is considered a gap
				if start == -1 {
					start = i - 1
				}
			} else if start != -1 {
				// End of gap
				gaps = append(gaps, []int{start, i})
				start = -1
			}
		}
	}

	// Handle trailing gap
	if start != -1 && start < len(points)-1 {
		gaps = append(gaps, []int{start, len(points) - 1})
	}

	return gaps
}

// calculateAverageInterval calculates average time interval
func (s *SplineInterpolator) calculateAverageInterval(points []model.Point, start, end int) float64 {
	if start >= end {
		return 1.0
	}

	if start < 0 {
		start = 0
	}
	if end >= len(points) {
		end = len(points) - 1
	}

	totalInterval := 0.0
	count := 0

	for i := start + 1; i <= end; i++ {
		if !points[i].Time.IsZero() && !points[i-1].Time.IsZero() {
			interval := points[i].Time.Sub(points[i-1].Time).Seconds()
			if interval > 0 && interval < 100 { // Sanity check
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

// interpolateSegment interpolates points between two endpoints
func (s *SplineInterpolator) interpolateSegment(
	p1, p2 model.Point,
	numPoints int,
	startIndex int,
) []model.Point {
	result := make([]model.Point, numPoints)

	// Time parameterization
	t1 := float64(p1.Time.Unix())
	t2 := float64(p2.Time.Unix())
	dt := (t2 - t1) / float64(numPoints+1)

	// Calculate cubic spline coefficients for lat and lon
	// Using natural cubic spline with zero second derivative at boundaries
	latCoeffs := s.calculateNaturalSpline(
		0, p1.Lat,
		1, p2.Lat,
	)
	lonCoeffs := s.calculateNaturalSpline(
		0, p1.Lon,
		1, p2.Lon,
	)

	// Interpolate elevation if available
	var eleCoeffs *SplineCoeff
	if p1.Elevation > 0 && p2.Elevation > 0 {
		eleCoeffs = s.calculateNaturalSpline(
			0, p1.Elevation,
			1, p2.Elevation,
		)
	}

	for i := 0; i < numPoints; i++ {
		t := float64(i+1) / float64(numPoints+1)

		result[i] = model.Point{
			Index:          startIndex + i + 1,
			Lat:            s.evaluateSpline(latCoeffs, t),
			Lon:            s.evaluateSpline(lonCoeffs, t),
			Time:           p1.Time.Add(time.Duration(dt*float64(i+1)+0.5) * time.Second),
			Status:         model.StatusInterpolated,
			IsInterpolated: true,
			FixedBy:        "样条插值", // Mark as fixed by spline interpolation
		}

		if eleCoeffs != nil {
			result[i].Elevation = s.evaluateSpline(eleCoeffs, t)
		}

		// Calculate speed and bearing
		if i == 0 {
			result[i].Speed = model.CalculateSpeed(p1, result[i])
			result[i].Bearing = model.CalculateBearing(
				p1.Lat, p1.Lon,
				result[i].Lat, result[i].Lon,
			)
		} else {
			result[i].Speed = model.CalculateSpeed(result[i-1], result[i])
			result[i].Bearing = model.CalculateBearing(
				result[i-1].Lat, result[i-1].Lon,
				result[i].Lat, result[i].Lon,
			)
		}
	}

	return result
}

// calculateNaturalSpline calculates natural cubic spline coefficients
// For two points, we use a simplified Hermite spline
func (s *SplineInterpolator) calculateNaturalSpline(x1, y1, x2, y2 float64) *SplineCoeff {
	// Calculate derivatives at endpoints
	// For natural spline, second derivative is zero at boundaries
	// Using finite differences for interior points would be more accurate

	dx := x2 - x1
	dy := y2 - y1

	// Simple cubic interpolation:
	// s(t) = y1 + m1*t + (3*dy - 2*m1 - m2)*t^2 + (m1 + m2 - 2*dy)*t^3
	// For natural spline, m1 = m2 = dy (linear derivatives)
	m1 := dy / dx
	m2 := dy / dx

	// Convert to standard form: s(t) = a + b*t + c*t^2 + d*t^3
	return &SplineCoeff{
		A: y1,
		B: m1,
		C: 3*dy - 2*m1 - m2,
		D: m1 + m2 - 2*dy,
	}
}

// evaluateSpline evaluates the spline at parameter t
func (s *SplineInterpolator) evaluateSpline(coeff *SplineCoeff, t float64) float64 {
	return coeff.A + coeff.B*t + coeff.C*t*t + coeff.D*t*t*t
}

// InterpolatePoints fills specific missing points by index
func (s *SplineInterpolator) InterpolatePoints(
	points []model.Point,
	indices []int,
) []model.Point {
	if len(indices) == 0 {
		return points
	}

	// Sort indices
	sortedIndices := make([]int, len(indices))
	copy(sortedIndices, indices)
	// Simple sort (can be optimized with sort package)
	for i := 0; i < len(sortedIndices); i++ {
		for j := i + 1; j < len(sortedIndices); j++ {
			if sortedIndices[i] > sortedIndices[j] {
				sortedIndices[i], sortedIndices[j] = sortedIndices[j], sortedIndices[i]
			}
		}
	}

	result := make([]model.Point, len(points))
	copy(result, points)

	for _, idx := range sortedIndices {
		if idx <= 0 || idx >= len(points)-1 {
			continue
		}

		// Find nearest valid points
		prevIdx := idx - 1
		nextIdx := idx + 1

		// Skip if neighbors are also interpolated
		if result[prevIdx].IsInterpolated || result[nextIdx].IsInterpolated {
			continue
		}

		// Interpolate single point
		t := 0.5
		latCoeffs := s.calculateNaturalSpline(0, result[prevIdx].Lat, 1, result[nextIdx].Lat)
		lonCoeffs := s.calculateNaturalSpline(0, result[prevIdx].Lon, 1, result[nextIdx].Lon)

		// Calculate interpolated time safely
		interpolatedTime := result[prevIdx].Time
		if !result[prevIdx].Time.IsZero() && !result[nextIdx].Time.IsZero() {
			duration := result[nextIdx].Time.Sub(result[prevIdx].Time)
			interpolatedTime = result[prevIdx].Time.Add(duration / 2)
		}

		result[idx] = model.Point{
			Index:          idx,
			Lat:            s.evaluateSpline(latCoeffs, t),
			Lon:            s.evaluateSpline(lonCoeffs, t),
			Time:           interpolatedTime,
			Status:         model.StatusInterpolated,
			IsInterpolated: true,
			Speed:          model.CalculateSpeed(result[prevIdx], result[nextIdx]),
			Bearing:        model.CalculateBearing(result[prevIdx].Lat, result[prevIdx].Lon, result[nextIdx].Lat, result[nextIdx].Lon),
		}

		if result[prevIdx].Elevation > 0 && result[nextIdx].Elevation > 0 {
			eleCoeffs := s.calculateNaturalSpline(0, result[prevIdx].Elevation, 1, result[nextIdx].Elevation)
			result[idx].Elevation = s.evaluateSpline(eleCoeffs, t)
		}
	}

	return result
}
