import { WorkerUser, Incident, MaintenanceTask } from '../types';

export class WorkerDispatchService {
  /**
   * Station factory coordinates for Euclidean plant distance calculation
   */
  static getStationCoordinates(stationId: string): { x: number; y: number; zone: string } {
    const stationPositions: Record<string, { x: number; y: number; zone: string }> = {
      S01: { x: 10, y: 35, zone: 'Zone A' },
      S02: { x: 18, y: 32, zone: 'Zone A' },
      S03: { x: 35, y: 14, zone: 'Zone B' }, // CNC-04 5-Axis Milling Center
      S04: { x: 48, y: 20, zone: 'Zone B' },
      S05: { x: 55, y: 55, zone: 'Zone C' },
      S06: { x: 65, y: 62, zone: 'Zone C' }
    };
    return stationPositions[stationId] || { x: 35, y: 14, zone: 'Zone B' };
  }

  /**
   * Filters workers that are marked AVAILABLE
   */
  static findAvailableWorkers(workers: WorkerUser[]): WorkerUser[] {
    return workers.filter((w) => w.availability === 'AVAILABLE');
  }

  /**
   * Filters workers by matching required industrial skills
   */
  static filterWorkersBySkill(workers: WorkerUser[], requiredSkillSubstrings: string[]): WorkerUser[] {
    if (!requiredSkillSubstrings || requiredSkillSubstrings.length === 0) {
      return workers;
    }

    const matched = workers.filter((worker) =>
      worker.skills.some((skill) =>
        requiredSkillSubstrings.some((req) => skill.toLowerCase().includes(req.toLowerCase()))
      )
    );

    return matched.length > 0 ? matched : workers;
  }

  /**
   * Calculates approximate plant Euclidean distance in meters
   */
  static calculateWorkerDistance(worker: WorkerUser, stationId: string): number {
    const machinePos = this.getStationCoordinates(stationId);
    const dx = worker.zoneLocation.x - machinePos.x;
    const dy = worker.zoneLocation.y - machinePos.y;
    // Scaled grid distance: 1 unit ~ 1.2 meters, rounded
    const rawDist = Math.sqrt(dx * dx + dy * dy) * 1.2;
    return Math.max(12, Math.round(rawDist));
  }

  /**
   * Deterministically selects the best available worker based on qualification, availability, and plant distance.
   */
  static selectBestWorker(incident: Incident, workers: WorkerUser[]): {
    bestWorker: WorkerUser;
    distanceMeters: number;
    etaSeconds: number;
    rankedCandidates: { worker: WorkerUser; distanceMeters: number; qualified: boolean }[];
  } | null {
    if (!workers || workers.length === 0) return null;

    // Determine required skill based on incident title & component
    const requiredSkills: string[] = [];
    if (incident.targetComponent?.toLowerCase().includes('bearing') || incident.title.toLowerCase().includes('bearing')) {
      requiredSkills.push('bearing', 'cnc', 'spindle');
    } else if (incident.title.toLowerCase().includes('electrical') || incident.title.toLowerCase().includes('pump')) {
      requiredSkills.push('electrical', 'drive');
    } else {
      requiredSkills.push('mechanics', 'tooling');
    }

    // Rank all workers
    const rankedCandidates = workers.map((worker) => {
      const distance = this.calculateWorkerDistance(worker, incident.stationId);
      const isQualified = worker.skills.some((skill) =>
        requiredSkills.some((req) => skill.toLowerCase().includes(req))
      );
      return {
        worker,
        distanceMeters: distance,
        qualified: isQualified
      };
    });

    // Available workers first, qualified first, then closest distance
    const sorted = [...rankedCandidates].sort((a, b) => {
      // 1. Availability check
      if (a.worker.availability === 'AVAILABLE' && b.worker.availability !== 'AVAILABLE') return -1;
      if (a.worker.availability !== 'AVAILABLE' && b.worker.availability === 'AVAILABLE') return 1;

      // 2. Skill match
      if (a.qualified && !b.qualified) return -1;
      if (!a.qualified && b.qualified) return 1;

      // 3. Closest distance
      return a.distanceMeters - b.distanceMeters;
    });

    const topCandidate = sorted[0];
    const walkSpeedMetersPerSec = 1.1; // ~4 km/h industrial walking speed
    const etaSeconds = Math.round(topCandidate.distanceMeters / walkSpeedMetersPerSec) + 15; // 15s transit prep

    return {
      bestWorker: topCandidate.worker,
      distanceMeters: topCandidate.distanceMeters,
      etaSeconds,
      rankedCandidates: sorted
    };
  }

  /**
   * Generates initial maintenance task for the chosen worker
   */
  static createMaintenanceTask(
    incident: Incident,
    worker: WorkerUser,
    distanceMeters: number,
    etaSeconds: number
  ): MaintenanceTask {
    return {
      id: `TSK-${incident.id.replace('INC-', '')}-${Date.now().toString().slice(-4)}`,
      incidentId: incident.id,
      machineId: incident.machineId,
      stationId: incident.stationId,
      targetComponent: incident.targetComponent || 'Bearing #02 (Rear Support Deep-Groove)',
      issue: incident.title,
      assignedWorkerId: worker.id,
      assignedWorkerName: worker.name,
      priority: incident.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      state: 'PENDING',
      distanceMeters,
      etaSeconds,
      createdAt: new Date().toISOString(),
      steps: [
        { id: 'step-accept', label: 'Accept Maintenance Request', completed: false, details: 'Acknowledge assignment on mobile terminal' },
        { id: 'step-nav', label: 'Transit & Arrive at Station', completed: false, details: `Navigate to ${incident.stationId} in Zone B (${distanceMeters}m)` },
        { id: 'step-loto', label: 'Safety Lockout / Tagout (LOTO)', completed: false, details: 'Isolate auxiliary electrical & pneumatic drive lines' },
        { id: 'step-inspect', label: 'Inspect Bearing #02 Vibration', completed: false, details: 'Mount handheld contact transducer to confirm 6.8 mm/s spike' },
        { id: 'step-service', label: 'Execute Component Replacement', completed: false, details: 'Simulated extraction & seating of precision bearing unit' },
        { id: 'step-test', label: 'Post-Maintenance Spin Test', completed: false, details: 'Spin test at 3,000 RPM; verify harmonic resonance < 1.8 mm/s' }
      ],
      notes: [
        'AI Diagnosis: Possible bearing degradation (91% confidence).',
        'Recommended Action: Inspect Bearing #02 and verify harmonic resonance.'
      ]
    };
  }
}
