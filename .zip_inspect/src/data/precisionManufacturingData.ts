import {
  PrecisionMetalUnit,
  StageBottleneckMetric,
  ThroughputLossImpact,
  EconomicLossBreakdown,
  ExplainableRecommendation,
  ModelEvaluationSummary,
  ObservedAssociationFactor,
  DemoScenarioKey
} from '../types';

/**
 * 5 Standard Stages of Precision Metal-Component Manufacturing
 * Raw Material → CNC Machining → Washing / Finishing → Quality Inspection → Packing
 */
export const PRECISION_METAL_STAGES = [
  {
    id: 'RAW_MATERIAL' as const,
    name: 'Raw Material',
    description: 'Bar Stock Infeed & Billet Pre-conditioning',
    stationId: 'S01',
    machineId: 'RAW-INGRESS-01',
    nominalCycleSec: 24.0,
    nominalCapacityPerHour: 150
  },
  {
    id: 'CNC_MACHINING' as const,
    name: 'CNC Machining',
    description: '5-Axis Precision Milling & Turning Center',
    stationId: 'S02',
    machineId: 'CNC-04',
    nominalCycleSec: 45.0,
    nominalCapacityPerHour: 80
  },
  {
    id: 'WASHING_FINISHING' as const,
    name: 'Washing / Finishing',
    description: 'Ultrasonic Degreasing & Vibratory Deburring',
    stationId: 'S03',
    machineId: 'WASH-DEBURR-02',
    nominalCycleSec: 32.0,
    nominalCapacityPerHour: 110
  },
  {
    id: 'QUALITY_INSPECTION' as const,
    name: 'Quality Inspection',
    description: 'Automated Optical Inspection (AOI) & CMM Probe',
    stationId: 'S04',
    machineId: 'AOI-CMM-01',
    nominalCycleSec: 28.0,
    nominalCapacityPerHour: 125
  },
  {
    id: 'PACKING' as const,
    name: 'Packing',
    description: 'Anti-Corrosion Clean Packaging & Box Crating',
    stationId: 'S05',
    machineId: 'PACK-AGV-01',
    nominalCycleSec: 22.0,
    nominalCapacityPerHour: 160
  }
];

/**
 * Machine Learning Models: Random Forest (Primary) & Logistic Regression (Baseline)
 * Clearly labeled: ILLUSTRATIVE — DEMO DATA
 */
export const ML_MODEL_EVALUATIONS: Record<'RANDOM_FOREST' | 'LOGISTIC_REGRESSION', ModelEvaluationSummary> = {
  RANDOM_FOREST: {
    modelName: 'Random Forest (Primary)',
    task: 'ACCEPTABLE vs DEFECTIVE',
    datasetSplit: 'Precision Metal Test Split (Batch B200-B218, N=1,280)',
    accuracy: 0.946,
    precision: 0.928,
    recall: 0.951,
    f1Score: 0.939,
    confusionMatrix: {
      truePositive: 388,
      falsePositive: 30,
      trueNegative: 842,
      falseNegative: 20
    },
    individualPredictionConfidence: 0.942,
    demoDataLabel: 'ILLUSTRATIVE — DEMO DATA'
  },
  LOGISTIC_REGRESSION: {
    modelName: 'Logistic Regression (Baseline)',
    task: 'ACCEPTABLE vs DEFECTIVE',
    datasetSplit: 'Precision Metal Test Split (Batch B200-B218, N=1,280)',
    accuracy: 0.842,
    precision: 0.810,
    recall: 0.825,
    f1Score: 0.817,
    confusionMatrix: {
      truePositive: 336,
      falsePositive: 79,
      trueNegative: 793,
      falseNegative: 72
    },
    individualPredictionConfidence: 0.814,
    demoDataLabel: 'ILLUSTRATIVE — DEMO DATA'
  }
};

/**
 * Units database for the Precision Metal Component scenario.
 * When localization data exists (NEU-DET steel samples): bounding boxes and overlay supported.
 * When localization data does NOT exist (e.g. dimensional drift or synthetic units):
 * explicitly displays: "Defect localization not available for this dataset."
 */
export const PRECISION_METAL_UNITS: PrecisionMetalUnit[] = [
  {
    unit_id: 'UNIT-4821',
    batch_id: 'BATCH-B204',
    machine_id: 'CNC-04',
    production_stage: 'Quality Inspection',
    prediction: 'DEFECTIVE',
    confidence: 0.942,
    confidenceState: 'HIGH CONFIDENCE',
    defect_type: 'Surface Scratch / Scoring',
    defect_family: 'Surface',
    hasLocalization: true,
    boundingBoxes: [
      { id: 'b1', name: 'Scratch', xmin: 26, ymin: 12, xmax: 43, ymax: 171, confidence: 0.95 },
      { id: 'b2', name: 'Scoring', xmin: 8, ymin: 184, xmax: 17, ymax: 196, confidence: 0.91 }
    ],
    localImageUrl: '/assets/neu_det/scratches_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/scratches_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    relatedProcessVariables: {
      spindleRpm: 12800,
      vibrationMmSec: 6.8,
      coolantFlowLpm: 14.2,
      coolantTempCelsius: 38.6,
      feedRateMmMin: 3400,
      cycleTimeSec: 68.4,
      downtimeMinutes: 38.2,
      toolWearHours: 24.5,
      acousticDb: 89,
      dimensionalDeviationMm: 0.024
    },
    modelStatus: 'DEPLOYED_RANDOM_FOREST_V2',
    observedDefectInfo: 'Continuous 159px longitudinal abrasive scratch across machined datum face. High optical contrast gradient.',
    whyFlagged: 'High-aspect-ratio edge gradient (>3.8x baseline) with sharp specular reflection drop. Correlates with Bearing #02 harmonic vibration spike (6.8 mm/s).',
    requiresHumanReview: false,
    inspectionTimestamp: '2026-09-19 14:32:08 UTC',
    scrapCostUsd: 48.0,
    reworkCostUsd: 18.5
  },
  {
    unit_id: 'UNIT-4138',
    batch_id: 'BATCH-B202',
    machine_id: 'CNC-04',
    production_stage: 'CNC Machining',
    prediction: 'DEFECTIVE',
    confidence: 0.915,
    confidenceState: 'HIGH CONFIDENCE',
    defect_type: 'Tool Chatter Grooves & Flank Wear',
    defect_family: 'Tooling',
    hasLocalization: true,
    boundingBoxes: [
      { id: 'b-chatter-1', name: 'Chatter Groove', xmin: 92, ymin: 24, xmax: 106, ymax: 176, confidence: 0.92 }
    ],
    localImageUrl: '/assets/neu_det/scratches_2.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/scratches_2.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    relatedProcessVariables: {
      spindleRpm: 13100,
      vibrationMmSec: 5.9,
      coolantFlowLpm: 16.0,
      coolantTempCelsius: 36.2,
      feedRateMmMin: 3600,
      cycleTimeSec: 64.2,
      downtimeMinutes: 28.0,
      toolWearHours: 28.1,
      acousticDb: 86,
      dimensionalDeviationMm: 0.038
    },
    modelStatus: 'DEPLOYED_RANDOM_FOREST_V2',
    observedDefectInfo: 'Periodic micro-groove pitch (0.42mm) corresponding to spindle harmonic rotational frequency (213 Hz).',
    whyFlagged: 'Periodic radial waviness exceeding ISO 2768-m tolerance band. Flank wear on Carbide Insert #04 measured at 0.38mm (limit 0.35mm).',
    requiresHumanReview: false,
    inspectionTimestamp: '2026-09-19 13:48:15 UTC',
    scrapCostUsd: 48.0,
    reworkCostUsd: 18.5
  },
  {
    unit_id: 'UNIT-4210',
    batch_id: 'BATCH-B212',
    machine_id: 'WASH-DEBURR-02',
    production_stage: 'Washing / Finishing',
    prediction: 'DEFECTIVE',
    confidence: 0.582,
    confidenceState: 'NEEDS REVIEW', // Borderline uncertainty
    defect_type: 'Thermal Crazing & Micro-Crack Network',
    defect_family: 'Surface',
    hasLocalization: true,
    boundingBoxes: [
      { id: 'b3', name: 'Thermal Crazing', xmin: 2, ymin: 2, xmax: 193, ymax: 194, confidence: 0.88 }
    ],
    localImageUrl: '/assets/neu_det/crazing_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/crazing_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    relatedProcessVariables: {
      spindleRpm: 0,
      vibrationMmSec: 2.1,
      coolantFlowLpm: 22.0,
      coolantTempCelsius: 24.0,
      feedRateMmMin: 1800,
      cycleTimeSec: 36.5,
      downtimeMinutes: 8.5,
      acousticDb: 62,
      dimensionalDeviationMm: 0.011
    },
    modelStatus: 'DEPLOYED_RANDOM_FOREST_V2',
    observedDefectInfo: 'Fine reticulated surface pattern exhibiting low cosine similarity (0.42) to known training catalog classes.',
    whyFlagged: 'Model prediction confidence (58.2%) sits below automated routing threshold (70%). Ultrasonic cavitation tank resonance suspected.',
    requiresHumanReview: true,
    inspectionTimestamp: '2026-09-19 14:15:30 UTC',
    scrapCostUsd: 48.0,
    reworkCostUsd: 18.5
  },
  {
    unit_id: 'UNIT-3980',
    batch_id: 'BATCH-B201',
    machine_id: 'RAW-INGRESS-01',
    production_stage: 'Raw Material',
    prediction: 'DEFECTIVE',
    confidence: 0.884,
    confidenceState: 'HIGH CONFIDENCE',
    defect_type: 'Non-Metallic Slag Inclusion',
    defect_family: 'Metallurgical',
    hasLocalization: true,
    boundingBoxes: [
      { id: 'b4-1', name: 'Inclusion', xmin: 33, ymin: 5, xmax: 46, ymax: 36, confidence: 0.92 },
      { id: 'b4-2', name: 'Inclusion', xmin: 120, ymin: 34, xmax: 130, ymax: 60, confidence: 0.89 },
      { id: 'b4-3', name: 'Inclusion', xmin: 116, ymin: 115, xmax: 135, ymax: 198, confidence: 0.94 }
    ],
    localImageUrl: '/assets/neu_det/inclusion_1.jpg',
    remoteImageUrl: 'https://raw.githubusercontent.com/siddhartamukherjee/NEU-DET-Steel-Surface-Defect-Detection/master/IMAGES/inclusion_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    relatedProcessVariables: {
      spindleRpm: 0,
      vibrationMmSec: 1.2,
      coolantTempCelsius: 21.0,
      feedRateMmMin: 1200,
      cycleTimeSec: 25.1,
      downtimeMinutes: 4.0,
      acousticDb: 58,
      dimensionalDeviationMm: 0.006
    },
    modelStatus: 'DEPLOYED_RANDOM_FOREST_V2',
    observedDefectInfo: 'Isolated dark non-reflective inclusion grain (3.2mm) embedded in raw bar billet stock.',
    whyFlagged: 'Eddy-current and optical contrast ratio flagged localized metallurgical discontinuity. Supplier ingot heat #7719.',
    requiresHumanReview: false,
    inspectionTimestamp: '2026-09-19 11:22:40 UTC',
    scrapCostUsd: 48.0,
    reworkCostUsd: 0 // Inclusions cannot be reworked
  },
  {
    unit_id: 'UNIT-4144',
    batch_id: 'BATCH-B204',
    machine_id: 'CNC-04',
    production_stage: 'CNC Machining',
    prediction: 'ACCEPTABLE',
    confidence: 0.978,
    confidenceState: 'HIGH CONFIDENCE',
    defect_type: 'None (Nominal Specimen)',
    defect_family: 'None',
    hasLocalization: true,
    boundingBoxes: [],
    localImageUrl: '/assets/neu_det/normal_reference_1.jpg',
    remoteImageUrl: '/assets/neu_det/normal_reference_1.jpg',
    normalReferenceUrl: '/assets/neu_det/normal_reference_1.jpg',
    relatedProcessVariables: {
      spindleRpm: 12400,
      vibrationMmSec: 2.1,
      coolantFlowLpm: 18.5,
      coolantTempCelsius: 23.4,
      feedRateMmMin: 2800,
      cycleTimeSec: 46.2,
      downtimeMinutes: 0,
      toolWearHours: 8.2,
      acousticDb: 74,
      dimensionalDeviationMm: 0.004
    },
    modelStatus: 'DEPLOYED_RANDOM_FOREST_V2',
    observedDefectInfo: 'Surface topography and key dimensional datums conform to engineering specification.',
    whyFlagged: 'Conforms to nominal envelope. High confidence acceptable verification.',
    requiresHumanReview: false,
    inspectionTimestamp: '2026-09-19 14:40:11 UTC',
    scrapCostUsd: 0,
    reworkCostUsd: 0
  },
  {
    unit_id: 'UNIT-4302',
    batch_id: 'BATCH-B205',
    machine_id: 'PACK-AGV-01',
    production_stage: 'Packing',
    prediction: 'ACCEPTABLE',
    confidence: 0.991,
    confidenceState: 'HIGH CONFIDENCE',
    defect_type: 'None',
    defect_family: 'None',
    hasLocalization: false,
    relatedProcessVariables: {
      vibrationMmSec: 0.6,
      coolantTempCelsius: 20.0,
      cycleTimeSec: 21.8,
      downtimeMinutes: 1.5,
      acousticDb: 54
    },
    modelStatus: 'DEPLOYED_RANDOM_FOREST_V2',
    observedDefectInfo: 'Desiccant packaging intact, bar code readable, dimensional outer casing verified.',
    whyFlagged: 'Full compliance with dispatch packing specifications.',
    requiresHumanReview: false,
    inspectionTimestamp: '2026-09-19 14:45:00 UTC',
    scrapCostUsd: 0,
    reworkCostUsd: 0
  }
];

/**
 * Observed Contributing Factors
 * Requirement 7: Explicitly labeled "OBSERVED ASSOCIATION".
 * Never display "ROOT CAUSE PROVEN".
 */
export const OBSERVED_ASSOCIATIONS: ObservedAssociationFactor[] = [
  {
    factor: 'Spindle Bearing Harmonic Anomaly (Bearing #02)',
    subsystem: 'Spindle & Kinematic Bearings (CNC-04)',
    observedAssociationStrength: 91,
    evidenceDescription: 'Sub-harmonic vibration peak at 213 Hz (6.8 mm/s vs 1.8 mm/s nominal) strongly co-occurs with blade root chatter and surface scoring on Batch B-204 (Pearson r = 0.91).',
    investigationProtocol: 'Execute tactile vibration check on Bearing #02 rear support; inspect raceway micro-pitting.',
    status: 'SUSPECTED'
  },
  {
    factor: 'Coolant Flow Delta-P & Thermal Rise',
    subsystem: 'Lubrication & Tribology Circuit',
    observedAssociationStrength: 84,
    evidenceDescription: 'Coolant delivery temperature elevated to 38.6°C (+14°C above baseline) during prolonged roughing passes, correlating with localized thermal expansion (+0.024mm).',
    investigationProtocol: 'Verify heat exchanger coolant flow rate and clean filter basket #2.',
    status: 'EVALUATING'
  },
  {
    factor: 'Tool Flank Wear Beyond Critical Limit',
    subsystem: 'Carbide Insert Tooling',
    observedAssociationStrength: 78,
    evidenceDescription: 'Insert #04 recorded 28.1 operating hours (threshold: 25.0 hrs); optical flank wear measured at 0.38mm.',
    investigationProtocol: 'Index turret to fresh insert pocket and re-calibrate tool z-offset.',
    status: 'EVALUATING'
  },
  {
    factor: 'Billet Hardness Variance in Batch B-204',
    subsystem: 'Incoming Metallurgy',
    observedAssociationStrength: 62,
    evidenceDescription: 'Supplier mill cert indicates 218 HBW hardness vs nominal 195 HBW, imposing higher cutting forces during rough milling.',
    investigationProtocol: 'Perform laboratory portable Rockwell hardness test on retention bar samples.',
    status: 'MONITORED'
  }
];

/**
 * Stage Bottleneck Metrics for the 5 production stages
 * Requirement 8: Shows utilization, average cycle time, downtime, throughput, bottleneck score, and WHY highlighted.
 */
export const INITIAL_STAGE_BOTTLENECK_METRICS: StageBottleneckMetric[] = [
  {
    stageId: 'RAW_MATERIAL',
    stageName: 'Raw Material',
    stationId: 'S01',
    machineId: 'RAW-INGRESS-01',
    utilizationPct: 76.5,
    averageCycleTimeSec: 24.2,
    nominalCycleTimeSec: 24.0,
    downtimeMinutes: 4.2,
    throughputUnitsPerHour: 148,
    nominalThroughputUnitsPerHour: 150,
    bottleneckScore: 'LOW',
    isBottleneck: false,
    highlightReason: 'Sufficient buffer margin. Cycle time variance within nominal ±0.4s.',
    queueUnits: 28,
    queueMax: 120
  },
  {
    stageId: 'CNC_MACHINING',
    stageName: 'CNC Machining',
    stationId: 'S02',
    machineId: 'CNC-04',
    utilizationPct: 94.2, // Bottleneck utilization
    averageCycleTimeSec: 68.4, // Elevated from 45s nominal
    nominalCycleTimeSec: 45.0,
    downtimeMinutes: 42.0, // Elevated downtime
    throughputUnitsPerHour: 52, // Constrained from 80 nominal
    nominalThroughputUnitsPerHour: 80,
    bottleneckScore: 'CRITICAL',
    isBottleneck: true,
    highlightReason: 'High utilization (94.2%) + elevated cycle time (68.4s vs 45.0s baseline) + repeated downtime (42 min/shift). Upstream queue accumulating 142 units.',
    queueUnits: 142,
    queueMax: 160
  },
  {
    stageId: 'WASHING_FINISHING',
    stageName: 'Washing / Finishing',
    stationId: 'S03',
    machineId: 'WASH-DEBURR-02',
    utilizationPct: 61.2,
    averageCycleTimeSec: 32.1,
    nominalCycleTimeSec: 32.0,
    downtimeMinutes: 5.0,
    throughputUnitsPerHour: 52, // Starved by CNC-04
    nominalThroughputUnitsPerHour: 110,
    bottleneckScore: 'LOW',
    isBottleneck: false,
    highlightReason: 'Starved by upstream CNC-04 bottleneck. Available headroom to absorb rebalanced secondary deburring tasks.',
    queueUnits: 18,
    queueMax: 100
  },
  {
    stageId: 'QUALITY_INSPECTION',
    stageName: 'Quality Inspection',
    stationId: 'S04',
    machineId: 'AOI-CMM-01',
    utilizationPct: 88.2,
    averageCycleTimeSec: 28.4,
    nominalCycleTimeSec: 28.0,
    downtimeMinutes: 11.0,
    throughputUnitsPerHour: 52,
    nominalThroughputUnitsPerHour: 125,
    bottleneckScore: 'MODERATE',
    isBottleneck: false,
    highlightReason: 'Operating stably. Processing defect quarantine queue with multi-spectral AOI imaging.',
    queueUnits: 64,
    queueMax: 120
  },
  {
    stageId: 'PACKING',
    stageName: 'Packing',
    stationId: 'S05',
    machineId: 'PACK-AGV-01',
    utilizationPct: 54.0,
    averageCycleTimeSec: 21.0,
    nominalCycleTimeSec: 22.0,
    downtimeMinutes: 2.0,
    throughputUnitsPerHour: 52,
    nominalThroughputUnitsPerHour: 160,
    bottleneckScore: 'LOW',
    isBottleneck: false,
    highlightReason: 'High idle capacity. Readily satisfies current line delivery pace.',
    queueUnits: 12,
    queueMax: 90
  }
];

/**
 * Throughput & Loss Metrics
 * Requirement 9: Connects bottleneck to current throughput, affected units, scrap, rework, downtime.
 */
export const INITIAL_THROUGHPUT_LOSS: ThroughputLossImpact = {
  currentThroughputUnitsHr: 52,
  nominalThroughputUnitsHr: 80,
  throughputDeficitUnitsHr: 28, // 80 - 52 = 28 units lost per hour
  affectedUnitsTotal: 224, // Over 8-hour shift
  scrapUnitsTotal: 34,
  reworkUnitsTotal: 48,
  bottleneckStarvationMinutes: 118,
  downtimeHoursPerShift: 0.70 // 42 minutes / 60
};

/**
 * Transparent Economic Impact with Formulas
 * Requirement 10: Transparent calculations with clearly visible formulas and assumptions.
 */
export const INITIAL_ECONOMIC_BREAKDOWN: EconomicLossBreakdown = {
  scrapCostUsd: 1632.0, // 34 scrap units * $48.00
  reworkCostUsd: 888.0,  // 48 rework units * $18.50
  downtimeCostUsd: 6090.0, // 42 min (0.7 hr) * $145.00/hr machine downtime rate + upstream idling ($8,700/shift rate)
  throughputOpportunityLossUsd: 7616.0, // 224 deficit units * $34.00 contribution margin
  totalEstimatedLossUsd: 16226.0,
  calculationFormulas: {
    scrapFormula: 'Scrap Cost = Defective Units Scrapped (34) × Unit Scrap Loss ($48.00/unit) = $1,632.00',
    reworkFormula: 'Rework Cost = Reworkable Units (48) × Average Rework Cost ($18.50/unit) = $888.00',
    downtimeFormula: 'Downtime Cost = Total Downtime Minutes (42 min) × Machine Overhead Rate ($145.00/hr) = $6,090.00',
    throughputFormula: 'Throughput Opportunity Loss = (Target Capacity [80] - Actual [52]) × 8 hrs (224 units) × Unit Gross Margin ($34.00/unit) = $7,616.00'
  },
  assumptions: [
    'Unit Scrap Loss based on precision alloy billet raw material cost ($32.00) plus incurred machining overhead ($16.00).',
    'Rework Cost includes 18 minutes secondary hand-stoning and re-measurement under optical comparator.',
    'Downtime rate reflects 5-Axis CNC machine labor ($45/hr) + plant overhead allocation ($100/hr).',
    'Throughput opportunity margin based on contracted Tier-1 automotive customer sales price ($82.00) minus standard BOM ($48.00).'
  ]
};

/**
 * Rule-Based Explainable Recommendations
 * Requirement 11: WHAT, WHY, EVIDENCE, EXPECTED IMPACT. Simple, explainable, advisory only.
 */
export const INITIAL_EXPLAINABLE_RECOMMENDATIONS: ExplainableRecommendation[] = [
  {
    id: 'REC-01',
    title: 'Offload Secondary Finishing from CNC-04 to Washing/Deburring Station',
    stationId: 'S02',
    stageName: 'CNC Machining',
    priority: 'HIGH',
    what: 'Transfer chamfer deburring and surface wash passes (18 seconds) from CNC-04 spindle to S03 automated vibratory finishing.',
    why: 'CNC-04 is the active line bottleneck operating at 94.2% utilization, while downstream S03 has 46% unused capacity.',
    evidence: [
      'CNC-04 cycle time: 68.4s (152% of nominal 45s baseline)',
      'S03 Washing/Deburring utilization is only 61.2%',
      'Buffer queue between S02 and S03 currently holding 142 units'
    ],
    expectedImpact: 'Reduces CNC-04 cycle time by 18.2s (down to 50.2s); increases line throughput from 52 to 71 units/hr (+36.5%); recovers $5,400/shift in throughput loss.',
    status: 'OPEN',
    simulatedImprovement: {
      cycleTimeReductionSec: 18.2,
      throughputIncreasePct: 36.5,
      lossReductionUsd: 5400,
      defectReductionPct: 15.0
    }
  },
  {
    id: 'REC-02',
    title: 'Replace Spindle Bearing #02 Cartridge & Re-seat Tool Insert #04',
    stationId: 'S02',
    stageName: 'CNC Machining',
    priority: 'HIGH',
    what: 'Engage safety isolation on CNC-04, inspect Bearing #02 rear support raceway, and index Carbide Tool Insert #04.',
    why: 'Elevated bearing vibration (6.8 mm/s vs 1.8 mm/s) correlates (r=0.91) with surface chatter and recurring scrap on Batch B-204.',
    evidence: [
      'Bearing #02 accelerometer reads 6.8 mm/s (critical threshold: 4.5 mm/s)',
      '34 units scrapped in current shift with longitudinal surface chatter',
      'Insert #04 exceeds allowable cut hours by 3.1 hours'
    ],
    expectedImpact: 'Eliminates harmonic chatter vibration; reduces batch scrap rate by 72%; prevents estimated $1,170/shift in material scrap loss.',
    status: 'APPROVED',
    simulatedImprovement: {
      cycleTimeReductionSec: 3.5,
      throughputIncreasePct: 6.0,
      lossReductionUsd: 1170,
      defectReductionPct: 72.0
    }
  },
  {
    id: 'REC-03',
    title: 'Quarantine Batch B-212 for Forensic CMM Review & Cavitation Flush',
    stationId: 'S03',
    stageName: 'Washing / Finishing',
    priority: 'MEDIUM',
    what: 'Place Batch B-212 (45 units) on engineering hold for CMM laser profiling; perform ultrasonic tank degassing cycle.',
    why: 'Unit UNIT-4210 exhibited novel micro-groove pattern with low AI confidence (58.2%), requiring human verification before packing.',
    evidence: [
      'Model confidence state: NEEDS REVIEW (58.2%)',
      'Cosine similarity to known defect catalog: 0.42 (Low)',
      'Ultrasonic tank transducer #3 impedance drift detected'
    ],
    expectedImpact: 'Prevents defective units escaping to customer assembly line; zero customer warranty recall exposure ($45,000 protection).',
    status: 'OPEN',
    simulatedImprovement: {
      cycleTimeReductionSec: 0,
      throughputIncreasePct: 0,
      lossReductionUsd: 45000,
      defectReductionPct: 100
    }
  }
];

/**
 * 5 Pre-configured Coherent Demo Scenarios
 * Requirement 17:
 * 1. NORMAL PRODUCTION
 * 2. INCREASING DEFECT RATE
 * 3. CNC MACHINING BOTTLENECK
 * 4. HIGH-UNCERTAINTY / UNUSUAL BATCH
 * 5. COMBINED DEFECT + BOTTLENECK + FINANCIAL IMPACT
 */
export const DEMO_SCENARIOS_CONFIG: Record<DemoScenarioKey, {
  name: string;
  badge: string;
  description: string;
  activeDefectUnitId: string;
  bottleneckStationId: string;
  throughputUnitsHr: number;
  defectRatePct: number;
  totalLossUsd: number;
  cncCycleTimeSec: number;
  cncUtilizationPct: number;
  cncDowntimeMin: number;
  cncQueueUnits: number;
  recommendationFocusId: string;
}> = {
  NORMAL_PRODUCTION: {
    name: 'Normal Production Flow',
    badge: 'STABLE BASELINE',
    description: 'All 5 stages operating within nominal parameters. Minimal scrap, stable 45s CNC cycle time, high throughput.',
    activeDefectUnitId: 'UNIT-4144',
    bottleneckStationId: 'NONE',
    throughputUnitsHr: 79,
    defectRatePct: 1.4,
    totalLossUsd: 1420,
    cncCycleTimeSec: 45.2,
    cncUtilizationPct: 81.0,
    cncDowntimeMin: 6.0,
    cncQueueUnits: 32,
    recommendationFocusId: 'REC-01'
  },
  INCREASING_DEFECT_RATE: {
    name: 'Increasing Defect Rate Alert',
    badge: 'QUALITY DEVIATION',
    description: 'Surge in surface scratch and tooling chatter defects across Batch B-204. Scrap and rework costs rising.',
    activeDefectUnitId: 'UNIT-4821',
    bottleneckStationId: 'S04',
    throughputUnitsHr: 68,
    defectRatePct: 8.6,
    totalLossUsd: 9850,
    cncCycleTimeSec: 54.0,
    cncUtilizationPct: 88.5,
    cncDowntimeMin: 18.0,
    cncQueueUnits: 76,
    recommendationFocusId: 'REC-02'
  },
  CNC_BOTTLENECK: {
    name: 'CNC Machining Stage Bottleneck',
    badge: 'BOTTLENECK ACTIVE',
    description: 'CNC-04 cycle time surges to 68.4s with 94.2% utilization. Upstream queue holding 142 units; downstream starved.',
    activeDefectUnitId: 'UNIT-4138',
    bottleneckStationId: 'S02',
    throughputUnitsHr: 52,
    defectRatePct: 4.8,
    totalLossUsd: 14600,
    cncCycleTimeSec: 68.4,
    cncUtilizationPct: 94.2,
    cncDowntimeMin: 42.0,
    cncQueueUnits: 142,
    recommendationFocusId: 'REC-01'
  },
  HIGH_UNCERTAINTY: {
    name: 'High-Uncertainty / Unusual Batch (B-212)',
    badge: 'HUMAN REVIEW REQUIRED',
    description: 'Novel micro-groove texture pattern flagged on Batch B-212 with low model confidence (58.2%). Quarantined for forensic review.',
    activeDefectUnitId: 'UNIT-4210',
    bottleneckStationId: 'S03',
    throughputUnitsHr: 64,
    defectRatePct: 5.2,
    totalLossUsd: 8400,
    cncCycleTimeSec: 52.0,
    cncUtilizationPct: 84.0,
    cncDowntimeMin: 22.0,
    cncQueueUnits: 68,
    recommendationFocusId: 'REC-03'
  },
  COMBINED_IMPACT: {
    name: 'Combined Defect + Bottleneck + Financial Impact',
    badge: 'CRITICAL MULTI-TIER IMPACT',
    description: 'Compounded failure: Bearing #02 harmonic vibration spike (6.8 mm/s) + CNC cycle time 68.4s + high defect rate, driving $28,740 loss.',
    activeDefectUnitId: 'UNIT-4821',
    bottleneckStationId: 'S02',
    throughputUnitsHr: 48,
    defectRatePct: 9.8,
    totalLossUsd: 28740,
    cncCycleTimeSec: 72.0,
    cncUtilizationPct: 96.8,
    cncDowntimeMin: 58.0,
    cncQueueUnits: 154,
    recommendationFocusId: 'REC-02'
  }
};
