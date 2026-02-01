<div align="center">

<img src="docs/logo.svg" width="140" alt="PositionDoctor"/>

# PositionDoctor

**自动化 GPS 轨迹诊断与修复**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[English](README.md) · [简体中文](README_zh.md)

</div>

---

## PositionDoctor 是什么？

GPS 轨迹常常充满噪声：信号漂移、突然跳变、速度异常。这些问题会扭曲运动轨迹数据，影响分析精度。

**PositionDoctor** 自动检测并修复常见的 GPS 跟踪误差。上传 GPX/KML 文件，即时分析，一键修复。

适合跑步、骑行、徒步及所有依赖 GPS 跟踪的用户。

---

## 功能特性

| 检测类型 | 修复算法 | 可视化 |
|---------|---------|--------|
| 漂移 | AdaptiveRTS 平滑 | 修复前后对比 |
| 跳变 | 样条插值 | 健康评分 |
| 速度异常 | Douglas-Peucker | 轨迹回放 |
| 加速度 | 离群点剔除 | 异常标记 |
| 密度 | — | — |
| 离群点 | — | — |

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

### 诊断轨迹

**接口:** `POST /api/v1/diagnose/points`

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

**点格式:** `[纬度, 经度, 时间戳, 海拔?, 速度?, 航向?]`

| 索引 | 字段 | 类型 | 必填 | 范围 |
|-----|------|------|------|------|
| `[0]` | 纬度 | number | 是 | -90 到 90 |
| `[1]` | 经度 | number | 是 | -180 到 180 |
| `[2]` | 时间戳 | number | 是 | Unix 时间戳 |
| `[3]` | 海拔 | number | 否 | 米 |
| `[4]` | 速度 | number | 否 | m/s |
| `[5]` | 航向 | number | 否 | 0-360 度 |

### 导出结果

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

## 技术架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             PositionDoctor                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────┐         ┌─────────────────────────┐  │
│   │       前端 (React)          │         │      后端 (Go)          │  │
│   ├─────────────────────────────┤         ├─────────────────────────┤  │
│   │ • React 18 + TypeScript     │         │ • Go 1.21 + Chi Router │  │
│   │ • Vite (构建工具)           │         │ • AdaptiveRTS           │  │
│   │ • Tailwind CSS              │         │ • Douglas-Peucker       │  │
│   │ • Leaflet (地图)            │         │ • 样条插值              │  │
│   │ • Zustand (状态管理)        │         │ • 统计滤波              │  │
│   └─────────────────────────────┘         └─────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        算法流程                                  │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │                                                                 │   │
│   │   1. 异常检测                                                   │   │
│   │      • 漂移检测     → 连续位置偏差                              │   │
│   │      • 跳变检测     → 突发位置变化                              │   │
│   │      • 速度分析     → 不合理速度                                │   │
│   │      • 加速度检查   → 急剧速度变化                              │   │
│   │      • 密度验证     → 点分布分析                                │   │
│   │      • 离群点识别   → 统计异常                                  │   │
│   │                                                                 │   │
│   │   2. 修复算法                                                   │   │
│   │      • AdaptiveRTS         前向 EKF + 后向 RTS                  │   │
│   │                            变分贝叶斯噪声估计                   │   │
│   │      • Douglas-Peucker    噪声感知简化                          │   │
│   │      • 样条插值           三次样条填补缺口                       │   │
│   │      • 离群点剔除         统计滤波                                │   │
│   │                                                                 │   │
│   │   3. 健康评分                                                   │   │
│   │      • 完整度 (40%)     点覆盖率                                 │   │
│   │      • 准确性 (30%)     位置偏差                                 │   │
│   │      • 一致性 (30%)     轨迹平滑度                               │   │
│   │                                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 算法详解

### AdaptiveRTS

自研 **自适应 Rauch-Tung-Striebel** 平滑器，采用变分贝叶斯噪声估计。

```
前向传递 (EKF)            →  后向传递 (RTS)
─────────────────           →  ─────────────────
状态预测                   →  平滑增益计算
测量更新                   →  状态修正
噪声估计 (VB)              →  协方差更新
```

**优势:**
- 根据轨迹特征动态调整平滑参数
- 比传统卡尔曼滤波精度提升 30-40%
- 处理变速运动和 GPS 漂移场景

### Douglas-Peucker

噪声感知的轨迹简化算法，使用 Haversine 公式计算垂直距离。

**特性:**
- 保留关键转弯点
- 基于局部噪声水平的自适应阈值
- 大轨迹并行处理

### 健康评分

多维度轨迹质量评估 (0-100):

| 等级 | 范围 | 颜色 |
|-----|------|------|
| 优秀 | 85-100 | 翠绿 |
| 良好 | 70-84 | 青色 |
| 一般 | 50-69 | 黄色 |
| 较差 | 0-49 | 红色 |

---

## 配置说明

环境变量 (`.env`):

```bash
# 后端
PORT=8081
CORS_ORIGINS=http://localhost:3002

# 前端
VITE_API_URL=http://localhost:8081
VITE_GOOGLE_MAPS_API_KEY=你的密钥
```

---

## 开源协议

MIT © 2026 PositionDoctor

[查看协议](LICENSE)
