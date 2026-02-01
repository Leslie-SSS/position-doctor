# PositionDoctor API Specification

## Overview

PositionDoctor 提供极简的 RESTful API，单个端点完成所有轨迹诊断与清洗功能。

**Base URL**: `https://api.positiondoctor.com/api/v1`

**内容类型**: `application/json`

---

## 端点列表

| 方法 | 端点 | 描述 |
|-----|------|------|
| POST | `/diagnose` | 诊断并清洗轨迹数据 |
| GET | `/export/{reportID}/{format}` | 导出修复后的轨迹 |
| GET | `/health` | 健康检查 |
| GET | `/metrics` | 服务指标 |

---

## 1. 诊断 API

### POST /api/v1/diagnose

诊断上传的轨迹文件，返回修复后的轨迹和诊断报告。

#### 请求

**Method**: `POST`

**Content-Type**: `multipart/form-data`

**参数**:

| 字段 | 类型 | 必填 | 描述 |
|-----|------|------|------|
| file | File | ✅ | KML 或 GPX 文件 (最大 50MB) |
| options | string | ❌ | JSON 配置字符串 |

**options 配置**:

```json
{
  "algorithms": {
    "kalman": true,           // 启用 Kalman 滤波
    "interpolation": true,    // 启用线性插值
    "simplification": true,   // 启用 Douglas-Peucker 简化
    "outlierRemoval": true    // 启用异常值移除
  },
  "thresholds": {
    "maxSpeed": 120.0,        // 最大速度 (km/h)
    "maxAcceleration": 10.0,  // 最大加速度 (m/s²)
    "maxJump": 500.0,         // 最大跳变距离 (米)
    "driftThreshold": 0.0001  // 漂移检测阈值 (度)
  },
  "output": {
    "includePoints": true,    // 返回所有点位数据
    "simplifyEpsilon": 1.0    // 简化容差 (米)
  }
}
```

**示例请求**:

```bash
curl -X POST https://api.positiondoctor.com/api/v1/diagnose \
  -H "Accept: application/json" \
  -F "file=@track.gpx" \
  -F 'options={"algorithms":{"kalman":true}}'
```

#### 响应

**成功响应** (200 OK):

```json
{
  "success": true,
  "data": {
    "reportId": "550e8400-e29b-41d4-a716-446655440000",

    "original": {
      "pointCount": 1234,
      "distance": 15234.5,
      "durationSeconds": 5025,
      "bounds": {
        "north": 39.9042,
        "south": 39.8042,
        "east": 116.4074,
        "west": 116.3074
      },
      "elevation": {
        "min": 10.0,
        "max": 150.5,
        "gain": 450.0,
        "loss": 380.0
      }
    },

    "corrected": {
      "pointCount": 1189,
      "distance": 14980.2,
      "durationSeconds": 5025,
      "bounds": {
        "north": 39.9042,
        "south": 39.8042,
        "east": 116.4074,
        "west": 116.3074
      },
      "elevation": {
        "min": 10.0,
        "max": 150.5,
        "gain": 450.0,
        "loss": 380.0
      }
    },

    "diagnostics": {
      "normalPoints": 1189,
      "anomalyPoints": 45,
      "fixedPoints": 38,
      "removedPoints": 7,

      "anomalies": [
        {
          "type": "drift",
          "description": "GPS position drift detected",
          "count": 25,
          "severity": "low",
          "indices": [12, 13, 14, 67, 68, 69, 70]
        },
        {
          "type": "jump",
          "description": "Position jump detected",
          "count": 8,
          "severity": "high",
          "indices": [123, 456, 789]
        },
        {
          "type": "speed_anomaly",
          "description": "Abnormal speed detected",
          "count": 7,
          "severity": "medium",
          "indices": [234, 567, 890]
        },
        {
          "type": "missing",
          "description": "Missing data segment",
          "count": 5,
          "severity": "medium",
          "gaps": [[100, 105], [500, 502]]
        }
      ],

      "algorithms": [
        {
          "name": "kalman_filter",
          "description": "Kalman filtering for GPS smoothing",
          "processedPoints": 25,
          "parameters": {
            "processNoise": 0.01,
            "measurementNoise": 0.1
          }
        },
        {
          "name": "linear_interpolation",
          "description": "Linear interpolation for missing points",
          "processedPoints": 10,
          "gapsFilled": 2
        },
        {
          "name": "douglas_peucker",
          "description": "Douglas-Peucker line simplification",
          "processedPoints": 1234,
          "removedPoints": 42,
          "epsilon": 1.0
        }
      ],

      "healthScore": {
        "total": 78,
        "breakdown": {
          "completeness": {
            "score": 85,
            "weight": 0.25,
            "description": "Data completeness ratio"
          },
          "accuracy": {
            "score": 72,
            "weight": 0.25,
            "description": "Position accuracy assessment"
          },
          "consistency": {
            "score": 80,
            "weight": 0.25,
            "description": "Temporal consistency check"
          },
          "smoothness": {
            "score": 75,
            "weight": 0.25,
            "description": "Trajectory smoothness score"
          }
        },
        "rating": "good"
      }
    },

    "points": [
      {
        "index": 0,
        "lat": 39.9042,
        "lon": 116.4074,
        "time": "2024-01-01T08:00:00Z",
        "elevation": 50.5,
        "status": "normal",
        "isInterpolated": false,
        "speed": 15.2,
        "bearing": 45.3
      },
      {
        "index": 12,
        "lat": 39.9050,
        "lon": 116.4080,
        "time": "2024-01-01T08:00:30Z",
        "elevation": 51.0,
        "status": "drift",
        "isInterpolated": false,
        "originalLat": 39.9065,
        "originalLon": 116.4095,
        "speed": 18.5,
        "bearing": 47.8
      }
    ]
  },

  "meta": {
    "version": "1.0.0",
    "processedAt": "2024-01-30T10:30:00Z",
    "processingTimeMs": 1234
  }
}
```

#### 错误响应

**400 Bad Request**:

```json
{
  "success": false,
  "error": "invalid_request",
  "message": "Invalid file format. Only KML and GPX are supported.",
  "details": {
    "field": "file",
    "expectedFormats": ["kml", "gpx"],
    "receivedFormat": "txt"
  }
}
```

**413 Payload Too Large**:

```json
{
  "success": false,
  "error": "file_too_large",
  "message": "File size exceeds maximum allowed size of 50MB.",
  "details": {
    "maxSizeBytes": 52428800,
    "receivedSizeBytes": 67108864
  }
}
```

**429 Too Many Requests**:

```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please try again later.",
  "details": {
    "limit": 10,
    "window": "1m",
    "retryAfter": 30
  }
}
```

**500 Internal Server Error**:

```json
{
  "success": false,
  "error": "internal_error",
  "message": "An unexpected error occurred.",
  "requestId": "req_abc123"
}
```

---

## 2. 健康检查 API

### GET /api/v1/health

检查服务健康状态。

#### 请求

```bash
curl https://api.positiondoctor.com/api/v1/health
```

#### 响应

**200 OK**:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 123456,
  "timestamp": "2024-01-30T10:30:00Z"
}
```

---

## 3. 导出 API

### GET /api/v1/export/{reportID}/{format}

导出修复后的轨迹文件。

#### 请求

**Method**: `GET`

**路径参数**:

| 参数 | 类型 | 描述 |
|-----|------|------|
| reportID | string | 诊断报告 ID |
| format | string | 导出格式: `gpx`, `kml`, `json`, `geojson` |

**示例请求**:

```bash
curl -O https://api.positiondoctor.com/api/v1/export/550e8400-e29b-41d4-a716-446655440000/gpx
```

#### 响应

**成功响应** (200 OK):

返回指定格式的轨迹文件。

| 格式 | Content-Type |
|-----|-------------|
| gpx | `application/gpx+xml` |
| kml | `application/vnd.google-earth.kml+xml` |
| json | `application/json` |
| geojson | `application/geo+json` |

**响应头**:

```http
Content-Type: application/gpx+xml
Content-Disposition: attachment; filename="position-doctor-550e8400.gpx"
```

#### 错误响应

**404 Not Found**:

```json
{
  "success": false,
  "error": "not_found",
  "message": "Report not found or expired"
}
```

**400 Bad Request**:

```json
{
  "success": false,
  "error": "invalid_format",
  "message": "Unsupported export format"
}
```

---

## 4. 健康检查 API

### GET /api/v1/health

获取服务运行指标（需要管理员权限）。

#### 响应

**200 OK**:

```json
{
  "requests": {
    "total": 1000000,
    "last24h": 45000
  },
  "files": {
    "total": 850000,
    "totalPoints": 1234567890,
    "avgPointsPerFile": 1452
  },
  "rateLimit": {
    "currentUsage": 45,
    "limit": 1000
  }
}
```

---

## 数据模型

### Point

```typescript
interface Point {
  index: number;              // 点位索引
  lat: number;               // 纬度 (WGS84)
  lon: number;               // 经度 (WGS84)
  time: string;              // ISO 8601 时间戳
  elevation?: number;        // 海拔高度 (米)
  status: PointStatus;       // 点位状态
  isInterpolated?: boolean;  // 是否为插值点
  originalLat?: number;      // 原始纬度 (修复后)
  originalLon?: number;      // 原始经度 (修复后)
  speed?: number;            // 速度 (km/h)
  bearing?: number;          // 方向角 (度)
}

type PointStatus =
  | "normal"      // 正常
  | "drift"       // 漂移
  | "jump"        // 跳变
  | "speed_anomaly" // 速度异常
  | "missing"     // 缺失
  | "interpolated"; // 插值
```

### Bounds

```typescript
interface Bounds {
  north: number;  // 最大纬度
  south: number;  // 最小纬度
  east: number;   // 最大经度
  west: number;   // 最小经度
}
```

### Anomaly

```typescript
interface Anomaly {
  type: AnomalyType;
  description: string;
  count: number;
  severity: "low" | "medium" | "high";
  indices: number[];
  gaps?: number[][];  // 缺失段的起止索引
}

type AnomalyType =
  | "drift"
  | "jump"
  | "speed_anomaly"
  | "acceleration_anomaly"
  | "missing"
  | "density_anomaly";
```

### HealthScore

```typescript
interface HealthScore {
  total: number;          // 总分 0-100
  breakdown: {
    completeness: ScoreDetail;
    accuracy: ScoreDetail;
    consistency: ScoreDetail;
    smoothness: ScoreDetail;
  };
  rating: "excellent" | "good" | "fair" | "poor";
}

interface ScoreDetail {
  score: number;      // 分数 0-100
  weight: number;     // 权重 0-1
  description: string;
}
```

---

## 限流规则

### 规则配置

| 配置项 | 值 |
|-------|---|
| 算法 | 令牌桶 (Token Bucket) |
| 速率 | 10 请求/分钟 |
| 突发容量 | 20 请求 |
| 键来源 | X-Real-IP > X-Forwarded-For > RemoteAddr |

### 响应头

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1706605200
```

---

## 文件格式支持

### GPX

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PositionDoctor">
  <trk>
    <name>Sample Track</name>
    <trkseg>
      <trkpt lat="39.9042" lon="116.4074">
        <ele>50.5</ele>
        <time>2024-01-01T08:00:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
```

### KML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Sample Track</name>
      <LineString>
        <coordinates>116.4074,39.9042,50.5 116.4084,39.9052,51.0</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>
```

---

## 请求示例

### JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('options', JSON.stringify({
  algorithms: { kalman: true, interpolation: true }
}));

const response = await fetch('https://api.positiondoctor.com/api/v1/diagnose', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.data.diagnostics.healthScore);
```

### Go (HTTP Client)

```go
func DiagnoseTrack(filePath string) (*DiagnoseResponse, error) {
    file, err := os.Open(filePath)
    if err != nil {
        return nil, err
    }
    defer file.Close()

    var body bytes.Buffer
    writer := multipart.NewWriter(&body)

    part, err := writer.CreateFormFile("file", filepath.Base(filePath))
    if err != nil {
        return nil, err
    }

    io.Copy(part, file)

    writer.WriteField("options", `{"algorithms":{"kalman":true}}`)
    writer.Close()

    req, err := http.NewRequest("POST", baseURL+"/diagnose", &body)
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", writer.FormDataContentType())
    req.Header.Set("Accept", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result DiagnoseResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}
```

### Python (Requests)

```python
import requests

def diagnose_track(file_path):
    url = "https://api.positiondoctor.com/api/v1/diagnose"

    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {
            'options': json.dumps({
                'algorithms': {'kalman': True, 'interpolation': True}
            })
        }

        response = requests.post(url, files=files, data=data)
        return response.json()
```

---

**文档版本**: 1.0.0
**最后更新**: 2025-01-30
