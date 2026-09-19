import { StationTelemetry, Incident, WorkerUser, EconomicBaseline } from '../types';

export interface BusinessSummaryMetrics {
  factoryHealthScore: number;
  totalThroughputUnits: number;
  goodUnitsProduced: number;
  overallDefectRatePct: number;
  totalScrapCostUsd: number;
  totalReworkCostUsd: number;
  totalDowntimeCostUsd: number;
  totalShiftLossUsd: number;
  estimatedNetMarginUsd: number;
  marginErosionPct: number;
  activeBottlenecksCount: number;
  openIncidentsCount: number;
  criticalIncidentsCount: number;
  availableWorkersCount: number;
  totalWorkersCount: number;
}

export class EconomicService {
  static calculateBusinessSummary(
    stations: StationTelemetry[],
    incidents: Incident[],
    workers: WorkerUser[],
    baseline: EconomicBaseline
  ): BusinessSummaryMetrics {
    // 1. Factory health: weighted average across 18 stations
    const avgHealth = stations.length > 0
      ? stations.reduce((acc, s) => acc + s.healthScore, 0) / stations.length
      : 89.2;

    // 2. Throughput & defective units
    const totalThroughput = 8420; // units manufactured in current run
    const activeBottlenecks = stations.filter((s) => s.isBottleneck || (s.utilizationPct > 90 && s.queueUnits > 80));
    const openIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
    const criticalIncidents = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED');

    const defectRate = criticalIncidents.length > 0 ? 4.7 : 1.2;
    const goodUnits = Math.round(totalThroughput * (1 - defectRate / 100));

    // 3. Cost impacts
    const scrapCost = criticalIncidents.length > 0 ? 31400 : 8200;
    const reworkCost = criticalIncidents.length > 0 ? 19800 : 4500;
    const downtimeCost = criticalIncidents.length > 0 ? 23700 : 3100;
    const throughputLoss = criticalIncidents.length > 0 ? 41200 : 0;
    const totalShiftLoss = scrapCost + reworkCost + downtimeCost + throughputLoss;

    // 4. Margins
    const nominalGrossMargin = baseline.expectedMarginTotalUsd || 480000;
    const estimatedNetMargin = Math.max(0, nominalGrossMargin - totalShiftLoss);
    const marginErosion = ((totalShiftLoss / nominalGrossMargin) * 100);

    // 5. Worker metrics
    const availableWorkers = workers.filter((w) => w.availability === 'AVAILABLE').length;

    return {
      factoryHealthScore: Math.round(avgHealth * 10) / 10,
      totalThroughputUnits: totalThroughput,
      goodUnitsProduced: goodUnits,
      overallDefectRatePct: defectRate,
      totalScrapCostUsd: scrapCost,
      totalReworkCostUsd: reworkCost,
      totalDowntimeCostUsd: downtimeCost,
      totalShiftLossUsd: totalShiftLoss,
      estimatedNetMarginUsd: estimatedNetMargin,
      marginErosionPct: Math.round(marginErosion * 10) / 10,
      activeBottlenecksCount: activeBottlenecks.length,
      openIncidentsCount: openIncidents.length,
      criticalIncidentsCount: criticalIncidents.length,
      availableWorkersCount: availableWorkers,
      totalWorkersCount: workers.length
    };
  }
}
