export default {
  // App Header & Footer
  app: {
    title: 'PositionDoctor - GPS Trajectory Diagnosis & Repair',
    subtitle: 'Intelligent diagnosis of GPS trajectory anomalies, one-click data repair',
    systemOnline: 'System Online',
    loading: 'Loading',
    skipToMain: 'Skip to main content',
    footer: '© 2024 PositionDoctor. Open Source · MIT License'
  },

  // Common
  common: {
    newAnalysis: 'New Analysis',
    original: 'Original',
    anomaly: 'Anomaly',
    simplified: 'Simplified',
    interpolated: 'Interpolated',
    latest: 'Latest',
    points: 'points',
    processing: 'Processing',
    retry: 'Retry',
    download: 'Download',
    downloading: 'Downloading...',
    complete: 'Complete',
    downloadAll: 'Download All',
    close: 'Close',
    backToApp: 'Back to App',
    confirm: 'Confirm',
    cancel: 'Cancel',
    health: 'Healthy',
    unhealthy: 'Unhealthy',
    unknown: 'Unknown',
    pause: 'Pause',
    play: 'Play',
    reset: 'Reset',
    enableTracking: 'Enable Tracking',
    disableTracking: 'Disable Tracking',
    trackOf: '/ {total}'
  },

  // Language Switcher
  language: {
    switch: 'Switch Language',
    zh: 'ZH',
    en: 'EN'
  },

  // File Uploader
  uploader: {
    title: 'Upload Trajectory File',
    subtitle: 'Intelligent diagnosis of GPS trajectory anomalies, one-click data repair',
    dragDropActive: 'Drop file to analyze',
    dragDropInactive: 'Drag & drop GPX/KML file here',
    or: 'or',
    selectFile: 'Select File',
    useDemo: 'Use Demo Data',
    processing: 'Processing trajectory data',
    analyzing: 'AI algorithm analyzing...',
    supportedFormats: 'Supports <span class="text-cyan-400">.gpx</span>, <span class="text-cyan-400">.kml</span> formats, max 50MB',
    stepParsing: 'Parsing File',
    stepDetection: 'Anomaly Detection',
    stepRepair: 'Trajectory Repair',
    stepReport: 'Generating Report',
    smartDetection: 'Smart Detection',
    smartDetectionDesc: '6 Anomaly Types',
    quickRepair: 'Quick Repair',
    quickRepairDesc: 'AI-Powered Algorithms',
    healthScore: 'Health Score',
    healthScoreDesc: 'Multi-dimensional Assessment'
  },

  // Result Panel
  results: {
    newAnalysis: 'New Analysis',
    download: 'Download',
    healthScore: 'Trajectory Health Score',
    algorithmResults: 'Algorithm Results',
    anomalyDetection: 'Anomaly Detection',
    anomalyTypes: 'Anomaly Detection ({count} types)',
    detectedTypes: '{count} detected',
    coreAlgorithms: 'Core Algorithm Repair Details',
    algorithmsCount: '{count} algorithms participated in repair',
    processedPoints: 'Processed Points',
    fixedPoints: 'Fixed Points',
    fixRate: 'Fix Rate',
    removedPoints: 'Removed Points',
    algorithmParams: 'Algorithm Parameters',
    fixedIndices: 'Fixed Point Indices ({count} points)',
    noFixes: 'This algorithm participated but did not fix anomalies (detection algorithm)'
  },

  // Health Score Card
  healthScore: {
    rating: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    ratingLabel: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    scoreLabel: 'Health Score',
    pointsSummary: 'Points Summary',
    timeSummary: 'Time Summary',
    original: 'Original',
    anomaly: 'Anomaly',
    simplified: 'Simplified',
    interpolated: 'Interpolated',
    latest: 'Latest',
    executionTime: 'Algorithm Execution Time',
    totalTime: 'Total Time',
    avgTimePerPoint: 'Avg Time Per Point',
    throughput: 'Throughput (pts/s)',
    highlyEfficient: 'Highly Efficient',
    efficiencyDesc: 'Multi-algorithm, millisecond response',
    efficiency: {
      extreme: 'Extreme Efficiency',
      high: 'High Efficiency',
      good: 'Good',
      normal: 'Normal'
    },
    // Additional keys for HealthScoreCard
    healthDiagnosis: 'Health Diagnosis',
    dataChanges: 'Data Changes',
    dataPoints: 'Data Points',
    processingOperations: 'Processing Operations',
    algorithmsCount: '{count} Algorithms',
    final: 'Final',
    repairedPointCount: 'Repaired Count',
    algorithmTime: 'Algorithm Time',
    efficiencyLabel: 'Efficiency',
    pointsPerSecond: 'pts/s'
  },

  // Algorithms
  algorithms: {
    adaptiveRTS: {
      name: 'AdaptiveRTS Smoother',
      shortName: 'RTS Smoothing',
      description: 'Bidirectional Kalman filter smoothing based on Rauch-Tung-Striebel algorithm'
    },
    splineInterpolation: {
      name: 'Cubic Spline Interpolator',
      shortName: 'Spline Interp',
      description: 'Smooth interpolation between missing points using cubic spline curves'
    },
    douglasPeucker: {
      name: 'Douglas-Peucker Simplifier',
      shortName: 'DP Simplify',
      description: 'Simplify trajectory while preserving key feature points, reducing data redundancy'
    },
    outlierRemoval: {
      name: 'Outlier Remover',
      shortName: 'Outlier Rem',
      description: 'Identify and remove outliers in trajectory using statistical methods'
    },
    speedDetection: {
      name: 'Speed Anomaly Detection',
      shortName: 'Speed Detect',
      description: 'Detect position points with excessive speed'
    },
    jumpDetection: {
      name: 'Position Jump Detection',
      shortName: 'Jump Detect',
      description: 'Detect position jumps with excessive distance between adjacent points'
    },
    accelerationDetection: {
      name: 'Acceleration Anomaly Detection',
      shortName: 'Accel Detect',
      description: 'Detect position points with sudden acceleration changes'
    },
    densityAnalysis: {
      name: 'Density Anomaly Analysis',
      shortName: 'Density',
      description: 'Analyze point distribution density, identify clustering or sparse areas'
    },
    healthy: 'Healthy',
    detectedPoints: 'Detected Points',
    removedPoints: 'Removed Points',
    fixedPoints: 'Fixed Points',
    totalResults: 'Algorithm Processing Results',
    totalAlgorithms: '{count} algorithms in total'
  },

  // Anomaly Types
  anomalies: {
    drift: 'GPS Drift',
    jump: 'Position Jump',
    speed_anomaly: 'Speed Anomaly',
    acceleration_anomaly: 'Acceleration Anomaly',
    missing: 'Data Missing',
    density_anomaly: 'Density Anomaly',
    outlier: 'Outlier',
    severity: {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    },
    healthy: 'Healthy',
    types: 'types'
  },

  // Map / Trajectory
  map: {
    trajectoryCompare: 'Trajectory Comparison',
    originalTrack: 'Original Track',
    repairedTrack: 'Repaired Track',
    noData: 'No trajectory data'
  },

  // Errors
  errors: {
    title: 'Processing Failed',
    suggestions: 'Suggestions:',
    suggestion1: 'Check file format (supports .gpx, .kml)',
    suggestion2: 'File size not exceeding 50MB',
    suggestion3: 'Ensure GPS coordinates are valid',
    suggestion4: 'Check network connection',
    boundaryError: 'Error Occurred',
    boundaryDesc: 'An unexpected error occurred, please refresh the page',
    refreshPage: 'Refresh Page'
  },

  // API Modal
  api: {
    title: 'API',
    subtitle: 'One API, Unlimited Possibilities',
    hero: 'Use-and-go GPS trajectory diagnosis API',
    description: 'AdaptiveRTS algorithm 30-40% ahead, integrate in one line of code',
    quickStart: 'Quick Start',
    codeExamples: 'Code Examples',
    tryIt: 'Try It',
    copy: 'Copy',
    copied: 'Copied',
    endpoint: 'Endpoint',
    method: 'Method',
    requestFormat: 'Request Format',
    responseFormat: 'Response Format',
    feature1: 'JSON Request',
    feature2: 'No API Key Required',
    feature3: 'IP Rate Limiting',
    steps: {
      sendRequest: 'Send POST Request',
      parseResult: 'Parse Response',
      integrate: 'Integrate to Project'
    },
    // Parameters table
    paramName: 'Parameter',
    paramType: 'Type',
    paramRequired: 'Required',
    paramDesc: 'Description',
    modeFile: 'File Mode',
    modeJson: 'JSON Mode',
    reqParams: 'Request Parameters',
    respParams: 'Response Parameters',
    paramFile: 'GPX/KML File',
    paramPoints: 'GPS Point Array',
    paramPointsLat: 'Latitude',
    paramPointsLon: 'Longitude',
    paramPointsTime: 'Timestamp',
    paramPointsEle: 'Elevation',
    paramOptions: 'Algorithm Options',
    paramOptionsAlgo: 'Algorithm Toggles',
    paramOptionsThresholds: 'Detection Thresholds',
    paramOptionsOutput: 'Output Options',
    // Response fields
    respReportId: 'Report ID',
    respPointCount: 'Point Count',
    respDistance: 'Distance (m)',
    respDuration: 'Duration (s)',
    respAvgSpeed: 'Avg Speed',
    respMaxSpeed: 'Max Speed',
    // Performance notes
    perfTitle: 'Performance Notes',
    perfDesc1: 'File upload supports large-scale data (10k+ points)',
    perfDesc2: 'JSON mode for small-scale real-time processing',
    perfDesc3: 'Response excludes detailed points by default, export on demand'
  },

  // Map Legend
  legend: {
    drift: 'GPS Drift',
    jump: 'Position Jump',
    speed_anomaly: 'Speed Anomaly',
    acceleration_anomaly: 'Acceleration Anomaly',
    missing: 'Data Missing',
    density_anomaly: 'Density Anomaly',
    outlier: 'Outlier',
    interpolated: 'Interpolated (Fixed)',
    normal: 'Normal'
  },

  // Algorithm List
  algorithmList: {
    title: 'Core Algorithm Repair Details',
    count: '{count} algorithms participated',
    processedPoints: 'Processed Points',
    fixedPoints: 'Fixed Points',
    fixRate: 'Fix Rate',
    params: 'Algorithm Parameters',
    fixedIndices: 'Fixed Point Indices ({count} points)',
    noFixes: 'This algorithm participated but did not fix anomalies (detection algorithm)',
    fixed: 'Fixed {count} points',
    removedPoints: 'Removed Points',
    detectedPoints: 'Detected Points',
    totalAlgorithms: '{count} algorithms in total',
    totalResults: 'Algorithm Processing Results',
    healthy: 'Healthy'
  },

  // Algorithm Effect
  algorithmEffect: {
    title: 'Algorithm Processing Results',
    totalTitle: 'Core Algorithm Processing Results',
    healthy: 'Healthy',
    fixedPoints: 'Fixed Points',
    removedPoints: 'Removed Points',
    detectedPoints: 'Detected Points'
  },

  // Demo Track
  demo: {
    trackName: 'PositionDoctor Demo Track',
    trackDesc: 'Demo trajectory file showcasing anomaly detection',
    segmentName: 'Tech Park Loop',
    anomalyDrift: 'GPS drift anomaly (building area)',
    recovery: 'Signal recovered, back to normal',
    anomalyOutlier: 'Outlier anomaly',
    leftTurn: 'Left turn into Shennan Avenue',
    southward: 'Southward - Second drift',
    driftEnd: 'Drift ended, back to normal',
    backToStart: 'Back to start, loop completed'
  },

  // Map Playback
  playback: {
    originalTrack: 'Original Track',
    repairedTrack: 'Repaired Track',
    pause: 'Pause',
    play: 'Play',
    reset: 'Reset',
    enableTracking: 'Enable Tracking',
    disableTracking: 'Disable Tracking'
  },

  // API Modal
  apiModal: {
    title: 'API',
    subtitle: 'GPS Trajectory Diagnosis & Repair API v1.0',
    section: {
      overview: 'Overview',
      request: 'Request',
      response: 'Response',
      errors: 'Errors'
    },
    // Overview section
    endpointDesc: 'Receive GPS trajectory point data for anomaly detection and repair. Using binary array format reduces data size by ~70% compared to object array format.',
    features: {
      adaptiveRTS: 'AdaptiveRTS',
      adaptiveRTSDesc: 'Kalman filter smoothing',
      splineInterpolation: 'Spline Interpolation',
      splineInterpolationDesc: 'Missing point filling',
      douglasPeucker: 'DP Simplify',
      douglasPeuckerDesc: 'Trajectory compression',
      outlierRemoval: 'Outlier Removal',
      outlierRemovalDesc: 'Anomaly point removal'
    },
    quickStart: 'Quick Start',
    quickStartSteps: {
      prepare: {
        title: 'Prepare Data',
        desc: 'Convert GPS points to binary array format [[lat, lon, time, ele?, speed?, bearing?], ...]'
      },
      send: {
        title: 'Send Request',
        desc: 'POST to /api/v1/diagnose/points, JSON format'
      },
      getResult: {
        title: 'Get Results',
        desc: 'Parse healthScore, diagnostics, and repaired points from response'
      }
    },
    // Request section
    requestBodyTitle: 'Request Body Structure',
    pointsArrayFormat: 'points Array Format',
    pointsArrayDesc: 'Each point is an array of length 3-6, indices correspond to:',
    index: 'Index',
    fieldName: 'Field',
    fieldType: 'Type',
    required: 'Required',
    description: 'Description',
    range: 'Range/Unit',
    // Point fields
    latitude: 'Latitude',
    longitude: 'Longitude',
    timestamp: 'Unix Timestamp',
    elevation: 'Elevation',
    speed: 'Speed',
    bearing: 'Bearing',
    units: {
      degrees: 'degrees',
      meters: 'meters (m)',
      kmh: 'km/h',
      degrees360: '0 ~ 360°',
      seconds: 'seconds (2000-2100)'
    },
    note: 'Note: speed and bearing are optional fields for improved accuracy. If not provided, they will be calculated automatically.',
    algorithmsConfig: 'options.algorithms Algorithm Configuration',
    thresholds: 'options.thresholds Detection Thresholds',
    outputConfig: 'options.output Output Configuration',
    field: 'Field',
    defaultValue: 'Default',
    // Algorithm descriptions
    adaptiveRTSDesc: 'Enable adaptive RTS Kalman filter smoothing',
    splineInterpolationDesc: 'Enable cubic spline interpolation to fill missing points',
    simplificationDesc: 'Enable Douglas-Peucker trajectory simplification',
    outlierRemovalDesc: 'Enable outlier point removal',
    // Threshold descriptions
    maxSpeedDesc: 'Maximum allowed speed (km/h)',
    maxAccelerationDesc: 'Maximum acceleration (m/s²)',
    maxJumpDesc: 'Maximum jump distance (meters)',
    driftThresholdDesc: 'GPS drift detection threshold (degrees)',
    // Output descriptions
    includePointsDesc: 'Whether to include repaired point data in response',
    simplifyEpsilonDesc: 'DP simplification tolerance parameter (meters)',
    // Constraints
    constraintsTitle: 'Request Constraints',
    minPoints: 'Minimum Points',
    minPointsDesc: 'At least 2 points required',
    maxPoints: 'Maximum Points',
    maxPointsDesc: 'Maximum 100,000 points per request',
    requestTimeout: 'Request Timeout',
    requestTimeoutDesc: 'Maximum processing time',
    rateLimit: 'Rate Limit',
    rateLimitDesc: 'Per IP address',
    codeExamples: 'Code Examples',
    // Response section
    responseBodyTitle: 'Response Body Structure',
    successResponseFields: 'Success Response Fields',
    fieldPath: 'Field Path',
    trajectoryStats: 'TrajectoryStats Trajectory Statistics',
    pointCount: 'Number of trajectory points',
    distance: 'Total trajectory length',
    distanceUnit: 'count',
    durationSeconds: 'Total trajectory duration',
    avgSpeed: 'Average speed',
    maxSpeed_field: 'Maximum speed',
    bounds: 'Bounding box (north, south, east, west)',
    elevation_field: 'Elevation stats (min, max, avg, gain, loss)',
    diagnosticsInfo: 'DiagnosticsInfo Diagnostic Information',
    normalPoints: 'Number of normal points',
    anomalyPoints: 'Number of detected anomaly points',
    fixedPoints_field: 'Number of points repaired by algorithms',
    removedPoints_field: 'Number of points removed by simplification',
    interpolatedPoints_field: 'Number of interpolated points generated',
    totalProcessed: 'Total points processed by algorithms',
    anomalies_field: 'List of detected anomaly details',
    algorithms_field: 'Algorithm execution details',
    healthScore_field: 'Health score (total, rating, breakdown)',
    healthScoreTitle: 'HealthScore Health Score',
    totalScore: 'Total score (0-100)',
    rating_field: 'Rating: excellent(85+), good(70+), fair(50+), poor(<50)',
    breakdown_field: 'Breakdown scores by dimension',
    metaTitle: 'Meta Metadata',
    version: 'API version',
    processedAt: 'Processing time (ISO 8601)',
    processingTimeMs: 'Processing time (milliseconds)',
    // Errors section
    errorResponseTitle: 'Error Response Format',
    errorCodeTitle: 'Error Code List',
    errorCode: 'Error Code',
    httpStatus: 'HTTP Status',
    errorDesc: 'Description',
    invalid_json: 'JSON format error',
    too_many_points: 'Point count exceeds maximum limit (100,000)',
    too_few_points: 'Point count below minimum requirement (2)',
    invalid_points: 'Invalid point data (coordinates or timestamp out of range)',
    rate_limit_exceeded: 'Request rate limit exceeded',
    internal_error: 'Internal server error',
    errorDetailsTitle: 'ErrorDetails Field Description',
    error_field: 'Name of the field with error',
    error_message: 'Detailed error message',
    error_limit: 'Limit value (if applicable)',
    invalidIndices: 'List of invalid point indices',
    retryAfter: 'Retry wait seconds (for rate limit)',
    errorResponseExample: 'Error Response Examples',
    // Additional keys
    rateLimitValue: '10/min',
    includePointsComment: '// when options.output.includePoints=true',
    requestSuccess: 'Whether the request succeeded',
    reportIdDesc: 'Unique report identifier for result export',
    originalTrajectoryStats: 'Original trajectory statistics',
    correctedTrajectoryStats: 'Repaired trajectory statistics',
    pointsDataOptional: 'Repaired point data (optional)',
    secondsUnit: 'seconds',
    userFriendlyError: 'User-friendly error description',
    detailedErrorMessage: 'Detailed error message'
  },

  // API Docs Page
  apiDocs: {
    title: 'API',
    subtitle: 'GPS Trajectory Diagnosis & Repair API v1.0',
    section: {
      overview: 'Overview',
      request: 'Request',
      response: 'Response',
      errors: 'Errors'
    },
    endpointDesc: 'Receive GPS trajectory point data for anomaly detection and repair. Using binary array format reduces data size by ~70% compared to object array format.',
    coreAlgorithms: 'Core Algorithms',
    features: {
      adaptiveRTS: 'AdaptiveRTS',
      adaptiveRTSDesc: 'Kalman filter smoothing',
      splineInterpolation: 'Spline Interpolation',
      splineInterpolationDesc: 'Missing point filling',
      douglasPeucker: 'DP Simplify',
      douglasPeuckerDesc: 'Trajectory compression',
      outlierRemoval: 'Outlier Removal',
      outlierRemovalDesc: 'Anomaly point removal'
    },
    quickStart: 'Quick Start',
    quickStartSteps: {
      prepare: {
        title: 'Prepare Data',
        desc: 'Convert GPS points to binary array format [[lat, lon, time, ele?, speed?, bearing?], ...]'
      },
      send: {
        title: 'Send Request',
        desc: 'POST to /api/v1/diagnose/points, JSON format'
      },
      getResult: {
        title: 'Get Results',
        desc: 'Parse healthScore, diagnostics, and repaired points from response'
      }
    },
    performanceComparison: 'Performance Comparison',
    performanceTable: {
      format: 'Format',
      points10k: '10,000 Points',
      points50k: '50,000 Points',
      objectArray: 'Object Array',
      binaryArray: 'Binary Array',
      savings: 'Savings'
    },
    requestBodyTitle: 'Request Body Structure',
    pointsArrayFormat: 'points Array Format',
    pointsArrayDesc: 'Each point is an array of length 3-6, indices correspond to:',
    codeExamples: 'Code Examples',
    responseBodyTitle: 'Response Body Structure',
    healthScoreRating: 'HealthScore Rating',
    errorCodeList: 'Error Code List',
    rating: {
      excellent: 'Excellent',
      excellentRange: '85-100',
      good: 'Good',
      goodRange: '70-84',
      fair: 'Fair',
      fairRange: '50-69',
      poor: 'Poor',
      poorRange: '0-49'
    },
    ratingLabel: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    footerText: 'PositionDoctor API · GPS Trajectory Diagnosis & Repair Service',
    // Points array table
    tableHeaders: {
      index: 'Index',
      fieldName: 'Field',
      fieldType: 'Type',
      required: 'Required',
      description: 'Description',
      range: 'Range/Unit'
    },
    pointFields: {
      latitude: 'Latitude',
      longitude: 'Longitude',
      timestamp: 'Timestamp',
      elevation: 'Elevation',
      speed: 'Speed',
      bearing: 'Bearing'
    },
    fieldTypes: {
      number: 'number'
    },
    required: {
      yes: 'Yes',
      no: '-'
    },
    fieldDescriptions: {
      latitude: 'Latitude',
      longitude: 'Longitude',
      timestamp: 'Unix timestamp',
      elevation: 'Elevation above sea level',
      speed: 'Speed',
      bearing: 'Bearing angle'
    },
    fieldRanges: {
      lat: '-90 ~ 90°',
      lon: '-180 ~ 180°',
      time: 'seconds (2000-2100)',
      ele: 'meters (m)',
      speed: 'km/h',
      bearing: '0 ~ 360°'
    },
    // Error codes table
    errorCodeTable: {
      errorCode: 'Error Code',
      httpStatus: 'HTTP Status',
      description: 'Description'
    },
    errorCodes: {
      invalid_json: 'JSON format error',
      too_many_points: 'Point count exceeds maximum limit (100,000)',
      too_few_points: 'Point count below minimum requirement (2)',
      invalid_points: 'Invalid point data (coordinates or timestamp out of range)',
      rate_limit_exceeded: 'Request rate limit exceeded',
      internal_error: 'Internal server error'
    },
    httpStatus: {
      badRequest: '400',
      tooManyRequests: '429',
      serverError: '500'
    },
    // Enhanced Request Section
    algorithmsTitle: 'Algorithms Options',
    algorithmsDesc: 'Configure which algorithms to enable for trajectory processing',
    thresholdsTitle: 'Thresholds Options',
    thresholdsDesc: 'Set validation thresholds for anomaly detection',
    outputTitle: 'Output Options',
    outputDesc: 'Control response format and content',
    algorithmOptions: {
      adaptiveRTS: {
        name: 'Adaptive RTS',
        desc: 'Kalman filter-based smoothing algorithm that reduces GPS noise while preserving trajectory patterns',
        default: 'true'
      },
      splineInterpolation: {
        name: 'Spline Interpolation',
        desc: 'Fills missing points using cubic spline interpolation based on time intervals',
        default: 'true'
      },
      simplification: {
        name: 'Douglas-Peucker',
        desc: 'Reduces point count while preserving trajectory shape using epsilon tolerance',
        default: 'true'
      },
      outlierRemoval: {
        name: 'Outlier Removal',
        desc: 'Detects and removes anomalous points exceeding statistical thresholds',
        default: 'true'
      }
    },
    thresholdOptions: {
      maxSpeed: {
        name: 'Max Speed',
        desc: 'Maximum valid speed between consecutive points (km/h)',
        default: '120.0',
        range: '1 ~ 500'
      },
      maxAcceleration: {
        name: 'Max Acceleration',
        desc: 'Maximum valid acceleration between consecutive points (m/s²)',
        default: '10.0',
        range: '1 ~ 50'
      },
      maxJump: {
        name: 'Max Distance Jump',
        desc: 'Maximum valid distance between consecutive points (meters)',
        default: '500.0',
        range: '10 ~ 5000'
      },
      driftThreshold: {
        name: 'Drift Threshold',
        desc: 'Minimum coordinate change to detect GPS drift (degrees)',
        default: '0.0001',
        range: '0.00001 ~ 0.01'
      }
    },
    outputOptions: {
      includePoints: {
        name: 'Include Points',
        desc: 'Return corrected points array in response',
        default: 'true'
      },
      simplifyEpsilon: {
        name: 'Simplification Epsilon',
        desc: 'Tolerance for Douglas-Peucker algorithm (meters)',
        default: '1.0',
        range: '0.1 ~ 100'
      }
    },
    // Enhanced Response Section
    responseFieldsTitle: 'Response Field Descriptions',
    responseFields: {
      reportId: {
        name: 'reportId',
        type: 'string',
        desc: 'Unique identifier for this diagnostic report'
      },
      original: {
        name: 'original',
        type: 'object',
        desc: 'Statistics about the input trajectory'
      },
      corrected: {
        name: 'corrected',
        type: 'object',
        desc: 'Statistics after processing and repair'
      },
      diagnostics: {
        name: 'diagnostics',
        type: 'object',
        desc: 'Detailed analysis including healthScore, anomalies, and algorithm results'
      },
      points: {
        name: 'points',
        type: 'array',
        desc: 'Corrected trajectory points (if requested)'
      },
      version: {
        name: 'version',
        type: 'string',
        desc: 'API version used for processing'
      },
      processingTimeMs: {
        name: 'processingTimeMs',
        type: 'number',
        desc: 'Server processing time in milliseconds'
      }
    },
    responseExampleTitle: 'Complete Response Example',
    successResponse: {
      title: 'Success Response',
      desc: 'HTTP 200 with diagnostic results'
    },
    errorResponse: {
      title: 'Error Response',
      desc: 'HTTP 4xx/5xx with error details',
      example: `{
  "success": false,
  "error": {
    "code": "invalid_points",
    "message": "Invalid point data: latitude out of range at index 5"
  }
}`
    }
  }
}
