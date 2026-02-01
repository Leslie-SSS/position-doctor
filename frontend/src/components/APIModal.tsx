import { useState } from 'react'
import { useAppTranslation } from '@/hooks/useTranslation'
import { useStore } from '@/hooks/useStore'

type CodeTab = 'curl' | 'javascript' | 'python' | 'go'

const codeExamples = {
  curl: `#!/bin/bash
# Binary array format (recommended)
curl -X POST https://api.positiondoctor.com/v1/diagnose/points \\
  -H "Content-Type: application/json" \\
  -d '{
    "points": [
      [22.5431, 113.9510, 1705318200, 15.2, 5.2, 45.0],
      [22.5429, 113.9510, 1705318203, 15.5, 5.5, 46.0],
      [22.5427, 113.9510, 1705318206, 15.8, 5.8, 47.0]
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
      },
      "output": {
        "includePoints": true,
        "simplifyEpsilon": 1.0
      }
    }
  }'`,

  javascript: `import { parseTrackFile } from './gpxParser'

// Parse GPX/KML client-side
const file = fileInput.files[0]
const { points } = await parseTrackFile(file)

// Send to API
const response = await fetch('/api/v1/diagnose/points', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    points, // [[lat, lon, time, ele?, speed?, bearing?], ...]
    options: {
      algorithms: {
        adaptiveRTS: true,
        splineInterpolation: true,
        simplification: true,
        outlierRemoval: true
      },
      thresholds: {
        maxSpeed: 120.0,
        maxAcceleration: 10.0,
        maxJump: 500.0,
        driftThreshold: 0.0001
      },
      output: {
        includePoints: true,
        simplifyEpsilon: 1.0
      }
    }
  })
})

const result = await response.json()
console.log(result.data.healthScore)
console.log(result.data.diagnostics)`,

  python: `import requests

# Binary array format
response = requests.post(
    'https://api.positiondoctor.com/v1/diagnose/points',
    json={
        'points': [
            [22.5431, 113.9510, 1705318200, 15.2, 5.2, 45.0],
            [22.5429, 113.9510, 1705318203, 15.5, 5.5, 46.0],
            [22.5427, 113.9510, 1705318206, 15.8, 5.8, 47.0]
        ],
        'options': {
            'algorithms': {
                'adaptiveRTS': True,
                'splineInterpolation': True,
                'simplification': True,
                'outlierRemoval': True
            },
            'thresholds': {
                'maxSpeed': 120.0,
                'maxAcceleration': 10.0,
                'maxJump': 500.0,
                'driftThreshold': 0.0001
            },
            'output': {
                'includePoints': True,
                'simplifyEpsilon': 1.0
            }
        }
    }
)

result = response.json()
print(result['data']['healthScore'])
print(result['data']['diagnostics'])`,

  go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type PointsRequest struct {
    Points  [][]float64  \`json:"points"\`
    Options Options       \`json:"options"\`
}

type Options struct {
    Algorithms Algorithms \`json:"algorithms"\`
    Thresholds Thresholds \`json:"thresholds"\`
    Output     Output     \`json:"output"\`
}

type Algorithms struct {
    AdaptiveRTS        bool \`json:"adaptiveRTS"\`
    SplineInterpolation bool \`json:"splineInterpolation"\`
    Simplification     bool \`json:"simplification"\`
    OutlierRemoval     bool \`json:"outlierRemoval"\`
}

type Thresholds struct {
    MaxSpeed        float64 \`json:"maxSpeed"\`
    MaxAcceleration float64 \`json:"maxAcceleration"\`
    MaxJump         float64 \`json:"maxJump"\`
    DriftThreshold  float64 \`json:"driftThreshold"\`
}

type Output struct {
    IncludePoints   bool    \`json:"includePoints"\`
    SimplifyEpsilon float64 \`json:"simplifyEpsilon"\`
}

func main() {
    req := PointsRequest{
        Points: [][]float64{
            {22.5431, 113.9510, 1705318200, 15.2, 5.2, 45.0},
            {22.5429, 113.9510, 1705318203, 15.5, 5.5, 46.0},
            {22.5427, 113.9510, 1705318206, 15.8, 5.8, 47.0},
        },
        Options: Options{
            Algorithms: Algorithms{
                AdaptiveRTS:        true,
                SplineInterpolation: true,
                Simplification:     true,
                OutlierRemoval:     true,
            },
            Thresholds: Thresholds{
                MaxSpeed:        120.0,
                MaxAcceleration: 10.0,
                MaxJump:         500.0,
                DriftThreshold:  0.0001,
            },
            Output: Output{
                IncludePoints:   true,
                SimplifyEpsilon: 1.0,
            },
        },
    }

    jsonData, _ := json.Marshal(req)
    resp, _ := http.Post(
        "https://api.positiondoctor.com/v1/diagnose/points",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    defer resp.Body.Close()

    fmt.Println("Response:", resp.Status)
}`
}

function getIconPath(iconName: string): string {
  const icons: Record<string, string> = {
    check: 'M5 13l4 4L19 7',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    server: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  }
  return icons[iconName] || icons.code
}

export function APIModal() {
  const { t } = useAppTranslation()
  const { apiModalOpen, toggleApiModal } = useStore()
  const [activeTab, setActiveTab] = useState<CodeTab>('curl')
  const [copiedTab, setCopiedTab] = useState<CodeTab | null>(null)
  const [activeSection, setActiveSection] = useState<'overview' | 'request' | 'response' | 'errors'>('overview')

  if (!apiModalOpen) return null

  const handleCopy = (code: string, tab: CodeTab) => {
    navigator.clipboard.writeText(code)
    setCopiedTab(tab)
    setTimeout(() => setCopiedTab(null), 2000)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      toggleApiModal()
    }
  }

  const sections = [
    { id: 'overview', label: t('apiModal.section.overview'), icon: 'book' },
    { id: 'request', label: t('apiModal.section.request'), icon: 'send' },
    { id: 'response', label: t('apiModal.section.response'), icon: 'code' },
    { id: 'errors', label: t('apiModal.section.errors'), icon: 'server' },
  ] as const

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 id="api-modal-title" className="text-xl font-bold text-white">
              {t('apiModal.title')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{t('apiModal.subtitle')}</p>
          </div>
          <button
            onClick={toggleApiModal}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-800 bg-slate-900/50">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={getIconPath(section.icon)} />
              </svg>
              {section.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Endpoint */}
              <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded">POST</span>
                  <code className="text-sm text-cyan-400 font-mono">/api/v1/diagnose/points</code>
                </div>
                <p className="text-sm text-slate-400">
                  {t('apiModal.endpointDesc')}
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t('apiModal.features.adaptiveRTS'), desc: t('apiModal.features.adaptiveRTSDesc') },
                  { label: t('apiModal.features.splineInterpolation'), desc: t('apiModal.features.splineInterpolationDesc') },
                  { label: t('apiModal.features.douglasPeucker'), desc: t('apiModal.features.douglasPeuckerDesc') },
                  { label: t('apiModal.features.outlierRemoval'), desc: t('apiModal.features.outlierRemovalDesc') },
                ].map((feature, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <div className="text-sm font-medium text-white">{feature.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{feature.desc}</div>
                  </div>
                ))}
              </div>

              {/* Quick Start */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.quickStart')}</h3>
                <div className="space-y-3">
                  {[
                    { num: 1, title: t('apiModal.quickStartSteps.prepare.title'), desc: t('apiModal.quickStartSteps.prepare.desc') },
                    { num: 2, title: t('apiModal.quickStartSteps.send.title'), desc: t('apiModal.quickStartSteps.send.desc') },
                    { num: 3, title: t('apiModal.quickStartSteps.getResult.title'), desc: t('apiModal.quickStartSteps.getResult.desc') },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <div className="w-7 h-7 rounded-full bg-cyan-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {step.num}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{step.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Request Section */}
          {activeSection === 'request' && (
            <div className="space-y-6">
              {/* Request Body Structure */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.requestBodyTitle')}</h3>
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
                  <pre className="text-xs text-slate-400 font-mono">{`{
  "points": [
    [lat, lon, time, ele?, speed?, bearing?],
    ...
  ],
  "options": {
    "algorithms": { ... },
    "thresholds": { ... },
    "output": { ... }
  }
}`}</pre>
                </div>
              </div>

              {/* Points Array Detail */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.pointsArrayFormat')}</h3>
                <p className="text-sm text-slate-500 mb-4">{t('apiModal.pointsArrayDesc')}</p>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.index')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldName')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-center font-medium text-slate-300">{t('apiModal.required')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.range')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">[0]</td><td className="px-4 py-3 text-white">latitude</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-center text-emerald-400">✓</td><td className="px-4 py-3 text-slate-400">{t('apiModal.latitude')}</td><td className="px-4 py-3 text-slate-500">-90 ~ 90°</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">[1]</td><td className="px-4 py-3 text-white">longitude</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-center text-emerald-400">✓</td><td className="px-4 py-3 text-slate-400">{t('apiModal.longitude')}</td><td className="px-4 py-3 text-slate-500">-180 ~ 180°</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">[2]</td><td className="px-4 py-3 text-white">timestamp</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-center text-emerald-400">✓</td><td className="px-4 py-3 text-slate-400">{t('apiModal.timestamp')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.units.seconds')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">[3]</td><td className="px-4 py-3 text-white">elevation</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-center text-slate-500">-</td><td className="px-4 py-3 text-slate-400">{t('apiModal.elevation')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.units.meters')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">[4]</td><td className="px-4 py-3 text-white">speed</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-center text-slate-500">-</td><td className="px-4 py-3 text-slate-400">{t('apiModal.speed')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.units.kmh')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">[5]</td><td className="px-4 py-3 text-white">bearing</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-center text-slate-500">-</td><td className="px-4 py-3 text-slate-400">{t('apiModal.bearing')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.units.degrees360')}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-600 mt-2">{t('apiModal.note')}</p>
              </div>

              {/* Algorithms Options */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.algorithmsConfig')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.defaultValue')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">adaptiveRTS</td><td className="px-4 py-3 text-slate-400">boolean</td><td className="px-4 py-3 text-emerald-400">true</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.adaptiveRTSDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">splineInterpolation</td><td className="px-4 py-3 text-slate-400">boolean</td><td className="px-4 py-3 text-emerald-400">true</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.splineInterpolationDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">simplification</td><td className="px-4 py-3 text-slate-400">boolean</td><td className="px-4 py-3 text-emerald-400">true</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.simplificationDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">outlierRemoval</td><td className="px-4 py-3 text-slate-400">boolean</td><td className="px-4 py-3 text-emerald-400">true</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.outlierRemovalDesc')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Thresholds Options */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.thresholds')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.defaultValue')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">maxSpeed</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-300">120.0</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.maxSpeedDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">maxAcceleration</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-300">10.0</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.maxAccelerationDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">maxJump</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-300">500.0</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.maxJumpDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">driftThreshold</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-300">0.0001</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.driftThresholdDesc')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Output Options */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.outputConfig')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.defaultValue')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">includePoints</td><td className="px-4 py-3 text-slate-400">boolean</td><td className="px-4 py-3 text-emerald-400">true</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.includePointsDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">simplifyEpsilon</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-300">1.0</td><td className="px-4 py-3 text-slate-400 text-xs">{t('apiModal.simplifyEpsilonDesc')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.constraintsTitle')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('apiModal.minPoints'), value: '2', desc: t('apiModal.minPointsDesc') },
                    { label: t('apiModal.maxPoints'), value: '100,000', desc: t('apiModal.maxPointsDesc') },
                    { label: t('apiModal.requestTimeout'), value: '60s', desc: t('apiModal.requestTimeoutDesc') },
                    { label: t('apiModal.rateLimit'), value: t('apiModal.rateLimitValue'), desc: t('apiModal.rateLimitDesc') },
                  ].map((limit, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{limit.label}</span>
                        <span className="text-sm font-medium text-cyan-400">{limit.value}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{limit.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Examples */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.codeExamples')}</h3>
                <div className="flex gap-2 mb-3">
                  {(['curl', 'javascript', 'python', 'go'] as CodeTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {tab === 'javascript' ? 'JavaScript' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg blur-xl" />
                  <pre className="relative bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-800 max-h-64">
                    <code className="text-xs text-slate-300 font-mono whitespace-pre">
                      {codeExamples[activeTab]}
                    </code>
                  </pre>
                  <button
                    onClick={() => handleCopy(codeExamples[activeTab], activeTab)}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                  >
                    {copiedTab === activeTab ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={getIconPath('check')} />
                        </svg>
                        <span className="text-emerald-400">{t('api.copied')}</span>
                      </>
                    ) : (
                      <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{t('api.copy')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Response Section */}
          {activeSection === 'response' && (
            <div className="space-y-6">
              {/* Response Structure */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.responseBodyTitle')}</h3>
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
                  <pre className="text-xs text-slate-400 font-mono">{`{
  "success": true,
  "data": {
    "reportId": "uuid",
    "original": { "pointCount": 722, "distance": 5234.5, ... },
    "corrected": { "pointCount": 190, "distance": 5180.2, ... },
    "diagnostics": {
      "normalPoints": 145,
      "anomalyPoints": 45,
      "fixedPoints": 45,
      "removedPoints": 487,
      "interpolatedPoints": 100,
      "totalProcessed": 532,
      "anomalies": [...],
      "algorithms": [...],
      "healthScore": { "total": 85, "rating": "good", "breakdown": {...} }
    },
    "points": [...]  // {t('apiModal.includePointsComment')}
  },
  "meta": {
    "version": "1.0.0",
    "processedAt": "2024-01-15T08:30:00Z",
    "processingTimeMs": 156
  }
}`}</pre>
                </div>
              </div>

              {/* Success Response Fields */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.successResponseFields')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldPath')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">success</td><td className="px-4 py-3 text-slate-400">boolean</td><td className="px-4 py-3 text-slate-400">{t('apiModal.requestSuccess')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">data.reportId</td><td className="px-4 py-3 text-slate-400">string</td><td className="px-4 py-3 text-slate-400">{t('apiModal.reportIdDesc')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">data.original</td><td className="px-4 py-3 text-slate-400">object</td><td className="px-4 py-3 text-slate-400">{t('apiModal.originalTrajectoryStats')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">data.corrected</td><td className="px-4 py-3 text-slate-400">object</td><td className="px-4 py-3 text-slate-400">{t('apiModal.correctedTrajectoryStats')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">data.points</td><td className="px-4 py-3 text-slate-400">array</td><td className="px-4 py-3 text-slate-400">{t('apiModal.pointsDataOptional')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trajectory Stats */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.trajectoryStats')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.range')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">pointCount</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.pointCount')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.distanceUnit')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">distance</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-400">{t('apiModal.distance')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.units.meters')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">durationSeconds</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.durationSeconds')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.secondsUnit')} (s)</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">avgSpeed</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-400">{t('apiModal.avgSpeed')}</td><td className="px-4 py-3 text-slate-500">km/h</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">maxSpeed</td><td className="px-4 py-3 text-slate-400">number</td><td className="px-4 py-3 text-slate-400">{t('apiModal.maxSpeed_field')}</td><td className="px-4 py-3 text-slate-500">km/h</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">bounds</td><td className="px-4 py-3 text-slate-400">object</td><td className="px-4 py-3 text-slate-400">{t('apiModal.bounds')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.units.degrees')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">elevation</td><td className="px-4 py-3 text-slate-400">object</td><td className="px-4 py-3 text-slate-400">{t('apiModal.elevation_field')}</td><td className="px-4 py-3 text-slate-500">{t('apiModal.units.meters')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Diagnostics */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.diagnosticsInfo')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">normalPoints</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.normalPoints')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">anomalyPoints</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.anomalyPoints')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">fixedPoints</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.fixedPoints_field')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">removedPoints</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.removedPoints_field')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">interpolatedPoints</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.interpolatedPoints_field')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">totalProcessed</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.totalProcessed')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">anomalies</td><td className="px-4 py-3 text-slate-400">array</td><td className="px-4 py-3 text-slate-400">{t('apiModal.anomalies_field')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">algorithms</td><td className="px-4 py-3 text-slate-400">array</td><td className="px-4 py-3 text-slate-400">{t('apiModal.algorithms_field')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">healthScore</td><td className="px-4 py-3 text-slate-400">object</td><td className="px-4 py-3 text-slate-400">{t('apiModal.healthScore_field')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Health Score */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.healthScoreTitle')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">total</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.totalScore')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">rating</td><td className="px-4 py-3 text-slate-400">string</td><td className="px-4 py-3 text-slate-400">{t('apiModal.rating_field')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">breakdown</td><td className="px-4 py-3 text-slate-400">object</td><td className="px-4 py-3 text-slate-400">{t('apiModal.breakdown_field')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Meta */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.metaTitle')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">version</td><td className="px-4 py-3 text-slate-400">string</td><td className="px-4 py-3 text-slate-400">{t('apiModal.version')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">processedAt</td><td className="px-4 py-3 text-slate-400">string</td><td className="px-4 py-3 text-slate-400">{t('apiModal.processedAt')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">processingTimeMs</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.processingTimeMs')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Errors Section */}
          {activeSection === 'errors' && (
            <div className="space-y-6">
              {/* Error Response Structure */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.errorResponseTitle')}</h3>
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
                  <pre className="text-xs text-slate-400 font-mono">{`{
  "success": false,
  "error": "error_code",
  "message": "${t('apiModal.userFriendlyError')}",
  "details": {
    "field": "points",
    "message": "${t('apiModal.detailedErrorMessage')}",
    "limit": 100000,
    "invalidIndices": [5, 10, 15]
  },
  "meta": {
    "version": "1.0.0"
  }
}`}</pre>
                </div>
              </div>

              {/* Error Codes */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.errorCodeTitle')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.errorCode')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.httpStatus')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.errorDesc')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-red-400 font-mono text-xs">invalid_json</td><td className="px-4 py-3 text-slate-400">400</td><td className="px-4 py-3 text-slate-400">{t('apiModal.invalid_json')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-red-400 font-mono text-xs">too_many_points</td><td className="px-4 py-3 text-slate-400">400</td><td className="px-4 py-3 text-slate-400">{t('apiModal.too_many_points')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-red-400 font-mono text-xs">too_few_points</td><td className="px-4 py-3 text-slate-400">400</td><td className="px-4 py-3 text-slate-400">{t('apiModal.too_few_points')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-red-400 font-mono text-xs">invalid_points</td><td className="px-4 py-3 text-slate-400">400</td><td className="px-4 py-3 text-slate-400">{t('apiModal.invalid_points')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-red-400 font-mono text-xs">rate_limit_exceeded</td><td className="px-4 py-3 text-slate-400">429</td><td className="px-4 py-3 text-slate-400">{t('apiModal.rate_limit_exceeded')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-red-400 font-mono text-xs">internal_error</td><td className="px-4 py-3 text-slate-400">500</td><td className="px-4 py-3 text-slate-400">{t('apiModal.internal_error')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Error Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.errorDetailsTitle')}</h3>
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.field')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.fieldType')}</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-300">{t('apiModal.description')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">field</td><td className="px-4 py-3 text-slate-400">string</td><td className="px-4 py-3 text-slate-400">{t('apiModal.error_field')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">message</td><td className="px-4 py-3 text-slate-400">string</td><td className="px-4 py-3 text-slate-400">{t('apiModal.error_message')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">limit</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.error_limit')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">invalidIndices</td><td className="px-4 py-3 text-slate-400">array</td><td className="px-4 py-3 text-slate-400">{t('apiModal.invalidIndices')}</td></tr>
                      <tr className="bg-slate-900/30"><td className="px-4 py-3 text-cyan-400 font-mono text-xs">retryAfter</td><td className="px-4 py-3 text-slate-400">integer</td><td className="px-4 py-3 text-slate-400">{t('apiModal.retryAfter')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Example Errors */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">{t('apiModal.errorResponseExample')}</h3>
                <div className="space-y-4">
                  {/* Too Many Points */}
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs font-mono bg-red-500/20 text-red-400 rounded">too_many_points</span>
                      <span className="text-xs text-slate-500">HTTP 400</span>
                    </div>
                    <pre className="text-xs text-slate-400 font-mono bg-slate-950 rounded p-3">{`{
  "success": false,
  "error": "too_many_points",
  "message": "Maximum 100,000 points per request",
  "details": {
    "field": "points",
    "message": "Received 150,000 points, maximum is 100,000",
    "limit": 100000
  }
}`}</pre>
                  </div>

                  {/* Invalid Points */}
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs font-mono bg-red-500/20 text-red-400 rounded">invalid_points</span>
                      <span className="text-xs text-slate-500">HTTP 400</span>
                    </div>
                    <pre className="text-xs text-slate-400 font-mono bg-slate-950 rounded p-3">{`{
  "success": false,
  "error": "invalid_points",
  "message": "Invalid points at indices: [5, 10, 15]",
  "details": {
    "field": "points",
    "message": "Invalid points at indices: [5, 10, 15] (check lat, lon, time ranges)",
    "invalidIndices": [5, 10, 15]
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
