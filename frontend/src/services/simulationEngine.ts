import { SimulationParameters, SimulationResultMetrics } from '../types';

export const DEFAULT_SIMULATION_PARAMS: SimulationParameters = {
  cycleTimeMultiplier: 1.0,
  capacityUnitsPerHour: 100,
  plannedDowntimeMinutes: 38,
  changeoverMinutes: 28,
  targetDefectRatePct: 5.8,
  inspectionSamplingRatePct: 100,
  batchSizeUnits: 250,
  loadBalanceShiftPct: 25, // 25% transferred from S03 to S04
  feedRateOptimizationPct: 12
};

export const BASELINE_METRICS: SimulationResultMetrics = {
  throughputUnits: 8200,
  bottleneckQueueUnits: 142,
  overallDefectRatePct: 5.8,
  scrapLossUsd: 31400,
  reworkLossUsd: 18900,
  downtimeLossUsd: 24600,
  estimatedMarginUsd: 395900,
  marginRatePct: 24.1
};

export function runFactorySimulation(params: SimulationParameters): SimulationResultMetrics {
  // 1. Calculate Throughput Impact
  // Base throughput is 8,200 units.
  // Load balancing away from S03 bottleneck relieves cycle stagnation.
  const loadBalanceBenefit = (params.loadBalanceShiftPct / 100) * 1100; // up to +1100 units
  const cycleTimeEffect = (1 - (params.cycleTimeMultiplier - 1.0)) * 500;
  const downtimeDeduction = (params.plannedDowntimeMinutes - 20) * 22; // every minute saved recovers throughput

  const simulatedThroughput = Math.round(
    Math.max(5000, Math.min(11500, 8200 + loadBalanceBenefit + cycleTimeEffect - downtimeDeduction))
  );

  // 2. Bottleneck Queue (Station 03)
  // Base queue is 142 units. Load balancing directly reduces queue.
  const queueRelief = (params.loadBalanceShiftPct / 100) * 110;
  const feedAdjustmentRelief = (params.feedRateOptimizationPct / 100) * 25;
  const simulatedQueue = Math.max(12, Math.round(142 - queueRelief - feedAdjustmentRelief + (params.cycleTimeMultiplier > 1 ? (params.cycleTimeMultiplier - 1) * 40 : 0)));

  // 3. Defect Rate (%)
  // Spindle harmonic dampening / feed rate optimization lowers defects.
  const defectReduction = (params.feedRateOptimizationPct / 100) * 1.8 + (params.loadBalanceShiftPct / 100) * 1.0;
  const simulatedDefectRate = Math.max(
    1.2,
    Number((5.8 - defectReduction).toFixed(2))
  );

  // 4. Economic Waterfall Calculation
  // Total units inspected: simulatedThroughput
  const defectiveUnits = Math.round(simulatedThroughput * (simulatedDefectRate / 100));
  const scrapRatio = 0.65; // 65% of defects scrapped, 35% reworked
  const scrapUnits = Math.round(defectiveUnits * scrapRatio);
  const reworkUnits = defectiveUnits - scrapUnits;

  const scrapLossUsd = Math.round(scrapUnits * 128); // $128/unit scrap
  const reworkLossUsd = Math.round(reworkUnits * 42); // $42/unit rework
  const downtimeLossUsd = Math.round(params.plannedDowntimeMinutes * 380); // $380/min downtime

  // Gross potential margin if 100% yield at $62/unit contribution margin
  const grossPotentialMargin = simulatedThroughput * 62.4;
  const estimatedMarginUsd = Math.round(
    grossPotentialMargin - scrapLossUsd - reworkLossUsd - downtimeLossUsd
  );
  const revenueEst = simulatedThroughput * 185;
  const marginRatePct = Number(((estimatedMarginUsd / revenueEst) * 100).toFixed(1));

  return {
    throughputUnits: simulatedThroughput,
    bottleneckQueueUnits: simulatedQueue,
    overallDefectRatePct: simulatedDefectRate,
    scrapLossUsd,
    reworkLossUsd,
    downtimeLossUsd,
    estimatedMarginUsd,
    marginRatePct
  };
}
