import {
  StationTelemetry,
  ProductVariantInfo,
  InspectionRecord,
  EconomicBaseline,
  AIRecommendation,
  MachineComponentDiagnostic,
  WorkerDispatch,
  RootCauseNode
} from '../types';

export const INITIAL_STATIONS: StationTelemetry[] = [
  {
    id: 'S01',
    name: 'Raw Infeed & Billet Prep',
    shortCode: 'IN-FEED',
    type: 'Material Handling',
    zone: 'Zone A',
    status: 'HEALTHY',
    healthScore: 98.4,
    cycleTimeSec: 24.2,
    nominalCycleSec: 24.0,
    cycleVarianceSec: 0.4,
    capacityUnitsPerHour: 150,
    utilizationPct: 76.5,
    downtimeMinutesPerShift: 4.2,
    changeoverMinutes: 12.0,
    queueUnits: 28,
    queueMaxCapacity: 120,
    operatingCondition: {
      spindleRpm: 0,
      vibrationMmSec: 1.1,
      coolantTempCelsius: 21.4,
      feedRateMmMin: 1200,
      acousticEmissionsDb: 58
    },
    realStationId: 'queue_c1s4', // observed dataset mapping
    position3D: [-14, 0, 0]
  },
  {
    id: 'S02',
    name: 'Rough Turning Lathe #02',
    shortCode: 'LATHE-02',
    type: 'Rough Machining',
    zone: 'Zone A',
    status: 'HEALTHY',
    healthScore: 94.1,
    cycleTimeSec: 36.8,
    nominalCycleSec: 36.0,
    cycleVarianceSec: 1.2,
    capacityUnitsPerHour: 98,
    utilizationPct: 82.0,
    downtimeMinutesPerShift: 8.5,
    changeoverMinutes: 18.5,
    queueUnits: 45,
    queueMaxCapacity: 150,
    operatingCondition: {
      spindleRpm: 3400,
      vibrationMmSec: 2.4,
      coolantTempCelsius: 24.8,
      feedRateMmMin: 2100,
      acousticEmissionsDb: 72
    },
    realStationId: 'queue_c1s2', // observed dataset mapping
    position3D: [-8, 0, 0]
  },
  {
    id: 'S03',
    name: '5-Axis CNC Milling Center #04',
    shortCode: 'CNC-04',
    type: 'Precision Machining',
    zone: 'Zone B',
    status: 'CRITICAL',
    healthScore: 78.6,
    cycleTimeSec: 54.6,
    nominalCycleSec: 42.0,
    cycleVarianceSec: 7.8, // high variance
    capacityUnitsPerHour: 68,
    utilizationPct: 96.4, // bottleneck utilization
    downtimeMinutesPerShift: 38.2,
    changeoverMinutes: 28.0,
    queueUnits: 142, // high queue!
    queueMaxCapacity: 160,
    operatingCondition: {
      spindleRpm: 12800,
      vibrationMmSec: 6.8, // high vibration anomaly
      coolantTempCelsius: 38.6, // elevated temperature
      feedRateMmMin: 3400,
      acousticEmissionsDb: 89
    },
    realStationId: 'queue_c4s3', // observed dataset mapping
    position3D: [-2, 0, 0],
    isBottleneck: true
  },
  {
    id: 'S04',
    name: 'Robotic Finishing & Deburring',
    shortCode: 'DEBURR-01',
    type: 'Finishing & Deburring',
    zone: 'Zone B',
    status: 'HEALTHY',
    healthScore: 92.8,
    cycleTimeSec: 32.1,
    nominalCycleSec: 34.0,
    cycleVarianceSec: 1.1,
    capacityUnitsPerHour: 112,
    utilizationPct: 61.2, // underutilized buffer capacity
    downtimeMinutesPerShift: 5.0,
    changeoverMinutes: 10.0,
    queueUnits: 18,
    queueMaxCapacity: 100,
    operatingCondition: {
      spindleRpm: 8000,
      vibrationMmSec: 1.8,
      coolantTempCelsius: 22.0,
      feedRateMmMin: 1800,
      acousticEmissionsDb: 64
    },
    realStationId: 'queue_c4s4', // observed dataset mapping
    position3D: [4, 0, 0]
  },
  {
    id: 'S05',
    name: 'Multi-Spectral Optical Inspection',
    shortCode: 'AOI-SCAN',
    type: 'Automated Inspection',
    zone: 'Zone C',
    status: 'WARNING',
    healthScore: 88.5,
    cycleTimeSec: 28.4,
    nominalCycleSec: 28.0,
    cycleVarianceSec: 1.8,
    capacityUnitsPerHour: 125,
    utilizationPct: 88.2,
    downtimeMinutesPerShift: 11.0,
    changeoverMinutes: 6.0,
    queueUnits: 64,
    queueMaxCapacity: 120,
    operatingCondition: {
      spindleRpm: 0,
      vibrationMmSec: 0.8,
      coolantTempCelsius: 20.5,
      feedRateMmMin: 800,
      acousticEmissionsDb: 52
    },
    realStationId: 'queue_c2s4', // observed dataset mapping
    position3D: [10, 0, 0]
  },
  {
    id: 'S06',
    name: 'Automated Packaging & AGV Ingress',
    shortCode: 'PACK-AGV',
    type: 'Packaging & Dispatch',
    zone: 'Zone C',
    status: 'HEALTHY',
    healthScore: 97.2,
    cycleTimeSec: 21.0,
    nominalCycleSec: 22.0,
    cycleVarianceSec: 0.6,
    capacityUnitsPerHour: 160,
    utilizationPct: 54.0,
    downtimeMinutesPerShift: 2.0,
    changeoverMinutes: 8.0,
    queueUnits: 12,
    queueMaxCapacity: 90,
    operatingCondition: {
      spindleRpm: 0,
      vibrationMmSec: 0.5,
      coolantTempCelsius: 20.0,
      feedRateMmMin: 1500,
      acousticEmissionsDb: 56
    },
    realStationId: 'queue_c3s3', // observed dataset mapping
    position3D: [16, 0, 0]
  }
];

export const TOTAL_FACTORY_STATIONS_COUNT = 18;

export const PRODUCT_VARIANTS: ProductVariantInfo[] = [
  {
    id: 'Variant A',
    name: 'Precision Spindle Gear',
    code: 'PSG-720',
    nominalToleranceMm: 0.012,
    standardCycleSec: 184,
    unitValueUsd: 185.0,
    totalManufactured: 3420,
    defectCount: 82
  },
  {
    id: 'Variant B',
    name: 'Titanium Turbine Impeller',
    code: 'TTI-440',
    nominalToleranceMm: 0.008,
    standardCycleSec: 248,
    unitValueUsd: 290.0,
    totalManufactured: 2180,
    defectCount: 168 // Significantly elevated defect rate in B17!
  },
  {
    id: 'Variant C',
    name: 'High-Pressure Hydraulic Valve',
    code: 'HPV-910',
    nominalToleranceMm: 0.015,
    standardCycleSec: 162,
    unitValueUsd: 145.0,
    totalManufactured: 1890,
    defectCount: 41
  },
  {
    id: 'Variant D',
    name: 'Aero Sensor Housing',
    code: 'ASH-105',
    nominalToleranceMm: 0.020,
    standardCycleSec: 110,
    unitValueUsd: 88.0,
    totalManufactured: 2640,
    defectCount: 34
  }
];

export const INSPECTION_DATASET: InspectionRecord[] = [
  {
    productId: 'PRD-B17-4092',
    variant: 'Variant B',
    batchId: 'Batch B17',
    timestamp: '10:42:15 UTC',
    result: 'DEFECTIVE',
    defectType: 'Surface Micro-Crack & Chatter',
    defectFamily: 'Surface',
    confidence: 0.91,
    novelPatternSimilarity: 'N/A',
    defectLocation: { x: 62, y: 38, z: 12, label: 'Blade Root Fillet #03', severity: 'Severe' },
    stationOrigin: 'S03',
    inspectionCondition: {
      illuminationLux: 1420,
      sensorExposureMs: 4.2,
      feedVelocityMPerS: 0.8
    },
    associationHypothesis: 'Pattern is associated with increased cycle time variance and spindle vibration at Station 03 during Batch B17.',
    flaggedForHumanReview: false
  },
  {
    productId: 'PRD-B17-4105',
    variant: 'Variant B',
    batchId: 'Batch B17',
    timestamp: '10:44:02 UTC',
    result: 'DEFECTIVE',
    defectType: 'Thermal Scuffing & Edge Burn',
    defectFamily: 'Surface',
    confidence: 0.88,
    novelPatternSimilarity: 'N/A',
    defectLocation: { x: 78, y: 55, z: 8, label: 'Outer Shroud Perimeter', severity: 'Moderate' },
    stationOrigin: 'S03',
    inspectionCondition: {
      illuminationLux: 1420,
      sensorExposureMs: 4.2,
      feedVelocityMPerS: 0.8
    },
    associationHypothesis: 'Associated with elevated coolant thermal deviation (38.6°C) observed at Station 03.',
    flaggedForHumanReview: false
  },
  {
    productId: 'PRD-B17-4122',
    variant: 'Variant B',
    batchId: 'Batch B17',
    timestamp: '10:48:30 UTC',
    result: 'UNCERTAIN',
    defectType: 'Novel Multi-Harmonic Micro-Groove',
    defectFamily: 'Novel / Unknown',
    confidence: 0.42, // Low confidence
    novelPatternSimilarity: 'Low',
    defectLocation: { x: 45, y: 45, z: 15, label: 'Central Hub Inner Core', severity: 'Moderate' },
    stationOrigin: 'S03',
    inspectionCondition: {
      illuminationLux: 1450,
      sensorExposureMs: 3.8,
      feedVelocityMPerS: 0.75
    },
    associationHypothesis: 'Unseen geometric texture signature with low cosine similarity to known catalog classes. Suggested human forensic review.',
    flaggedForHumanReview: true
  },
  {
    productId: 'PRD-B17-4138',
    variant: 'Variant B',
    batchId: 'Batch B17',
    timestamp: '10:52:11 UTC',
    result: 'DEFECTIVE',
    defectType: 'Dimensional Tolerance Drift (+0.038mm)',
    defectFamily: 'Geometric',
    confidence: 0.94,
    novelPatternSimilarity: 'N/A',
    defectLocation: { x: 30, y: 70, z: 4, label: 'Secondary Datum Bore', severity: 'Moderate' },
    stationOrigin: 'S03',
    inspectionCondition: {
      illuminationLux: 1420,
      sensorExposureMs: 4.2,
      feedVelocityMPerS: 0.8
    },
    associationHypothesis: 'Correlates with tool thermal expansion and elevated radial vibration during prolonged heavy cuts.',
    flaggedForHumanReview: false
  },
  {
    productId: 'PRD-B17-4144',
    variant: 'Variant A',
    batchId: 'Batch B17',
    timestamp: '10:55:40 UTC',
    result: 'PASS',
    defectType: 'None',
    defectFamily: 'Surface',
    confidence: 0.99,
    novelPatternSimilarity: 'N/A',
    stationOrigin: 'S03',
    inspectionCondition: {
      illuminationLux: 1420,
      sensorExposureMs: 4.2,
      feedVelocityMPerS: 0.8
    },
    associationHypothesis: 'Conforms to nominal CAD reference envelope.',
    flaggedForHumanReview: false
  },
  {
    productId: 'PRD-B16-3980',
    variant: 'Variant C',
    batchId: 'Batch B16',
    timestamp: '09:12:00 UTC',
    result: 'PASS',
    defectType: 'None',
    defectFamily: 'Surface',
    confidence: 0.98,
    novelPatternSimilarity: 'N/A',
    stationOrigin: 'S02',
    inspectionCondition: {
      illuminationLux: 1400,
      sensorExposureMs: 4.0,
      feedVelocityMPerS: 0.8
    },
    associationHypothesis: 'No significant anomalies detected in Batch B16.',
    flaggedForHumanReview: false
  }
];

export const INITIAL_ECONOMIC_BASELINE: EconomicBaseline = {
  unitCostUsd: 145.0,
  scrapCostPerUnitUsd: 128.0,
  reworkCostPerUnitUsd: 42.0,
  productionValuePerHourUsd: 38500.0,
  downtimeCostPerHourUsd: 14200.0,
  targetMarginPct: 29.4,
  expectedMarginTotalUsd: 512000.0,
  actualScrapLossUsd: 31400.0,
  actualReworkLossUsd: 18900.0,
  actualDowntimeLossUsd: 24600.0,
  actualThroughputLossUsd: 41200.0
};

export const INITIAL_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'REC-01',
    title: 'Dynamic Workload Offload: S03 → S04',
    stationId: 'S03',
    priority: 'HIGH',
    category: 'Load Balancing',
    reason: 'Station 03 (CNC-04) is operating near peak capacity (96.4% utilization) with 142-unit queue accumulation.',
    evidence: [
      'Station 03 utilization sustained at 96.4% across last 4 shifts',
      'Cycle time variance expanded by +6.6s above nominal (42.0s → 54.6s)',
      'Station 04 buffer has 38.8% idle headroom'
    ],
    expectedEffect: 'Relieves bottleneck pressure, cuts queue from 142 to 78 units, and recovers +12.4% throughput.',
    confidencePct: 92,
    simulatedDelta: {
      throughputPct: 12.4,
      marginUsd: 38400,
      queueReductionUnits: 64,
      defectRateDeltaPct: -1.6
    }
  },
  {
    id: 'REC-02',
    title: 'Adaptive Spindle Dampening for Variant B',
    stationId: 'S03',
    priority: 'HIGH',
    category: 'Feed Rate Adjustment',
    reason: 'Variant B Titanium Impeller exhibits resonant harmonics at 12,800 RPM resulting in blade fillet chatter.',
    evidence: [
      'Defect frequency in Variant B increased by 310% during Batch B17',
      'Vibration sensor reading 6.8 mm/s on Spindle Bearing #02 during finish pass',
      'Cosine correlation r = 0.87 between spindle heat and micro-crack incidence'
    ],
    expectedEffect: 'Reduces surface chatter rejects by 74%, mitigating scrap costs by ~$22,000/shift.',
    confidencePct: 88,
    simulatedDelta: {
      throughputPct: 4.8,
      marginUsd: 22100,
      queueReductionUnits: 18,
      defectRateDeltaPct: -2.8
    }
  },
  {
    id: 'REC-03',
    title: 'Predictive Service Dispatch: Spindle Bearing #02',
    stationId: 'S03',
    priority: 'MEDIUM',
    category: 'Tool Re-calibration',
    reason: 'Sub-harmonic vibration spectral peaks indicate mechanical wear on rear shaft bearing.',
    evidence: [
      'Vibration envelope velocity 6.8 mm/s (threshold: 4.5 mm/s)',
      'Bearing thermal rise to 38.6°C (+14.2°C above baseline)',
      'Acoustic emission spikes during high-load roughing'
    ],
    expectedEffect: 'Preempts catastrophic spindle lockup, preventing an estimated 6.5 hours of unplanned downtime.',
    confidencePct: 84,
    simulatedDelta: {
      throughputPct: 6.2,
      marginUsd: 17800,
      queueReductionUnits: 22,
      defectRateDeltaPct: -0.9
    }
  }
];

export const MACHINE_COMPONENTS: MachineComponentDiagnostic[] = [
  {
    id: 'comp-rotor',
    name: 'High-Torque Synchronous Rotor',
    role: 'Magnetic flux generation & primary rotational core',
    healthScore: 94.0,
    temperatureCelsius: 41.2,
    vibrationMmSec: 1.4,
    wearPct: 8.0,
    condition: 'Optimal',
    diagnosticAnomaly: null,
    offsetExploded: [0, 0, -2.5]
  },
  {
    id: 'comp-stator',
    name: 'Precision Stator Housing & Coils',
    role: 'Static electromagnetic field induction',
    healthScore: 96.5,
    temperatureCelsius: 38.0,
    vibrationMmSec: 0.9,
    wearPct: 5.0,
    condition: 'Optimal',
    diagnosticAnomaly: null,
    offsetExploded: [0, 0, 0]
  },
  {
    id: 'comp-shaft',
    name: 'Hardened Chrome-Steel Spindle Shaft',
    role: 'Kinematic power transmission to tool arbor',
    healthScore: 89.0,
    temperatureCelsius: 44.5,
    vibrationMmSec: 2.8,
    wearPct: 15.0,
    condition: 'Optimal',
    diagnosticAnomaly: 'Minor eccentricity runout detected within 0.003mm',
    offsetExploded: [0, 0, 2.5]
  },
  {
    id: 'comp-bearing-01',
    name: 'Bearing #01 (Front Ceramic Angular Contact)',
    role: 'Axial thrust containment at spindle nose',
    healthScore: 92.0,
    temperatureCelsius: 36.2,
    vibrationMmSec: 1.8,
    wearPct: 11.0,
    condition: 'Optimal',
    diagnosticAnomaly: null,
    offsetExploded: [0, 2.0, 1.8]
  },
  {
    id: 'comp-bearing-02',
    name: 'Bearing #02 (Rear Support Deep-Groove)',
    role: 'Radial stability & harmonic dampening at drive tail',
    healthScore: 68.4,
    temperatureCelsius: 58.6,
    vibrationMmSec: 6.8, // High anomaly!
    wearPct: 42.0,
    condition: 'Degraded',
    diagnosticAnomaly: 'Elevated cage frequency sidebands and localized raceway micro-pitting.',
    offsetExploded: [0, -2.0, -1.8]
  },
  {
    id: 'comp-cooling-fan',
    name: 'Variable-Speed Forced Cooling Impeller',
    role: 'Thermal heat dissipation across stator sleeve',
    healthScore: 88.0,
    temperatureCelsius: 29.5,
    vibrationMmSec: 1.6,
    wearPct: 14.0,
    condition: 'Optimal',
    diagnosticAnomaly: null,
    offsetExploded: [0, 0, -4.2]
  },
  {
    id: 'comp-sensor-temp',
    name: 'PT100 Resistance Temperature Detector',
    role: 'Real-time telemetry on bearing junction temperature',
    healthScore: 98.0,
    temperatureCelsius: 24.0,
    vibrationMmSec: 0.1,
    wearPct: 2.0,
    condition: 'Optimal',
    diagnosticAnomaly: null,
    offsetExploded: [1.8, 1.2, 0]
  },
  {
    id: 'comp-sensor-vib',
    name: 'High-Frequency Triaxial Accelerometer',
    role: 'Continuous vibration velocity and crest factor monitoring',
    healthScore: 99.0,
    temperatureCelsius: 24.0,
    vibrationMmSec: 0.1,
    wearPct: 1.0,
    condition: 'Optimal',
    diagnosticAnomaly: null,
    offsetExploded: [-1.8, 1.2, 0]
  }
];

export const INITIAL_WORKER_DISPATCH: WorkerDispatch = {
  id: 'TASK-W9102',
  workerName: 'Elena Rostova',
  workerId: 'TECH-740',
  role: 'Senior Mechatronics Specialist',
  avatar: 'ER',
  machineId: 'CNC-04 (Station 03)',
  issue: 'Bearing Anomaly & Resonant Harmonic Spikes on Rear Shaft',
  distanceMeters: 38,
  priority: 'HIGH',
  status: 'PENDING',
  etaSeconds: 45
};

export const ROOT_CAUSE_TREE: RootCauseNode = {
  id: 'node-defect',
  title: 'Surface Micro-Crack & Chatter',
  category: 'Defect',
  subtext: 'Observed defect family in 7.7% of Batch B17 inspection records',
  evidenceWeight: 94,
  correlationFactor: 0.91,
  sampleCount: 168,
  caveatNote: 'Observationally linked to mechanical vibration and thermal drift; advisory correlation only.',
  childrenIds: ['node-batch']
};

export const ROOT_CAUSE_ALL_NODES: RootCauseNode[] = [
  {
    id: 'node-defect',
    title: 'Surface Micro-Crack & Chatter',
    category: 'Defect',
    subtext: 'Observed defect family in 7.7% of Batch B17 inspection records',
    evidenceWeight: 94,
    correlationFactor: 0.91,
    sampleCount: 168,
    caveatNote: 'Observationally linked to mechanical vibration and thermal drift; advisory correlation only.',
    childrenIds: ['node-batch']
  },
  {
    id: 'node-batch',
    title: 'Batch B17 Production Run',
    category: 'Batch',
    subtext: 'Shift 02-B, 2,180 total units processed under accelerated schedule',
    evidenceWeight: 89,
    correlationFactor: 0.87,
    sampleCount: 2180,
    caveatNote: 'Material batch inspection of raw titanium billets showed normal tensile compliance (no pre-existing metal flaws).',
    childrenIds: ['node-station']
  },
  {
    id: 'node-station',
    title: 'Station 03 (5-Axis CNC-04)',
    category: 'Station',
    subtext: 'Constrained bottleneck node; 96.4% utilization with 142-unit queue',
    evidenceWeight: 92,
    correlationFactor: 0.93,
    sampleCount: 420,
    caveatNote: 'Strong spatial association: 89% of chatter defects originated during the finishing pass at this specific spindle.',
    childrenIds: ['node-cond-temp', 'node-cond-vib', 'node-cond-time']
  },
  {
    id: 'node-cond-temp',
    title: 'Coolant Thermal Rise (+14.2°C)',
    category: 'Condition',
    subtext: 'Operating temperature rose from 24.4°C baseline to 38.6°C',
    evidenceWeight: 82,
    correlationFactor: 0.79,
    sampleCount: 310,
    caveatNote: 'Potential thermal expansion contributor to localized edge burning on turbine blades.'
  },
  {
    id: 'node-cond-vib',
    title: 'Spindle Bearing Harmonic Spike (6.8 mm/s)',
    category: 'Condition',
    subtext: 'High-frequency accelerometer detected sub-harmonics on Bearing #02',
    evidenceWeight: 95,
    correlationFactor: 0.94,
    sampleCount: 412,
    caveatNote: 'Directly accounts for blade root surface scalloping and micro-crack initiation.'
  },
  {
    id: 'node-cond-time',
    title: 'Cycle Variance Stagnation (+6.6s)',
    category: 'Metric',
    subtext: 'Extended tool engagement time under heavy tool deflection',
    evidenceWeight: 78,
    correlationFactor: 0.71,
    sampleCount: 180,
    caveatNote: 'Indicates machine stalling or adaptive feed-limiting kicking in under load.'
  }
];

export const MOCK_STATIONS = INITIAL_STATIONS;
export const MOCK_AI_RECOMMENDATIONS = INITIAL_AI_RECOMMENDATIONS;
export const MACHINE_COMPONENT_DIAGNOSTICS = MACHINE_COMPONENTS;
