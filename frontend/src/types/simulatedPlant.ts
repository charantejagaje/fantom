export type PlantQualityStatus = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'STOP RECOMMENDED';

export type PlantProductionStatus = 
  | 'RUNNING' 
  | 'PAUSED — SIMULATED' 
  | 'UNDER REVIEW' 
  | 'QUALITY HOLD — SIMULATED' 
  | 'INSPECTION REQUIRED'
  | 'NORMAL';

export type ImageQualityGroup = 'GOOD' | 'ATTENTION' | 'DEFECTIVE' | 'CRITICAL';

export interface SimulatedPlantArea {
  id: string;
  name: string;
  line: string;
  currentBatch: string;
  productsProcessed: number;
  defectsDetected: number;
  criticalDefects: number;
  qualityStatus: PlantQualityStatus;
  inspectionStatus: 'ACTIVE' | 'ELEVATED' | 'HOLD' | 'RECHECK_REQUIRED';
  productionStatus: PlantProductionStatus;
  operatorInCharge: string;
  cycleTimeSec: number;
  lastInspectionTime: string;
}

export interface SimulatedInspectionImage {
  id: string;
  plantAreaId: string;
  plantAreaName: string;
  productionLine: string;
  batchNumber: string;
  component: string;
  qualityGroup: ImageQualityGroup;
  defectType: string;
  severity: 'CRITICAL' | 'WARNING' | 'LOW' | 'NORMAL';
  confidenceScore: number;
  imageUrl: string;
  inspectionTimestamp: string;
  summary: string;
  visualEvidence: string[];
  possibleCauses: string[];
  recommendedNextStep: string;
  isCrack: boolean;
  requiresReview: boolean;
  reviewedByEngineer?: boolean;
}

export interface SimulatedBatch {
  id: string;
  batchNumber: string;
  component: string;
  productionLine: string;
  inspectionArea: string;
  totalInspected: number;
  passed: number;
  defects: number;
  critical: number;
  attentionCount: number;
  qualityStatus: PlantQualityStatus;
  productionStatus: PlantProductionStatus;
  crackCount: number;
  startTime: string;
  notes: string;
}

export interface EngineeringActionRecord {
  id: string;
  timestamp: string;
  engineerAction: string;
  batchNumber: string;
  productionLine: string;
  reason: string;
  result: 'SIMULATED';
  details?: string;
}

export interface SimulatedWorkerInstruction {
  id: string;
  timestamp: string;
  area: string;
  batchNumber: string;
  instructionText: string;
  status: 'SIMULATED COMMAND';
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
}

export interface DefectPatternData {
  defectName: string;
  batchHistory: {
    batchNumber: string;
    detectedCount: number;
    severity: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  }[];
  observation: string;
  recommendation: string;
  isRepeatedPattern: boolean;
}

export type StreamStatus = 'RUNNING' | 'PAUSED';
export type StreamSpeed = 'SLOW' | 'NORMAL' | 'FAST';

export interface RollingStreamStats {
  totalCount: number; // in window (e.g. last 20)
  goodCount: number;
  attentionCount: number;
  defectCount: number;
  crackCount: number;
  defectRatePct: number;
  crackRatePct: number;
  escalationLevel: 'NORMAL' | 'REVIEW' | 'WARNING' | 'HIGH_ALERT' | 'CRITICAL_ALERT';
  escalationTitle: string;
  escalationMessage: string;
  stopRecommended: boolean;
  affectedBatchId: string;
  affectedLine: string;
}

export interface LiveInspectionEvent {
  inspection_id: string;
  sequenceNumber: number;
  timestamp: string;
  batch_id: string;
  line_id: string;
  station: string;
  component: string;
  image: string;
  result: 'GOOD' | 'DEFECT' | 'CRACK';
  defect_type: string;
  confidence: number;
  severity: 'NORMAL' | 'LOW' | 'WARNING' | 'CRITICAL';
  evidence: string[];
  possible_causes: string[];
  recommended_action: string;
  action_steps: string[];
  status: 'COMPLETED' | 'HOLD_RECOMMENDED';
  isCrack: boolean;
  requiresReview: boolean;
  isAuthenticNeuDet: boolean;
  datasetDefectClass: 'normal' | 'scratches' | 'patches' | 'inclusion' | 'crazing' | 'rolled-in_scale' | 'pitted_surface';
  boundingBoxes?: Array<{
    id: string;
    name: string;
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    confidence?: number;
  }>;
}
