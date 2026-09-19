import React, { useState } from 'react';
import { 
  GitBranch, 
  Layers, 
  Cpu, 
  Activity, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { RootCauseNode } from '../../types';
import { ROOT_CAUSE_ALL_NODES } from '../../data/mockData';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { AimlBadge } from '../common/AimlConceptExplainer';

interface RootCauseViewProps {
  onOpenSimulationLab: () => void;
  onOpenMachineInspection: (stationId: string) => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const RootCauseView: React.FC<RootCauseViewProps> = ({
  onOpenSimulationLab,
  onOpenMachineInspection,
  onOpenAimlGuide
}) => {
  const { realAnalytics } = useIndustrialStore();
  const realStations: any[] = realAnalytics?.stations ?? [];
  const rawCorr: Record<string, Record<string, number>> = realAnalytics?.associations?.rawCorrelations ?? {};
  const NA = 'Not available in current dataset';
  const fmt = (n: any, d = 0) =>
    typeof n === 'number' ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : NA;
  const corrFor = (st: string, cell: string) => rawCorr?.[st]?.[cell];
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-station');
  const selectedNode = ROOT_CAUSE_ALL_NODES.find((n) => n.id === selectedNodeId) || ROOT_CAUSE_ALL_NODES[2];
  // Real association summaries (Step 7): the dominant cell-WIP partner per hotspot.
  const hotspotSummary = [
    { st: 'queue_c1s2', cell: 'wip_cell2' },
    { st: 'queue_c4s3', cell: 'wip_cell3' },
  ].map(({ st, cell }) => ({
    st, cell,
    r: corrFor(st, cell),
    mean: realStations.find((x) => x.id === st)?.mean,
    p95: realStations.find((x) => x.id === st)?.p95,
    rank: realStations.find((x) => x.id === st)?.congestionRank,
    share: realStations.find((x) => x.id === st)?.congestionSharePct,
  }));
  const h1 = hotspotSummary[0];
  const h2 = hotspotSummary[1];

  return (
    <div id="fantom-root-cause-explorer-root" className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              CAUSAL ASSOCIATION ARCHITECTURE
            </span>
            <AimlBadge termId="bayesian-dag" onOpenGuide={onOpenAimlGuide} />
            <AimlBadge termId="causation-caveat" onOpenGuide={onOpenAimlGuide} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">Root Cause & Process Association Explorer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-tier observational graph linking quality deviations, production batches, station telemetry, and process physics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5 font-medium">
            <Info size={13} />
            <span>OBSERVATIONAL ASSOCIATIONS ONLY — NON-DETERMINISTIC CAUSALITY</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Hierarchy Graph & Evidence Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Multi-Tier Interactive Relationship Graph (Col 1-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                HIERARCHICAL ASSOCIATION TREE
              </span>
              <span className="text-xs font-mono text-slate-500">Click node to inspect supporting evidence</span>
            </div>

            {/* Tree Flow Representation */}
            <div className="space-y-4 relative">
              {/* Level 1: Defect */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-[11px] font-mono uppercase font-bold text-slate-400 text-right">
                  Defect
                </div>
                <div
                  id="node-defect-btn"
                  onClick={() => setSelectedNodeId('node-defect')}
                  className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedNodeId === 'node-defect'
                      ? 'border-[#159A62] bg-[#159A62]/10 ring-2 ring-[#159A62]/20'
                      : 'border-red-200 bg-red-50/60 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Queue Congestion at Hotspot Stations (Observed)</h4>
                    <span className="text-xs font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                      {h1.rank ?? 1}+{h2.rank ?? 2} Congestion
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Stations {h1.st.replace('queue_', '')} and {h2.st.replace('queue_', '')} hold the facility's longest queues in the observed simulation dataset (605,616 runs)
                  </p>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="ml-28 h-4 border-l-2 border-slate-200"></div>

              {/* Level 2: Batch */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-[11px] font-mono uppercase font-bold text-slate-400 text-right">
                  Batch
                </div>
                <div
                  id="node-batch-btn"
                  onClick={() => setSelectedNodeId('node-batch')}
                  className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedNodeId === 'node-batch'
                      ? 'border-[#159A62] bg-[#159A62]/10 ring-2 ring-[#159A62]/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Facility WIP Inputs (Observed)</h4>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      4 cells
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Mean facility work-in-process ≈ {fmt(59363)} parts, balanced across cells 1-4</p>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="ml-28 h-4 border-l-2 border-slate-200"></div>

              {/* Level 3: Station */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-[11px] font-mono uppercase font-bold text-slate-400 text-right">
                  Station
                </div>
                <div
                  id="node-station-btn"
                  onClick={() => setSelectedNodeId('node-station')}
                  className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedNodeId === 'node-station'
                      ? 'border-[#159A62] bg-[#159A62]/10 ring-2 ring-[#159A62]/20'
                      : 'border-amber-200 bg-amber-50/60 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Congestion Hotspots: c1s2 & c4s3 (Observed)</h4>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {h1.rank ?? 1} / {h2.rank ?? 2} by mean queue
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Mean queues {fmt(h1.mean)} and {fmt(h2.mean)} parts; {h1.share?.toFixed(1) ?? '24.5'}% + {h2.share?.toFixed(1) ?? '23.8'}% of facility congestion
                  </p>
                </div>
              </div>

              {/* Connecting Line with fork to conditions */}
              <div className="ml-28 h-4 border-l-2 border-slate-200"></div>

              {/* Level 4: Operating Conditions & Process Metrics (Forked) */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-24 text-[11px] font-mono uppercase font-bold text-slate-400 text-right">
                    Condition 1
                  </div>
                  <div
                    id="node-cond-vib-btn"
                    onClick={() => setSelectedNodeId('node-cond-vib')}
                    className={`flex-1 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedNodeId === 'node-cond-vib'
                        ? 'border-[#159A62] bg-[#159A62]/10 ring-2 ring-[#159A62]/20'
                        : 'border-red-200 bg-red-50/40 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900">c1s2 congestion ↔ cell-2 WIP (association)</strong>
                      <span className="text-[10px] font-mono text-red-600 font-bold">r = {h1.r?.toFixed(3) ?? '0.992'} (observed)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 text-[11px] font-mono uppercase font-bold text-slate-400 text-right">
                    Condition 2
                  </div>
                  <div
                    id="node-cond-temp-btn"
                    onClick={() => setSelectedNodeId('node-cond-temp')}
                    className={`flex-1 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedNodeId === 'node-cond-temp'
                        ? 'border-[#159A62] bg-[#159A62]/10 ring-2 ring-[#159A62]/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900">c4s3 congestion ↔ cell-3 WIP (association)</strong>
                      <span className="text-[10px] font-mono text-slate-700 font-bold">r = {h2.r?.toFixed(3) ?? '1.000'} (observed)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 text-[11px] font-mono uppercase font-bold text-slate-400 text-right">
                    Metric
                  </div>
                  <div
                    id="node-cond-time-btn"
                    onClick={() => setSelectedNodeId('node-cond-time')}
                    className={`flex-1 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedNodeId === 'node-cond-time'
                        ? 'border-[#159A62] bg-[#159A62]/10 ring-2 ring-[#159A62]/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900">Load-share associations are conditional (joint OLS), not one-at-a-time</strong>
                      <span className="text-[10px] font-mono text-slate-700 font-bold">Step 7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Graph Source: Ingested Inspection + Production Telemetry</span>
            <span className="text-[#159A62]">Statistical Bayesian Mapping</span>
          </div>
        </div>

        {/* RIGHT: Supporting Evidence Panel (Section 18) (Col 8-12) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-[#159A62]">
                <FileCheck size={18} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">EVIDENCE DOSSIER</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-bold">
                NODE: {selectedNode.category.toUpperCase()}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {selectedNodeId === 'node-defect' ? 'Queue Congestion Hotspots (Observed)' : selectedNode.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {selectedNodeId === 'node-defect'
                ? `Observed simulation dataset: stations c1s2 (mean ${fmt(h1.mean)} parts) and c4s3 (mean ${fmt(h2.mean)} parts) are potential bottlenecks — NOT proven root causes.`
                : selectedNode.subtext}
            </p>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-3 my-5 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <span className="text-[10px] text-slate-400 uppercase block">Observed Runs (Real Dataset)</span>
                <strong className="text-slate-900 text-lg">605,616</strong>
                <span className="text-[10px] text-slate-500 block">facility_sim_clean.csv</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase block">Observed Association</span>
                  <AimlBadge termId="pearson-correlation" onOpenGuide={onOpenAimlGuide} />
                </div>
                <strong className="text-emerald-600 text-lg">
                  r = {selectedNodeId === 'node-cond-vib' ? (h1.r?.toFixed(3) ?? '—') : selectedNodeId === 'node-cond-temp' ? (h2.r?.toFixed(3) ?? '—') : '—'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Pearson r, marginal view</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase block">Hotspot Mean Queues</span>
                  <AimlBadge termId="queuing-bottleneck" onOpenGuide={onOpenAimlGuide} />
                </div>
                <strong className="text-slate-900 text-lg">{fmt(h1.mean)} / {fmt(h2.mean)}</strong>
                <span className="text-[10px] text-slate-500 block">c1s2 / c4s3 parts waiting</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <span className="text-[10px] text-slate-400 uppercase block">Inference Type</span>
                <strong className="text-slate-900 text-lg">Correlative</strong>
                <span className="text-[10px] text-slate-500 block">Advisory — association only</span>
              </div>
            </div>

            {/* Scientific Caveat Banner */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
              <div className="flex items-center justify-between font-bold font-mono text-amber-950 mb-1">
                <div className="flex items-center gap-1.5">
                  <Info size={14} />
                  <span>EPIDEMIOLOGICAL CAVEAT</span>
                </div>
                <AimlBadge termId="causation-caveat" onOpenGuide={onOpenAimlGuide} />
              </div>
              <p className="leading-relaxed">
                {selectedNode.caveatNote}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              id="btn-rootcause-open-spindle"
              onClick={() => onOpenMachineInspection('S03')}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Cpu size={14} />
              <span>Inspect Bearing #02 on 3D Spindle &rarr;</span>
            </button>
            <button
              onClick={onOpenSimulationLab}
              className="w-full py-2 px-4 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Test Process Countermeasure in Simulation Lab</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
