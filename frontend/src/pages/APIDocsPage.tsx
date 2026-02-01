import { useState } from 'react'
import { useAppTranslation } from '@/hooks/useTranslation'
import { useStore } from '@/hooks/useStore'
import { Navigation } from '@/components/APIDocsPage/Navigation'
import { CodeBlock } from '@/components/APIDocsPage/CodeBlock'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

type CodeTab = 'curl' | 'javascript' | 'typescript' | 'python' | 'go' | 'java' | 'php'

const codeExamples: Record<CodeTab, string> = {
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

  javascript: `// Parse GPX/KML client-side
const file = fileInput.files[0]
const { points } = await parseTrackFile(file)

// Send to API
const response = await fetch('/api/v1/diagnose/points', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    points,
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

  typescript: `import type { GPSPoint, DiagnosticRequest, DiagnosticResponse } from './types'

const points: GPSPoint[] = [
  [22.5431, 113.9510, 1705318200, 15.2, 5.2, 45.0],
  [22.5429, 113.9510, 1705318203, 15.5, 5.5, 46.0],
  [22.5427, 113.9510, 1705318206, 15.8, 5.8, 47.0]
]

const request: DiagnosticRequest = {
  points,
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
}

const response = await fetch('/api/v1/diagnose/points', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
})

const result: DiagnosticResponse = await response.json()
console.log(result.data.healthScore.total)`,

  python: `import requests

# Binary array format
points = [
    [22.5431, 113.9510, 1705318200, 15.2, 5.2, 45.0],
    [22.5429, 113.9510, 1705318203, 15.5, 5.5, 46.0],
    [22.5427, 113.9510, 1705318206, 15.8, 5.8, 47.0]
]

response = requests.post(
    'https://api.positiondoctor.com/v1/diagnose/points',
    json={
        'points': points,
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
print(f"Health Score: {result['data']['healthScore']['total']}")
print(f"Rating: {result['data']['healthScore']['rating']}")`,

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
}`,

  java: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class PositionDoctorClient {
    public static void main(String[] args) throws Exception {
        // Build request body
        String requestBody = "{\\"points\\":[[22.5431,113.9510,1705318200,15.2,5.2,45.0]],\\"options\\":{\\"algorithms\\":{\\"adaptiveRTS\\":true},\\"thresholds\\":{\\"maxSpeed\\":120.0},\\"output\\":{\\"includePoints\\":true}}}";

        // Send request
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.positiondoctor.com/v1/diagnose/points"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = client.send(request,
            HttpResponse.BodyHandlers.ofString());

        System.out.println("Response: " + response.body());
    }
}`,

  php: `<?php
// PHP cURL example
$points = [
    [22.5431, 113.9510, 1705318200, 15.2, 5.2, 45.0],
    [22.5429, 113.9510, 1705318203, 15.5, 5.5, 46.0],
    [22.5427, 113.9510, 1705318206, 15.8, 5.8, 47.0]
];

$data = [
    'points' => $points,
    'options' => [
        'algorithms' => [
            'adaptiveRTS' => true,
            'splineInterpolation' => true,
            'simplification' => true,
            'outlierRemoval' => true
        ],
        'thresholds' => [
            'maxSpeed' => 120.0,
            'maxAcceleration' => 10.0,
            'maxJump' => 500.0,
            'driftThreshold' => 0.0001
        ],
        'output' => [
            'includePoints' => true,
            'simplifyEpsilon' => 1.0
        ]
    ]
];

$ch = curl_init('https://api.positiondoctor.com/v1/diagnose/points');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
echo "Health Score: " . $result['data']['healthScore']['total'];
?>`
}

function getIconPath(iconName: string): string {
  const icons: Record<string, string> = {
    check: 'M5 13l4 4L19 7',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    server: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
    arrowLeft: 'M10 19l-7-7m0 0l7-7m-7 7h18',
  }
  return icons[iconName] || icons.code
}

// Table row component for better readability
interface TableRowProps {
  index: string
  field: string
  type: string
  required: boolean
  description: string
  range: string
}

function PointTableRow({ index, field, type, required, description, range }: TableRowProps) {
  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{index}</td>
      <td className="px-4 py-3 text-white font-medium">{field}</td>
      <td className="px-4 py-3 text-slate-400 text-sm">{type}</td>
      <td className="px-4 py-3 text-center">
        {required ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">Yes</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-500">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-400 text-sm">{description}</td>
      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{range}</td>
    </tr>
  )
}

interface OptionTableRowProps {
  name: string
  type: string
  defaultVal: string
  description: string
  range?: string
}

function OptionTableRow({ name, type, defaultVal, description, range }: OptionTableRowProps) {
  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{name}</td>
      <td className="px-4 py-3 text-slate-400 text-sm">{type}</td>
      <td className="px-4 py-3 text-slate-500 text-sm font-mono">{defaultVal}</td>
      {range !== undefined && <td className="px-4 py-3 text-slate-500 text-xs font-mono">{range}</td>}
      <td className="px-4 py-3 text-slate-400 text-sm">{description}</td>
    </tr>
  )
}

export function APIDocsPage() {
  const { t } = useAppTranslation()
  const { setView } = useStore()
  const [activeTab, setActiveTab] = useState<CodeTab>('curl')
  const [activeSection, setActiveSection] = useState<'overview' | 'request' | 'response' | 'errors'>('overview')

  const sections = [
    { id: 'overview' as const, label: t('apiDocs.section.overview'), icon: 'book' },
    { id: 'request' as const, label: t('apiDocs.section.request'), icon: 'send' },
    { id: 'response' as const, label: t('apiDocs.section.response'), icon: 'code' },
    { id: 'errors' as const, label: t('apiDocs.section.errors'), icon: 'server' },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14">
            {/* Left - Logo and Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                Position<span className="text-cyan-400">Doctor</span>
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right - Back to App + Language */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView('app')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('common.backToApp')}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation - Desktop */}
          <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center gap-1 mb-6 p-1 bg-slate-900/50 rounded-xl border border-slate-800 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={getIconPath(section.icon)} />
                  </svg>
                  {section.label}
                </button>
              ))}
            </div>

            {/* Content Sections */}
            <div className="bg-slate-900/30 border border-slate-700/50 rounded-2xl p-4 sm:p-6 lg:p-8">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  {/* Endpoint Card */}
                  <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500/20 text-emerald-400 rounded-lg">POST</span>
                      <code className="text-base text-cyan-400 font-mono">/api/v1/diagnose/points</code>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {t('apiDocs.endpointDesc')}
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.coreAlgorithms')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: t('apiDocs.features.adaptiveRTS'), desc: t('apiDocs.features.adaptiveRTSDesc'), color: 'cyan' },
                        { label: t('apiDocs.features.splineInterpolation'), desc: t('apiDocs.features.splineInterpolationDesc'), color: 'emerald' },
                        { label: t('apiDocs.features.douglasPeucker'), desc: t('apiDocs.features.douglasPeuckerDesc'), color: 'purple' },
                        { label: t('apiDocs.features.outlierRemoval'), desc: t('apiDocs.features.outlierRemovalDesc'), color: 'orange' },
                      ].map((feature, i) => (
                        <div key={i} className={`p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-${feature.color}-500/30 transition-colors`}>
                          <div className="text-sm font-medium text-white">{feature.label}</div>
                          <div className="text-xs text-slate-500 mt-1">{feature.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Start */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.quickStart')}</h3>
                    <div className="space-y-3">
                      {[
                        { num: 1, title: t('apiDocs.quickStartSteps.prepare.title'), desc: t('apiDocs.quickStartSteps.prepare.desc') },
                        { num: 2, title: t('apiDocs.quickStartSteps.send.title'), desc: t('apiDocs.quickStartSteps.send.desc') },
                        { num: 3, title: t('apiDocs.quickStartSteps.getResult.title'), desc: t('apiDocs.quickStartSteps.getResult.desc') },
                      ].map((step) => (
                        <div key={step.num} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
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
                <div className="space-y-8">
                  {/* Request Body Structure */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.requestBodyTitle')}</h3>
                    <CodeBlock
                      code={`{
  "points": [
    [lat, lon, time, ele?, speed?, bearing?],
    ...
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
}`}
                      language="json"
                      filename="request-body.json"
                    />
                  </div>

                  {/* Points Array Detail */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.pointsArrayFormat')}</h3>
                    <p className="text-sm text-slate-500 mb-4">{t('apiDocs.pointsArrayDesc')}</p>
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.tableHeaders.index')}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.tableHeaders.fieldName')}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.tableHeaders.fieldType')}</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-300">{t('apiDocs.tableHeaders.required')}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.tableHeaders.description')}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.tableHeaders.range')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <PointTableRow
                            index="[0]"
                            field={t('apiDocs.pointFields.latitude')}
                            type={t('apiDocs.fieldTypes.number')}
                            required={true}
                            description={t('apiDocs.fieldDescriptions.latitude')}
                            range={t('apiDocs.fieldRanges.lat')}
                          />
                          <PointTableRow
                            index="[1]"
                            field={t('apiDocs.pointFields.longitude')}
                            type={t('apiDocs.fieldTypes.number')}
                            required={true}
                            description={t('apiDocs.fieldDescriptions.longitude')}
                            range={t('apiDocs.fieldRanges.lon')}
                          />
                          <PointTableRow
                            index="[2]"
                            field={t('apiDocs.pointFields.timestamp')}
                            type={t('apiDocs.fieldTypes.number')}
                            required={true}
                            description={t('apiDocs.fieldDescriptions.timestamp')}
                            range={t('apiDocs.fieldRanges.time')}
                          />
                          <PointTableRow
                            index="[3]"
                            field={t('apiDocs.pointFields.elevation')}
                            type={t('apiDocs.fieldTypes.number')}
                            required={false}
                            description={t('apiDocs.fieldDescriptions.elevation')}
                            range={t('apiDocs.fieldRanges.ele')}
                          />
                          <PointTableRow
                            index="[4]"
                            field={t('apiDocs.pointFields.speed')}
                            type={t('apiDocs.fieldTypes.number')}
                            required={false}
                            description={t('apiDocs.fieldDescriptions.speed')}
                            range={t('apiDocs.fieldRanges.speed')}
                          />
                          <PointTableRow
                            index="[5]"
                            field={t('apiDocs.pointFields.bearing')}
                            type={t('apiDocs.fieldTypes.number')}
                            required={false}
                            description={t('apiDocs.fieldDescriptions.bearing')}
                            range={t('apiDocs.fieldRanges.bearing')}
                          />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Algorithms Options */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">{t('apiDocs.algorithmsTitle')}</h3>
                    <p className="text-xs text-slate-500 mb-4">{t('apiDocs.algorithmsDesc')}</p>
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Option</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Type</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Default</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <OptionTableRow
                            name="adaptiveRTS"
                            type="boolean"
                            defaultVal={t('apiDocs.algorithmOptions.adaptiveRTS.default')}
                            description={t('apiDocs.algorithmOptions.adaptiveRTS.desc')}
                          />
                          <OptionTableRow
                            name="splineInterpolation"
                            type="boolean"
                            defaultVal={t('apiDocs.algorithmOptions.splineInterpolation.default')}
                            description={t('apiDocs.algorithmOptions.splineInterpolation.desc')}
                          />
                          <OptionTableRow
                            name="simplification"
                            type="boolean"
                            defaultVal={t('apiDocs.algorithmOptions.simplification.default')}
                            description={t('apiDocs.algorithmOptions.simplification.desc')}
                          />
                          <OptionTableRow
                            name="outlierRemoval"
                            type="boolean"
                            defaultVal={t('apiDocs.algorithmOptions.outlierRemoval.default')}
                            description={t('apiDocs.algorithmOptions.outlierRemoval.desc')}
                          />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Thresholds Options */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">{t('apiDocs.thresholdsTitle')}</h3>
                    <p className="text-xs text-slate-500 mb-4">{t('apiDocs.thresholdsDesc')}</p>
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Option</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Type</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Default</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Range</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <OptionTableRow
                            name="maxSpeed"
                            type="number"
                            defaultVal={t('apiDocs.thresholdOptions.maxSpeed.default')}
                            range={t('apiDocs.thresholdOptions.maxSpeed.range')}
                            description={t('apiDocs.thresholdOptions.maxSpeed.desc')}
                          />
                          <OptionTableRow
                            name="maxAcceleration"
                            type="number"
                            defaultVal={t('apiDocs.thresholdOptions.maxAcceleration.default')}
                            range={t('apiDocs.thresholdOptions.maxAcceleration.range')}
                            description={t('apiDocs.thresholdOptions.maxAcceleration.desc')}
                          />
                          <OptionTableRow
                            name="maxJump"
                            type="number"
                            defaultVal={t('apiDocs.thresholdOptions.maxJump.default')}
                            range={t('apiDocs.thresholdOptions.maxJump.range')}
                            description={t('apiDocs.thresholdOptions.maxJump.desc')}
                          />
                          <OptionTableRow
                            name="driftThreshold"
                            type="number"
                            defaultVal={t('apiDocs.thresholdOptions.driftThreshold.default')}
                            range={t('apiDocs.thresholdOptions.driftThreshold.range')}
                            description={t('apiDocs.thresholdOptions.driftThreshold.desc')}
                          />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Output Options */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">{t('apiDocs.outputTitle')}</h3>
                    <p className="text-xs text-slate-500 mb-4">{t('apiDocs.outputDesc')}</p>
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Option</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Type</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Default</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Range</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <OptionTableRow
                            name="includePoints"
                            type="boolean"
                            defaultVal={t('apiDocs.outputOptions.includePoints.default')}
                            range="-"
                            description={t('apiDocs.outputOptions.includePoints.desc')}
                          />
                          <OptionTableRow
                            name="simplifyEpsilon"
                            type="number"
                            defaultVal={t('apiDocs.outputOptions.simplifyEpsilon.default')}
                            range={t('apiDocs.outputOptions.simplifyEpsilon.range')}
                            description={t('apiDocs.outputOptions.simplifyEpsilon.desc')}
                          />
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.codeExamples')}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(['curl', 'javascript', 'typescript', 'python', 'go', 'java', 'php'] as CodeTab[]).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activeTab === tab
                              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {tab === 'javascript' ? 'JavaScript' : tab === 'typescript' ? 'TypeScript' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    <CodeBlock
                      code={codeExamples[activeTab]}
                      language={activeTab}
                      filename={`request.${activeTab === 'javascript' ? 'js' : activeTab === 'typescript' ? 'ts' : activeTab}`}
                    />
                  </div>
                </div>
              )}

              {/* Response Section */}
              {activeSection === 'response' && (
                <div className="space-y-8">
                  {/* Success Response Structure */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">{t('apiDocs.successResponse.title')}</h3>
                    <p className="text-xs text-slate-500 mb-4">{t('apiDocs.successResponse.desc')}</p>
                    <CodeBlock
                      code={`{
  "success": true,
  "data": {
    "reportId": "550e8400-e29b-41d4-a716-446655440000",
    "original": {
      "pointCount": 722,
      "distance": 5234.5,
      "duration": 1800
    },
    "corrected": {
      "pointCount": 190,
      "distance": 5180.2,
      "duration": 1795
    },
    "diagnostics": {
      "healthScore": {
        "total": 85,
        "rating": "good",
        "breakdown": {
          "completeness": 90,
          "accuracy": 82,
          "consistency": 83
        }
      },
      "anomalies": [
        {
          "type": "drift",
          "count": 45,
          "severity": "medium",
          "locations": [[22.5431, 113.9510], ...]
        },
        {
          "type": "duplicate",
          "count": 487,
          "severity": "low"
        }
      ],
      "algorithms": [
        {
          "name": "adaptiveRTS",
          "applied": true,
          "pointsProcessed": 722,
          "pointsRemoved": 15
        },
        {
          "name": "splineInterpolation",
          "applied": true,
          "pointsAdded": 25
        },
        {
          "name": "simplification",
          "applied": true,
          "pointsRemoved": 532
        }
      ]
    },
    "points": [
      [22.5431, 113.9510, 1705318200, 15.2, 5.2, 45.0],
      [22.5429, 113.9510, 1705318203, 15.5, 5.5, 46.0],
      ...
    ]
  },
  "meta": {
    "version": "1.0.0",
    "processingTimeMs": 156
  }
}`}
                      language="json"
                      filename="response-success.json"
                    />
                  </div>

                  {/* Response Field Descriptions */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.responseFieldsTitle')}</h3>
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Field</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Type</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{t('apiDocs.responseFields.reportId.name')}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{t('apiDocs.responseFields.reportId.type')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.responseFields.reportId.desc')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{t('apiDocs.responseFields.original.name')}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{t('apiDocs.responseFields.original.type')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.responseFields.original.desc')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{t('apiDocs.responseFields.corrected.name')}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{t('apiDocs.responseFields.corrected.type')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.responseFields.corrected.desc')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{t('apiDocs.responseFields.diagnostics.name')}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{t('apiDocs.responseFields.diagnostics.type')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.responseFields.diagnostics.desc')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{t('apiDocs.responseFields.points.name')}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{t('apiDocs.responseFields.points.type')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.responseFields.points.desc')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{t('apiDocs.responseFields.version.name')}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{t('apiDocs.responseFields.version.type')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.responseFields.version.desc')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-cyan-400 font-mono text-sm">{t('apiDocs.responseFields.processingTimeMs.name')}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{t('apiDocs.responseFields.processingTimeMs.type')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.responseFields.processingTimeMs.desc')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Health Score Rating */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.healthScoreRating')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { rating: 'excellent', label: t('apiDocs.rating.excellent'), range: t('apiDocs.rating.excellentRange'), color: 'emerald' },
                        { rating: 'good', label: t('apiDocs.rating.good'), range: t('apiDocs.rating.goodRange'), color: 'cyan' },
                        { rating: 'fair', label: t('apiDocs.rating.fair'), range: t('apiDocs.rating.fairRange'), color: 'yellow' },
                        { rating: 'poor', label: t('apiDocs.rating.poor'), range: t('apiDocs.rating.poorRange'), color: 'red' },
                      ].map((item) => (
                        <div key={item.rating} className={`p-4 rounded-xl bg-${item.color}-500/5 border border-${item.color}-500/20`}>
                          <div className={`text-lg font-bold text-${item.color}-400`}>{item.range}</div>
                          <div className="text-sm text-white mt-1">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.rating}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error Response */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">{t('apiDocs.errorResponse.title')}</h3>
                    <p className="text-xs text-slate-500 mb-4">{t('apiDocs.errorResponse.desc')}</p>
                    <CodeBlock
                      code={`{
  "success": false,
  "error": {
    "code": "invalid_points",
    "message": "Invalid point data: latitude out of range at index 5"
  }
}`}
                      language="json"
                      filename="response-error.json"
                    />
                  </div>
                </div>
              )}

              {/* Errors Section */}
              {activeSection === 'errors' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">{t('apiDocs.errorCodeList')}</h3>
                    <div className="rounded-xl border border-slate-700 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.errorCodeTable.errorCode')}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.errorCodeTable.httpStatus')}</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-300">{t('apiDocs.errorCodeTable.description')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-red-400 font-mono text-xs">invalid_json</td>
                            <td className="px-4 py-3 text-slate-400">{t('apiDocs.httpStatus.badRequest')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.errorCodes.invalid_json')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-red-400 font-mono text-xs">too_many_points</td>
                            <td className="px-4 py-3 text-slate-400">{t('apiDocs.httpStatus.badRequest')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.errorCodes.too_many_points')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-red-400 font-mono text-xs">too_few_points</td>
                            <td className="px-4 py-3 text-slate-400">{t('apiDocs.httpStatus.badRequest')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.errorCodes.too_few_points')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-red-400 font-mono text-xs">invalid_points</td>
                            <td className="px-4 py-3 text-slate-400">{t('apiDocs.httpStatus.badRequest')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.errorCodes.invalid_points')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-red-400 font-mono text-xs">rate_limit_exceeded</td>
                            <td className="px-4 py-3 text-slate-400">{t('apiDocs.httpStatus.tooManyRequests')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.errorCodes.rate_limit_exceeded')}</td>
                          </tr>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-red-400 font-mono text-xs">internal_error</td>
                            <td className="px-4 py-3 text-slate-400">{t('apiDocs.httpStatus.serverError')}</td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{t('apiDocs.errorCodes.internal_error')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
