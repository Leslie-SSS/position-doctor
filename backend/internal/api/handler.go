package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"github.com/positiondoctor/backend/internal/algorithm"
	"github.com/positiondoctor/backend/internal/model"
	"github.com/positiondoctor/backend/internal/parser"
)

const (
	maxFileSize = 50 * 1024 * 1024 // 50MB
)

// Handler handles HTTP requests
type Handler struct {
	parserFactory *parser.ParserFactory
	startTime     time.Time
}

// NewHandler creates a new API handler
func NewHandler() *Handler {
	return &Handler{
		parserFactory: parser.NewParserFactory(),
		startTime:     time.Now(),
	}
}

// RegisterRoutes registers all API routes
func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Post("/diagnose", h.Diagnose)          // Legacy: multipart/form-data file upload
	r.Post("/diagnose/points", h.DiagnosePoints) // New: JSON binary array format
	r.Get("/health", h.Health)
	r.Head("/health", h.HealthHead)
	r.Get("/metrics", h.Metrics)
	r.Get("/export/{reportID}/{format}", h.Export)
}

// Diagnose handles trajectory diagnosis requests
func (h *Handler) Diagnose(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	// Parse multipart form
	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		h.respondError(w, http.StatusBadRequest, "invalid_request", "Failed to parse form data", nil)
		return
	}

	// Get file
	file, header, err := r.FormFile("file")
	if err != nil {
		h.respondError(w, http.StatusBadRequest, "invalid_request", "File is required", nil)
		return
	}
	defer file.Close()

	// Validate file size
	if header.Size > maxFileSize {
		h.respondError(w, http.StatusRequestEntityTooLarge, "file_too_large",
			fmt.Sprintf("File size exceeds maximum allowed size of %dMB", maxFileSize/(1024*1024)),
			&model.ErrorDetails{
				MaxSizeBytes: maxFileSize,
				ReceivedSize: header.Size,
			})
		return
	}

	// Validate file format
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".gpx" && ext != ".kml" {
		receivedFormat := ""
		if len(ext) > 1 {
			receivedFormat = ext[1:]
		}
		h.respondError(w, http.StatusBadRequest, "invalid_request",
			"Invalid file format. Only KML and GPX are supported.",
			&model.ErrorDetails{
				Field:           "file",
				ExpectedFormats: []string{"kml", "gpx"},
				ReceivedFormat:  receivedFormat,
			})
		return
	}

	// Parse options
	options := h.parseOptions(r)

	// Read file content
	data, err := io.ReadAll(file)
	if err != nil {
		h.respondError(w, http.StatusInternalServerError, "internal_error", "Failed to read file", nil)
		return
	}

	// Parse trajectory file
	points, err := h.parserFactory.ParseFile(header.Filename, data)
	if err != nil {
		// Provide user-friendly error messages
		errorMsg := err.Error()
		userMsg := "Failed to parse trajectory file"

		switch {
		case strings.Contains(errorMsg, "empty"):
			userMsg = "文件为空，请检查上传的文件"
		case strings.Contains(errorMsg, "too small"):
			userMsg = "文件太小，可能不是有效的轨迹文件"
		case strings.Contains(errorMsg, "not a GPX") || strings.Contains(errorMsg, "not a KML"):
			userMsg = "文件格式错误，请确保上传的是有效的 GPX 或 KML 文件"
		case strings.Contains(errorMsg, "invalid GPX format") || strings.Contains(errorMsg, "invalid KML format"):
			userMsg = "文件格式损坏，请检查文件是否完整"
		case strings.Contains(errorMsg, "no tracks") || strings.Contains(errorMsg, "no documents"):
			userMsg = "文件中没有找到轨迹数据"
		case strings.Contains(errorMsg, "no track points") || strings.Contains(errorMsg, "no coordinate"):
			userMsg = "文件中没有有效的GPS坐标点"
		case strings.Contains(errorMsg, "invalid XML"):
			userMsg = "XML格式错误，文件可能已损坏"
		default:
			userMsg = fmt.Sprintf("解析失败: %s", errorMsg)
		}

		h.respondError(w, http.StatusBadRequest, "invalid_file", userMsg, &model.ErrorDetails{
			Field: "file",
		})
		return
	}

	// Post-process points
	points = parser.PostProcess(points)

	// Store original stats
	originalStats := model.CalculateStats(points)

	// Run diagnostics
	detector := algorithm.NewDetector()
	detector.MaxSpeed = options.Thresholds.MaxSpeed
	detector.MaxAcceleration = options.Thresholds.MaxAcceleration
	detector.MaxJump = options.Thresholds.MaxJump

	anomalies := detector.DetectAll(points)

	// Apply corrections with statistics
	correctedPoints, correctionStats := h.applyCorrectionsWithStats(points, anomalies, options)

	// Calculate corrected stats
	correctedStats := model.CalculateStats(correctedPoints)

	// Calculate health score
	scorer := algorithm.NewHealthScorer()
	healthScore := scorer.Calculate(correctedPoints, anomalies)

	// Build algorithm info with real statistics
	algorithmInfo := h.buildAlgorithmInfoWithStats(points, correctedPoints, options, correctionStats)

	// Build diagnostics info with new fields
	diagnostics := model.DiagnosticsInfo{
		NormalPoints:       h.countNormalPoints(correctedPoints),
		AnomalyPoints:      h.countAnomalyPoints(correctedPoints),
		FixedPoints:        correctionStats.OutlierRemovedCount,  // 删除的异常点
		RemovedPoints:      correctionStats.SimplifiedCount,      // 简化删除的点
		TotalProcessed:     correctionStats.OutlierRemovedCount + correctionStats.SimplifiedCount,
		InterpolatedPoints: correctionStats.InterpolatedCount,    // 新增字段：插值生成的点
		Anomalies:          anomalies,
		Algorithms:         algorithmInfo,
		HealthScore:        healthScore,
	}

	// Build response
	reportID := uuid.New().String()
	response := h.buildDiagnoseResponse(
		reportID,
		originalStats,
		correctedStats,
		diagnostics,
		correctedPoints,
		options,
		startTime,
	)

	// Store result for export (with TTL)
	StoreResult(reportID, correctedPoints)

	h.respondJSON(w, http.StatusOK, response)
}

// DiagnosePoints handles trajectory diagnosis requests using binary array format
// Request format: {"points": [[lat, lon, time, ele?], ...], "options": {...}}
func (h *Handler) DiagnosePoints(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	// Parse JSON request
	var req model.PointsRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		h.respondError(w, http.StatusBadRequest, "invalid_json",
			"Failed to parse JSON: "+err.Error(), nil)
		return
	}

	// Validate point count limits
	const maxPoints = 100000
	const minPoints = 2

	if len(req.Points) > maxPoints {
		h.respondError(w, http.StatusBadRequest, "too_many_points",
			fmt.Sprintf("Maximum %d points per request", maxPoints), &model.ErrorDetails{
				Field:  "points",
				Limit:  maxPoints,
				Message: fmt.Sprintf("Received %d points, maximum is %d", len(req.Points), maxPoints),
			})
		return
	}

	if len(req.Points) < minPoints {
		h.respondError(w, http.StatusBadRequest, "too_few_points",
			fmt.Sprintf("Minimum %d points required", minPoints), &model.ErrorDetails{
				Field:   "points",
				Limit:   minPoints,
				Message: fmt.Sprintf("Received %d points, minimum is %d", len(req.Points), minPoints),
			})
		return
	}

	// Validate and convert points
	points, validationErr := h.validateAndConvertPoints(req.Points)
	if validationErr != nil {
		h.respondError(w, http.StatusBadRequest, "invalid_points", validationErr.Message, validationErr)
		return
	}

	// Use default options if none provided or all disabled
	if !req.Options.Algorithms.AdaptiveRTS &&
		!req.Options.Algorithms.SplineInterpolation &&
		!req.Options.Algorithms.Simplification &&
		!req.Options.Algorithms.OutlierRemoval {
		req.Options = model.DefaultRequest()
	}

	// Post-process points (same as file-based handler)
	points = parser.PostProcess(points)

	// Store original stats
	originalStats := model.CalculateStats(points)

	// Run diagnostics
	detector := algorithm.NewDetector()
	detector.MaxSpeed = req.Options.Thresholds.MaxSpeed
	detector.MaxAcceleration = req.Options.Thresholds.MaxAcceleration
	detector.MaxJump = req.Options.Thresholds.MaxJump

	anomalies := detector.DetectAll(points)

	// Apply corrections with statistics
	correctedPoints, correctionStats := h.applyCorrectionsWithStats(points, anomalies, req.Options)

	// Calculate corrected stats
	correctedStats := model.CalculateStats(correctedPoints)

	// Calculate health score
	scorer := algorithm.NewHealthScorer()
	healthScore := scorer.Calculate(correctedPoints, anomalies)

	// Build algorithm info with real statistics
	algorithmInfo := h.buildAlgorithmInfoWithStats(points, correctedPoints, req.Options, correctionStats)

	// Build diagnostics info with new fields
	diagnostics := model.DiagnosticsInfo{
		NormalPoints:       h.countNormalPoints(correctedPoints),
		AnomalyPoints:      h.countAnomalyPoints(correctedPoints),
		FixedPoints:        correctionStats.OutlierRemovedCount,
		RemovedPoints:      correctionStats.SimplifiedCount,
		TotalProcessed:     correctionStats.OutlierRemovedCount + correctionStats.SimplifiedCount,
		InterpolatedPoints: correctionStats.InterpolatedCount,
		Anomalies:          anomalies,
		Algorithms:         algorithmInfo,
		HealthScore:        healthScore,
	}

	// Build response
	reportID := uuid.New().String()
	response := h.buildDiagnoseResponse(
		reportID,
		originalStats,
		correctedStats,
		diagnostics,
		correctedPoints,
		req.Options,
		startTime,
	)

	// Store result for export (with TTL)
	StoreResult(reportID, correctedPoints)

	h.respondJSON(w, http.StatusOK, response)
}

// validateAndConvertPoints validates and converts binary array points to model.Point
// Input format: [[lat, lon, time, ele?], ...]
func (h *Handler) validateAndConvertPoints(rawPoints [][]float64) ([]model.Point, *model.ErrorDetails) {
	points := make([]model.Point, 0, len(rawPoints))
	invalidIndices := make([]int, 0)

	const (
		minTime = int64(946684800)  // 2000-01-01
		maxTime = int64(4102444800) // 2100-01-01
	)

	for i, p := range rawPoints {
		// Check minimum length (lat, lon, time required)
		if len(p) < 3 {
			invalidIndices = append(invalidIndices, i)
			continue
		}

		lat, lon, ts := p[0], p[1], p[2]

		// Validate coordinate ranges
		if lat < -90 || lat > 90 || lon < -180 || lon > 180 {
			invalidIndices = append(invalidIndices, i)
			continue
		}

		// Validate timestamp (convert to int64 for comparison)
		unixTs := int64(ts)
		if unixTs < minTime || unixTs > maxTime {
			invalidIndices = append(invalidIndices, i)
			continue
		}

		// Create point with index
		point := model.Point{
			Index: i,
			Lat:   lat,
			Lon:   lon,
			Time:  time.Unix(unixTs, 0),
			Status: model.StatusNormal,
		}

		// Optional elevation
		if len(p) > 3 {
			point.Elevation = p[3]
		}

		points = append(points, point)
	}

	if len(invalidIndices) > 0 {
		return nil, &model.ErrorDetails{
			Field:          "points",
			Message:        fmt.Sprintf("Invalid points at indices: %v (check lat, lon, time ranges)", invalidIndices),
			InvalidIndices: invalidIndices,
		}
	}

	if len(points) < 2 {
		return nil, &model.ErrorDetails{
			Field:   "points",
			Message: "Too few valid points (minimum 2 required)",
		}
	}

	return points, nil
}

// CorrectionStats 统计各算法的处理结果
type CorrectionStats struct {
	InterpolatedCount int // 插值生成的点数
	SimplifiedCount   int // 简化删除的点数
	OutlierRemovedCount int // 离群点删除的点数
}

// applyCorrections applies correction algorithms and returns stats
func (h *Handler) applyCorrectionsWithStats(
	points []model.Point,
	anomalies []model.Anomaly,
	options model.DiagnoseRequest,
) ([]model.Point, CorrectionStats) {
	stats := CorrectionStats{}
	result := make([]model.Point, len(points))
	copy(result, points)

	// Apply AdaptiveRTS smoothing
	if options.Algorithms.AdaptiveRTS {
		rts := algorithm.NewAdaptiveRTS()
		result = rts.Smooth(result)
	}

	// Apply spline interpolation for missing points
	if options.Algorithms.SplineInterpolation {
		beforeLen := len(result)
		interpolator := algorithm.NewSplineInterpolator()
		result = interpolator.Interpolate(result)
		stats.InterpolatedCount = len(result) - beforeLen
	}

	// Apply simplification
	if options.Algorithms.Simplification {
		beforeLen := len(result)
		dp := algorithm.NewImprovedDouglasPeucker(options.Output.SimplifyEpsilon)
		result = dp.Simplify(result)
		stats.SimplifiedCount = beforeLen - len(result)
	}

	// Remove outliers
	if options.Algorithms.OutlierRemoval {
		beforeLen := len(result)
		result = h.removeOutliers(result, anomalies)
		stats.OutlierRemovedCount = beforeLen - len(result)
	}

	return result, stats
}

// applyCorrections applies correction algorithms (legacy)
func (h *Handler) applyCorrections(
	points []model.Point,
	anomalies []model.Anomaly,
	options model.DiagnoseRequest,
) []model.Point {
	result, _ := h.applyCorrectionsWithStats(points, anomalies, options)
	return result
}

// removeOutliers removes outlier points
func (h *Handler) removeOutliers(points []model.Point, anomalies []model.Anomaly) []model.Point {
	outlierIndices := make(map[int]bool)

	for _, a := range anomalies {
		if a.Severity == model.SeverityHigh {
			for _, idx := range a.Indices {
				outlierIndices[idx] = true
			}
		}
	}

	if len(outlierIndices) == 0 {
		return points
	}

	result := make([]model.Point, 0, len(points))
	for i, p := range points {
		if !outlierIndices[i] {
			result = append(result, p)
		}
	}

	return result
}

// parseOptions parses request options
func (h *Handler) parseOptions(r *http.Request) model.DiagnoseRequest {
	options := model.DefaultRequest()

	if optionsStr := r.FormValue("options"); optionsStr != "" {
		var reqOpts model.DiagnoseRequest
		if err := json.Unmarshal([]byte(optionsStr), &reqOpts); err == nil {
			return reqOpts
		}
	}

	return options
}

// buildAlgorithmInfoWithStats builds algorithm execution info using real statistics
func (h *Handler) buildAlgorithmInfoWithStats(originalPoints []model.Point, correctedPoints []model.Point, options model.DiagnoseRequest, stats CorrectionStats) []model.AlgorithmInfo {
	info := make([]model.AlgorithmInfo, 0)
	originalCount := len(originalPoints)

	// Collect fixed points by algorithm
	fixedByRTS := make([]int, 0)
	fixedBySpline := make([]int, 0)

	for i, p := range correctedPoints {
		switch p.FixedBy {
		case "RTS平滑":
			fixedByRTS = append(fixedByRTS, i)
		case "样条插值":
			fixedBySpline = append(fixedBySpline, i)
		}
	}

	// Add RTS info if it was applied
	if options.Algorithms.AdaptiveRTS {
		info = append(info, model.AlgorithmInfo{
			Name:            "自适应RTS平滑器",
			Description:     "基于Rauch-Tung-Striebel算法的双向卡尔曼滤波平滑，自动估计测量噪声",
			ProcessedPoints: originalCount,
			FixedPoints:     len(fixedByRTS),
			FixedIndices:    fixedByRTS,
			Parameters: map[string]interface{}{
				"initQ": 1e-3,
				"initR": 1e-1,
				"vbAlpha": 1.0,
				"vbBeta": 10.0,
				"method": "变分贝叶斯估计",
			},
		})
	}

	// Add Spline Interpolation info
	if options.Algorithms.SplineInterpolation {
		info = append(info, model.AlgorithmInfo{
			Name:            "三次样条插值器",
			Description:     "使用三次样条曲线在缺失点之间进行平滑插值",
			ProcessedPoints: originalCount,
			FixedPoints:     len(fixedBySpline),
			RemovedPoints:   0, // 插值是新增点，不是删除
			Parameters: map[string]interface{}{
				"method":        "cubic",
				"maxGapSeconds": 60,
				"tension":       0.5,
				"addedPoints":   stats.InterpolatedCount, // 实际新增的点数
			},
		})
	}

	// Add Douglas-Peucker info with real statistics
	if options.Algorithms.Simplification {
		info = append(info, model.AlgorithmInfo{
			Name:            "Douglas-Peucker简化器",
			Description:     "保留关键特征点的同时简化轨迹，减少数据冗余",
			ProcessedPoints: originalCount,
			FixedPoints:     0,
			RemovedPoints:   stats.SimplifiedCount, // 真实删除的点数
			Parameters: map[string]interface{}{
				"epsilon":        options.Output.SimplifyEpsilon,
				"considerNoise": true,
			},
		})
	}

	// Add Outlier Removal info with real statistics
	if options.Algorithms.OutlierRemoval {
		info = append(info, model.AlgorithmInfo{
			Name:            "离群点移除器",
			Description:     "移除高严重性的异常点（GPS漂移、跳跃等）",
			ProcessedPoints: originalCount,
			FixedPoints:     0,
			RemovedPoints:   stats.OutlierRemovedCount, // 真实删除的点数
			Parameters: map[string]interface{}{
				"method":    "severity_high",
				"threshold": "仅移除高严重性异常",
			},
		})
	}

	return info
}

// buildAlgorithmInfo builds algorithm execution info with actual statistics (legacy)
func (h *Handler) buildAlgorithmInfo(originalPoints []model.Point, correctedPoints []model.Point, options model.DiagnoseRequest, removedCount int, fixedCount int) []model.AlgorithmInfo {
	info := make([]model.AlgorithmInfo, 0)
	originalCount := len(originalPoints)
	_ = len(correctedPoints) // 用于未来扩展

	// Collect fixed points by algorithm
	fixedByRTS := make([]int, 0)
	fixedBySpline := make([]int, 0)

	for i, p := range correctedPoints {
		switch p.FixedBy {
		case "RTS平滑":
			fixedByRTS = append(fixedByRTS, i)
		case "样条插值":
			fixedBySpline = append(fixedBySpline, i)
		}
	}

	// Calculate removed points for each algorithm
	// Since we can't track exact removal per algorithm without deeper changes,
	// we use the proportion based on algorithm settings
	dpRemoved := 0
	outlierRemoved := 0

	if removedCount > 0 {
		hasDP := options.Algorithms.Simplification
		hasOutlier := options.Algorithms.OutlierRemoval

		if hasDP && hasOutlier {
			// Both enabled - split evenly
			dpRemoved = removedCount / 2
			outlierRemoved = removedCount - dpRemoved
		} else if hasDP {
			dpRemoved = removedCount
		} else if hasOutlier {
			outlierRemoved = removedCount
		}
	}

	// Add RTS info if it was applied
	if options.Algorithms.AdaptiveRTS {
		info = append(info, model.AlgorithmInfo{
			Name:            "自适应RTS平滑器",
			Description:     "基于Rauch-Tung-Striebel算法的双向卡尔曼滤波平滑，自动估计测量噪声",
			ProcessedPoints: originalCount,
			FixedPoints:     len(fixedByRTS),
			FixedIndices:    fixedByRTS,
			Parameters: map[string]interface{}{
				"initQ": 1e-3,
				"initR": 1e-1,
				"vbAlpha": 1.0,
				"vbBeta": 10.0,
				"method": "变分贝叶斯估计",
			},
		})
	}

	// Add Spline Interpolation info
	if options.Algorithms.SplineInterpolation {
		info = append(info, model.AlgorithmInfo{
			Name:            "三次样条插值器",
			Description:     "使用三次样条曲线在缺失点之间进行平滑插值",
			ProcessedPoints: originalCount,
			FixedPoints:     len(fixedBySpline),
			FixedIndices:    fixedBySpline,
			Parameters: map[string]interface{}{
				"method":        "cubic",
				"maxGapSeconds": 60,
				"tension":       0.5,
			},
		})
	}

	// Add Douglas-Peucker info
	if options.Algorithms.Simplification {
		info = append(info, model.AlgorithmInfo{
			Name:            "Douglas-Peucker简化器",
			Description:     "保留关键特征点的同时简化轨迹，减少数据冗余",
			ProcessedPoints: originalCount,
			FixedPoints:     0,
			RemovedPoints:   dpRemoved,
			Parameters: map[string]interface{}{
				"epsilon":        options.Output.SimplifyEpsilon,
				"considerNoise": true,
			},
		})
	}

	// Add Outlier Removal info
	if options.Algorithms.OutlierRemoval {
		info = append(info, model.AlgorithmInfo{
			Name:            "离群点移除器",
			Description:     "基于统计方法识别并移除轨迹中的离群点",
			ProcessedPoints: originalCount,
			FixedPoints:     0,
			RemovedPoints:   outlierRemoved,
			Parameters: map[string]interface{}{
				"method":   "MAD",
				"threshold": 3,
			},
		})
	}

	return info
}

// countFixedPoints counts points that were fixed
func (h *Handler) countFixedPoints(points []model.Point) int {
	count := 0
	for _, p := range points {
		if p.OriginalLat != 0 || p.OriginalLon != 0 {
			count++
		}
	}
	return count
}

// countFixedAnomalyPoints counts anomalous points that were fixed
// 只统计原本是异常点且被修复的点（有OriginalLat/OriginalLon且Status!=Normal）
func (h *Handler) countFixedAnomalyPoints(points []model.Point) int {
	count := 0
	for _, p := range points {
		// 必须有原始坐标（表示被修复过）
		// 且当前状态是异常（说明原本就是异常点，修复后仍标记为异常）
		if (p.OriginalLat != 0 || p.OriginalLon != 0) && p.Status != model.StatusNormal {
			count++
		}
	}
	return count
}

// countNormalPoints counts normal status points
func (h *Handler) countNormalPoints(points []model.Point) int {
	count := 0
	for _, p := range points {
		if p.Status == model.StatusNormal {
			count++
		}
	}
	return count
}

// countAnomalyPoints counts anomaly status points
func (h *Handler) countAnomalyPoints(points []model.Point) int {
	count := 0
	for _, p := range points {
		if p.Status != model.StatusNormal && p.Status != model.StatusInterpolated {
			count++
		}
	}
	return count
}

// buildDiagnoseResponse builds the diagnose response
func (h *Handler) buildDiagnoseResponse(
	reportID string,
	original, corrected model.TrajectoryStats,
	diagnostics model.DiagnosticsInfo,
	points []model.Point,
	options model.DiagnoseRequest,
	startTime time.Time,
) model.DiagnoseResponse {
	data := &model.Data{
		ReportID:   reportID,
		Original:   original,
		Corrected:  corrected,
		Diagnostics: diagnostics,
	}

	// Include points if requested
	if options.Output.IncludePoints {
		data.Points = points
	}

	// Calculate processing time
	processingTime := time.Since(startTime).Milliseconds()

	return model.DiagnoseResponse{
		Success: true,
		Data:    data,
		Meta: &model.ResponseMeta{
			Version:        "1.0.0",
			ProcessingTime: processingTime,
			ProcessedAt:    time.Now().Format(time.RFC3339),
		},
	}
}

// Health handles health check requests
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, model.HealthResponse{
		Status:   "ok",
		Version:  "1.0.0",
		Uptime:   int64(time.Since(h.startTime).Seconds()),
		Timestamp: time.Now().Format(time.RFC3339),
	})
}

// HealthHead handles HEAD requests for health check
func (h *Handler) HealthHead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

// Metrics handles metrics requests
func (h *Handler) Metrics(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"requests": map[string]interface{}{
			"total":   0,
			"last24h": 0,
		},
		"files": map[string]interface{}{
			"total":            0,
			"totalPoints":      0,
			"avgPointsPerFile": 0,
		},
		"rateLimit": map[string]interface{}{
			"currentUsage": 0,
			"limit":       10,
		},
	})
}

// respondJSON responds with JSON
func (h *Handler) respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		// Log error but headers already sent
		http.Error(w, `{"error":"encoding_failed"}`, http.StatusInternalServerError)
	}
}

// respondError responds with error
func (h *Handler) respondError(w http.ResponseWriter, status int, errCode, message string, details *model.ErrorDetails) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	response := model.ErrorResponse{
		Success: false,
		Error:   errCode,
		Message: message,
		Details: details,
		Meta: &model.ResponseMeta{
			Version: "1.0.0",
		},
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		// Last resort error response
		http.Error(w, `{"success":false,"error":"encoding_failed"}`, http.StatusInternalServerError)
	}
}

// respondJSON is a helper for JSON responses
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		// Log error but headers already sent
		http.Error(w, `{"error":"encoding_failed"}`, http.StatusInternalServerError)
	}
}

// SetupRouter sets up the API router
func SetupRouter() *chi.Mux {
	r := chi.NewRouter()

	// Add chi middleware
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(middleware.AllowContentType("multipart/form-data", "application/json"))
	r.Use(middleware.NoCache)
	r.Use(middleware.Heartbeat("/ping"))

	// Add custom rate limiting
	r.Use(rateLimitMiddleware(10, 20))

	// Register API routes with /api/v1 prefix
	r.Route("/api/v1", func(r chi.Router) {
		handler := NewHandler()
		handler.RegisterRoutes(r)
	})

	return r
}

// rateLimitMiddleware creates rate limiting middleware
func rateLimitMiddleware(rate, burst int) func(http.Handler) http.Handler {
	limiter := rateMiddleware{rate: rate, burst: burst}
	return limiter.Middleware
}

// rateMiddleware implements token bucket rate limiting
type rateMiddleware struct {
	rate     int
	burst    int
	tokens   map[string]int
	lastTime map[string]time.Time
	mu       sync.RWMutex
}

func (rm *rateMiddleware) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := getClientIP(r)

		// Simple token bucket implementation with mutex for thread safety
		now := time.Now()

		rm.mu.Lock()
		if rm.lastTime == nil {
			rm.lastTime = make(map[string]time.Time)
			rm.tokens = make(map[string]int)
		}

		lastTime, exists := rm.lastTime[key]
		if !exists {
			rm.lastTime[key] = now
			rm.tokens[key] = rm.burst - 1
			rm.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		// Refill tokens
		elapsed := now.Sub(lastTime).Seconds()
		tokensToAdd := int(elapsed * float64(rm.rate) / 60.0)
		currentTokens := rm.tokens[key] + tokensToAdd
		if currentTokens > rm.burst {
			currentTokens = rm.burst
		}

		if currentTokens <= 0 {
			rm.lastTime[key] = now
			rm.mu.Unlock()
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", rm.rate))
			w.Header().Set("Retry-After", "30")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"success":false,"error":"rate_limit_exceeded","message":"Rate limit exceeded"}`))
			return
		}

		rm.tokens[key] = currentTokens - 1
		rm.lastTime[key] = now
		rm.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}

func getClientIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	return r.RemoteAddr
}

// In-memory storage for export results (in production, use Redis or database)
var (
	resultStore = struct {
		sync.RWMutex
		data map[string][]model.Point
	}{data: make(map[string][]model.Point)}
)

// StoreResult stores result data for export
func StoreResult(reportID string, points []model.Point) {
	resultStore.Lock()
	defer resultStore.Unlock()
	resultStore.data[reportID] = points
}

// GetResult retrieves result data for export
func GetResult(reportID string) ([]model.Point, bool) {
	resultStore.RLock()
	defer resultStore.RUnlock()
	points, ok := resultStore.data[reportID]
	return points, ok
}

// Export handles trajectory export requests
func (h *Handler) Export(w http.ResponseWriter, r *http.Request) {
	reportID := chi.URLParam(r, "reportID")
	format := chi.URLParam(r, "format")

	if reportID == "" {
		h.respondError(w, http.StatusBadRequest, "invalid_request", "Report ID is required", nil)
		return
	}

	// Retrieve stored result
	points, ok := GetResult(reportID)
	if !ok {
		h.respondError(w, http.StatusNotFound, "not_found", "Report not found or expired", nil)
		return
	}

	// Set filename
	filename := fmt.Sprintf("position-doctor-%s.%s", reportID[:8], format)

	switch format {
	case "gpx":
		h.exportGPX(w, points, filename)
	case "kml":
		h.exportKML(w, points, filename)
	case "json":
		h.exportJSON(w, points, filename)
	case "geojson":
		h.exportGeoJSON(w, points, filename)
	default:
		h.respondError(w, http.StatusBadRequest, "invalid_format", "Unsupported export format", nil)
	}
}

// exportGPX exports trajectory as GPX
func (h *Handler) exportGPX(w http.ResponseWriter, points []model.Point, filename string) {
	data, err := parser.ToGPX(points, "PositionDoctor Corrected Trajectory")
	if err != nil {
		h.respondError(w, http.StatusInternalServerError, "export_failed", err.Error(), nil)
		return
	}

	w.Header().Set("Content-Type", "application/gpx+xml")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	w.Write(data)
}

// exportKML exports trajectory as KML
func (h *Handler) exportKML(w http.ResponseWriter, points []model.Point, filename string) {
	data, err := parser.ToKML(points, "PositionDoctor Corrected Trajectory")
	if err != nil {
		h.respondError(w, http.StatusInternalServerError, "export_failed", err.Error(), nil)
		return
	}

	w.Header().Set("Content-Type", "application/vnd.google-earth.kml+xml")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	w.Write(data)
}

// exportJSON exports trajectory as JSON
func (h *Handler) exportJSON(w http.ResponseWriter, points []model.Point, filename string) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	if err := json.NewEncoder(w).Encode(map[string]interface{}{
		"reportID": filename,
		"points":   points,
		"count":    len(points),
	}); err != nil {
		http.Error(w, `{"error":"encoding_failed"}`, http.StatusInternalServerError)
	}
}

// exportGeoJSON exports trajectory as GeoJSON
func (h *Handler) exportGeoJSON(w http.ResponseWriter, points []model.Point, filename string) {
	coordinates := make([][]float64, len(points))
	for i, p := range points {
		coordinates[i] = []float64{p.Lon, p.Lat}
	}

	geojson := map[string]interface{}{
		"type": "Feature",
		"properties": map[string]interface{}{
			"name": "PositionDoctor Corrected Trajectory",
		},
		"geometry": map[string]interface{}{
			"type":        "LineString",
			"coordinates": coordinates,
		},
	}

	w.Header().Set("Content-Type", "application/geo+json")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	if err := json.NewEncoder(w).Encode(geojson); err != nil {
		http.Error(w, `{"error":"encoding_failed"}`, http.StatusInternalServerError)
	}
}

// GetServer returns a configured HTTP server
func GetServer(addr string) *http.Server {
	return &http.Server{
		Addr:    addr,
		Handler: SetupRouter(),
	}
}
