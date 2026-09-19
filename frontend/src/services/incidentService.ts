import { Incident, IncidentSeverity, IncidentStatus } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-0042',
    machineId: 'CNC-04',
    stationId: 'S03',
    severity: 'CRITICAL',
    title: 'CNC-04 Bearing Harmonic Anomaly',
    description: 'High-frequency accelerometer detected sub-harmonics on Bearing #02 (6.8 mm/s vs 1.8 mm/s baseline). Strong correlation (r=0.94) with blade root surface chatter defects on Variant B.',
    detectedAt: '12 minutes ago',
    status: 'ASSIGNED',
    assignedEngineerId: 'usr-eng-01',
    assignedWorkerId: 'usr-wrk-01', // Ravi Patel
    aiDiagnosis: 'Possible bearing degradation & localized raceway micro-pitting',
    confidence: 91,
    recommendedAction: 'Isolate spindle, perform physical tactile vibration inspection on Bearing #02, and execute simulated bearing cartridge swap.',
    estimatedFinancialImpactUsd: 116100,
    queueUnitsThrottled: 142,
    targetComponent: 'Bearing #02 (Rear Support Deep-Groove)',
    acknowledgedByOwner: true,
    acknowledgedByEngineer: true
  },
  {
    id: 'INC-0039',
    machineId: 'LATHE-02',
    stationId: 'S02',
    severity: 'MEDIUM',
    title: 'S02 Roughing Tool Insert Edge Wear',
    description: 'Minor cycle variance creep (+1.2s). Optical inspection indicates flank wear nearing 0.35mm limit on carbide tip.',
    detectedAt: '48 minutes ago',
    status: 'ACKNOWLEDGED',
    assignedEngineerId: 'usr-eng-01',
    aiDiagnosis: 'Progressive tool flank abrasion from high-feed roughing pass',
    confidence: 84,
    recommendedAction: 'Schedule turret index change during next planned batch changeover (18.5 min window).',
    estimatedFinancialImpactUsd: 8400,
    queueUnitsThrottled: 45,
    targetComponent: 'Carbide Insert Tip #04',
    acknowledgedByOwner: false,
    acknowledgedByEngineer: true
  },
  {
    id: 'INC-0044',
    machineId: 'INSPECT-04',
    stationId: 'S04',
    severity: 'HIGH',
    title: 'Batch B-204 Surface Scratch Anomaly (AOI Vision)',
    description: 'Automated Optical Inspection detected continuous 159px longitudinal scoring across cold-rolled coils on Batch B-204. Mechanical entry guide plate abrasive scoring suspected.',
    detectedAt: '6 minutes ago',
    status: 'ASSIGNED',
    assignedEngineerId: 'usr-eng-01',
    assignedWorkerId: 'usr-wrk-02', // Elena Rostova
    aiDiagnosis: 'Lateral entry guide B-4 abrasive burr pickup causing cold-strip gouging',
    confidence: 93,
    recommendedAction: 'Engage Station 04 LOTO, stone-polish Entry Guide B-4, and clear descaling spray nozzles #2 and #3.',
    estimatedFinancialImpactUsd: 22700,
    queueUnitsThrottled: 64,
    targetComponent: 'Entry Guide Plate B-4 & Spray Header',
    acknowledgedByOwner: true,
    acknowledgedByEngineer: true
  }
];

export class IncidentService {
  static getInitialIncidents(): Incident[] {
    return [...INITIAL_INCIDENTS];
  }

  static findCriticalIncidents(incidents: Incident[]): Incident[] {
    return incidents.filter((inc) => inc.severity === 'CRITICAL' && inc.status !== 'RESOLVED');
  }

  static getOpenIncidents(incidents: Incident[]): Incident[] {
    return incidents.filter((inc) => inc.status !== 'RESOLVED');
  }

  static getIncidentById(incidents: Incident[], id: string): Incident | undefined {
    return incidents.find((inc) => inc.id === id);
  }

  static calculateEstimatedTotalLoss(incidents: Incident[]): number {
    return incidents
      .filter((inc) => inc.status !== 'RESOLVED')
      .reduce((sum, inc) => sum + (inc.estimatedFinancialImpactUsd || 0), 0);
  }
}
