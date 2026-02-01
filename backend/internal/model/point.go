package model

import (
	"math"
	"time"
)

// Point represents a GPS trajectory point
type Point struct {
	Index          int       `json:"index"`
	Lat            float64   `json:"lat"`
	Lon            float64   `json:"lon"`
	Time           time.Time `json:"time"`
	Elevation      float64   `json:"elevation,omitempty"`
	Status         PointStatus `json:"status"`
	IsInterpolated bool      `json:"isInterpolated,omitempty"`
	OriginalLat    float64   `json:"originalLat,omitempty"`
	OriginalLon    float64   `json:"originalLon,omitempty"`
	Speed          float64   `json:"speed,omitempty"`
	Bearing        float64   `json:"bearing,omitempty"`
	Acceleration   float64   `json:"acceleration,omitempty"`
	FixedBy        string    `json:"fixedBy,omitempty"` // Which algorithm fixed this point
}

// PointStatus represents the status of a trajectory point
type PointStatus string

const (
	StatusNormal      PointStatus = "normal"
	StatusDrift       PointStatus = "drift"
	StatusJump        PointStatus = "jump"
	StatusSpeedAnomaly PointStatus = "speed_anomaly"
	StatusAccelAnomaly PointStatus = "acceleration_anomaly"
	StatusMissing     PointStatus = "missing"
	StatusInterpolated PointStatus = "interpolated"
)

// Bounds represents geographic bounds
type Bounds struct {
	North float64 `json:"north"`
	South float64 `json:"south"`
	East  float64 `json:"east"`
	West  float64 `json:"west"`
}

// ElevationStats represents elevation statistics
type ElevationStats struct {
	Min   float64 `json:"min"`
	Max   float64 `json:"max"`
	Gain  float64 `json:"gain"`
	Loss  float64 `json:"loss"`
	Avg   float64 `json:"avg"`
}

// TrajectoryStats represents trajectory statistics
type TrajectoryStats struct {
	PointCount    int             `json:"pointCount"`
	Distance      float64         `json:"distance"`       // meters
	DurationSecs  int64           `json:"durationSeconds"`
	Bounds        Bounds          `json:"bounds"`
	Elevation     ElevationStats  `json:"elevation"`
	AvgSpeed      float64         `json:"avgSpeed"`       // km/h
	MaxSpeed      float64         `json:"maxSpeed"`       // km/h
}

// Anomaly represents a detected anomaly
type Anomaly struct {
	Type        AnomalyType `json:"type"`
	Description string      `json:"description"`
	Count       int         `json:"count"`
	Severity    Severity    `json:"severity"`
	Indices     []int       `json:"indices"`
	Gaps        [][]int     `json:"gaps,omitempty"`
}

// AnomalyType represents the type of anomaly
type AnomalyType string

const (
	AnomalyDrift       AnomalyType = "drift"
	AnomalyJump        AnomalyType = "jump"
	AnomalySpeedAnomaly AnomalyType = "speed_anomaly"
	AnomalyAccelAnomaly AnomalyType = "acceleration_anomaly"
	AnomalyMissing     AnomalyType = "missing"
	AnomalyDensity     AnomalyType = "density_anomaly"
)

// Severity represents the severity level
type Severity string

const (
	SeverityLow    Severity = "low"
	SeverityMedium Severity = "medium"
	SeverityHigh   Severity = "high"
)

// HealthScore represents the health score of a trajectory
type HealthScore struct {
	Total     int                    `json:"total"`
	Breakdown map[string]ScoreDetail `json:"breakdown"`
	Rating    Rating                 `json:"rating"`
}

// ScoreDetail represents a score component
type ScoreDetail struct {
	Score      float64 `json:"score"`
	Weight     float64 `json:"weight"`
	Description string  `json:"description"`
}

// Rating represents the overall rating
type Rating string

const (
	RatingExcellent Rating = "excellent"
	RatingGood      Rating = "good"
	RatingFair      Rating = "fair"
	RatingPoor      Rating = "poor"
)

// Trajectory represents a complete trajectory
type Trajectory struct {
	Points  []Point `json:"points"`
	OriginalPointCount int    `json:"originalPointCount"`
}

// HaversineDistance calculates the great circle distance between two points
func HaversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371000 // Earth radius in meters

	dLat := toRadians(lat2 - lat1)
	dLon := toRadians(lon2 - lon1)

	lat1Rad := toRadians(lat1)
	lat2Rad := toRadians(lat2)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(lat1Rad)*math.Cos(lat2Rad)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

// CalculateBearing calculates the initial bearing between two points
func CalculateBearing(lat1, lon1, lat2, lon2 float64) float64 {
	dLon := toRadians(lon2 - lon1)

	lat1Rad := toRadians(lat1)
	lat2Rad := toRadians(lat2)

	y := math.Sin(dLon) * math.Cos(lat2Rad)
	x := math.Cos(lat1Rad)*math.Sin(lat2Rad) -
		math.Sin(lat1Rad)*math.Cos(lat2Rad)*math.Cos(dLon)

	bearing := math.Atan2(y, x)
	bearing = toDegrees(bearing)
	bearing = math.Mod(bearing+360, 360)

	return bearing
}

// CalculateSpeed calculates speed in km/h between two points
func CalculateSpeed(p1, p2 Point) float64 {
	if p2.Time.IsZero() || p1.Time.IsZero() {
		return 0
	}

	duration := p2.Time.Sub(p1.Time).Seconds()
	if duration <= 0 {
		return 0
	}

	distance := HaversineDistance(p1.Lat, p1.Lon, p2.Lat, p2.Lon)
	return (distance / 1000) / (duration / 3600) // km/h
}

// CalculateAcceleration calculates acceleration in m/s²
func CalculateAcceleration(p1, p2, p3 Point) float64 {
	if p2.Time.IsZero() || p1.Time.IsZero() || p3.Time.IsZero() {
		return 0
	}

	dt1 := p2.Time.Sub(p1.Time).Seconds()
	dt2 := p3.Time.Sub(p2.Time).Seconds()

	if dt1 <= 0 || dt2 <= 0 {
		return 0
	}

	v1 := CalculateSpeed(p1, p2) / 3.6 // convert km/h to m/s
	v2 := CalculateSpeed(p2, p3) / 3.6

	dt := (dt1 + dt2) / 2
	if dt <= 0 {
		return 0
	}

	return (v2 - v1) / dt
}

func toRadians(degrees float64) float64 {
	return degrees * math.Pi / 180
}

func toDegrees(radians float64) float64 {
	return radians * 180 / math.Pi
}

// NewBounds creates a new Bounds from points
func NewBounds(points []Point) Bounds {
	if len(points) == 0 {
		return Bounds{}
	}

	b := Bounds{
		North: points[0].Lat,
		South: points[0].Lat,
		East:  points[0].Lon,
		West:  points[0].Lon,
	}

	for _, p := range points {
		if p.Lat > b.North {
			b.North = p.Lat
		}
		if p.Lat < b.South {
			b.South = p.Lat
		}
		if p.Lon > b.East {
			b.East = p.Lon
		}
		if p.Lon < b.West {
			b.West = p.Lon
		}
	}

	return b
}

// CalculateElevationStats calculates elevation statistics
func CalculateElevationStats(points []Point) ElevationStats {
	if len(points) == 0 {
		return ElevationStats{}
	}

	stats := ElevationStats{
		Min: points[0].Elevation,
		Max: points[0].Elevation,
	}

	var totalGain, totalLoss, sum float64
	validCount := 0

	for i := 0; i < len(points); i++ {
		if points[i].Elevation <= 0 {
			continue
		}

		if points[i].Elevation < stats.Min {
			stats.Min = points[i].Elevation
		}
		if points[i].Elevation > stats.Max {
			stats.Max = points[i].Elevation
		}

		sum += points[i].Elevation
		validCount++

		if i > 0 && points[i-1].Elevation > 0 {
			diff := points[i].Elevation - points[i-1].Elevation
			if diff > 0 {
				totalGain += diff
			} else {
				totalLoss -= diff
			}
		}
	}

	stats.Gain = totalGain
	stats.Loss = totalLoss
	if validCount > 0 {
		stats.Avg = sum / float64(validCount)
	}

	return stats
}

// CalculateStats calculates trajectory statistics
func CalculateStats(points []Point) TrajectoryStats {
	if len(points) == 0 {
		return TrajectoryStats{}
	}

	var distance float64
	var maxSpeed, avgSpeedSum float64
	validSpeedCount := 0

	for i := 1; i < len(points); i++ {
		segDist := HaversineDistance(
			points[i-1].Lat, points[i-1].Lon,
			points[i].Lat, points[i].Lon,
		)
		distance += segDist

		if points[i].Speed > 0 {
			if points[i].Speed > maxSpeed {
				maxSpeed = points[i].Speed
			}
			avgSpeedSum += points[i].Speed
			validSpeedCount++
		}
	}

	duration := int64(0)
	if len(points) > 1 && !points[0].Time.IsZero() && !points[len(points)-1].Time.IsZero() {
		duration = int64(points[len(points)-1].Time.Sub(points[0].Time).Seconds())
	}

	avgSpeed := 0.0
	if validSpeedCount > 0 {
		avgSpeed = avgSpeedSum / float64(validSpeedCount)
	}

	return TrajectoryStats{
		PointCount:   len(points),
		Distance:     distance,
		DurationSecs: duration,
		Bounds:       NewBounds(points),
		Elevation:    CalculateElevationStats(points),
		AvgSpeed:     avgSpeed,
		MaxSpeed:     maxSpeed,
	}
}

// GetRating returns the rating for a given score
func GetRating(score int) Rating {
	switch {
	case score >= 85:
		return RatingExcellent
	case score >= 70:
		return RatingGood
	case score >= 50:
		return RatingFair
	default:
		return RatingPoor
	}
}
