<div align="center">

<img src="docs/logo.svg" width="120" alt="PositionDoctor"/>

# PositionDoctor

<div align="center">

**智能修复您的 GPS 轨迹，让数据回归真实**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[English](README.md) · [简体中文](README_zh.md)

</div>

</div>

---

## 为什么需要 PositionDoctor？

GPS 轨迹数据常常充满噪声：信号漂移、突然跳变、速度异常... 这些问题让运动轨迹失真，影响数据分析的准确性。

PositionDoctor 是一款**自动化的 GPS 轨迹诊断与修复工具**，上传文件，一键修复。

> **适合场景**：跑步、骑行、徒步、马拉松训练、户外运动轨迹分析

---

## 核心功能

<div align="center">

<table>
<tr>
<td width="50%">

**🔍 6 种异常检测**

漂移 · 跳变 · 速度异常
加速度 · 密度 · 离群点

</td>
<td width="50%">

**🧠 智能修复算法**

AdaptiveRTS · 样条插值
Douglas-Peucker · 统计滤波

</td>
</tr>
<tr>
<td width="50%">

**📊 可视化分析**

地图对比 · 健康评分
轨迹回放 · 异常标记

</td>
<td width="50%">

**💾 多格式导出**

GPX · KML · GeoJSON · JSON

</td>
</tr>
</table>

</div>

---

## 快速开始

```bash
git clone https://github.com/LeslieSSS/position-doctor.git
cd position-doctor
docker-compose up -d
```

访问 http://localhost:3002

---

## 界面预览

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

## 技术架构

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

## 算法优势

| 算法 | 精度提升 | 适用场景 |
|-----|---------|---------|
| **AdaptiveRTS** | +30~40% vs Kalman | 动态轨迹、变速运动 |
| **Douglas-Peucker** | 压缩 60~80% | 数据简化 |
| **样条插值** | 平滑度 +50% | 缺失点补全 |
| **统计滤波** | 离群点剔除 95%+ | 噪声清理 |

---

## API 使用

```bash
# 上传文件诊断
curl -X POST http://localhost:8081/api/v1/diagnose \
  -F "file=@track.gpx"

# 下载修复结果
curl http://localhost:8081/api/v1/export/{id}/gpx -o cleaned.gpx
```

---

## Star 历史

<a href="https://github.com/LeslieSSS/position-doctor/stargazers">
  <img src="https://api.star-history.com/svg?repos=LeslieSSS/position-doctor&type=Date" alt="Star History Chart">
</a>

---

## 开源协议

MIT © 2026 PositionDoctor · [查看完整协议](LICENSE)

---

<div align="center">

**为 GPS 爱好者打造 ❤️**

[⭐ Star](https://github.com/LeslieSSS/position-doctor) · [🐛 问题反馈](https://github.com/LeslieSSS/position-doctor/issues) · [💬 讨论](https://github.com/LeslieSSS/position-doctor/discussions)

</div>
