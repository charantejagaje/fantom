import { create } from 'zustand';
import { 
  SimulatedPlantArea, 
  SimulatedBatch, 
  SimulatedInspectionImage, 
  EngineeringActionRecord, 
  SimulatedWorkerInstruction,
  DefectPatternData,
  ImageQualityGroup,
  PlantProductionStatus,
  LiveInspectionEvent,
  StreamStatus,
  StreamSpeed,
  RollingStreamStats
} from '../types/simulatedPlant';
import {
  INITIAL_SIMULATED_AREAS,
  INITIAL_SIMULATED_BATCHES,
  INITIAL_SIMULATED_IMAGES,
  INITIAL_DEFECT_PATTERNS,
  INITIAL_ENGINEERING_ACTIONS,
  INITIAL_WORKER_INSTRUCTIONS
} from '../data/simulatedPlantData';
import { DEMO_INSPECTION_SEQUENCE } from '../data/inspectionStreamSequence';

// Helper to calculate rolling stats over recent window of inspections
function computeRollingStats(
  current: LiveInspectionEvent,
  history: LiveInspectionEvent[]
): RollingStreamStats {
  const windowEvents = [current, ...history].slice(0, 20);
  const totalCount = windowEvents.length;

  let goodCount = 0;
  let attentionCount = 0;
  let defectCount = 0;
  let crackCount = 0;

  for (const ev of windowEvents) {
    if (ev.result === 'GOOD') {
      goodCount++;
    } else if (ev.result === 'CRACK') {
      crackCount++;
    } else {
      defectCount++;
    }
    if (ev.severity === 'LOW') {
      attentionCount++;
    }
  }

  const defectRatePct = totalCount > 0 ? Math.round(((defectCount + crackCount) / totalCount) * 100) : 0;
  const crackRatePct = totalCount > 0 ? Math.round((crackCount / totalCount) * 100) : 0;

  // Escalation determination
  let escalationLevel: RollingStreamStats['escalationLevel'] = 'NORMAL';
  let stopRecommended = false;
  let escalationTitle = 'STREAM STABLE';
  let escalationMessage = 'Rolling defect rate is within nominal 0.5% tolerance.';

  // Trigger critical alert when multiple cracks are observed (e.g. >= 2 in window or critical run)
  if (crackCount >= 2 || (current.sequenceNumber >= 51 && current.isCrack)) {
    escalationLevel = 'CRITICAL_ALERT';
    stopRecommended = true;
    escalationTitle = 'CRITICAL QUALITY ALERT';
    escalationMessage = `${crackCount} crack indications detected in the last ${totalCount} inspections on Batch ${current.batch_id} (${current.line_id}).`;
  } else if (crackCount === 1) {
    escalationLevel = 'HIGH_ALERT';
    stopRecommended = false;
    escalationTitle = 'HIGH ALERT // CRACK INDICATION';
    escalationMessage = `Crack indication observed on Batch ${current.batch_id}. Elevated monitoring active.`;
  } else if (defectRatePct > 15) {
    escalationLevel = 'WARNING';
    stopRecommended = false;
    escalationTitle = 'QUALITY WARNING // ELEVATED DEFECT RATE';
    escalationMessage = `Defect rate reached ${defectRatePct}% across recent inspections.`;
  } else if (defectRatePct > 5) {
    escalationLevel = 'REVIEW';
    stopRecommended = false;
    escalationTitle = 'QUALITY REVIEW // OCCASIONAL DEFECTS';
    escalationMessage = 'Minor isolated defects detected. Stream within watch limits.';
  }

  return {
    totalCount,
    goodCount,
    attentionCount,
    defectCount,
    crackCount,
    defectRatePct,
    crackRatePct,
    escalationLevel,
    escalationTitle,
    escalationMessage,
    stopRecommended,
    affectedBatchId: current.batch_id,
    affectedLine: current.line_id
  };
}

interface SimulatedPlantState {
  // Continuous Simulated Inspection Stream
  streamStatus: StreamStatus;
  streamSpeed: StreamSpeed;
  currentInspectionIndex: number;
  currentInspection: LiveInspectionEvent;
  inspectionHistory: LiveInspectionEvent[];
  streamInspectionQueue: LiveInspectionEvent[];
  rollingStats: RollingStreamStats;
  criticalAlertDismissed: boolean;

  // Stream Actions
  startStream: () => void;
  pauseStream: () => void;
  resumeStream: () => void;
  setStreamSpeed: (speed: StreamSpeed) => void;
  nextInspection: () => void;
  selectInspection: (index: number) => void;
  resetDemo: () => void;
  tickStream: () => void;
  dismissCriticalAlert: () => void;
  continueMonitoring: () => void;

  // Core Entities
  areas: SimulatedPlantArea[];
  batches: SimulatedBatch[];
  images: SimulatedInspectionImage[];
  defectPatterns: DefectPatternData;
  actionHistory: EngineeringActionRecord[];
  workerInstructions: SimulatedWorkerInstruction[];

  // Selection & Filter State
  selectedAreaId: string;
  selectedBatchId: string;
  qualityFilter: 'ALL' | ImageQualityGroup;
  areaFilter: string;
  searchQuery: string;

  // Active Modals & Workflows
  showCriticalStopModal: boolean;
  showCrackWorkflowModal: boolean;
  selectedCrackImage: SimulatedInspectionImage | null;
  activeInspectionImage: SimulatedInspectionImage | null;
  lastSimulatedActionNotice: string | null;
  demoPlantMode: boolean;

  // Setters & Modal Triggers
  setSelectedAreaId: (id: string) => void;
  setSelectedBatchId: (id: string) => void;
  setQualityFilter: (filter: 'ALL' | ImageQualityGroup) => void;
  setAreaFilter: (areaId: string) => void;
  setSearchQuery: (q: string) => void;
  setShowCriticalStopModal: (show: boolean) => void;
  openCrackWorkflow: (img?: SimulatedInspectionImage) => void;
  closeCrackWorkflow: () => void;
  setActiveInspectionImage: (img: SimulatedInspectionImage | null) => void;
  toggleDemoPlantMode: () => void;
  dismissActionNotice: () => void;

  // Engineer Virtual Production Decision Actions
  pauseLine: (lineName: string, reason?: string) => void;
  resumeLine: (lineName: string) => void;
  holdBatch: (batchId: string, reason?: string) => void;
  releaseBatchForReview: (batchId: string) => void;
  increaseInspection: (batchId: string) => void;
  requestRecheck: (batchId: string) => void;
  escalateQualityIssue: (batchId: string) => void;
  markForEngineeringReview: (batchId: string) => void;
  acknowledgeAndSimulateStop: (batchId: string) => void;

  // Worker Instructions
  issueWorkerInstruction: (text: string, area?: string, batchId?: string, priority?: 'NORMAL' | 'URGENT' | 'CRITICAL') => void;

  // Bridge from AI Intervention Studio
  addInterventionImage: (data: {
    defectName: string;
    severity: 'CRITICAL' | 'WARNING' | 'LOW' | 'NORMAL';
    confidence: number;
    imageUrl: string;
    summary: string;
    visualEvidence: string[];
    possibleCauses: string[];
    recommendedNextStep: string;
    isCrack?: boolean;
    batchId?: string;
  }) => void;
}

// Initial index: Start at index 41 (Inspection #042) so live viewers immediately experience
// the escalation leading into the critical crack sequence within 10-15 seconds!
const INITIAL_INSPECTION_INDEX = 41;
const initialInspection = DEMO_INSPECTION_SEQUENCE[INITIAL_INSPECTION_INDEX] || DEMO_INSPECTION_SEQUENCE[0];
const initialHistory = DEMO_INSPECTION_SEQUENCE.slice(Math.max(0, INITIAL_INSPECTION_INDEX - 15), INITIAL_INSPECTION_INDEX).reverse();
const initialStats = computeRollingStats(initialInspection, initialHistory);

export const useSimulatedPlantStore = create<SimulatedPlantState>((set, get) => ({
  // Continuous Simulated Inspection Stream State
  streamStatus: 'RUNNING',
  streamSpeed: 'NORMAL',
  currentInspectionIndex: INITIAL_INSPECTION_INDEX,
  currentInspection: initialInspection,
  inspectionHistory: initialHistory,
  streamInspectionQueue: DEMO_INSPECTION_SEQUENCE,
  rollingStats: initialStats,
  criticalAlertDismissed: false,

  // Stream Actions
  startStream: () => set({ streamStatus: 'RUNNING' }),
  pauseStream: () => set({ streamStatus: 'PAUSED' }),
  resumeStream: () => set({ streamStatus: 'RUNNING' }),
  setStreamSpeed: (speed) => set({ streamSpeed: speed }),

  nextInspection: () => {
    get().tickStream();
  },

  selectInspection: (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, DEMO_INSPECTION_SEQUENCE.length - 1));
    const targetEvent = DEMO_INSPECTION_SEQUENCE[clampedIndex];
    const newHistory = [targetEvent, ...get().inspectionHistory.slice(0, 40)];
    const newStats = computeRollingStats(targetEvent, newHistory);

    set({
      currentInspectionIndex: clampedIndex,
      currentInspection: targetEvent,
      inspectionHistory: newHistory,
      rollingStats: newStats,
      selectedBatchId: targetEvent.batch_id,
      selectedAreaId: targetEvent.station.includes('Final') ? 'AREA-06' : 'AREA-05'
    });
  },

  resetDemo: () => {
    const firstEvent = DEMO_INSPECTION_SEQUENCE[0];
    const cleanStats = computeRollingStats(firstEvent, []);

    set({
      currentInspectionIndex: 0,
      currentInspection: firstEvent,
      inspectionHistory: [firstEvent],
      rollingStats: cleanStats,
      streamStatus: 'RUNNING',
      showCriticalStopModal: false,
      showCrackWorkflowModal: false,
      criticalAlertDismissed: false,
      selectedBatchId: 'B-2046',
      selectedAreaId: 'AREA-05',
      areas: INITIAL_SIMULATED_AREAS.map((a) => ({
        ...a,
        productionStatus: 'RUNNING',
        qualityStatus: a.id === 'AREA-06' ? 'WATCH' : a.qualityStatus,
        defectsDetected: Math.min(a.defectsDetected, 3),
        criticalDefects: 0
      })),
      batches: INITIAL_SIMULATED_BATCHES.map((b) => ({
        ...b,
        productionStatus: 'RUNNING',
        qualityStatus: 'NORMAL',
        crackCount: 0,
        defects: Math.min(b.defects, 2),
        critical: 0
      })),
      actionHistory: INITIAL_ENGINEERING_ACTIONS,
      workerInstructions: INITIAL_WORKER_INSTRUCTIONS,
      lastSimulatedActionNotice: 'Demo state reset: sequence restarted at Inspection #001. All lines RUNNING.'
    });
  },

  tickStream: () => {
    const state = get();
    const nextIndex = (state.currentInspectionIndex + 1) % DEMO_INSPECTION_SEQUENCE.length;
    const nextEvent = DEMO_INSPECTION_SEQUENCE[nextIndex];
    const newHistory = [nextEvent, ...state.inspectionHistory.slice(0, 40)];
    const newStats = computeRollingStats(nextEvent, newHistory);

    // Sync to images collection
    const qualityGroup: ImageQualityGroup = 
      nextEvent.severity === 'CRITICAL' ? 'CRITICAL' :
      nextEvent.severity === 'WARNING' ? 'DEFECTIVE' :
      nextEvent.severity === 'LOW' ? 'ATTENTION' : 'GOOD';

    const newSimImg: SimulatedInspectionImage = {
      id: `IMG-${nextEvent.inspection_id}`,
      plantAreaId: nextEvent.station.includes('Final') ? 'AREA-06' : 'AREA-05',
      plantAreaName: nextEvent.station,
      productionLine: nextEvent.line_id,
      batchNumber: nextEvent.batch_id,
      component: nextEvent.component,
      qualityGroup,
      defectType: nextEvent.defect_type,
      severity: nextEvent.severity,
      confidenceScore: nextEvent.confidence / 100,
      imageUrl: nextEvent.image,
      inspectionTimestamp: nextEvent.timestamp,
      summary: nextEvent.evidence[0] || 'Continuous inspection stream optical scan.',
      visualEvidence: nextEvent.evidence,
      possibleCauses: nextEvent.possible_causes,
      recommendedNextStep: nextEvent.recommended_action,
      isCrack: nextEvent.isCrack,
      requiresReview: nextEvent.requiresReview
    };

    // Update batch stats
    const updatedBatches = state.batches.map((b) => {
      if (b.batchNumber === nextEvent.batch_id) {
        const isDefect = nextEvent.result !== 'GOOD';
        const isCritical = nextEvent.severity === 'CRITICAL';
        const newCrackCount = b.crackCount + (nextEvent.isCrack ? 1 : 0);
        return {
          ...b,
          totalInspected: b.totalInspected + 1,
          defects: b.defects + (isDefect ? 1 : 0),
          critical: b.critical + (isCritical ? 1 : 0),
          crackCount: newCrackCount,
          qualityStatus: newStats.stopRecommended ? 'STOP RECOMMENDED' : (newCrackCount > 0 ? 'WARNING' : b.qualityStatus)
        };
      }
      return b;
    });

    // Update area stats
    const updatedAreas = state.areas.map((a) => {
      if (a.id === newSimImg.plantAreaId) {
        return {
          ...a,
          productsProcessed: a.productsProcessed + 1,
          defectsDetected: a.defectsDetected + (nextEvent.result !== 'GOOD' ? 1 : 0),
          criticalDefects: a.criticalDefects + (nextEvent.severity === 'CRITICAL' ? 1 : 0),
          qualityStatus: newStats.stopRecommended ? 'STOP RECOMMENDED' : a.qualityStatus,
          lastInspectionTime: nextEvent.timestamp
        };
      }
      return a;
    });

    // Check if critical modal should open:
    // When 3 cracks occur in the critical sequence or stop recommended and not previously dismissed
    const shouldTriggerCriticalModal = 
      newStats.stopRecommended && 
      !state.criticalAlertDismissed && 
      !state.showCriticalStopModal &&
      (nextIndex === 54 || nextEvent.sequenceNumber === 55 || newStats.crackCount >= 3);

    set({
      currentInspectionIndex: nextIndex,
      currentInspection: nextEvent,
      inspectionHistory: newHistory,
      rollingStats: newStats,
      selectedBatchId: nextEvent.batch_id,
      selectedAreaId: newSimImg.plantAreaId,
      batches: updatedBatches,
      areas: updatedAreas,
      images: [newSimImg, ...state.images.filter((img) => img.id !== newSimImg.id).slice(0, 30)],
      showCriticalStopModal: shouldTriggerCriticalModal ? true : state.showCriticalStopModal
    });
  },

  dismissCriticalAlert: () => set({ 
    showCriticalStopModal: false, 
    criticalAlertDismissed: true 
  }),

  continueMonitoring: () => set({ 
    showCriticalStopModal: false, 
    criticalAlertDismissed: true,
    lastSimulatedActionNotice: 'Monitoring continued. Line remains under observation.'
  }),

  // Core Entities
  areas: INITIAL_SIMULATED_AREAS,
  batches: INITIAL_SIMULATED_BATCHES,
  images: INITIAL_SIMULATED_IMAGES,
  defectPatterns: INITIAL_DEFECT_PATTERNS,
  actionHistory: INITIAL_ENGINEERING_ACTIONS,
  workerInstructions: INITIAL_WORKER_INSTRUCTIONS,

  selectedAreaId: 'AREA-06',
  selectedBatchId: 'B-2048',
  qualityFilter: 'ALL',
  areaFilter: 'ALL',
  searchQuery: '',

  showCriticalStopModal: false,
  showCrackWorkflowModal: false,
  selectedCrackImage: INITIAL_SIMULATED_IMAGES[0],
  activeInspectionImage: null,
  lastSimulatedActionNotice: null,
  demoPlantMode: true,

  setSelectedAreaId: (id) => set({ selectedAreaId: id }),
  setSelectedBatchId: (id) => set({ selectedBatchId: id }),
  setQualityFilter: (filter) => set({ qualityFilter: filter }),
  setAreaFilter: (areaId) => set({ areaFilter: areaId }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  setShowCriticalStopModal: (show) => set({ showCriticalStopModal: show }),
  openCrackWorkflow: (img) => {
    const target = img || get().images.find((i) => i.isCrack) || get().images[0];
    set({ showCrackWorkflowModal: true, selectedCrackImage: target });
  },
  closeCrackWorkflow: () => set({ showCrackWorkflowModal: false }),
  setActiveInspectionImage: (img) => set({ activeInspectionImage: img }),
  toggleDemoPlantMode: () => set((state) => ({ demoPlantMode: !state.demoPlantMode })),
  dismissActionNotice: () => set({ lastSimulatedActionNotice: null }),

  // Engineer Virtual Production Decision Actions
  pauseLine: (lineName: string, reason = 'Repeated critical defects detected') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetBatch = get().selectedBatchId;

    set((state) => ({
      areas: state.areas.map((a) =>
        a.line.includes(lineName) || a.line.includes('Line 02')
          ? { ...a, productionStatus: 'PAUSED — SIMULATED', qualityStatus: 'CRITICAL' }
          : a
      ),
      batches: state.batches.map((b) =>
        b.batchNumber === targetBatch
          ? { ...b, productionStatus: 'PAUSED — SIMULATED', qualityStatus: 'CRITICAL' }
          : b
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Line Paused (${lineName})`,
          batchNumber: targetBatch,
          productionLine: lineName,
          reason,
          result: 'SIMULATED',
          details: 'Simulated production stop applied. Machinery status set to PAUSED — SIMULATED.'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Line ${lineName} status updated to PAUSED — SIMULATED. (Simulated action — no real machinery connected.)`
    }));
  },

  resumeLine: (lineName: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetBatch = get().selectedBatchId;

    set((state) => ({
      areas: state.areas.map((a) =>
        a.line.includes(lineName)
          ? { ...a, productionStatus: 'RUNNING', qualityStatus: 'WATCH' }
          : a
      ),
      batches: state.batches.map((b) =>
        b.batchNumber === targetBatch
          ? { ...b, productionStatus: 'RUNNING', qualityStatus: 'WATCH' }
          : b
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Line Resumed (${lineName})`,
          batchNumber: targetBatch,
          productionLine: lineName,
          reason: 'Engineer verification complete; simulated line restart initiated.',
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Line ${lineName} resumed in simulation mode. (Simulated action — no real machinery connected.)`
    }));
  },

  holdBatch: (batchId: string, reason = 'Quality quarantine pending engineering review') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      batches: state.batches.map((b) =>
        b.batchNumber === batchId
          ? { ...b, productionStatus: 'QUALITY HOLD — SIMULATED', qualityStatus: 'CRITICAL' }
          : b
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Batch Placed on Simulated Hold`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason,
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Batch ${batchId} marked QUALITY HOLD — SIMULATED. (Simulated action — no real machinery connected.)`
    }));
  },

  releaseBatchForReview: (batchId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      batches: state.batches.map((b) =>
        b.batchNumber === batchId
          ? { ...b, productionStatus: 'UNDER REVIEW', qualityStatus: 'WATCH' }
          : b
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Batch Released for Review`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason: 'Senior engineer approval for gated sampling review.',
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Batch ${batchId} released for review. (Simulated action — no real machinery connected.)`
    }));
  },

  increaseInspection: (batchId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      areas: state.areas.map((a) =>
        a.currentBatch === batchId ? { ...a, inspectionStatus: 'ELEVATED' } : a
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Inspection Frequency Increased`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason: 'Elevated defect rate requires 100% optical inspection passes.',
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Inspection frequency elevated to 100% optical check for Batch ${batchId}. (Simulated action.)`
    }));
  },

  requestRecheck: (batchId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      areas: state.areas.map((a) =>
        a.currentBatch === batchId ? { ...a, inspectionStatus: 'RECHECK_REQUIRED' } : a
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Request Recheck Issued`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason: 'Manual surface micrometer and ultrasonic calibration requested.',
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Recheck requested for Batch ${batchId}. (Simulated action — no real machinery connected.)`
    }));
  },

  escalateQualityIssue: (batchId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      areas: state.areas.map((a) =>
        a.currentBatch === batchId ? { ...a, qualityStatus: 'CRITICAL' } : a
      ),
      batches: state.batches.map((b) =>
        b.batchNumber === batchId ? { ...b, qualityStatus: 'CRITICAL' } : b
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Quality Issue Escalated to Plant Lead`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason: 'Defect pattern breached allowable statistical process limits.',
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Batch ${batchId} quality alert escalated to Executive Command. (Simulated action.)`
    }));
  },

  markForEngineeringReview: (batchId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      batches: state.batches.map((b) =>
        b.batchNumber === batchId ? { ...b, productionStatus: 'UNDER REVIEW' } : b
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Marked for Engineering Review`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason: 'Pending metallographic and acoustic emission validation.',
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Batch ${batchId} marked for engineering review. (Simulated action.)`
    }));
  },

  acknowledgeAndSimulateStop: (batchId: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      showCriticalStopModal: false,
      criticalAlertDismissed: true,
      areas: state.areas.map((a) =>
        a.id === 'AREA-06' || a.line.includes('Line 02')
          ? { ...a, productionStatus: 'PAUSED — SIMULATED', qualityStatus: 'CRITICAL' }
          : a
      ),
      batches: state.batches.map((b) =>
        b.batchNumber === batchId
          ? { ...b, productionStatus: 'PAUSED — SIMULATED', qualityStatus: 'CRITICAL', notes: 'Simulated stop executed by Chief Quality Engineer due to repeated cracks.' }
          : b
      ),
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Acknowledge & Simulate Production Stop`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason: 'Repeated critical crack defects detected across Batch B-2048',
          result: 'SIMULATED',
          details: 'Production status changed to PAUSED — SIMULATED. (Simulated action — no real machinery connected.)'
        },
        ...state.actionHistory
      ],
      workerInstructions: [
        {
          id: `WINSTR-${Date.now().toString().slice(-4)}`,
          timestamp,
          area: 'Final Inspection & Line 02',
          batchNumber: batchId,
          instructionText: 'Hold affected components from Batch B-2048 and send them for engineering review. Line 02 is on simulated pause.',
          status: 'SIMULATED COMMAND',
          priority: 'CRITICAL'
        },
        ...state.workerInstructions
      ],
      lastSimulatedActionNotice: `SIMULATED STOP EXECUTED: Line 02 is now PAUSED — SIMULATED for Batch ${batchId}. (Simulated action — no real machinery connected.)`
    }));
  },

  issueWorkerInstruction: (text, area = 'Final Inspection', batchId = 'B-2048', priority = 'URGENT') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newInstr: SimulatedWorkerInstruction = {
      id: `WINSTR-${Date.now().toString().slice(-4)}`,
      timestamp,
      area,
      batchNumber: batchId,
      instructionText: text,
      status: 'SIMULATED COMMAND',
      priority
    };

    set((state) => ({
      workerInstructions: [newInstr, ...state.workerInstructions],
      actionHistory: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          timestamp,
          engineerAction: `Simulated Worker Instruction Issued`,
          batchNumber: batchId,
          productionLine: 'Line 02',
          reason: text,
          result: 'SIMULATED'
        },
        ...state.actionHistory
      ],
      lastSimulatedActionNotice: `Worker instruction dispatched: "${text}" [STATUS: SIMULATED COMMAND — no real workers connected].`
    }));
  },

  addInterventionImage: (data) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetBatch = data.batchId || 'B-2048';
    const isCrack = data.isCrack || data.defectName.toLowerCase().includes('crack') || data.defectName.toLowerCase().includes('crazing');
    const qualityGroup: ImageQualityGroup = 
      data.severity === 'CRITICAL' ? 'CRITICAL' :
      data.severity === 'WARNING' ? 'DEFECTIVE' :
      data.severity === 'LOW' ? 'ATTENTION' : 'GOOD';

    const newImg: SimulatedInspectionImage = {
      id: `IMG-${targetBatch}-${Date.now().toString().slice(-4)}`,
      plantAreaId: 'AREA-06',
      plantAreaName: 'Final Inspection',
      productionLine: 'Line 02',
      batchNumber: targetBatch,
      component: 'Cold-Rolled Steel Strip',
      qualityGroup,
      defectType: data.defectName,
      severity: data.severity,
      confidenceScore: data.confidence,
      imageUrl: data.imageUrl,
      inspectionTimestamp: timestamp,
      summary: data.summary,
      visualEvidence: data.visualEvidence,
      possibleCauses: data.possibleCauses,
      recommendedNextStep: data.recommendedNextStep,
      isCrack,
      requiresReview: data.severity !== 'NORMAL'
    };

    set((state) => {
      const updatedImages = [newImg, ...state.images];
      const crackCountInBatch = updatedImages.filter((i) => i.batchNumber === targetBatch && i.isCrack).length;

      const updatedBatches = state.batches.map((b) => {
        if (b.batchNumber === targetBatch) {
          const newDefects = b.defects + (data.severity !== 'NORMAL' ? 1 : 0);
          const newCritical = b.critical + (data.severity === 'CRITICAL' ? 1 : 0);
          return {
            ...b,
            totalInspected: b.totalInspected + 1,
            defects: newDefects,
            critical: newCritical,
            crackCount: crackCountInBatch,
            qualityStatus: crackCountInBatch >= 2 ? 'STOP RECOMMENDED' : b.qualityStatus
          };
        }
        return b;
      });

      const updatedAreas = state.areas.map((a) => {
        if (a.id === 'AREA-06') {
          return {
            ...a,
            productsProcessed: a.productsProcessed + 1,
            defectsDetected: a.defectsDetected + (data.severity !== 'NORMAL' ? 1 : 0),
            criticalDefects: a.criticalDefects + (data.severity === 'CRITICAL' ? 1 : 0),
            qualityStatus: crackCountInBatch >= 2 ? 'STOP RECOMMENDED' : a.qualityStatus,
            lastInspectionTime: timestamp
          };
        }
        return a;
      });

      const shouldTriggerCriticalStop = isCrack && crackCountInBatch >= 2;

      return {
        images: updatedImages,
        batches: updatedBatches,
        areas: updatedAreas,
        showCriticalStopModal: shouldTriggerCriticalStop ? true : state.showCriticalStopModal,
        lastSimulatedActionNotice: `Inspection image stacked to Batch ${targetBatch}. Quality Group: ${qualityGroup}. (Simulated production data)`
      };
    });
  }
}));
