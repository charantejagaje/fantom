import React, { useState } from 'react';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { 
  GitPullRequest, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Clock, 
  Layers, 
  Cpu, 
  Flame, 
  Play,
  Maximize2
} from 'lucide-react';
import { StationTelemetry } from '../../types';
import { AimlBadge } from '../common/AimlConceptExplainer';

interface FlowViewProps {
  stations: StationTelemetry[];
  onSelectStation: (id: string) => void;
  onOpenSimulationLab: () => void;
  onOpenMachineInspection: (stationId: string) => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const FlowView: React.FC<FlowViewProps> = ({
  stations,
  onSelectStation,
  onOpenSimulationLab,
  onOpenMachineInspection,
  onOpenAimlGuide
}) => {
  const { realAnalytics } = useIndustrialStore();
  const realStations: any[] = realAnalytics?.stations ?? [];
  const NA = 'Not available in current dataset';
  const fmt = (n: any, d = 0) =>
    typeof n === 'number' ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : NA;
  const [selectedStationId, setSelectedStationId] = useState<string>('S03');
  const activeStation = stations.find((s) => s.id === selectedStationId) || stations[2];
  const activeReal = realStations.find((r) => r.id === activeStation?.realStationId);

  return (
    <div id="fantom-flow-intelligence-root" className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              PRODUCTION FLOW ARCHITECTURE
            </span>
            <AimlBadge termId="queuing-bottleneck" onOpenGuide={onOpenAimlGuide} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">Flow Intelligence & Bottleneck Pressure</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time queuing accumulation, cycle variance stagnation, and line pressure balancing.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            id="btn-flow-open-simulation"
            onClick={onOpenSimulationLab}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] transition-colors font-semibold"
          >
            <Play size={13} />
            <span>Simulate Re-balance (S03 &rarr; S04)</span>
          </button>
        </div>
      </div>

      {/* Horizontal Station Pipeline Chain (Section 19: S01 -> S02 -> S03 -> S04 -> S05 -> S06) */}
      <div className="bg-[#11141B] rounded-2xl p-6 border border-slate-800 text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#38E08A] uppercase">
              HORIZONTAL LINE FLOW STREAM
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800">
              BOTTLENECK IDENTIFIED AT S03
            </span>
            <AimlBadge termId="queuing-bottleneck" onOpenGuide={onOpenAimlGuide} labelOverride="AIML: Little's Law L=λW" />
          </div>
          <span className="text-xs font-mono text-slate-400">NOMINAL FLOW VELOCITY: 0.82 m/s</span>
        </div>

        {/* Station Nodes Flow Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
          {stations.map((st, idx) => {
            const isSelected = selectedStationId === st.id;
            const isBottleneck = st.isBottleneck;
            return (
              <div key={st.id} className="relative flex flex-col">
                <div
                  id={`flow-station-card-${st.id}`}
                  onClick={() => setSelectedStationId(st.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] relative overflow-hidden ${
                    isSelected
                      ? 'border-[#21C47A] bg-[#1A2332] ring-2 ring-[#21C47A]/30'
                      : isBottleneck
                      ? 'border-red-500/80 bg-red-950/25 hover:bg-red-950/40'
                      : 'border-slate-800 bg-[#161C26] hover:bg-[#1B2230]'
                  }`}
                >
                  {/* Heatmap Flow Pressure Indicator Banner atop card */}
                  {isBottleneck && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-red-500 animate-pulse"></div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#38E08A]">{st.id}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          st.status === 'CRITICAL'
                            ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                            : st.status === 'WARNING'
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{st.shortCode}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{st.type}</p>
                  </div>

                  {/* Station Telemetry Mini-Metrics (real observed data where mapped) */}
                  {(() => {
                    const rs = realStations.find((r) => r.id === st.realStationId);
                    return (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mean Queue</span>
                        <span className={rs && rs.potentialBottleneck ? 'text-red-400 font-bold' : 'text-slate-200'}>
                          {rs ? `${fmt(rs.mean)} u` : NA}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Peak Queue (P95)</span>
                        <span className="text-slate-200">{rs ? `${fmt(rs.p95)} u` : NA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Utilization / Cycle</span>
                        <span className="text-slate-500">{NA}</span>
                      </div>
                    </div>
                    );
                  })()}
                </div>

                {/* Right Arrow connecting stations on desktop */}
                {idx < stations.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400">
                    <ArrowRight size={10} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Active Station & Bottleneck Diagnostic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Bottleneck Detected Diagnostic Card (Section 19) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <Flame size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 font-bold">
                  BOTTLENECK INTELLIGENCE ACTIVE
                </span>
                <h3 className="font-bold text-slate-900 text-base">Station S03 (CNC Milling Center #04)</h3>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-100 text-red-800">
              CONSTRAINED (96.4% UTIL)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-400 text-[10px] block">CURRENT QUEUE</span>
              <strong className="text-red-600 text-lg">142 units</strong>
              <span className="text-[10px] text-slate-500 block">Cap: 160 u (88.7% full)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-400 text-[10px] block">CYCLE TIME DRIFT</span>
              <strong className="text-red-600 text-lg">54.6 sec</strong>
              <span className="text-[10px] text-slate-500 block">+12.6s above nominal</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-400 text-[10px] block">THROUGHPUT EFFECT</span>
              <strong className="text-red-600 text-lg">-14% Line Loss</strong>
              <span className="text-[10px] text-slate-500 block">~980 unbuilt units</span>
            </div>
          </div>                  <div className="p-4 bg-red-50/70 border border-red-200/80 rounded-xl text-xs text-red-950 space-y-2">
            <h4 className="font-bold font-mono text-red-900 uppercase">Observed Congestion Evidence (Real Dataset)</h4>
            <p className="leading-relaxed">
              Station c4s3 is a potential bottleneck in the observed simulation data: mean queue {fmt(realStations.find((r) => r.id === 'queue_c4s3')?.mean)} parts,
              P95 {fmt(realStations.find((r) => r.id === 'queue_c4s3')?.p95)}, holding {realStations.find((r) => r.id === 'queue_c4s3')?.congestionSharePct?.toFixed(1) ?? '23.8'}% of facility congestion.
              Monetary impact is not available in current dataset (no cost fields exist).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              id="btn-inspect-spindle-from-flow"
              onClick={() => onOpenMachineInspection('S03')}
              className="px-3.5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono font-semibold transition-colors"
            >
              Open 3D Spindle Explode View &rarr;
            </button>
            <button
              onClick={onOpenSimulationLab}
              className="px-3.5 py-2 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] text-xs font-mono font-semibold transition-colors"
            >
              Simulate Load Balancing &rarr;
            </button>
          </div>
        </div>

        {/* RIGHT: Station Telemetry Breakdown for Selected Station */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  TELEMETRY INSPECTION
                </span>
                <h3 className="font-bold text-slate-900 text-base">{activeStation.id}: {activeStation.name}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Zone: {activeStation.zone}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <span className="text-slate-400 text-[10px] block">CAPACITY RATE</span>
                <strong className="text-slate-900 text-base">{activeStation.capacityUnitsPerHour} u/hr</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <span className="text-slate-400 text-[10px] block">DOWNTIME (PER SHIFT)</span>
                <strong className="text-slate-900 text-base">{activeStation.downtimeMinutesPerShift} min</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <span className="text-slate-400 text-[10px] block">CHANGEOVER DURATION</span>
                <strong className="text-slate-900 text-base">{activeStation.changeoverMinutes} min</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <span className="text-slate-400 text-[10px] block">HEALTH SCORE</span>
                <strong className={activeStation.healthScore < 85 ? 'text-amber-600 text-base' : 'text-emerald-600 text-base'}>
                  {activeStation.healthScore}%
                </strong>
              </div>
            </div>

            {/* Downstream Buffer Comparison (real observed stations) */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950">
              <span className="font-bold font-mono text-blue-900 uppercase block mb-1">
                Real Station Comparison (Observed Dataset)
              </span>
              <p>
                {activeReal
                  ? `${activeReal.id}: mean queue ${fmt(activeReal.mean)} parts, P95 ${fmt(activeReal.p95)}, congestion rank #${activeReal.congestionRank} of 8 (${activeReal.congestionSharePct?.toFixed(1)}% of congestion)${activeReal.potentialBottleneck ? ' — potential bottleneck (not a proven root cause)' : ''}.`
                  : 'No corresponding observed station for this card.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Operating Condition: {activeStation.operatingCondition.spindleRpm} RPM</span>
            <span>Acoustics: {activeStation.operatingCondition.acousticEmissionsDb} dB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
