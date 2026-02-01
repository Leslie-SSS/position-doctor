export default {
  // App Header & Footer
  app: {
    title: 'PositionDoctor - GPS 轨迹智能诊断与修复',
    subtitle: '智能诊断 GPS 轨迹异常，一键修复数据问题',
    systemOnline: '系统在线',
    loading: '加载中',
    skipToMain: '跳转到主内容',
    footer: '© 2024 PositionDoctor. 开源项目 · MIT 许可证'
  },

  // Common
  common: {
    newAnalysis: '新建分析',
    original: '原始',
    anomaly: '异常',
    simplified: '简化',
    interpolated: '插值',
    latest: '最新',
    points: '点',
    processing: '处理中',
    retry: '重试',
    download: '下载',
    downloading: '下载中...',
    complete: '完成',
    downloadAll: '全部下载',
    close: '关闭',
    backToApp: '返回应用',
    confirm: '确认',
    cancel: '取消',
    health: '健康',
    unhealthy: '异常',
    unknown: '未知',
    pause: '暂停',
    play: '播放',
    reset: '重置',
    enableTracking: '开启追踪',
    disableTracking: '关闭追踪',
    trackOf: '/ {total}'
  },

  // Language Switcher
  language: {
    switch: '切换语言',
    zh: '中',
    en: 'EN'
  },

  // File Uploader
  uploader: {
    title: '上传轨迹文件',
    subtitle: '智能诊断 GPS 轨迹异常，一键修复数据问题',
    dragDropActive: '释放文件开始分析',
    dragDropInactive: '拖拽文件到此处',
    or: '或',
    selectFile: '选择文件',
    useDemo: '使用演示数据预览',
    processing: '正在处理轨迹数据',
    analyzing: 'AI 算法分析中...',
    supportedFormats: '支持 <span class="text-cyan-400">.gpx</span>、<span class="text-cyan-400">.kml</span> 格式，最大 50MB',
    stepParsing: '解析文件',
    stepDetection: '异常检测',
    stepRepair: '轨迹修复',
    stepReport: '生成报告',
    smartDetection: '智能检测',
    smartDetectionDesc: '6种异常类型',
    quickRepair: '快速修复',
    quickRepairDesc: 'AI 驱动算法',
    healthScore: '健康评分',
    healthScoreDesc: '多维度评估'
  },

  // Result Panel
  results: {
    newAnalysis: '新建分析',
    download: '下载',
    healthScore: '轨迹健康度评分',
    algorithmResults: '算法处理结果',
    anomalyDetection: '异常检测',
    anomalyTypes: '异常检测 ({count} 种类型)',
    detectedTypes: '检测到 {count} 种',
    coreAlgorithms: '核心算法修复详情',
    algorithmsCount: '共 {count} 个算法参与修复',
    processedPoints: '处理点数',
    fixedPoints: '修复点数',
    fixRate: '修复率',
    removedPoints: '移除点数',
    algorithmParams: '算法参数',
    fixedIndices: '修复点位索引 ({count} 个)',
    noFixes: '此算法参与处理但未修复异常点（检测算法）'
  },

  // Health Score Card
  healthScore: {
    rating: {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差'
    },
    ratingLabel: {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差'
    },
    scoreLabel: '健康评分',
    pointsSummary: '点数变化概要',
    timeSummary: '执行时间概要',
    original: '原始',
    anomaly: '异常',
    simplified: '简化',
    interpolated: '插值',
    latest: '最新',
    executionTime: '算法执行时间',
    totalTime: '总时间',
    avgTimePerPoint: '平均每点耗时',
    throughput: '吞吐量 (点/秒)',
    highlyEfficient: '极高效率',
    efficiencyDesc: '多算法协同，毫秒级响应',
    efficiency: {
      extreme: '极高效率',
      high: '高效率',
      good: '良好',
      normal: '一般'
    },
    // Additional keys for HealthScoreCard
    healthDiagnosis: '健康诊断',
    dataChanges: '数据变化',
    dataPoints: '数据点',
    processingOperations: '处理操作',
    algorithmsCount: '{count}项算法',
    final: '最终',
    repairedPointCount: '修复后点数',
    algorithmTime: '算法耗时',
    efficiencyLabel: '效率',
    pointsPerSecond: '点/秒'
  },

  // Algorithms
  algorithms: {
    adaptiveRTS: {
      name: '自适应RTS平滑器',
      shortName: 'RTS平滑',
      description: '基于Rauch-Tung-Striebel算法的双向卡尔曼滤波平滑'
    },
    splineInterpolation: {
      name: '三次样条插值器',
      shortName: '样条插值',
      description: '使用三次样条曲线在缺失点之间进行平滑插值'
    },
    douglasPeucker: {
      name: 'Douglas-Peucker简化器',
      shortName: 'DP简化',
      description: '保留关键特征点的同时简化轨迹，减少数据冗余'
    },
    outlierRemoval: {
      name: '离群点移除器',
      shortName: '离群移除',
      description: '基于统计方法识别并移除轨迹中的离群点'
    },
    speedDetection: {
      name: '速度异常检测',
      shortName: '速度检测',
      description: '检测速度超过合理阈值的位置点'
    },
    jumpDetection: {
      name: '位置跳跃检测',
      shortName: '跳变检测',
      description: '检测相邻点间距离过大的位置跳跃'
    },
    accelerationDetection: {
      name: '加速度异常检测',
      shortName: '加速度检测',
      description: '检测加速度突变的位置点'
    },
    densityAnalysis: {
      name: '密度异常分析',
      shortName: '密度分析',
      description: '分析点分布密度，识别聚集或稀疏区域'
    },
    healthy: '健康',
    detectedPoints: '检测点数',
    removedPoints: '移除点数',
    fixedPoints: '修复点数',
    totalResults: '算法处理结果',
    totalAlgorithms: '共 {count} 个算法'
  },

  // Anomaly Types
  anomalies: {
    drift: 'GPS 漂移',
    jump: '位置跳跃',
    speed_anomaly: '速度异常',
    acceleration_anomaly: '加速度异常',
    missing: '数据丢失',
    density_anomaly: '密度异常',
    outlier: '离群点',
    severity: {
      high: '高',
      medium: '中',
      low: '低'
    },
    healthy: '健康',
    types: '种类型'
  },

  // Map / Trajectory
  map: {
    trajectoryCompare: '轨迹对比',
    originalTrack: '原始轨迹',
    repairedTrack: '修复轨迹',
    noData: '暂无轨迹数据'
  },

  // Errors
  errors: {
    title: '处理失败',
    suggestions: '建议检查：',
    suggestion1: '检查文件格式 (支持 .gpx, .kml)',
    suggestion2: '文件大小不超过 50MB',
    suggestion3: '确保 GPS 坐标有效',
    suggestion4: '检查网络连接是否正常',
    boundaryError: '出错了',
    boundaryDesc: '应用程序遇到意外错误，请刷新页面重试',
    refreshPage: '刷新页面'
  },

  // API Modal
  api: {
    title: 'API',
    subtitle: '一个接口，搞定一切',
    hero: '用完即走的 GPS 轨迹诊断 API',
    description: 'AdaptiveRTS 算法领先 30-40%，一行代码集成',
    quickStart: '快速开始',
    codeExamples: '代码示例',
    tryIt: '在线测试',
    copy: '复制',
    copied: '已复制',
    endpoint: '接口地址',
    method: '请求方法',
    requestFormat: '请求格式',
    responseFormat: '响应格式',
    feature1: 'JSON 格式请求',
    feature2: '无需 API Key',
    feature3: 'IP 限流保护',
    steps: {
      sendRequest: '发送 POST 请求',
      parseResult: '解析返回结果',
      integrate: '集成到项目'
    },
    // 参数表格
    paramName: '参数',
    paramType: '类型',
    paramRequired: '必填',
    paramDesc: '说明',
    modeFile: '文件模式',
    modeJson: 'JSON 模式',
    reqParams: '请求参数',
    respParams: '响应参数',
    paramFile: 'GPX/KML 文件',
    paramPoints: 'GPS 点数组',
    paramPointsLat: '纬度',
    paramPointsLon: '经度',
    paramPointsTime: '时间戳',
    paramPointsEle: '海拔',
    paramOptions: '算法选项',
    paramOptionsAlgo: '算法开关',
    paramOptionsThresholds: '检测阈值',
    paramOptionsOutput: '输出选项',
    // 响应字段
    respReportId: '报告 ID',
    respPointCount: '点数',
    respDistance: '距离 (米)',
    respDuration: '时长 (秒)',
    respAvgSpeed: '平均速度',
    respMaxSpeed: '最大速度',
    // 性能说明
    perfTitle: '性能说明',
    perfDesc1: '文件上传模式支持大规模数据（数万点）',
    perfDesc2: 'JSON 模式适合小规模数据实时处理',
    perfDesc3: '响应默认不含详细点数据，按需导出'
  },

  // Map Legend
  legend: {
    drift: 'GPS 漂移',
    jump: '位置跳跃',
    speed_anomaly: '速度异常',
    acceleration_anomaly: '加速度异常',
    missing: '数据丢失',
    density_anomaly: '密度异常',
    outlier: '离群点',
    interpolated: '插值点（修复点）',
    normal: '正常'
  },

  // Algorithm List
  algorithmList: {
    title: '核心算法修复详情',
    count: '共 {count} 个算法参与修复',
    processedPoints: '处理点数',
    fixedPoints: '修复点数',
    fixRate: '修复率',
    params: '算法参数',
    fixedIndices: '修复点位索引 ({count} 个)',
    noFixes: '此算法参与处理但未修复异常点（检测算法）',
    fixed: '修复 {count} 点',
    removedPoints: '移除点数',
    detectedPoints: '检测点数',
    totalAlgorithms: '共 {count} 个算法',
    totalResults: '算法处理结果',
    healthy: '健康'
  },

  // Algorithm Effect
  algorithmEffect: {
    title: '算法处理结果',
    totalTitle: '核心算法处理结果',
    healthy: '健康',
    fixedPoints: '修复点数',
    removedPoints: '移除点数',
    detectedPoints: '检测点数'
  },

  // Demo Track
  demo: {
    trackName: 'PositionDoctor 演示轨迹',
    trackDesc: '演示轨迹文件，展示异常检测功能',
    segmentName: '科技园环线',
    anomalyDrift: 'GPS 漂移异常（高楼区域）',
    recovery: '信号恢复，回到正常',
    anomalyOutlier: '离群点异常',
    leftTurn: '左转进入深南大道',
    southward: '向南 - 第二段漂移',
    driftEnd: '漂移结束，恢复正常',
    backToStart: '回到起点附近，完成环线'
  },

  // Map Playback
  playback: {
    originalTrack: '原始轨迹',
    repairedTrack: '修复轨迹',
    pause: '暂停',
    play: '播放',
    reset: '重置',
    enableTracking: '开启追踪',
    disableTracking: '关闭追踪'
  },

  // API Modal
  apiModal: {
    title: 'API',
    subtitle: 'GPS 轨迹诊断与修复 API v1.0',
    section: {
      overview: '概述',
      request: '请求',
      response: '响应',
      errors: '错误'
    },
    // Overview section
    endpointDesc: '接收 GPS 轨迹点数据，进行异常检测和修复处理。使用二元数组格式传输数据，相比对象数组格式减少约 70% 的数据包大小。',
    features: {
      adaptiveRTS: 'AdaptiveRTS',
      adaptiveRTSDesc: '卡尔曼滤波平滑',
      splineInterpolation: '样条插值',
      splineInterpolationDesc: '缺失点补充',
      douglasPeucker: 'DP 简化',
      douglasPeuckerDesc: '轨迹压缩',
      outlierRemoval: '离群移除',
      outlierRemovalDesc: '异常点剔除'
    },
    quickStart: '快速开始',
    quickStartSteps: {
      prepare: {
        title: '准备数据',
        desc: '将 GPS 点转换为二元数组格式 [[lat, lon, time, ele?, speed?, bearing?], ...]'
      },
      send: {
        title: '发送请求',
        desc: 'POST 请求到 /api/v1/diagnose/points，JSON 格式'
      },
      getResult: {
        title: '获取结果',
        desc: '解析响应中的 healthScore、diagnostics 和修复后的 points'
      }
    },
    // Request section
    requestBodyTitle: '请求体结构',
    pointsArrayFormat: 'points 数组格式',
    pointsArrayDesc: '每个点为长度 3-6 的数组，索引对应以下字段：',
    index: '索引',
    fieldName: '字段名',
    fieldType: '类型',
    required: '必填',
    description: '说明',
    range: '范围/单位',
    // Point fields
    latitude: '纬度',
    longitude: '经度',
    timestamp: 'Unix 时间戳',
    elevation: '海拔高度',
    speed: '速度',
    bearing: '航向角',
    units: {
      degrees: '度',
      meters: '米 (m)',
      kmh: '公里/时 (km/h)',
      degrees360: '0 ~ 360°',
      seconds: '秒 (2000-2100)'
    },
    note: '注：speed 和 bearing 为可选字段，用于提升算法精度。如不提供，系统将自动计算。',
    algorithmsConfig: 'options.algorithms 算法配置',
    thresholds: 'options.thresholds 检测阈值',
    outputConfig: 'options.output 输出配置',
    field: '字段',
    defaultValue: '默认值',
    // Algorithm descriptions
    adaptiveRTSDesc: '启用自适应 RTS 卡尔曼滤波平滑',
    splineInterpolationDesc: '启用三次样条插值填补缺失点',
    simplificationDesc: '启用 Douglas-Peucker 轨迹简化',
    outlierRemovalDesc: '启用离群点移除',
    // Threshold descriptions
    maxSpeedDesc: '最大允许速度 (km/h)',
    maxAccelerationDesc: '最大加速度 (m/s²)',
    maxJumpDesc: '最大跳跃距离 (米)',
    driftThresholdDesc: 'GPS 漂移检测阈值 (度)',
    // Output descriptions
    includePointsDesc: '响应中是否包含修复后的点数据',
    simplifyEpsilonDesc: 'DP 简化算法的容差参数 (米)',
    // Constraints
    constraintsTitle: '请求限制',
    minPoints: '最小点数',
    minPointsDesc: '至少需要 2 个点',
    maxPoints: '最大点数',
    maxPointsDesc: '单次请求最多 10 万点',
    requestTimeout: '请求超时',
    requestTimeoutDesc: '最大处理时间',
    rateLimit: '限流',
    rateLimitDesc: '每个 IP 地址',
    codeExamples: '代码示例',
    // Response section
    responseBodyTitle: '响应体结构',
    successResponseFields: '成功响应字段',
    fieldPath: '字段路径',
    trajectoryStats: 'TrajectoryStats 轨迹统计',
    pointCount: '轨迹点数量',
    distance: '轨迹总长度',
    distanceUnit: '个',
    durationSeconds: '轨迹总时长',
    avgSpeed: '平均速度',
    maxSpeed_field: '最大速度',
    bounds: '边界范围 (north, south, east, west)',
    elevation_field: '海拔统计 (min, max, avg, gain, loss)',
    diagnosticsInfo: 'DiagnosticsInfo 诊断信息',
    normalPoints: '正常点数量',
    anomalyPoints: '检测到的异常点数量',
    fixedPoints_field: '被算法修复的点数量',
    removedPoints_field: '被简化移除的点数量',
    interpolatedPoints_field: '插值生成的点数量',
    totalProcessed: '被算法处理的总点数',
    anomalies_field: '检测到的异常详情列表',
    algorithms_field: '各算法执行详情',
    healthScore_field: '健康评分 (total, rating, breakdown)',
    healthScoreTitle: 'HealthScore 健康评分',
    totalScore: '总分 (0-100)',
    rating_field: '等级: excellent(85+), good(70+), fair(50+), poor(<50)',
    breakdown_field: '各维度得分详情',
    metaTitle: 'Meta 元数据',
    version: 'API 版本号',
    processedAt: '处理时间 (ISO 8601)',
    processingTimeMs: '处理耗时（毫秒）',
    // Errors section
    errorResponseTitle: '错误响应格式',
    errorCodeTitle: '错误码列表',
    errorCode: '错误码',
    httpStatus: 'HTTP 状态',
    errorDesc: '说明',
    invalid_json: 'JSON 格式错误',
    too_many_points: '点数超过最大限制 (100,000)',
    too_few_points: '点数少于最小要求 (2)',
    invalid_points: '点数据无效（坐标或时间戳超出范围）',
    rate_limit_exceeded: '超过请求频率限制',
    internal_error: '服务器内部错误',
    errorDetailsTitle: 'ErrorDetails 字段说明',
    error_field: '出错的字段名',
    error_message: '详细错误信息',
    error_limit: '限制值（如适用）',
    invalidIndices: '无效点的索引列表',
    retryAfter: '重试等待秒数（限流时）',
    errorResponseExample: '错误响应示例',
    // Additional keys
    rateLimitValue: '10/分钟',
    includePointsComment: '// 当 options.output.includePoints=true',
    requestSuccess: '请求是否成功',
    reportIdDesc: '唯一报告标识符，用于导出结果',
    originalTrajectoryStats: '原始轨迹统计信息',
    correctedTrajectoryStats: '修复后轨迹统计信息',
    pointsDataOptional: '修复后的点数据（可选）',
    secondsUnit: '秒',
    userFriendlyError: '用户友好的错误描述',
    detailedErrorMessage: '详细错误信息'
  },

  // API Docs Page
  apiDocs: {
    title: 'API',
    subtitle: 'GPS 轨迹诊断与修复 API v1.0',
    section: {
      overview: '概述',
      request: '请求',
      response: '响应',
      errors: '错误'
    },
    endpointDesc: '接收 GPS 轨迹点数据，进行异常检测和修复处理。使用二元数组格式传输数据，相比对象数组格式减少约 70% 的数据包大小。',
    coreAlgorithms: '核心算法',
    features: {
      adaptiveRTS: 'AdaptiveRTS',
      adaptiveRTSDesc: '卡尔曼滤波平滑',
      splineInterpolation: '样条插值',
      splineInterpolationDesc: '缺失点补充',
      douglasPeucker: 'DP 简化',
      douglasPeuckerDesc: '轨迹压缩',
      outlierRemoval: '离群移除',
      outlierRemovalDesc: '异常点剔除'
    },
    quickStart: '快速开始',
    quickStartSteps: {
      prepare: {
        title: '准备数据',
        desc: '将 GPS 点转换为二元数组格式 [[lat, lon, time, ele?, speed?, bearing?], ...]'
      },
      send: {
        title: '发送请求',
        desc: 'POST 请求到 /api/v1/diagnose/points，JSON 格式'
      },
      getResult: {
        title: '获取结果',
        desc: '解析响应中的 healthScore、diagnostics 和修复后的 points'
      }
    },
    performanceComparison: '性能对比',
    performanceTable: {
      format: '格式',
      points10k: '10,000 点',
      points50k: '50,000 点',
      objectArray: '对象数组',
      binaryArray: '二元数组',
      savings: '节省'
    },
    requestBodyTitle: '请求体结构',
    pointsArrayFormat: 'points 数组格式',
    pointsArrayDesc: '每个点为长度 3-6 的数组，索引对应以下字段：',
    codeExamples: '代码示例',
    responseBodyTitle: '响应体结构',
    healthScoreRating: 'HealthScore 评级',
    errorCodeList: '错误码列表',
    rating: {
      excellent: '优秀',
      excellentRange: '85-100',
      good: '良好',
      goodRange: '70-84',
      fair: '一般',
      fairRange: '50-69',
      poor: '较差',
      poorRange: '0-49'
    },
    ratingLabel: {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差'
    },
    footerText: 'PositionDoctor API · GPS 轨迹诊断与修复服务',
    // Points array table
    tableHeaders: {
      index: '索引',
      fieldName: '字段名',
      fieldType: '类型',
      required: '必填',
      description: '说明',
      range: '范围/单位'
    },
    pointFields: {
      latitude: 'latitude',
      longitude: 'longitude',
      timestamp: 'timestamp',
      elevation: 'elevation',
      speed: 'speed',
      bearing: 'bearing'
    },
    fieldTypes: {
      number: 'number'
    },
    required: {
      yes: '✓',
      no: '-'
    },
    fieldDescriptions: {
      latitude: '纬度',
      longitude: '经度',
      timestamp: 'Unix 时间戳',
      elevation: '海拔高度',
      speed: '速度',
      bearing: '航向角'
    },
    fieldRanges: {
      lat: '-90 ~ 90°',
      lon: '-180 ~ 180°',
      time: '秒 (2000-2100)',
      ele: '米 (m)',
      speed: '公里/时 (km/h)',
      bearing: '0 ~ 360°'
    },
    // Error codes table
    errorCodeTable: {
      errorCode: '错误码',
      httpStatus: 'HTTP 状态',
      description: '说明'
    },
    errorCodes: {
      invalid_json: 'JSON 格式错误',
      too_many_points: '点数超过最大限制 (100,000)',
      too_few_points: '点数少于最小要求 (2)',
      invalid_points: '点数据无效（坐标或时间戳超出范围）',
      rate_limit_exceeded: '超过请求频率限制',
      internal_error: '服务器内部错误'
    },
    httpStatus: {
      badRequest: '400',
      tooManyRequests: '429',
      serverError: '500'
    },
    // 增强请求部分
    algorithmsTitle: '算法选项',
    algorithmsDesc: '配置轨迹处理启用的算法',
    thresholdsTitle: '阈值选项',
    thresholdsDesc: '设置异常检测的验证阈值',
    outputTitle: '输出选项',
    outputDesc: '控制响应格式和内容',
    algorithmOptions: {
      adaptiveRTS: {
        name: '自适应RTS',
        desc: '基于卡尔曼滤波的平滑算法，在降低GPS噪声的同时保持轨迹特征',
        default: 'true'
      },
      splineInterpolation: {
        name: '样条插值',
        desc: '基于时间间隔使用三次样条插值填充缺失点',
        default: 'true'
      },
      simplification: {
        name: '道格拉斯-普克',
        desc: '使用epsilon容差减少点数同时保持轨迹形状',
        default: 'true'
      },
      outlierRemoval: {
        name: '异常值移除',
        desc: '检测并移除超出统计阈值的异常点',
        default: 'true'
      }
    },
    thresholdOptions: {
      maxSpeed: {
        name: '最大速度',
        desc: '连续点之间的有效最大速度（公里/小时）',
        default: '120.0',
        range: '1 ~ 500'
      },
      maxAcceleration: {
        name: '最大加速度',
        desc: '连续点之间的有效最大加速度（米/秒²）',
        default: '10.0',
        range: '1 ~ 50'
      },
      maxJump: {
        name: '最大距离跳变',
        desc: '连续点之间的有效最大距离（米）',
        default: '500.0',
        range: '10 ~ 5000'
      },
      driftThreshold: {
        name: '漂移阈值',
        desc: '检测GPS漂移的最小坐标变化（度）',
        default: '0.0001',
        range: '0.00001 ~ 0.01'
      }
    },
    outputOptions: {
      includePoints: {
        name: '包含轨迹点',
        desc: '在响应中返回修正后的轨迹点数组',
        default: 'true'
      },
      simplifyEpsilon: {
        name: '简化精度',
        desc: '道格拉斯-普克算法的容差值（米）',
        default: '1.0',
        range: '0.1 ~ 100'
      }
    },
    // 增强响应部分
    responseFieldsTitle: '响应字段说明',
    responseFields: {
      reportId: {
        name: 'reportId',
        type: 'string',
        desc: '此诊断报告的唯一标识符'
      },
      original: {
        name: 'original',
        type: 'object',
        desc: '输入轨迹的统计信息'
      },
      corrected: {
        name: 'corrected',
        type: 'object',
        desc: '处理后修复的统计信息'
      },
      diagnostics: {
        name: 'diagnostics',
        type: 'object',
        desc: '详细分析，包括健康评分、异常和算法结果'
      },
      points: {
        name: 'points',
        type: 'array',
        desc: '修正后的轨迹点（如请求）'
      },
      version: {
        name: 'version',
        type: 'string',
        desc: '处理所用的API版本'
      },
      processingTimeMs: {
        name: 'processingTimeMs',
        type: 'number',
        desc: '服务器处理时间（毫秒）'
      }
    },
    responseExampleTitle: '完整响应示例',
    successResponse: {
      title: '成功响应',
      desc: 'HTTP 200 返回诊断结果'
    },
    errorResponse: {
      title: '错误响应',
      desc: 'HTTP 4xx/5xx 返回错误详情',
      example: `{
  "success": false,
  "error": {
    "code": "invalid_points",
    "message": "无效点数据：索引5处纬度超出范围"
  }
}`
    }
  }
}
