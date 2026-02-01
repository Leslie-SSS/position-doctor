<div align="center">

<img src="docs/logo.svg" width="100" alt="PositionDoctor Logo"/>

# PositionDoctor

**GPS 轨迹诊断医生 —— 让数据更精准**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)

[English](README.md) | [简体中文](README_zh.md)

</div>

---

上传 GPX/KML 文件 → 即时诊断 → 一键修复

适合跑步、骑行、徒步及所有依赖 GPS 跟踪的用户。

---

## 功能特性

- **6 种异常检测** — 漂移、跳变、速度、加速度、密度、离群点
- **智能修复** — AdaptiveRTS 算法（比卡尔曼滤波精准 30-40%）
- **可视化分析** — 地图对比、健康评分、轨迹回放
- **便捷导出** — GPX、KML、GeoJSON、JSON

---

## 快速开始

```bash
git clone https://github.com/LeslieSSS/position-doctor.git
cd position-doctor
docker-compose up -d
```

打开 http://localhost:3002

---

## API 使用

```bash
# 上传并诊断
curl -X POST http://localhost:8081/api/v1/diagnose \
  -F "file=@your_track.gpx"

# 下载清洗结果
curl http://localhost:8081/api/v1/export/{reportId}/gpx -o cleaned.gpx
```

---

## 技术栈

```
前端: React 18 + TypeScript + Vite + Tailwind + Leaflet
后端: Go 1.21 + Chi Router
```

---

## 开源协议

MIT © 2024 PositionDoctor
