package algorithm

import (
	"math"

	"github.com/positiondoctor/backend/internal/model"
)

// AdaptiveRTS implements the Adaptive Rauch-Tung-Striebel smoother
// with Variational Bayesian noise estimation
type AdaptiveRTS struct {
	// Process noise initial values
	initQ float64
	// Measurement noise initial values
	initR float64
	// Variational Bayesian parameters
	vbAlpha float64
	vbBeta  float64
	// State dimension (2D: lat, lon)
	stateDim int
}

// FilterState represents the forward filter state
type FilterState struct {
	// State vector [lat, lon, vel_lat, vel_lon]
	X []float64
	// Covariance matrix
	P [][]float64
	// Time of this state
	Time float64
}

// NewAdaptiveRTS creates a new AdaptiveRTS smoother
func NewAdaptiveRTS() *AdaptiveRTS {
	return &AdaptiveRTS{
		initQ:    1e-3, // Process noise - 增加以允许更多状态变化
		initR:    1e-1, // Measurement noise - 增加以适应GPS漂移
		vbAlpha:  1.0,  // Initial alpha
		vbBeta:   10.0, // Initial beta - 增加初始测量噪声估计
		stateDim: 4,    // [lat, lon, v_lat, v_lon]
	}
}

// Smooth applies AdaptiveRTS smoothing to trajectory points
func (a *AdaptiveRTS) Smooth(points []model.Point) []model.Point {
	if len(points) < 2 {
		return points
	}

	// Step 1: Forward EKF filtering with adaptive noise estimation
	forwardStates, qEstimates, _ := a.forwardFilter(points)

	// Step 2: Backward RTS smoothing
	smoothedStates := a.backwardSmooth(forwardStates, qEstimates)

	// Step 3: Convert states back to points
	result := a.statesToPoints(points, smoothedStates)

	// Step 4: Apply drift correction for points marked as drift
	result = a.correctDriftSegments(points, result)

	return result
}

// GetName returns the algorithm name
func (a *AdaptiveRTS) GetName() string {
	return "adaptive_rts"
}

// GetShortName returns the short name for display
func (a *AdaptiveRTS) GetShortName() string {
	return "RTS平滑"
}

// forwardFilter performs forward Extended Kalman Filtering
func (a *AdaptiveRTS) forwardFilter(points []model.Point) ([]FilterState, []float64, []float64) {
	n := len(points)
	states := make([]FilterState, n)
	qEstimates := make([]float64, n-1)
	rEstimates := make([]float64, n)

	// Initialize first state
	states[0] = a.initState(points[0])

	// Variational Bayesian parameters
	alpha, beta := a.vbAlpha, a.vbBeta

	for i := 1; i < n; i++ {
		prevState := states[i-1]
		dt := 1.0 // Default to 1 second

		// Calculate time difference only if times are valid
		if !points[i].Time.IsZero() && !points[i-1].Time.IsZero() {
			dt = points[i].Time.Sub(points[i-1].Time).Seconds()
			if dt <= 0 {
				dt = 1.0
			}
		}

		// Predict step
		predictedState := a.predict(prevState, dt)

		// Get current Q and R estimates
		Q := alpha / beta

		// Update step with measurement
		innovation := points[i].Lat - predictedState.X[0]
		innovationLon := points[i].Lon - predictedState.X[1]

		// Update R estimate using variational Bayesian
		alpha += 0.5
		beta += 0.5 * (innovation*innovation + innovationLon*innovationLon)

		R := alpha / beta

		// Store noise estimates
		qEstimates[i-1] = Q
		rEstimates[i] = R

		// Perform update
		states[i] = a.update(predictedState, points[i], Q, R, dt)
	}

	return states, qEstimates, rEstimates
}

// initState initializes the first state from a point
func (a *AdaptiveRTS) initState(p model.Point) FilterState {
	return FilterState{
		X: []float64{p.Lat, p.Lon, 0, 0},
		P: [][]float64{
			{1e-4, 0, 0, 0},    // 位置方差 - 增加以允许更多测量修正
			{0, 1e-4, 0, 0},
			{0, 0, 1e-3, 0},     // 速度方差 - 增加以适应速度变化
			{0, 0, 0, 1e-3},
		},
		Time: float64(p.Time.Unix()),
	}
}

// predict performs the prediction step
func (a *AdaptiveRTS) predict(state FilterState, dt float64) FilterState {
	// State transition: constant velocity model
	// x(k+1) = F * x(k)
	// F = [[1, 0, dt, 0],
	//      [0, 1, 0, dt],
	//      [0, 0, 1,  0],
	//      [0, 0, 0,  1]]

	newX := make([]float64, 4)
	newX[0] = state.X[0] + state.X[2]*dt
	newX[1] = state.X[1] + state.X[3]*dt
	newX[2] = state.X[2]
	newX[3] = state.X[3]

	// Predict covariance: P = F*P*F' + Q
	// Simplified calculation for efficiency
	newP := a.predictCovariance(state.P, dt)

	return FilterState{
		X:    newX,
		P:    newP,
		Time: state.Time + dt,
	}
}

// predictCovariance predicts the covariance matrix
func (a *AdaptiveRTS) predictCovariance(P [][]float64, dt float64) [][]float64 {
	newP := make([][]float64, 4)
	for i := range newP {
		newP[i] = make([]float64, 4)
	}

	// F*P*F' + Q (simplified)
	newP[0][0] = P[0][0] + 2*dt*P[0][2] + dt*dt*P[2][2] + a.initQ*dt
	newP[0][1] = P[0][1] + dt*P[0][3] + dt*P[1][2] + dt*dt*P[2][3]
	newP[0][2] = P[0][2] + dt*P[2][2]
	newP[0][3] = P[0][3] + dt*P[2][3]

	newP[1][0] = newP[0][1]
	newP[1][1] = P[1][1] + 2*dt*P[1][3] + dt*dt*P[3][3] + a.initQ*dt
	newP[1][2] = P[1][2] + dt*P[2][3]
	newP[1][3] = P[1][3] + dt*P[3][3]

	newP[2][0] = newP[0][2]
	newP[2][1] = newP[1][2]
	newP[2][2] = P[2][2] + a.initQ*dt
	newP[2][3] = P[2][3]

	newP[3][0] = newP[0][3]
	newP[3][1] = newP[1][3]
	newP[3][2] = newP[2][3]
	newP[3][3] = P[3][3] + a.initQ*dt

	return newP
}

// update performs the update step with measurement
func (a *AdaptiveRTS) update(state FilterState, point model.Point, Q, R float64, dt float64) FilterState {
	// Measurement matrix H (we only measure position, not velocity)
	// H = [[1, 0, 0, 0],
	//      [0, 1, 0, 0]]

	// Measurement residual (innovation)
	yLat := point.Lat - state.X[0]
	yLon := point.Lon - state.X[1]

	// Residual covariance S = H*P*H' + R
	// Simplified: S = P[0:2, 0:2] + R*I
	S := [][]float64{
		{state.P[0][0] + R, state.P[0][1]},
		{state.P[1][0], state.P[1][1] + R},
	}

	// Kalman gain K = P*H'*S^(-1)
	// Simplified calculation - 增加阈值以适应更大的协方差值
	det := S[0][0]*S[1][1] - S[0][1]*S[1][0]
	if math.Abs(det) < 1e-8 {
		return state // Singular matrix, return predicted state
	}

	invDet := 1.0 / det
	SInv := [][]float64{
		{S[1][1] * invDet, -S[0][1] * invDet},
		{-S[1][0] * invDet, S[0][0] * invDet},
	}

	// K = P * H' * S^(-1)
	K := make([][]float64, 4)
	for i := range K {
		K[i] = make([]float64, 2)
		K[i][0] = state.P[i][0]*SInv[0][0] + state.P[i][1]*SInv[1][0]
		K[i][1] = state.P[i][0]*SInv[0][1] + state.P[i][1]*SInv[1][1]
	}

	// Updated state: x = x + K*y
	newX := make([]float64, 4)
	newX[0] = state.X[0] + K[0][0]*yLat + K[0][1]*yLon
	newX[1] = state.X[1] + K[1][0]*yLat + K[1][1]*yLon
	newX[2] = state.X[2] + K[2][0]*yLat + K[2][1]*yLon
	newX[3] = state.X[3] + K[3][0]*yLat + K[3][1]*yLon

	// Updated covariance: P = (I - K*H)*P
	newP := a.updateCovariance(state.P, K)

	return FilterState{
		X:    newX,
		P:    newP,
		Time: state.Time + dt,
	}
}

// updateCovariance updates the covariance matrix
func (a *AdaptiveRTS) updateCovariance(P [][]float64, K [][]float64) [][]float64 {
	newP := make([][]float64, 4)
	for i := range newP {
		newP[i] = make([]float64, 4)
		for j := range newP[i] {
			newP[i][j] = P[i][j] - K[i][0]*P[0][j] - K[i][1]*P[1][j]
		}
	}
	return newP
}

// backwardSmooth performs backward RTS smoothing
func (a *AdaptiveRTS) backwardSmooth(forwardStates []FilterState, qEstimates []float64) []FilterState {
	n := len(forwardStates)
	smoothed := make([]FilterState, n)

	// Last state is the same as forward filtered
	smoothed[n-1] = forwardStates[n-1]

	// Smooth from n-2 down to 0
	for i := n - 2; i >= 0; i-- {
		dt := forwardStates[i+1].Time - forwardStates[i].Time
		if dt <= 0 {
			dt = 1.0
		}

		// Predict next state from current
		predicted := a.predict(forwardStates[i], dt)

		// Calculate smoothing gain C
		C := a.calculateSmoothingGain(forwardStates[i].P, predicted.P, dt)

		// Smoothed state
		smoothed[i] = a.applySmoothing(forwardStates[i], smoothed[i+1], predicted, C)
	}

	return smoothed
}

// calculateSmoothingGain calculates the RTS smoothing gain
func (a *AdaptiveRTS) calculateSmoothingGain(P, Pp [][]float64, dt float64) [][]float64 {
	C := make([][]float64, 4)
	for i := range C {
		C[i] = make([]float64, 4)
	}

	// C = P * F' * Pp^(-1)
	// Simplified calculation - 增加阈值以适应更大的协方差值
	det := Pp[0][0]*Pp[1][1] - Pp[0][1]*Pp[1][0]
	if math.Abs(det) < 1e-8 {
		return C
	}

	invDet := 1.0 / det

	// Only compute first two rows (for position smoothing)
	// 增强平滑效果：使用完整的前向协方差与预测协方差的比值
	C[0][0] = (P[0][0] + dt*P[2][0]) * Pp[1][1] * invDet
	C[0][1] = (P[0][1] + dt*P[2][1]) * Pp[1][1] * invDet
	C[1][0] = (P[1][0] + dt*P[3][0]) * Pp[1][1] * invDet
	C[1][1] = (P[1][1] + dt*P[3][1]) * Pp[1][1] * invDet

	return C
}

// applySmoothing applies the RTS smoothing
func (a *AdaptiveRTS) applySmoothing(
	filtered FilterState,
	nextSmoothed FilterState,
	predicted FilterState,
	C [][]float64,
) FilterState {
	// x_s = x_f + C * (x_s(next) - x_predicted)
	dx := make([]float64, 4)
	dx[0] = nextSmoothed.X[0] - predicted.X[0]
	dx[1] = nextSmoothed.X[1] - predicted.X[1]
	dx[2] = nextSmoothed.X[2] - predicted.X[2]
	dx[3] = nextSmoothed.X[3] - predicted.X[3]

	newX := make([]float64, 4)
	newX[0] = filtered.X[0] + C[0][0]*dx[0] + C[0][1]*dx[1]
	newX[1] = filtered.X[1] + C[1][0]*dx[0] + C[1][1]*dx[1]
	newX[2] = filtered.X[2] + C[0][0]*dx[2] + C[0][1]*dx[3]
	newX[3] = filtered.X[3] + C[1][0]*dx[2] + C[1][1]*dx[3]

	// Smoothed covariance
	newP := make([][]float64, 4)
	for i := range newP {
		newP[i] = make([]float64, 4)
		for j := range newP[i] {
			newP[i][j] = filtered.P[i][j]
		}
	}

	return FilterState{
		X:    newX,
		P:    newP,
		Time: filtered.Time,
	}
}

// statesToPoints converts smoothed states back to points
func (a *AdaptiveRTS) statesToPoints(original []model.Point, states []FilterState) []model.Point {
	result := make([]model.Point, len(original))

	for i, state := range states {
		result[i] = original[i]

		// Store original values if different
		if math.Abs(original[i].Lat-state.X[0]) > 1e-9 ||
			math.Abs(original[i].Lon-state.X[1]) > 1e-9 {
			result[i].OriginalLat = original[i].Lat
			result[i].OriginalLon = original[i].Lon
			// Mark as fixed by this algorithm
			result[i].FixedBy = "RTS平滑"
			// Update status if it was an anomaly
			if result[i].Status == model.StatusDrift {
				result[i].Status = model.StatusNormal
			}
		}

		result[i].Lat = state.X[0]
		result[i].Lon = state.X[1]

		// Recalculate speed and bearing
		if i > 0 {
			result[i].Speed = model.CalculateSpeed(result[i-1], result[i])
			result[i].Bearing = model.CalculateBearing(
				result[i-1].Lat, result[i-1].Lon,
				result[i].Lat, result[i].Lon,
			)
		}
	}

	return result
}

// correctDriftSegments applies additional correction to drift segments
// by pulling points toward a reference path between segment endpoints
func (a *AdaptiveRTS) correctDriftSegments(original, smoothed []model.Point) []model.Point {
	result := make([]model.Point, len(smoothed))
	copy(result, smoothed)

	// Find drift segments (consecutive points with drift status)
	i := 0
	for i < len(original) {
		// Find start of drift segment
		if original[i].Status != model.StatusDrift {
			i++
			continue
		}

		start := i
		// Find end of drift segment
		for i < len(original) && original[i].Status == model.StatusDrift {
			i++
		}
		end := i - 1

		// Need at least 3 points in a segment for meaningful correction
		if end-start >= 2 {
			a.correctSegment(result, start, end)
		}
	}

	return result
}

// correctSegment corrects a drift segment by pulling points toward reference path
func (a *AdaptiveRTS) correctSegment(points []model.Point, start, end int) {
	// Get the anchor points (before and after the drift segment)
	var startAnchor, endAnchor *model.Point

	if start > 0 {
		startAnchor = &points[start-1]
	} else {
		startAnchor = &points[start]
	}

	if end < len(points)-1 {
		endAnchor = &points[end+1]
	} else {
		endAnchor = &points[end]
	}

	// For each point in the drift segment, interpolate between anchors
	for i := start; i <= end; i++ {
		if i == 0 || i == len(points)-1 {
			continue
		}

		// Calculate interpolation weight
		totalSegments := float64(end - start + 2) // +2 for anchor points
		currentSegment := float64(i - start + 1)
		t := currentSegment / totalSegments

		// Linear interpolation between anchors
		referenceLat := startAnchor.Lat + t*(endAnchor.Lat-startAnchor.Lat)
		referenceLon := startAnchor.Lon + t*(endAnchor.Lon-startAnchor.Lon)

		// Pull the point toward reference (70% toward reference, 30% original smoothed)
		corrector := 0.7 // Aggressive correction for drift

		if points[i].OriginalLat != 0 {
			// This point was marked as drifted, apply stronger correction
			points[i].Lat = points[i].Lat*(1-corrector) + referenceLat*corrector
			points[i].Lon = points[i].Lon*(1-corrector) + referenceLon*corrector

			// Update speed and bearing
			if i > 0 {
				points[i].Speed = model.CalculateSpeed(points[i-1], points[i])
				points[i].Bearing = model.CalculateBearing(
					points[i-1].Lat, points[i-1].Lon,
					points[i].Lat, points[i].Lon,
				)
			}
		}
	}
}
