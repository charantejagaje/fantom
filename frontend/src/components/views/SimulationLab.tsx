import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { SimulationParameters, SimulationResultMetrics } from '../../types';
import { 
  DEFAULT_SIMULATION_PARAMS, 
  BASELINE_METRICS, 
  runFactorySimulation 
} from '../../services/simulationEngine';
import { AimlBadge } from '../common/AimlConceptExplainer';

interface SimulationLabProps {
  onApplyRecommendation?: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  onApplyRecommendation,
  onOpenAimlGuide
}) => {
  const [params, setParams] = useState<SimulationParameters>(DEFAULT_SIMULATION_PARAMS);
  const [results, setResults] = useState<SimulationResultMetrics>(() => runFactorySimulation(DEFAULT_SIMULATION_PARAMS));
  const [hasRun, setHasRun] = useState<boolean>(true);

  const handleRun = () => {
    const updated = runFactorySimulation(params);
    setResults(updated);
    setHasRun(true);
  };

  const handleReset = () => {
    setParams(DEFAULT_SIMULATION_PARAMS);
    setResults(BASELINE_METRICS);
  };

  // Deltas
  const throughputDelta = results.throughputUnits - BASELINE_METRICS.throughputUnits;
  const throughputPct = ((throughputDelta / BASELINE_METRICS.throughputUnits) * 100).toFixed(1);
  const queueDelta = results.bottleneckQueueUnits - BASELINE_METRICS.bottleneckQueueUnits;
  const defectDelta = (results.overallDefectRatePct - BASELINE_METRICS.overallDefectRatePct).toFixed(1);
  const marginDelta = results.estimatedMarginUsd - BASELINE_METRICS.estimatedMarginUsd;

  return (
    <div id="fantom-simulation-lab-root" className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              PREDICTIVE DIGITAL EXPERIMENTATION
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              SIMULATED / ADVISORY ONLY
            </span>
            <AimlBadge termId="simulation-lab" onOpenGuide={onOpenAimlGuide} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">SIMULATION LAB</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            &quot;Test a process change before recommending it.&quot; Evaluate load balancing, cycle dampening, and queue dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Baseline</span>
          </button>
          <button
            id="btn-run-simulation"
            onClick={handleRun}
            className="px-4 py-2 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] flex items-center gap-2 font-bold shadow-xs transition-colors"
          >
            <Play size={14} />
            <span>RUN SIMULATION</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Parametric Controls (Left) vs Before/After Impact (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Simulation Parameter Sliders (Col 1-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sliders size={16} className="text-[#159A62]" />
              <span>Process Parameter Adjustments</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Hypothetical Levers</span>
          </div>

          {/* Slider 1: Load Balance Shift (S03 -> S04) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <label htmlFor="slider-loadbalance" className="font-semibold text-slate-800">Workload Shift (S03 &rarr; S04)</label>
              <span className="text-[#159A62] font-bold">{params.loadBalanceShiftPct}% Offloaded</span>
            </div>
            <input
              id="slider-loadbalance"
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.loadBalanceShiftPct}
              onChange={(e) => setParams({ ...params, loadBalanceShiftPct: parseInt(e.target.value) })}
              className="w-full accent-[#159A62] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">
              Transfers rough deburring passes to S04 (which has 38.8% idle headroom).
            </span>
          </div>

          {/* Slider 2: Feed-Rate Optimization & Dampening */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <label htmlFor="slider-feedrate" className="font-semibold text-slate-800">Feed-Rate Dampening (Variant B)</label>
              <span className="text-[#159A62] font-bold">-{params.feedRateOptimizationPct}% Vibration</span>
            </div>
            <input
              id="slider-feedrate"
              type="range"
              min="0"
              max="30"
              step="2"
              value={params.feedRateOptimizationPct}
              onChange={(e) => setParams({ ...params, feedRateOptimizationPct: parseInt(e.target.value) })}
              className="w-full accent-[#159A62] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">
              Dampens spindle resonant chatter at 12,800 RPM to suppress blade root micro-cracks.
            </span>
          </div>

          {/* Slider 3: Cycle Time Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <label htmlFor="slider-cycletime" className="font-semibold text-slate-800">Cycle Time Multiplier</label>
              <span className="text-slate-800 font-bold">{params.cycleTimeMultiplier.toFixed(2)}x</span>
            </div>
            <input
              id="slider-cycletime"
              type="range"
              min="0.75"
              max="1.35"
              step="0.05"
              value={params.cycleTimeMultiplier}
              onChange={(e) => setParams({ ...params, cycleTimeMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-slate-700 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">
              Scales nominal machining duration against tool wear rates.
            </span>
          </div>

          {/* Slider 4: Planned Downtime (Minutes / Shift) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <label htmlFor="slider-downtime" className="font-semibold text-slate-800">Planned Downtime / Maintenance</label>
              <span className="text-slate-800 font-bold">{params.plannedDowntimeMinutes} min</span>
            </div>
            <input
              id="slider-downtime"
              type="range"
              min="10"
              max="60"
              step="2"
              value={params.plannedDowntimeMinutes}
              onChange={(e) => setParams({ ...params, plannedDowntimeMinutes: parseInt(e.target.value) })}
              className="w-full accent-slate-700 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">
              Includes preemptive spindle bearing calibration stops.
            </span>
          </div>

          {/* Safety Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck size={16} className="text-[#159A62]" />
            <span>Mathematical simulation models. No hardware actuation.</span>
          </div>
        </div>

        {/* RIGHT: BEFORE / AFTER Side-by-Side Comparison (Col 6-12) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                BEFORE VS AFTER SIMULATED PROJECTIONS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                SIMULATION CONVERGED
              </span>
            </div>

            {/* Comparison Cards: CURRENT vs SIMULATED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CURRENT CARD */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    CURRENT STATE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    MEASURED
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Throughput:</span>
                    <strong className="text-slate-900 text-sm">
                      {BASELINE_METRICS.throughputUnits.toLocaleString()} units
                    </strong>
                  </div>

                  <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">S03 Queue Buffer:</span>
                    <strong className="text-red-600 text-sm">
                      {BASELINE_METRICS.bottleneckQueueUnits} units
                    </strong>
                  </div>

                  <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Defect Rate:</span>
                    <strong className="text-amber-600 text-sm">
                      {BASELINE_METRICS.overallDefectRatePct}%
                    </strong>
                  </div>

                  <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Total Run Losses:</span>
                    <strong className="text-red-600 text-sm">
                      -${(BASELINE_METRICS.scrapLossUsd + BASELINE_METRICS.reworkLossUsd + BASELINE_METRICS.downtimeLossUsd).toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-700 font-bold">Estimated Margin:</span>
                    <strong className="text-slate-900 text-base">
                      ${BASELINE_METRICS.estimatedMarginUsd.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SIMULATED CARD */}
              <div className="p-4 rounded-xl border border-[#21C47A] bg-emerald-50/40 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A62]">
                    SIMULATED OUTCOME
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#159A62] text-white font-bold">
                    PREDICTED
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-emerald-100">
                    <span className="text-slate-600">Throughput:</span>
                    <div className="text-right">
                      <strong className="text-slate-900 text-sm">{results.throughputUnits.toLocaleString()} units</strong>
                      <span className="ml-2 text-[11px] font-bold text-emerald-600">
                        (+{throughputPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-1.5 border-b border-emerald-100">
                    <span className="text-slate-600">S03 Queue Buffer:</span>
                    <div className="text-right">
                      <strong className="text-slate-900 text-sm">{results.bottleneckQueueUnits} units</strong>
                      <span className="ml-2 text-[11px] font-bold text-emerald-600">
                        ({queueDelta} u)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-1.5 border-b border-emerald-100">
                    <span className="text-slate-600">Defect Rate:</span>
                    <div className="text-right">
                      <strong className="text-slate-900 text-sm">{results.overallDefectRatePct}%</strong>
                      <span className="ml-2 text-[11px] font-bold text-emerald-600">
                        ({defectDelta}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-1.5 border-b border-emerald-100">
                    <span className="text-slate-600">Total Run Losses:</span>
                    <div className="text-right">
                      <strong className="text-slate-900 text-sm">
                        -${(results.scrapLossUsd + results.reworkLossUsd + results.downtimeLossUsd).toLocaleString()}
                      </strong>
                      <span className="ml-2 text-[11px] font-bold text-emerald-600">
                        (-$12,400)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-800 font-bold">Estimated Margin:</span>
                    <div className="text-right">
                      <strong className="text-emerald-700 text-base font-extrabold">
                        ${results.estimatedMarginUsd.toLocaleString()}
                      </strong>
                      <span className="ml-2 text-[11px] font-bold text-emerald-600">
                        (+${marginDelta.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Recommendation Card */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono text-slate-500">
              Simulated Margin Recovery: <strong className="text-emerald-700 text-sm font-bold">+${marginDelta.toLocaleString()} / shift</strong>
            </div>

            {onApplyRecommendation && (
              <button
                onClick={onApplyRecommendation}
                className="px-4 py-2 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Format as Evidence-Based Advisory &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
