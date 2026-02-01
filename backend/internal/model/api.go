package model

// PointsRequest represents the unified diagnose request using binary array format
// Points format: [[lat, lon, time, ele?], ...] where ele is optional
type PointsRequest struct {
	Points  [][]float64     `json:"points"`  // [[lat, lon, time, ele?], ...]
	Options DiagnoseRequest `json:"options"`
}

// DiagnoseRequest represents the diagnose request
type DiagnoseRequest struct {
	Algorithms AlgorithmOptions `json:"algorithms"`
	Thresholds ThresholdOptions `json:"thresholds"`
	Output     OutputOptions    `json:"output"`
}

// AlgorithmOptions represents algorithm configuration
type AlgorithmOptions struct {
	AdaptiveRTS      bool `json:"adaptive_rts"`
	SplineInterpolation bool `json:"spline_interpolation"`
	Simplification   bool `json:"simplification"`
	OutlierRemoval   bool `json:"outlierRemoval"`
}

// ThresholdOptions represents threshold configuration
type ThresholdOptions struct {
	MaxSpeed        float64 `json:"maxSpeed"`
	MaxAcceleration float64 `json:"maxAcceleration"`
	MaxJump         float64 `json:"maxJump"`
	DriftThreshold  float64 `json:"driftThreshold"`
}

// OutputOptions represents output configuration
type OutputOptions struct {
	IncludePoints    bool    `json:"includePoints"`
	SimplifyEpsilon  float64 `json:"simplifyEpsilon"`
}

// DefaultRequest returns default request options
func DefaultRequest() DiagnoseRequest {
	return DiagnoseRequest{
		Algorithms: AlgorithmOptions{
			AdaptiveRTS:        true,
			SplineInterpolation: true,
			Simplification:     true,
			OutlierRemoval:     true,
		},
		Thresholds: ThresholdOptions{
			MaxSpeed:        120.0,  // km/h
			MaxAcceleration: 10.0,   // m/s²
			MaxJump:         500.0,  // meters
			DriftThreshold:  0.0001, // degrees
		},
		Output: OutputOptions{
			IncludePoints:   true,
			SimplifyEpsilon: 1.0,    // meters
		},
	}
}

// DiagnoseResponse represents the diagnose response
type DiagnoseResponse struct {
	Success bool          `json:"success"`
	Data    *Data         `json:"data,omitempty"`
	Error   string        `json:"error,omitempty"`
	Details *ErrorDetails `json:"details,omitempty"`
	Meta    *ResponseMeta `json:"meta,omitempty"`
}

// Data represents the response data
type Data struct {
	ReportID   string             `json:"reportId"`
	Original   TrajectoryStats    `json:"original"`
	Corrected  TrajectoryStats    `json:"corrected"`
	Diagnostics DiagnosticsInfo   `json:"diagnostics"`
	Points     []Point            `json:"points,omitempty"`
}

// DiagnosticsInfo represents diagnostic information
type DiagnosticsInfo struct {
	NormalPoints       int              `json:"normalPoints"`
	AnomalyPoints      int              `json:"anomalyPoints"`
	FixedPoints        int              `json:"fixedPoints"`        // 删除的异常点
	RemovedPoints      int              `json:"removedPoints"`      // 简化删除的点
	InterpolatedPoints int              `json:"interpolatedPoints"` // 插值生成的点
	TotalProcessed     int              `json:"totalProcessed"`     // 总处理点数 = 异常点 + 简化点
	Anomalies          []Anomaly        `json:"anomalies"`
	Algorithms         []AlgorithmInfo  `json:"algorithms"`
	HealthScore        HealthScore      `json:"healthScore"`
}

// AlgorithmInfo represents algorithm execution info
type AlgorithmInfo struct {
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	ProcessedPoints int                    `json:"processedPoints"`
	FixedPoints     int                    `json:"fixedPoints"`
	RemovedPoints   int                    `json:"removedPoints,omitempty"` // For algorithms that remove points
	FixedIndices    []int                  `json:"fixedIndices,omitempty"`
	Parameters      map[string]interface{} `json:"parameters"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool          `json:"success"`
	Error   string        `json:"error"`
	Message string        `json:"message"`
	Details  *ErrorDetails `json:"details,omitempty"`
	Meta    *ResponseMeta  `json:"meta,omitempty"`
}

// ErrorDetails represents error details
type ErrorDetails struct {
	Field           string   `json:"field,omitempty"`
	Message         string   `json:"message,omitempty"`
	ExpectedFormats []string `json:"expectedFormats,omitempty"`
	ReceivedFormat  string   `json:"receivedFormat,omitempty"`
	MaxSizeBytes    int64    `json:"maxSizeBytes,omitempty"`
	ReceivedSize    int64    `json:"receivedSizeBytes,omitempty"`
	Limit           int      `json:"limit,omitempty"`
	Window          string   `json:"window,omitempty"`
	RetryAfter      int      `json:"retryAfter,omitempty"`
	InvalidIndices  []int    `json:"invalidIndices,omitempty"`
}

// ResponseMeta represents response metadata
type ResponseMeta struct {
	Version        string  `json:"version"`
	ProcessedAt    string  `json:"processedAt"`
	ProcessingTime int64   `json:"processingTimeMs"`
	RequestID      string  `json:"requestId,omitempty"`
}

// HealthResponse represents health check response
type HealthResponse struct {
	Status   string `json:"status"`
	Version  string `json:"version"`
	Uptime   int64  `json:"uptime"`
	Timestamp string `json:"timestamp"`
}
