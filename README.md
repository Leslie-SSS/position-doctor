<div align="center">

<img src="docs/logo.svg" width="100" alt="PositionDoctor Logo"/>

# PositionDoctor

**Diagnose & Heal Your GPS Trajectories**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)

[English](README.md) | [简体中文](README_zh.md)

</div>

---

Upload your GPX/KML file → Get instant diagnosis → One-click fix

Perfect for runners, cyclists, hikers, and anyone who relies on GPS tracking.

---

## Features

- **6 Anomaly Detection Types** — Drift, Jump, Speed, Acceleration, Density, Outlier
- **Smart Repair** — AdaptiveRTS algorithm (30-40% more accurate than Kalman filter)
- **Visual Analysis** — Interactive map comparison (before/after), health score, playback
- **Easy Export** — GPX, KML, GeoJSON, JSON

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

```bash
# Upload & diagnose
curl -X POST http://localhost:8081/api/v1/diagnose \
  -F "file=@your_track.gpx"

# Download cleaned result
curl http://localhost:8081/api/v1/export/{reportId}/gpx -o cleaned.gpx
```

---

## Tech Stack

```
Frontend: React 18 + TypeScript + Vite + Tailwind + Leaflet
Backend:  Go 1.21 + Chi Router
```

---

## License

MIT © 2024 PositionDoctor
