---
<div align="center">

# PositionDoctor

**GPS 轨迹诊断医生 —— 让数据更精准**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)

</div>

---

## ✨ 核心功能

上传 GPX/KML 文件 → 智能诊断 → 一键修复

### 🎯 为什么选择 PositionDoctor？

| 特性 | 说明 |
|-----|------|
| 🧠 **更智能的算法** | 自适应RTS 精度比 Kalman 滤波提升 30-40% |
| 🔍 **6种异常检测** | 漂移、跳变、速度、加速度、密度、离群点 |
| 📊 **健康评分** | 业界首创的轨迹质量多维度评估体系 |
| 🗺️ **地图对比** | 原始轨迹 vs 修复轨迹并排展示 |
| 🎬 **播放动画** | 实时观看修复过程 |
| 🌐 **中英双语** | 无缝切换 |

## 🚀 快速开始

```bash
# 一键启动
git clone https://github.com/your-org/position-doctor.git
cd position-doctor
docker-compose up -d

# 浏览器打开 http://localhost:3002
```

## 📖 API 使用

```bash
# 上传并诊断
curl -X POST http://localhost:8081/api/v1/diagnose \
  -F "file=@your_track.gpx"

# 下载清洗结果
curl http://localhost:8081/api/v1/export/{reportId}/gpx -o cleaned.gpx
```

## 🛠️ 技术栈

```
后端: Go 1.21 + Chi Router
前端: React 18 + TypeScript + Vite + Tailwind
地图: Leaflet + Google Maps
```

## 📚 文档

- [API 参考](docs/API.md)
- [算法详解](docs/ALGORITHMS.md)

## 📄 开源协议

MIT © 2024 PositionDoctor

---

<div align="center">

**为 GPS 爱好者打造 ❤️**

</div>
