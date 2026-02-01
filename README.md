<div align="center">

<img src="docs/logo.svg" width="140" alt="PositionDoctor"/>

# PositionDoctor

**Automatic GPS trajectory diagnosis and repair**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[English](README.md) · [简体中文](README_zh.md)

</div>

---

## What is PositionDoctor?

GPS tracks are often noisy: signal drift, sudden jumps, unrealistic speeds. These distortions corrupt your activity data and affect analysis accuracy.

**PositionDoctor** automatically detects and repairs common GPS tracking errors. Upload your GPX/KML file and get instant analysis with one-click repair.

Perfect for runners, cyclists, hikers, and anyone who relies on GPS tracking.

---

## Features

| Detection | Repair | Visualization |
|-----------|--------|---------------|
| Drift | AdaptiveRTS Smoothing | Before/After Map |
| Jump | Spline Interpolation | Health Score |
| Speed Anomaly | Douglas-Peucker | Playback Animation |
| Acceleration | Outlier Removal | Anomaly Markers |
| Density | — | — |
| Outliers | — | — |

---

## Quick Start

```bash
git clone https://github.com/LeslieSSS/position-doctor.git
cd position-doctor
docker-compose up -d
```

Open http://localhost:3002

---

## API Usage

### Diagnose Trajectory

**Endpoint:** `POST /api/v1/diagnose/points`

```bash
curl -X POST http://localhost:8081/api/v1/diagnose/points \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      [22.5431, 113.9510, 1705318200, 15.2],
      [22.5429, 113.9510, 1705318203, 15.5],
      [22.5427, 113.9510, 1705318206, 15.8]
    ],
    "options": {
      "algorithms": {
        "adaptiveRTS": true,
        "splineInterpolation": true,
        "simplification": true,
        "outlierRemoval": true
      },
      "thresholds": {
        "maxSpeed": 120.0,
        "maxAcceleration": 10.0,
        "maxJump": 500.0,
        "driftThreshold": 0.0001
      }
    }
  }'
```

**Point Format:** `[latitude, longitude, timestamp, elevation?, speed?, bearing?]`

| Index | Field | Type | Required | Range |
|-------|-------|------|----------|-------|
| `[0]` | latitude | number | Yes | -90 to 90 |
| `[1]` | longitude | number | Yes | -180 to 180 |
| `[2]` | timestamp | number | Yes | Unix timestamp |
| `[3]` | elevation | number | No | meters |
| `[4]` | speed | number | No | m/s |
| `[5]` | bearing | number | No | 0-360 degrees |

### Export Results

```bash
# GPX
curl http://localhost:8081/api/v1/export/{reportId}/gpx -o cleaned.gpx

# KML
curl http://localhost:8081/api/v1/export/{reportId}/kml -o cleaned.kml

# GeoJSON
curl http://localhost:8081/api/v1/export/{reportId}/geojson -o cleaned.geojson

# JSON
curl http://localhost:8081/api/v1/export/{reportId}/json -o cleaned.json
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             PositionDoctor                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────┐         ┌─────────────────────────┐  │
│   │       Frontend (React)      │         │      Backend (Go)       │  │
│   ├─────────────────────────────┤         ├─────────────────────────┤  │
│   │ • React 18 + TypeScript     │         │ • Go 1.21 + Chi Router │  │
│   │ • Vite (Build Tool)         │         │ • AdaptiveRTS           │  │
│   │ • Tailwind CSS              │         │ • Douglas-Peucker       │  │
│   │ • Leaflet (Maps)            │         │ • Spline Interpolation  │  │
│   │ • Zustand (State)           │         │ • Statistical Filter    │  │
│   └─────────────────────────────┘         └─────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     Algorithm Pipeline                          │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │                                                                 │   │
│   │   1. Anomaly Detection                                          │   │
│   │      • Drift Detection    → Continuous position deviation       │   │
│   │      • Jump Detection    → Sudden location changes              │   │
│   │      • Speed Analysis     → Unrealistic velocities               │   │
│   │      • Acceleration Check→ Rapid velocity changes                │   │
│   │      • Density Verify     → Point distribution analysis          │   │
│   │      • Outlier Identify   → Statistical anomalies                │   │
│   │                                                                 │   │
│   │   2. Repair Algorithms                                           │   │
│   │      • AdaptiveRTS           Forward EKF + Backward RTS          │   │
│   │                             Variational Bayesian Noise           │   │
│   │      • Douglas-Peucker      Noise-aware simplification           │   │
│   │      • Spline Interpolation Cubic spline for gaps                │   │
│   │      • Outlier Removal      Statistical filtering                │   │
│   │                                                                 │   │
│   │   3. Health Scoring                                             │   │
│   │      • Completeness (40%)  Point coverage                        │   │
│   │      • Accuracy (30%)      Position deviation                    │   │
│   │      • Consistency (30%)   Trajectory smoothness                 │   │
│   │                                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Algorithms

### AdaptiveRTS

Our proprietary **Adaptive Rauch-Tung-Striebel** smoother with Variational Bayesian noise estimation.

```
Forward Pass (EKF)          →  Backward Pass (RTS)
─────────────────           →  ─────────────────
State Prediction            →  Smoothing Gain Calculation
Measurement Update          →  State Correction
Noise Estimation (VB)        →  Covariance Update
```

**Advantages:**
- Dynamically adjusts smoothing parameters based on trajectory characteristics
- 30-40% more accurate than traditional Kalman filtering
- Handles variable-speed motion and GPS drift scenarios

### Douglas-Peucker

Noise-aware trajectory simplification using perpendicular distance calculation with Haversine formula.

**Features:**
- Preserves critical turning points
- Adaptive threshold based on local noise level
- Parallel processing for large trajectories

### Health Score

Multi-dimensional trajectory quality assessment (0-100):

| Rating | Range | Color |
|--------|-------|-------|
| Excellent | 85-100 | Emerald |
| Good | 70-84 | Cyan |
| Fair | 50-69 | Yellow |
| Poor | 0-49 | Red |

---

## Configuration

Environment variables (`.env`):

```bash
# Backend
PORT=8081
CORS_ORIGINS=http://localhost:3002

# Frontend
VITE_API_URL=http://localhost:8081
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

---

## License

MIT © 2026 PositionDoctor

[View License](LICENSE)
