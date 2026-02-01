package api

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/positiondoctor/backend/internal/model"
	"github.com/positiondoctor/backend/internal/parser"
)

// TestHealthHandler tests the health check endpoint
func TestHealthHandler(t *testing.T) {
	handler := NewHandler()

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	handler.Health(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

 contentType := w.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected application/json, got %s", contentType)
	}
}

// TestDiagnoseHandler_ValidGPX tests the diagnose endpoint with valid GPX data
func TestDiagnoseHandler_ValidGPX(t *testing.T) {
	handler := NewHandler()

	// Create a test GPX file
	gpxData := []byte(`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PositionDoctor">
  <trk>
    <trkseg>
      <trkpt lat="39.9042" lon="116.4074">
        <ele>50.5</ele>
        <time>2024-01-01T08:00:00Z</time>
      </trkpt>
      <trkpt lat="39.9052" lon="116.4084">
        <ele>51.0</ele>
        <time>2024-01-01T08:00:30Z</time>
      </trkpt>
      <trkpt lat="39.9062" lon="116.4094">
        <ele>51.5</ele>
        <time>2024-01-01T08:01:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`)

	// Create multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.gpx")
	part.Write(gpxData)
	part.Close()
	writer.Close()

	req := httptest.NewRequest("POST", "/diagnose", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()

	handler.Diagnose(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}
}

// TestDiagnoseHandler_InvalidFormat tests with invalid file format
func TestDiagnoseHandler_InvalidFormat(t *testing.T) {
	handler := NewHandler()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.txt")
	part.Write([]byte("not a valid GPX or KML file"))
	part.Close()
	writer.Close()

	req := httptest.NewRequest("POST", "/diagnose", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()

	handler.Diagnose(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

// TestDiagnoseHandler_TooLarge tests file size validation
func TestDiagnoseHandler_TooLarge(t *testing.T) {
	handler := NewHandler()

	// Create a file larger than maxFileSize (50MB)
	largeData := make([]byte, 51*1024*1024)
	for i := range largeData {
		largeData[i] = 'a'
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "large.gpx")
	part.Write(largeData)
	part.Close()
	writer.Close()

	req := httptest.NewRequest("POST", "/diagnose", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()

	handler.Diagnose(w, req)

	if w.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("Expected status 413, got %d", w.Code)
	}
}

// TestDiagnoseHandler_NoFile tests missing file
func TestDiagnoseHandler_NoFile(t *testing.T) {
	handler := NewHandler()

	req := httptest.NewRequest("POST", "/diagnose", nil)
	w := httptest.NewRecorder()

	handler.Diagnose(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}

// TestDiagnoseHandler_FullWorkflow tests complete workflow
func TestDiagnoseHandler_FullWorkflow(t *testing.T) {
	handler := NewHandler()

	// Create a GPX with some anomalies for testing
	gpxData := createTestGPXWithAnomalies()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "test.gpx")
	part.Write(gpxData)
	part.Close()

	// Add options
	writer.WriteField("options", `{"algorithms":{"adaptive_rts":true}}`)
	writer.Close()

	req := httptest.NewRequest("POST", "/diagnose", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()

	handler.Diagnose(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}
}

// TestExportHandler tests the export endpoint
func TestExportHandler(t *testing.T) {
	handler := NewHandler()

	// First, store some test data
	testPoints := []model.Point{
		{Index: 0, Lat: 39.9042, Lon: 116.4074, Time: time.Now(), Status: model.StatusNormal},
		{Index: 1, Lat: 39.9052, Lon: 116.4084, Time: time.Now(), Status: model.StatusNormal},
	}

	StoreResult("test-report-id", testPoints)

	// Test GPX export
	req := httptest.NewRequest("GET", "/export/test-report-id/gpx", nil)
	w := httptest.NewRecorder()

	handler.Export(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200 for GPX export, got %d", w.Code)
	}

	contentType := w.Header().Get("Content-Type")
	if contentType != "application/gpx+xml" {
		t.Errorf("Expected application/gpx+xml, got %s", contentType)
	}

	// Check response contains GPX data
	body := w.Body.String()
	if !strings.Contains(body, "<?xml") {
		t.Error("Expected XML in GPX output")
	}
	if !strings.Contains(body, "<gpx") {
		t.Error("Expected <gpx> tag in GPX output")
	}

	// Test invalid format
	req2 := httptest.NewRequest("GET", "/export/test-report-id/invalid", nil)
	w2 := httptest.NewRecorder()

	handler.Export(w2, req2)

	if w2.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid format, got %d", w2.Code)
	}

	// Test not found
	req3 := httptest.NewRequest("GET", "/export/nonexistent-id/gpx", nil)
	w3 := httptest.NewRecorder()

	handler.Export(w3, req3)

	if w3.Code != http.StatusNotFound {
		t.Errorf("Expected status 404 for nonexistent report, got %d", w3.Code)
	}
}

// TestSetupRouter tests the router setup
func TestSetupRouter(t *testing.T) {
	router := SetupRouter()

	if router == nil {
		t.Fatal("Expected non-nil router")
	}

	// Test health endpoint
	req := httptest.NewRequest("GET", "/api/v1/health", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Health endpoint failed: status=%d", w.Code)
	}

	// Test ping endpoint (from heartbeat middleware)
	req2 := httptest.NewRequest("GET", "/ping", nil)
	w2 := httptest.NewRecorder()

	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Errorf("Ping endpoint failed: status=%d", w2.Code)
	}

	// Test 404 for invalid route
	req3 := httptest.NewRequest("GET", "/api/v1/invalid", nil)
	w3 := httptest.NewRecorder()

	router.ServeHTTP(w3, req3)

	if w3.Code != http.StatusNotFound {
		t.Errorf("Expected 404 for invalid route, got %d", w3.Code)
	}
}

// TestRateLimitMiddleware tests rate limiting
func TestRateLimitMiddleware(t *testing.T) {
	router := SetupRouter()

	// Send many requests from the same IP
	successCount := 0
	for i := 0; i < 15; i++ {
		req := httptest.NewRequest("GET", "/api/v1/health", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code == http.StatusOK {
			successCount++
		}
	}

	// Some requests should succeed (burst capacity)
	if successCount == 0 {
		t.Error("Expected some requests to succeed within burst capacity")
	}
}

// Helper function to create test GPX data with anomalies
func createTestGPXWithAnomalies() []byte {
	now := time.Now().UTC()
	return []byte(`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PositionDoctor Test">
  <trk>
    <trkseg>
      <trkpt lat="39.9042" lon="116.4074">
        <ele>50.0</ele>
        <time>` + now.Format(time.RFC3339) + `</time>
      </trkpt>
      <trkpt lat="39.9052" lon="116.4084">
        <ele>51.0</ele>
        <time>` + now.Add(time.Second*5).Format(time.RFC3339) + `</time>
      </trkpt>
      <trkpt lat="39.9062" lon="116.4094">
        <ele>52.0</ele>
        <time>` + now.Add(time.Second*10).Format(time.RFC3339) + `</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`)
}
