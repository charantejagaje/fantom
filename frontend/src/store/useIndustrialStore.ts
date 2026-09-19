import { create } from 'zustand';
import {
  User,
  WorkerUser,
  UserRole,
  StationTelemetry,
  Incident,
  IncidentStatus,
  IncidentMessage,
  MaintenanceTask,
  WorkerTaskState,
  RoleNotification,
  AIRecommendation,
  EconomicBaseline,
  PrecisionMetalUnit,
  StageBottleneckMetric,
  ThroughputLossImpact,
  EconomicLossBreakdown,
  ExplainableRecommendation,
  DemoScenarioKey
} from '../types';
import { DEMO_OWNER, DEMO_ENGINEER, DEMO_WORKERS } from '../data/authData';
import { INITIAL_STATIONS, INITIAL_AI_RECOMMENDATIONS, INITIAL_ECONOMIC_BASELINE } from '../data/mockData';
import {
  PRECISION_METAL_UNITS,
  INITIAL_STAGE_BOTTLENECK_METRICS,
  INITIAL_THROUGHPUT_LOSS,
  INITIAL_ECONOMIC_BREAKDOWN,
  INITIAL_EXPLAINABLE_RECOMMENDATIONS,
  DEMO_SCENARIOS_CONFIG
} from '../data/precisionManufacturingData';
import { INITIAL_INCIDENTS, IncidentService } from '../services/incidentService';
import { INITIAL_INCIDENT_MESSAGES, CommunicationService } from '../services/communicationService';
import { INITIAL_NOTIFICATIONS, NotificationService } from '../services/notificationService';
import { WorkerDispatchService } from '../services/workerDispatchService';
import { AuthService } from '../services/authService';

interface IndustrialState {
  // Auth & Session
  currentUser: User | WorkerUser | null;
  isAuthenticated: boolean;
  users: (User | WorkerUser)[];
  workers: WorkerUser[];

  // Factory State
  stations: StationTelemetry[];
  economicBaseline: EconomicBaseline;
  recommendations: AIRecommendation[];
  approvedRecommendationIds: string[];

  // Incidents & Collaboration
  incidents: Incident[];
  activeIncidentId: string;
  messages: IncidentMessage[];
  tasks: MaintenanceTask[];
  notifications: RoleNotification[];

  // Precision Metal Manufacturing State
  currentScenario: DemoScenarioKey;
  precisionUnits: PrecisionMetalUnit[];
  selectedInvestigationUnitId: string;
  stageBottlenecks: StageBottleneckMetric[];
  throughputLoss: ThroughputLossImpact;
  economicBreakdown: EconomicLossBreakdown;
  explainableRecommendations: ExplainableRecommendation[];
  mlModelType: 'RANDOM_FOREST' | 'LOGISTIC_REGRESSION';

  // Precision Manufacturing Actions
  setDemoScenario: (scenario: DemoScenarioKey) => void;
  setSelectedInvestigationUnitId: (unitId: string) => void;
  setMlModelType: (type: 'RANDOM_FOREST' | 'LOGISTIC_REGRESSION') => void;
  runSimulatedImprovement: (recId: string) => void;

  // UI helpers
  workerSmartphoneView: boolean; // toggle between smartphone frame & tablet view for worker

  // Auth Actions
  login: (email: string, password?: string) => { success: boolean; error?: string };
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  logout: () => void;

  // Incident & Dispatch Actions
  setActiveIncident: (id: string) => void;
  setActiveIncidentId: (id: string) => void;
  acknowledgeIncident: (incidentId: string) => void;
  dispatchWorker: (incidentId: string, workerId: string) => void;
  resolveIncident: (incidentId: string) => void;

  // Task Workflow Actions
  updateTaskState: (taskId: string, newState: WorkerTaskState) => void;
  completeTaskStep: (taskId: string, stepId: string) => void;
  addWorkerNote: (taskId: string, note: string) => void;

  // Communication Actions
  sendMessage: (incidentId: string, text: string, type?: 'TEXT' | 'SYSTEM' | 'STATUS_UPDATE' | 'AI_ALERT') => void;

  // Notification Actions
  markNotificationAsRead: (notificationId: string) => void;
  clearNotificationsForRole: (role: UserRole) => void;

  // Owner Actions
  approveRecommendation: (recommendationId: string) => void;

  // Simulation & Fault triggers
  injectCriticalDefect: () => void;
  restoreFactoryDefaults: () => void;
  toggleSmartphoneView: () => void;

  // REAL analytics data from the fantom backend (observed simulation dataset).
  // Hydrated at startup; UI falls back to bundled demo values until/unless data arrives.
  realAnalytics: {
    loading: boolean;
    error: string | null;
    overview: any;
    stations: any[];
    bottlenecks: any;
    associations: any;
  };
  loadRealAnalytics: () => Promise<void>;
}

// Initial task for Worker Ravi Patel on INC-0042
const initialTask = WorkerDispatchService.createMaintenanceTask(
  INITIAL_INCIDENTS[0],
  DEMO_WORKERS[0],
  38,
  45
);
// Initially set state to ACCEPTED for smooth demo flow
initialTask.id = 'TSK-0042-8821';
initialTask.state = 'ACCEPTED';
initialTask.steps[0].completed = true;

// Initial task for Worker Elena Rostova on INC-0044 (Station 04 Scratch Quality Alert)
const station04Task = WorkerDispatchService.createMaintenanceTask(
  INITIAL_INCIDENTS[2],
  DEMO_WORKERS[1],
  42,
  50
);
station04Task.id = 'TSK-0044-9204';
station04Task.state = 'PENDING';

export const useIndustrialStore = create<IndustrialState>((set, get) => ({
  // Default to OWNER for initial executive dashboard presentation
  currentUser: DEMO_OWNER,
  isAuthenticated: true,
  users: [DEMO_OWNER, DEMO_ENGINEER, ...DEMO_WORKERS],
  workers: [...DEMO_WORKERS],

  stations: INITIAL_STATIONS,
  economicBaseline: INITIAL_ECONOMIC_BASELINE,
  recommendations: INITIAL_AI_RECOMMENDATIONS,
  approvedRecommendationIds: [],

  incidents: INITIAL_INCIDENTS,
  activeIncidentId: 'INC-0042',
  messages: INITIAL_INCIDENT_MESSAGES,
  tasks: [initialTask, station04Task],
  notifications: INITIAL_NOTIFICATIONS,
  workerSmartphoneView: true,

  // Precision Metal Initial State
  currentScenario: 'COMBINED_IMPACT',
  precisionUnits: PRECISION_METAL_UNITS,
  selectedInvestigationUnitId: 'UNIT-4821',
  stageBottlenecks: INITIAL_STAGE_BOTTLENECK_METRICS,
  throughputLoss: INITIAL_THROUGHPUT_LOSS,
  economicBreakdown: INITIAL_ECONOMIC_BREAKDOWN,
  explainableRecommendations: INITIAL_EXPLAINABLE_RECOMMENDATIONS,
  mlModelType: 'RANDOM_FOREST',

  // Precision Metal Actions
  setDemoScenario: (scenario: DemoScenarioKey) => {
    const config = DEMO_SCENARIOS_CONFIG[scenario];
    set((state) => {
      // Update stations telemetry
      const updatedStations = state.stations.map((st) => {
        if (st.id === 'S03' || st.shortCode === 'CNC-04' || st.id === 'S02') {
          const isBottleneck = config.bottleneckStationId === 'S02' || config.bottleneckStationId === 'S03';
          return {
            ...st,
            status: isBottleneck ? ('CRITICAL' as const) : ('HEALTHY' as const),
            cycleTimeSec: config.cncCycleTimeSec,
            utilizationPct: config.cncUtilizationPct,
            downtimeMinutesPerShift: config.cncDowntimeMin,
            queueUnits: config.cncQueueUnits,
            isBottleneck: isBottleneck
          };
        }
        return st;
      });

      // Update stage bottlenecks
      const updatedBottlenecks = state.stageBottlenecks.map((stage) => {
        if (stage.stageId === 'CNC_MACHINING') {
          const isBottleneck = config.bottleneckStationId === 'S02' || config.bottleneckStationId === 'S03';
          return {
            ...stage,
            utilizationPct: config.cncUtilizationPct,
            averageCycleTimeSec: config.cncCycleTimeSec,
            downtimeMinutes: config.cncDowntimeMin,
            throughputUnitsPerHour: config.throughputUnitsHr,
            queueUnits: config.cncQueueUnits,
            isBottleneck: isBottleneck,
            bottleneckScore: isBottleneck ? ('CRITICAL' as const) : ('LOW' as const),
            highlightReason: isBottleneck
              ? `Elevated cycle time (${config.cncCycleTimeSec}s vs 45s nominal) + ${config.cncUtilizationPct}% utilization driving line constraint.`
              : 'Operating within nominal 45s cycle parameters.'
          };
        }
        return stage;
      });

      // Update throughput loss
      const deficit = Math.max(0, 80 - config.throughputUnitsHr);
      const affected = deficit * 8;
      const updatedLoss: ThroughputLossImpact = {
        currentThroughputUnitsHr: config.throughputUnitsHr,
        nominalThroughputUnitsHr: 80,
        throughputDeficitUnitsHr: deficit,
        affectedUnitsTotal: affected,
        scrapUnitsTotal: Math.round((affected * config.defectRatePct) / 100),
        reworkUnitsTotal: Math.round((affected * (config.defectRatePct * 1.3)) / 100),
        bottleneckStarvationMinutes: Math.round(config.cncDowntimeMin * 2.8),
        downtimeHoursPerShift: Number((config.cncDowntimeMin / 60).toFixed(2))
      };

      // Update economic breakdown
      const scrapCost = updatedLoss.scrapUnitsTotal * 48.0;
      const reworkCost = updatedLoss.reworkUnitsTotal * 18.5;
      const downtimeCost = config.cncDowntimeMin * 145.0;
      const throughputLossUsd = deficit * 8 * 34.0;
      const totalEstimatedLossUsd = scrapCost + reworkCost + downtimeCost + throughputLossUsd;

      const updatedEconomic: EconomicLossBreakdown = {
        scrapCostUsd: scrapCost,
        reworkCostUsd: reworkCost,
        downtimeCostUsd: downtimeCost,
        throughputOpportunityLossUsd: throughputLossUsd,
        totalEstimatedLossUsd: totalEstimatedLossUsd,
        calculationFormulas: {
          scrapFormula: `Scrap Cost = Defective Units Scrapped (${updatedLoss.scrapUnitsTotal}) × Unit Scrap Loss ($48.00) = $${scrapCost.toLocaleString()}`,
          reworkFormula: `Rework Cost = Reworkable Units (${updatedLoss.reworkUnitsTotal}) × Average Rework Cost ($18.50) = $${reworkCost.toLocaleString()}`,
          downtimeFormula: `Downtime Cost = Total Downtime (${config.cncDowntimeMin} min) × Machine Overhead ($145.00/hr) = $${downtimeCost.toLocaleString()}`,
          throughputFormula: `Throughput Opportunity Loss = Deficit Units (${deficit * 8}) × Unit Gross Margin ($34.00) = $${throughputLossUsd.toLocaleString()}`
        },
        assumptions: [
          `Scenario active: ${config.name} (${config.badge})`,
          'Unit Scrap Loss: $48.00/unit; Rework cost: $18.50/unit.',
          'Machine downtime labor & overhead rate: $145.00/hr.',
          'Tier-1 component contribution margin: $34.00/unit.'
        ]
      };

      return {
        currentScenario: scenario,
        selectedInvestigationUnitId: config.activeDefectUnitId,
        stations: updatedStations,
        stageBottlenecks: updatedBottlenecks,
        throughputLoss: updatedLoss,
        economicBreakdown: updatedEconomic
      };
    });
  },

  setSelectedInvestigationUnitId: (unitId: string) => {
    set({ selectedInvestigationUnitId: unitId });
  },

  setMlModelType: (type: 'RANDOM_FOREST' | 'LOGISTIC_REGRESSION') => {
    set({ mlModelType: type });
  },

  runSimulatedImprovement: (recId: string) => {
    set((state) => {
      // Find recommendation
      const rec = state.explainableRecommendations.find((r) => r.id === recId);
      if (!rec) return state;

      const cycleDelta = rec.simulatedImprovement.cycleTimeReductionSec;
      const lossDelta = rec.simulatedImprovement.lossReductionUsd;
      const throughputBonus = Math.round((state.throughputLoss.currentThroughputUnitsHr * rec.simulatedImprovement.throughputIncreasePct) / 100);

      const newThroughput = Math.min(80, state.throughputLoss.currentThroughputUnitsHr + throughputBonus);
      const newDeficit = Math.max(0, 80 - newThroughput);

      // Update stations
      const updatedStations = state.stations.map((st) => {
        if (st.shortCode === 'CNC-04' || st.id === 'S03' || st.id === 'S02') {
          return {
            ...st,
            cycleTimeSec: Math.max(45.0, st.cycleTimeSec - cycleDelta),
            utilizationPct: Math.max(76.0, st.utilizationPct - 15),
            queueUnits: Math.max(30, st.queueUnits - 65),
            isBottleneck: false,
            status: 'HEALTHY' as const
          };
        }
        return st;
      });

      // Update stage bottlenecks
      const updatedBottlenecks = state.stageBottlenecks.map((sb) => {
        if (sb.stageId === 'CNC_MACHINING') {
          return {
            ...sb,
            averageCycleTimeSec: Math.max(45.0, sb.averageCycleTimeSec - cycleDelta),
            utilizationPct: Math.max(76.0, sb.utilizationPct - 15),
            throughputUnitsPerHour: newThroughput,
            queueUnits: Math.max(30, sb.queueUnits - 65),
            isBottleneck: false,
            bottleneckScore: 'LOW' as const,
            highlightReason: 'Workload rebalanced. Cycle time returned to nominal baseline.'
          };
        }
        return sb;
      });

      // Update recommendations
      const updatedRecs = state.explainableRecommendations.map((r) => {
        if (r.id === recId) {
          return { ...r, status: 'COMPLETED' as const };
        }
        return r;
      });

      const updatedEconomic: EconomicLossBreakdown = {
        ...state.economicBreakdown,
        totalEstimatedLossUsd: Math.max(1200, state.economicBreakdown.totalEstimatedLossUsd - lossDelta),
        throughputOpportunityLossUsd: Math.max(0, state.economicBreakdown.throughputOpportunityLossUsd - lossDelta * 0.7)
      };

      return {
        stations: updatedStations,
        stageBottlenecks: updatedBottlenecks,
        explainableRecommendations: updatedRecs,
        economicBreakdown: updatedEconomic,
        throughputLoss: {
          ...state.throughputLoss,
          currentThroughputUnitsHr: newThroughput,
          throughputDeficitUnitsHr: newDeficit,
          affectedUnitsTotal: newDeficit * 8
        }
      };
    });
  },

  login: (email, password) => {
    const res = AuthService.authenticate(email, password);
    if (res.success && res.user) {
      set({ currentUser: res.user, isAuthenticated: true });
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  },

  switchRole: (role) => {
    if (role === 'OWNER') {
      set({ currentUser: DEMO_OWNER, isAuthenticated: true });
    } else if (role === 'ENGINEER') {
      set({ currentUser: DEMO_ENGINEER, isAuthenticated: true });
    } else {
      // Default to worker 1 (Ravi Patel)
      set({ currentUser: DEMO_WORKERS[0], isAuthenticated: true });
    }
  },

  switchUserById: (userId) => {
    const allUsers = get().users;
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      set({ currentUser: found, isAuthenticated: true });
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  setActiveIncident: (id) => {
    set({ activeIncidentId: id });
  },

  setActiveIncidentId: (id) => {
    set({ activeIncidentId: id });
  },

  acknowledgeIncident: (incidentId) => {
    const role = get().currentUser?.role || 'ENGINEER';
    set((state) => ({
      incidents: state.incidents.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: inc.status === 'OPEN' ? 'ACKNOWLEDGED' : inc.status,
            acknowledgedByOwner: role === 'OWNER' ? true : inc.acknowledgedByOwner,
            acknowledgedByEngineer: role === 'ENGINEER' ? true : inc.acknowledgedByEngineer
          };
        }
        return inc;
      })
    }));

    // Post notification & system message
    const currentUser = get().currentUser;
    const userName = currentUser?.name || 'Authorized User';
    get().sendMessage(
      incidentId,
      `Incident acknowledged by ${userName} (${role}).`,
      'SYSTEM'
    );
  },

  dispatchWorker: (incidentId, workerId) => {
    const state = get();
    const incident = state.incidents.find((i) => i.id === incidentId);
    const worker = state.workers.find((w) => w.id === workerId);
    if (!incident || !worker) return;

    const distance = WorkerDispatchService.calculateWorkerDistance(worker, incident.stationId);
    const newTask = WorkerDispatchService.createMaintenanceTask(incident, worker, distance, 45);

    set((s) => ({
      incidents: s.incidents.map((i) =>
        i.id === incidentId
          ? { ...i, status: 'ASSIGNED', assignedWorkerId: worker.id }
          : i
      ),
      workers: s.workers.map((w) =>
        w.id === workerId ? { ...w, availability: 'BUSY', currentTaskId: newTask.id } : w
      ),
      tasks: [newTask, ...s.tasks.filter((t) => t.id !== newTask.id)],
      notifications: [
        NotificationService.createNotification(
          'WORKER',
          '🚨 URGENT MAINTENANCE DISPATCH',
          `Assigned to ${incident.machineId} (${incident.title}) in ${worker.zone}. Distance: ${distance}m.`,
          'CRITICAL',
          incident.id,
          'Accept Task'
        ),
        NotificationService.createNotification(
          'ENGINEER',
          'Field Technician Dispatched',
          `${worker.name} dispatched to ${incident.machineId}. Distance: ${distance}m.`,
          'INFO',
          incident.id
        ),
        NotificationService.createNotification(
          'OWNER',
          'Technician Assigned to Bottleneck',
          `${worker.name} assigned to restore ${incident.machineId} (projected -$${incident.estimatedFinancialImpactUsd?.toLocaleString()} loss).`,
          'WARNING',
          incident.id
        ),
        ...s.notifications
      ]
    }));

    get().sendMessage(
      incidentId,
      `Dispatch Engine: ${worker.name} (${worker.workerId}) assigned to incident. Transit distance: ${distance}m.`,
      'SYSTEM'
    );
  },

  resolveIncident: (incidentId) => {
    set((s) => ({
      incidents: s.incidents.map((i) =>
        i.id === incidentId ? { ...i, status: 'RESOLVED', resolvedAt: 'Just now' } : i
      ),
      notifications: [
        NotificationService.createNotification(
          'ALL',
          'Incident Successfully Resolved',
          `Incident ${incidentId} has been resolved and verified by plant engineering.`,
          'SUCCESS',
          incidentId
        ),
        ...s.notifications
      ]
    }));

    get().sendMessage(
      incidentId,
      'Incident marked as RESOLVED. Line telemetry has returned to normal operating baseline.',
      'SYSTEM'
    );
  },

  updateTaskState: (taskId, newState) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Generate contextual system messages based on workflow steps
    let messageText = '';
    let notificationText = '';

    switch (newState) {
      case 'ACCEPTED':
        messageText = `Worker ${task.assignedWorkerName} accepted maintenance task. Preparing transit.`;
        notificationText = `${task.assignedWorkerName} accepted maintenance task on ${task.machineId}.`;
        break;
      case 'NAVIGATING':
        messageText = `Worker ${task.assignedWorkerName} in transit to ${task.stationId} (ETA ~${task.etaSeconds}s).`;
        notificationText = `${task.assignedWorkerName} en route to ${task.machineId}.`;
        break;
      case 'ARRIVED':
        messageText = `Worker ${task.assignedWorkerName} arrived at ${task.machineId}. Safety Lockout/Tagout initiated.`;
        notificationText = `${task.assignedWorkerName} arrived at ${task.machineId}. Commencing physical inspection.`;
        break;
      case 'INSPECTING':
        messageText = `Worker ${task.assignedWorkerName} started diagnostic vibration check on ${task.targetComponent}. Measured harmonic amplitude: 6.8 mm/s.`;
        notificationText = `${task.assignedWorkerName} confirmed high vibration on ${task.targetComponent}.`;
        break;
      case 'REPAIRING':
        messageText = `Worker ${task.assignedWorkerName} executing simulated component replacement on ${task.targetComponent}.`;
        notificationText = `${task.assignedWorkerName} is replacing ${task.targetComponent}.`;
        break;
      case 'COMPLETED':
        messageText = `Worker ${task.assignedWorkerName} completed precision repair. Machine restored. Harmonic resonance normalized to 1.4 mm/s.`;
        notificationText = `${task.machineId} restored to service by ${task.assignedWorkerName}!`;
        break;
    }

    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id === taskId) {
          const updatedSteps = t.steps.map((step) => {
            if (newState === 'ACCEPTED' && step.id === 'step-accept') return { ...step, completed: true };
            if (newState === 'ARRIVED' && step.id === 'step-nav') return { ...step, completed: true };
            if (newState === 'INSPECTING' && (step.id === 'step-loto' || step.id === 'step-inspect')) return { ...step, completed: true };
            if (newState === 'REPAIRING' && step.id === 'step-service') return { ...step, completed: true };
            if (newState === 'COMPLETED') return { ...step, completed: true };
            return step;
          });
          return {
            ...t,
            state: newState,
            steps: updatedSteps,
            completedAt: newState === 'COMPLETED' ? new Date().toISOString() : t.completedAt
          };
        }
        return t;
      }),
      // If completed, update incident to RESOLVED and normalize station S03
      incidents: newState === 'COMPLETED'
        ? s.incidents.map((i) => i.id === task.incidentId ? { ...i, status: 'RESOLVED', resolvedAt: 'Just now' } : i)
        : s.incidents.map((i) => i.id === task.incidentId ? { ...i, status: 'IN_PROGRESS' } : i),
      stations: newState === 'COMPLETED'
        ? s.stations.map((station) => {
            if (station.id === task.stationId) {
              return {
                ...station,
                status: 'HEALTHY',
                healthScore: 97.5,
                utilizationPct: 84.0,
                queueUnits: 18,
                isBottleneck: false,
                operatingCondition: {
                  ...station.operatingCondition,
                  vibrationMmSec: 1.4
                }
              };
            }
            return station;
          })
        : s.stations,
      workers: newState === 'COMPLETED'
        ? s.workers.map((w) => w.id === task.assignedWorkerId ? { ...w, availability: 'AVAILABLE', currentTaskId: undefined } : w)
        : s.workers,
      notifications: [
        NotificationService.createNotification(
          'ENGINEER',
          newState === 'COMPLETED' ? 'Machine Repaired & Restored' : 'Worker Status Update',
          notificationText,
          newState === 'COMPLETED' ? 'SUCCESS' : 'INFO',
          task.incidentId
        ),
        NotificationService.createNotification(
          'OWNER',
          newState === 'COMPLETED' ? 'Incident Resolved: Bottleneck Cleared' : 'Field Status Update',
          newState === 'COMPLETED'
            ? `${task.machineId} restored. Projected -$116,100 EBIT loss averted.`
            : notificationText,
          newState === 'COMPLETED' ? 'SUCCESS' : 'INFO',
          task.incidentId
        ),
        ...s.notifications
      ]
    }));

    if (messageText) {
      get().sendMessage(task.incidentId, messageText, 'STATUS_UPDATE');
    }
  },

  completeTaskStep: (taskId, stepId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            steps: t.steps.map((st) => (st.id === stepId ? { ...st, completed: !st.completed } : st))
          };
        }
        return t;
      })
    }));
  },

  addWorkerNote: (taskId, note) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, notes: [...(t.notes || []), note] } : t))
    }));

    const currentUser = get().currentUser;
    get().sendMessage(
      task.incidentId,
      `Technician Note: ${note}`,
      'TEXT'
    );
  },

  sendMessage: (incidentId, text, type = 'TEXT') => {
    const currentUser = get().currentUser || DEMO_OWNER;
    const newMessage = CommunicationService.createMessage(
      incidentId,
      currentUser.id,
      currentUser.name,
      currentUser.role,
      text,
      type
    );

    set((s) => ({
      messages: [...s.messages, newMessage]
    }));
  },

  markNotificationAsRead: (notificationId) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    }));
  },

  clearNotificationsForRole: (role) => {
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.role === role || n.role === 'ALL' ? { ...n, read: true } : n
      )
    }));
  },

  approveRecommendation: (recommendationId) => {
    const rec = get().recommendations.find((r) => r.id === recommendationId);
    set((s) => ({
      approvedRecommendationIds: [...s.approvedRecommendationIds, recommendationId],
      notifications: [
        NotificationService.createNotification(
          'ENGINEER',
          'Owner Approved Recommendation',
          `Owner approved process adjustment: ${rec?.title || 'Recommendation'}. Simulated delta active.`,
          'SUCCESS'
        ),
        ...s.notifications
      ]
    }));

    get().sendMessage(
      get().activeIncidentId,
      `Executive Approval: Owner approved engineering recommendation "${rec?.title || 'Process Intervention'}". Simulated impact: +${rec?.simulatedDelta.throughputPct}% throughput.`,
      'SYSTEM'
    );
  },

  injectCriticalDefect: () => {
    set((s) => ({
      stations: s.stations.map((st) => {
        if (st.id === 'S03') {
          return {
            ...st,
            status: 'CRITICAL',
            healthScore: 24.0,
            utilizationPct: 96.4,
            queueUnits: 142,
            isBottleneck: true,
            operatingCondition: {
              ...st.operatingCondition,
              vibrationMmSec: 6.8
            }
          };
        }
        return st;
      }),
      incidents: [
        {
          id: 'INC-0042',
          machineId: 'CNC-04',
          stationId: 'S03',
          severity: 'CRITICAL',
          title: 'CNC-04 Bearing Harmonic Anomaly',
          description: 'Accelerometer detected 6.8 mm/s vibration spike on Bearing #02.',
          detectedAt: 'Just now',
          status: 'OPEN',
          aiDiagnosis: 'Severe bearing cage degradation',
          confidence: 94,
          recommendedAction: 'Isolate spindle & inspect Bearing #02 immediately.',
          estimatedFinancialImpactUsd: 116100,
          queueUnitsThrottled: 142,
          targetComponent: 'Bearing #02 (Rear Support Deep-Groove)'
        },
        ...s.incidents.filter((i) => i.id !== 'INC-0042')
      ]
    }));
  },

  restoreFactoryDefaults: () => {
    set({
      stations: INITIAL_STATIONS,
      incidents: INITIAL_INCIDENTS,
      messages: INITIAL_INCIDENT_MESSAGES,
      notifications: INITIAL_NOTIFICATIONS,
      approvedRecommendationIds: []
    });
  },

  toggleSmartphoneView: () => {
    set((s) => ({ workerSmartphoneView: !s.workerSmartphoneView }));
  },

  loadRealAnalytics: async () => {
    try {
      const get2 = (u: string) => fetch(u).then((r) => {
        if (!r.ok) throw new Error(`${u} -> HTTP ${r.status}`);
        return r.json();
      });
      const [overview, stationsRes, bottlenecks, associations] = await Promise.all([
        get2('/api/overview'),
        get2('/api/stations'),
        get2('/api/bottlenecks'),
        get2('/api/associations'),
      ]);
      set({
        realAnalytics: {
          loading: false,
          error: null,
          overview,
          stations: stationsRes.stations ?? [],
          bottlenecks,
          associations,
        },
      });
    } catch (e) {
      set((s) => ({
        realAnalytics: { ...s.realAnalytics, loading: false, error: String(e) },
      }));
    }
  }
}));

// Kick off real-data hydration immediately (non-blocking; UI renders demo values
// until real observed-data analytics arrive, then realAnalytics holds them).
useIndustrialStore.getState().loadRealAnalytics();;
