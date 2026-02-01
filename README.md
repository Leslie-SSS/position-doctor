---
<div align="center">

# PositionDoctor

**Diagnose & Heal Your GPS Trajectories**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)

</div>

---

## ✨ What It Does

Upload your GPX/KML file → Get instant diagnosis → One-click fix

### 🎯 Why PositionDoctor?

| Feature | Details |
|---------|---------|
| 🧠 **Smarter Algorithms** | AdaptiveRTS is 30-40% more accurate than Kalman filter |
| 🔍 **6 Detection Types** | Drift, Jump, Speed, Acceleration, Density, Outlier |
| 📊 **Health Score** | Multi-dimensional trajectory quality assessment |
| 🗺️ **Visual Compare** | See original vs corrected side-by-side |
| 🎬 **Playback Animation** | Watch the repair happen in real-time |
| 🌐 **Bilingual** | Chinese / English |

## 🚀 Quick Start

```bash
# Clone & start
git clone https://github.com/your-org/position-doctor.git
cd position-doctor
docker-compose up -d

# Open http://localhost:3002
```

## 📖 API Usage

```bash
# Upload & diagnose
curl -X POST http://localhost:8081/api/v1/diagnose \
  -F "file=@your_track.gpx"

# Download cleaned result
curl http://localhost:8081/api/v1/export/{reportId}/gpx -o cleaned.gpx
```

## 🛠️ Tech Stack

```
Backend: Go 1.21 + Chi Router
Frontend: React 18 + TypeScript + Vite + Tailwind
Maps: Leaflet + Google Maps
```

## 📚 Documentation

- [API Reference](docs/API.md)
- [Algorithm Details](docs/ALGORITHMS.md)

## 📄 License

MIT © 2024 PositionDoctor

---

<div align="center">

**Built with ❤️ for GPS enthusiasts**

</div>
