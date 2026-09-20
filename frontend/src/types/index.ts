export type StationStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';
export type InspectionResult = 'PASS' | 'DEFECTIVE' | 'UNCERTAIN';
export type ProductVariantId = 'Variant A' | 'Variant B' | 'Variant C' | 'Variant D';

// ==========================================
// ROLE-BASED ACCESS CONTROL & USER MODELS
// ==========================================
export type UserRole = 'OWNER' | 'ENGINEER' | 'WORKER';
export type UserStatus = 'ONLINE' | 'BUSY' | 'OFFLINE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  location?: string;
  status?: UserStatus;
  skills?: string[];
}

export interface WorkerUser extends User {
  role: 'WORKER';
  workerId: string;
  zone: string;
  zoneLocation: {
    x: number;
    y: number;
  };
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  skills: string[];
  currentTaskId?: string;
  phone?: string;
}

// ==========================================
// SHARED INCIDENT & COMMUNICATION MODELS
// ==========================================
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 
  | 'OPEN' 
  | 'ACKNOWLEDGED' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED';

export interface Incident {
  id: string;
  machineId: string;
  stationId: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  detectedAt: string;
  status: IncidentStatus;
  assignedEngineerId?: string;
  assignedWorkerId?: string;
  aiDiagnosis?: string;
  confidence?: number;
  recommendedAction?: string;
  // Cross-role context
  estimatedFinancialImpactUsd?: number;
  queueUnitsThrottled?: number;
  targetComponent?: string;
  acknowledgedByOwner?: boolean;
  acknowledgedByEngineer?: boolean;
  resolvedAt?: string;
}

export type MessageType = 'TEXT' | 'SYSTEM' | 'STATUS_UPDATE' | 'AI_ALERT';

export interface IncidentMessage {
  id: string;
  incidentId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  type: MessageType;
}

// ==========================================
// WORKER TASK STATE MACHINE
// ==========================================
export type WorkerTaskState = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'NAVIGATING'
  | 'ARRIVED'
  | 'INSPECTING'
  | 'REPAIRING'
  | 'COMPLETED';

export interface MaintenanceTask {
  id: string;
  incidentId: string;
  machineId: string;
  stationId: string;
  targetComponent: string;
  issue: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  state: WorkerTaskState;
  distanceMeters: number;
  etaSeconds: number;
  createdAt: string;
  completedAt?: string;
  steps: {
    id: string;
    label: string;
    completed: boolean;
    details?: string;
  }[];
  notes?: string[];
}

// ==========================================
// ROLE-SPECIFIC NOTIFICATIONS
// ==========================================
export interface RoleNotification {
  id: string;
  role: UserRole | 'ALL';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  incidentId?: string;
  actionLabel?: string;
}

export interface ProductVariantInfo {
  id: ProductVariantId;
  name: string;
  code: string;
  nominalToleranceMm: number;
  standardCycleSec: number;
  unitValueUsd: number;
  totalManufactured: number;
  defectCount: number;
}

export interface DefectCoordinate {
  x: number;
  y: number;
  z?: number;
  label: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
}

export interface InspectionRecord {
  productId: string;
  variant: ProductVariantId;
  batchId: string;
  timestamp: string;
  result: InspectionResult;
  defectType: string;
  defectFamily: 'Surface' | 'Geometric' | 'Metallurgical' | 'Novel / Unknown';
  confidence: number;
  novelPatternSimilarity: 'High' | 'Medium' | 'Low' | 'N/A';
  defectLocation?: DefectCoordinate;
  stationOrigin: string;
  inspectionCondition: {
    illuminationLux: number;
    sensorExposureMs: number;
    feedVelocityMPerS: number;
  };
  associationHypothesis: string;
  flaggedForHumanReview: boolean;
}

export interface StationTelemetry {
  id: string;
  name: string;
  shortCode: string;
  /** Observed dataset column this demo station maps to (e.g. 'queue_c1s2'); optional demo-only field. */
  realStationId?: string;
  type: string;
  zone: 'Zone A' | 'Zone B' | 'Zone C';
  status: StationStatus;
  healthScore: number;
  cycleTimeSec: number;
  nominalCycleSec: number;
  cycleVarianceSec: number;
  capacityUnitsPerHour: number;
  utilizationPct: number;
  downtimeMinutesPerShift: number;
  changeoverMinutes: number;
  queueUnits: number;
  queueMaxCapacity: number;
  operatingCondition: {
    spindleRpm: number;
    vibrationMmSec: number;
    coolantTempCelsius: number;
    feedRateMmMin: number;
    acousticEmissionsDb: number;
  };
  position3D: [number, number, number];
  isBottleneck?: boolean;
}

export interface EconomicBaseline {
  unitCostUsd: number;
  scrapCostPerUnitUsd: number;
  reworkCostPerUnitUsd: number;
  productionValuePerHourUsd: number;
  downtimeCostPerHourUsd: number;
  targetMarginPct: number;
  expectedMarginTotalUsd: number;
  actualScrapLossUsd: number;
  actualReworkLossUsd: number;
  actualDowntimeLossUsd: number;
  actualThroughputLossUsd: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  stationId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Load Balancing' | 'Tool Re-calibration' | 'Thermal Compensation' | 'Feed Rate Adjustment';
  reason: string;
  evidence: string[];
  expectedEffect: string;
  confidencePct: number;
  simulatedDelta: {
    throughputPct: number;
    marginUsd: number;
    queueReductionUnits: number;
    defectRateDeltaPct: number;
  };
}

export interface MachineComponentDiagnostic {
  id: string;
  name: string;
  role: string;
  healthScore: number;
  temperatureCelsius: number;
  vibrationMmSec: number;
  wearPct: number;
  condition: 'Optimal' | 'Caution' | 'Degraded';
  diagnosticAnomaly: string | null;
  offsetExploded: [number, number, number];
}

export interface WorkerDispatch {
  id: string;
  workerName: string;
  workerId: string;
  role: string;
  avatar: string;
  machineId: string;
  issue: string;
  distanceMeters: number;
  priority: 'HIGH' | 'MEDIUM';
  status: 'PENDING' | 'ACCEPTED' | 'NAVIGATING' | 'ARRIVED' | 'RESOLVED';
  etaSeconds: number;
}

export interface SimulationParameters {
  cycleTimeMultiplier: number;
  capacityUnitsPerHour: number;
  plannedDowntimeMinutes: number;
  changeoverMinutes: number;
  targetDefectRatePct: number;
  inspectionSamplingRatePct: number;
  batchSizeUnits: number;
  loadBalanceShiftPct: number; // workload transferred from S03 to S04
  feedRateOptimizationPct: number;
}

export interface SimulationResultMetrics {
  throughputUnits: number;
  bottleneckQueueUnits: number;
  overallDefectRatePct: number;
  scrapLossUsd: number;
  reworkLossUsd: number;
  downtimeLossUsd: number;
  estimatedMarginUsd: number;
  marginRatePct: number;
}

export interface RootCauseNode {
  id: string;
  title: string;
  category: 'Defect' | 'Batch' | 'Station' | 'Condition' | 'Metric';
  subtext: string;
  evidenceWeight: number; // 0 to 100
  correlationFactor: number; // 0 to 1
  sampleCount: number;
  caveatNote: string;
  childrenIds?: string[];
}

// ==========================================
// PRECISION METAL-COMPONENT MANUFACTURING TYPES
// ==========================================

export type ProductionStageId = 
  | 'RAW_MATERIAL' 
  | 'CNC_MACHINING' 
  | 'WASHING_FINISHING' 
  | 'QUALITY_INSPECTION' 
  | 'PACKING';

export type ConfidenceState = 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'NEEDS REVIEW';

export type DemoScenarioKey = 
  | 'NORMAL_PRODUCTION' 
  | 'INCREASING_DEFECT_RATE' 
  | 'CNC_BOTTLENECK' 
  | 'HIGH_UNCERTAINTY' 
  | 'COMBINED_IMPACT';

export interface PrecisionMetalUnit {
  unit_id: string;
  batch_id: string;
  machine_id: string;
  production_stage: 'Raw Material' | 'CNC Machining' | 'Washing / Finishing' | 'Quality Inspection' | 'Packing';
  prediction: 'ACCEPTABLE' | 'DEFECTIVE';
  confidence: number; // 0.0 - 1.0
  confidenceState: ConfidenceState;
  defect_type: string;
  defect_family: 'Surface' | 'Geometric' | 'Metallurgical' | 'Tooling' | 'None';
  hasLocalization: boolean;
  boundingBoxes?: Array<{
    id: string;
    name: string;
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    confidence?: number;
  }>;
  localImageUrl?: string;
  remoteImageUrl?: string;
  normalReferenceUrl?: string;
  relatedProcessVariables: {
    spindleRpm?: number;
    vibrationMmSec: number;
    coolantFlowLpm?: number;
    coolantTempCelsius: number;
    feedRateMmMin?: number;
    cycleTimeSec: number;
    downtimeMinutes: number;
    toolWearHours?: number;
    acousticDb?: number;
    dimensionalDeviationMm?: number;
  };
  modelStatus: string;
  observedDefectInfo: string;
  whyFlagged: string;
  requiresHumanReview: boolean;
  inspectionTimestamp: string;
  scrapCostUsd: number;
  reworkCostUsd: number;
}

export interface ObservedAssociationFactor {
  factor: string;
  subsystem: string;
  observedAssociationStrength: number; // 0 - 100%
  evidenceDescription: string;
  investigationProtocol: string;
  status: 'SUSPECTED' | 'EVALUATING' | 'MONITORED';
}

export interface StageBottleneckMetric {
  stageId: ProductionStageId;
  stageName: string;
  stationId: string;
  machineId: string;
  utilizationPct: number;
  averageCycleTimeSec: number;
  nominalCycleTimeSec: number;
  downtimeMinutes: number;
  throughputUnitsPerHour: number;
  nominalThroughputUnitsPerHour: number;
  bottleneckScore: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  isBottleneck: boolean;
  highlightReason: string;
  queueUnits: number;
  queueMax: number;
}

export interface ThroughputLossImpact {
  currentThroughputUnitsHr: number;
  nominalThroughputUnitsHr: number;
  throughputDeficitUnitsHr: number;
  affectedUnitsTotal: number;
  scrapUnitsTotal: number;
  reworkUnitsTotal: number;
  bottleneckStarvationMinutes: number;
  downtimeHoursPerShift: number;
}

export interface EconomicLossBreakdown {
  scrapCostUsd: number;
  reworkCostUsd: number;
  downtimeCostUsd: number;
  throughputOpportunityLossUsd: number;
  totalEstimatedLossUsd: number;
  calculationFormulas: {
    scrapFormula: string;
    reworkFormula: string;
    downtimeFormula: string;
    throughputFormula: string;
  };
  assumptions: string[];
}

export interface ExplainableRecommendation {
  id: string;
  title: string;
  stationId: string;
  stageName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  what: string;
  why: string;
  evidence: string[];
  expectedImpact: string;
  status: 'OPEN' | 'APPROVED' | 'SIMULATING' | 'COMPLETED';
  simulatedImprovement: {
    cycleTimeReductionSec: number;
    throughputIncreasePct: number;
    lossReductionUsd: number;
    defectReductionPct: number;
  };
}

export interface ModelEvaluationSummary {
  modelName: 'Random Forest (Primary)' | 'Logistic Regression (Baseline)';
  task: 'ACCEPTABLE vs DEFECTIVE';
  datasetSplit: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  individualPredictionConfidence: number;
  demoDataLabel: 'ILLUSTRATIVE — DEMO DATA';
}
