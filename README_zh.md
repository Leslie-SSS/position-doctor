<div align="center">

<img src="docs/logo.svg" width="120" alt="PositionDoctor"/>

# PositionDoctor

<div align="center">

**Diagnose & Heal Your GPS Trajectories**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[English](README.md) · [简体中文](README_zh.md)

</div>

</div>

---

## Why PositionDoctor?

GPS tracks are often noisy: signal drift, sudden jumps, speed spikes... These issues distort your activity data and affect analysis accuracy.

PositionDoctor is an **automated GPS trajectory diagnosis and repair tool**. Upload your file, one-click fix.

> **Perfect for**: Running, Cycling, Hiking, Marathon Training, Outdoor Activity Analysis

---

## Core Features

<div align="center">

<table>
<tr>
<td width="50%">

**🔍 6 Anomaly Detection Types**

Drift · Jump · Speed Anomaly
Acceleration · Density · Outlier

</td>
<td width="50%">

**🧠 Smart Repair Algorithms**

AdaptiveRTS · Spline Interpolation
Douglas-Peucker · Statistical Filter

</td>
</tr>
<tr>
<td width="50%">

**📊 Visual Analysis**

Map Comparison · Health Score
Playback Animation · Anomaly Markers

</td>
<td width="50%">

**💾 Multiple Export Formats**

GPX · KML · GeoJSON · JSON

</td>
</tr>
</table>

</div>

---

## Quick Start

```bash
git clone https://github.com/LeslieSSS/position-doctor.git
cd position-doctor
docker-compose up -d
```

Visit http://localhost:3002

---

## Demo

<div align="center">

<table>
<tr>
<td width="100%">

<img src="docs/demo.gif" width="100%" alt="PositionDoctor Demo"/>

</td>
</tr>
</table>

</div>

---

## Tech Stack

```
┌────────────────────────────────────────────────────────────┐
│                        PositionDoctor                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────┐         ┌─────────────────┐         │
│   │   React 18      │         │      Go 1.21    │         │
│   │   + TypeScript  │ ◄─────► │    + Chi        │         │
│   │   + Tailwind    │  HTTP   │   + AdaptiveRTS │         │
│   │   + Leaflet     │         │                 │         │
│   └─────────────────┘         └─────────────────┘         │
│          Frontend                    Backend              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Algorithm Advantage

| Algorithm | Improvement | Use Case |
|-----------|-------------|----------|
| **AdaptiveRTS** | +30~40% vs Kalman | Dynamic tracks, variable speed |
| **Douglas-Peucker** | 60~80% compression | Data simplification |
| **Spline Interpolation** | +50% smoothness | Missing point filling |
| **Statistical Filter** | 95%+ outlier removal | Noise cleaning |

---

## API Usage

```bash
# Upload & diagnose
curl -X POST http://localhost:8081/api/v1/diagnose \
  -F "file=@track.gpx"

# Download cleaned result
curl http://localhost:8081/api/v1/export/{id}/gpx -o cleaned.gpx
```

---

## Star History

<a href="https://github.com/LeslieSSS/position-doctor/stargazers">
  <img src="https://api.star-history.com/svg?repos=LeslieSSS/position-doctor&type=Date" alt="Star History Chart">
</a>

---

## License

MIT © 2026 PositionDoctor · [View License](LICENSE)

---

<div align="center">

**Built with ❤️ for GPS enthusiasts**

[⭐ Star](https://github.com/LeslieSSS/position-doctor) · [🐛 Issues](https://github.com/LeslieSSS/position-doctor/issues) · [💬 Discussions](https://github.com/LeslieSSS/position-doctor/discussions)

</div>
