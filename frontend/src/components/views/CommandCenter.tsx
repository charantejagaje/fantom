import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Cpu, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Zap,
  Wrench,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { FactoryCanvas } from '../3d/FactoryCanvas';
import { StationTelemetry, AIRecommendation } from '../../types';
import { AimlBadge } from '../common/AimlConceptExplainer';
import { HelpTooltip } from '../common/HelpTooltip';

interface CommandCenterProps {
  stations: StationTelemetry[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  onInvestigateRootCause: () => void;
  onOpenQualityView: () => void;
  onOpenFlowView: () => void;
  onOpenSimulationLab: () => void;
  onOpenMachineInspection: (stationId: string) => void;
  onOpenWorkerDispatch: () => void;
  recommendations: AIRecommendation[];
  workerNavigating?: boolean;
  onWorkerArrived?: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  onInvestigateRootCause,
  onOpenQualityView,
  onOpenFlowView,
  onOpenSimulationLab,
  onOpenMachineInspection,
  onOpenWorkerDispatch,
  recommendations,
  workerNavigating,
  onWorkerArrived,
  onOpenAimlGuide
}) => {
  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[2]; // Default to S03

  // Aggregate metrics
  const totalQueue = stations.reduce((acc, s) => acc + s.queueUnits, 0);
  const avgHealth = (stations.reduce((acc, s) => acc + s.healthScore, 0) / stations.length).toFixed(1);
  const criticalCount = stations.filter((s) => s.status === 'CRITICAL').length;
  const warningCount = stations.filter((s) => s.status === 'WARNING').length;

  return (
    <div id="fantom-command-center-root" className="flex flex-col gap-4 p-4 lg:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-120px)]">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#159A62] animate-pulse"></div>
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-bold">FACTORY OVERVIEW</span>
            <h1 className="text-lg font-black text-[#1A1F2B] font-sans">COMMAND CENTER (Live Factory View)</h1>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="hidden sm:flex items-center gap-1 text-xs font-sans text-slate-500 font-medium">
            <span>Live Digital Factory Model (Digital Twin)</span>
            <HelpTooltip term="digitalTwin" />
          </div>
          <AimlBadge termId="telemetry-twin" onOpenGuide={onOpenAimlGuide} />
          <AimlBadge termId="covariate-shift" onOpenGuide={onOpenAimlGuide} />
        </div>

        <div className="flex items-center gap-2 text-xs font-sans font-bold">
          <button
            onClick={() => onOpenMachineInspection('S03')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11141B] text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Cpu size={14} className="text-[#38E08A]" />
            <span>Look Inside Machine (3D View)</span>
          </button>

          <button
            onClick={onOpenWorkerDispatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Wrench size={14} className="text-[#159A62]" />
            <span>Call / Dispatch Worker</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Command Grid: LEFT (Zones) | CENTER (3D Twin) | RIGHT (AI Intelligence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
        
        {/* LEFT COLUMN: Factory Navigation / Zones (Col 1-3) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Station Hierarchy Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-[11px] font-sans uppercase tracking-wider text-slate-500 font-bold">
                Factory Line Machines
              </span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                6 / 18 Online
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
              {stations.map((st) => {
                const isSelected = selectedStationId === st.id;
                const isBottleneck = st.isBottleneck;
                return (
                  <div
                    key={st.id}
                    id={`station-list-item-${st.id}`}
                    onClick={() => onSelectStation(st.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#159A62] bg-[#159A62]/5 shadow-xs'
                        : isBottleneck
                        ? 'border-red-200 bg-red-50/50 hover:bg-red-50'
                        : 'border-slate-150 bg-slate-50/70 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{st.id}</span>
                        <span className="text-xs font-semibold text-slate-700">{st.shortCode}</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                          st.status === 'CRITICAL'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : st.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {st.status === 'CRITICAL' ? 'ALERT' : st.status === 'WARNING' ? 'WARNING' : 'HEALTHY'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 truncate font-sans">{st.name}</p>

                    <div className="grid grid-cols-3 gap-1 mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] font-sans text-slate-600">
                      <div>
                        <div className="text-slate-400 text-[9px] flex items-center">
                          Busy
                          <HelpTooltip term="utilization" className="ml-0.5 scale-75 origin-left" />
                        </div>
                        <strong className="text-slate-800 font-mono">{st.utilizationPct}%</strong>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[9px] flex items-center">
                          Waiting
                          <HelpTooltip term="buffer" className="ml-0.5 scale-75 origin-left" />
                        </div>
                        <strong className={st.queueUnits > 100 ? 'text-red-600 font-bold font-mono' : 'text-slate-800 font-mono'}>
                          {st.queueUnits}
                        </strong>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[9px] flex items-center">
                          Per Part
                          <HelpTooltip term="cycleTime" className="ml-0.5 scale-75 origin-left" />
                        </div>
                        <strong className="text-slate-800 font-mono">{st.cycleTimeSec}s</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zone Summary Chips */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center text-[10px] font-sans">
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[9px]">ZONE A</span>
                <span className="text-emerald-600 font-bold">Normal</span>
              </div>
              <div className="p-1.5 bg-red-50 rounded border border-red-100">
                <span className="text-red-400 block font-semibold text-[9px]">ZONE B</span>
                <span className="text-red-600 font-bold">Slowed Down</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[9px]">ZONE C</span>
                <span className="text-amber-600 font-bold">Watch</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Large 3D Digital Twin (Col 4-8 or 4-9) */}
        <div className="lg:col-span-6 flex flex-col gap-3 min-h-[460px]">
          <div className="relative flex-1 rounded-xl overflow-hidden shadow-sm border border-slate-800 bg-[#11141B]">
            <FactoryCanvas
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={onSelectStation}
              workerNavigating={workerNavigating}
              onWorkerArrived={onWorkerArrived}
            />
          </div>

          {/* Quick Active Station Diagnostic Ribbon below 3D scene */}
          {selectedStation && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedStation.status === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Cpu size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{selectedStation.id}: {selectedStation.name}</span>
                    {selectedStation.isBottleneck && (
                      <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-sans font-bold flex items-center">
                        SLOWING DOWN LINE (Bottleneck)
                        <HelpTooltip term="bottleneck" className="ml-1" />
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-[11px] font-sans flex flex-wrap items-center gap-x-2 mt-0.5">
                    <span>Speed: {selectedStation.operatingCondition.spindleRpm} RPM</span>
                    <span>•</span>
                    <span className="flex items-center">
                      Shaking: {selectedStation.operatingCondition.vibrationMmSec} mm/s
                      <HelpTooltip term="vibration" className="ml-1" />
                    </span>
                    <span>•</span>
                    <span>Cooling Temp: {selectedStation.operatingCondition.coolantTempCelsius}°C</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-sans font-bold">
                <button
                  onClick={() => onOpenMachineInspection(selectedStation.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Look Inside Part (3D)
                </button>
                <button
                  onClick={onInvestigateRootCause}
                  className="px-3 py-1.5 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] transition-colors flex items-center gap-1"
                >
                  <span>Find Why It Broke (Root Cause)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI Intelligence Panel (Col 10-12) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* FANTOM Intelligence Panel */}
          <div id="fantom-intelligence-panel" className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-[#159A62]">
                  <Sparkles size={16} />
                  <span className="font-sans text-xs font-bold tracking-wider uppercase">AI ASSISTANT FINDINGS</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-sans uppercase text-slate-400 font-bold block mb-1">
                    CURRENT FACTORY STATUS
                  </span>
                  <p className="font-sans">Production flow is smooth and normal in Zones A and C.</p>
                  <p className="mt-1 font-medium text-red-900 font-sans">
                    <strong>Station 03 (CNC-04)</strong> is clogged up and slowing down the whole line.
                  </p>
                </div>

                <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-lg text-red-950">
                  <span className="text-[10px] font-sans uppercase font-bold text-red-700 block mb-1 flex items-center">
                    TOO MANY BAD PARTS (Defect Spike)
                    <HelpTooltip term="defect" className="ml-1" />
                  </span>
                  <p className="font-sans">
                    Too many flawed parts for <strong>Turbine Impeller (Variant B)</strong>: <strong>7.7%</strong> of parts made in this batch are damaged.
                  </p>
                  <div className="mt-2 text-[11px] text-red-800 space-y-0.5 font-sans">
                    <div>• Parts taking <strong>6.6 seconds longer</strong> per unit</div>
                    <div>• Spindle bearing shaking violently (<strong>6.8 mm/s</strong>)</div>
                    <div>• <strong>142 parts</strong> backed up waiting in line</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-amber-950">
                  <span className="text-[10px] font-sans uppercase font-bold text-amber-800 block mb-1 flex items-center">
                    MONEY & PRODUCTION RISK
                    <HelpTooltip term="scrap" className="ml-1" />
                  </span>
                  <p className="font-sans">
                    Making 14% fewer parts per hour, and losing an estimated <strong>$50,300</strong> in wasted materials and fixing bad parts.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons in AI Intelligence Panel */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                id="btn-ai-investigate"
                onClick={onInvestigateRootCause}
                className="w-full py-2.5 px-3 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs font-sans"
              >
                <span>[ FIND WHY THIS HAPPENED ]</span>
                <ArrowRight size={14} />
              </button>

              <button
                id="btn-ai-simulate-rec"
                onClick={onOpenSimulationLab}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors font-sans"
              >
                <span>Test Fix Before Doing It (Simulation)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STRIP: Live Production Intelligence Strip */}
      <div id="live-production-intelligence-strip" className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-bold">
            LIVE PRODUCTION NUMBERS & FACTORY HEALTH
          </span>
          <span className="text-[11px] font-mono text-slate-500">UPDATED: JUST NOW (LIVE)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Metric 1 */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center text-[10px] font-sans uppercase text-slate-400 font-bold">
              <span>Parts Made Today</span>
              <HelpTooltip term="throughput" className="ml-1" />
            </div>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">8,200 <span className="text-xs font-normal text-slate-500 font-sans">units</span></p>
            <span className="text-[10px] font-sans text-red-600 flex items-center gap-0.5 font-bold">
              <TrendingDown size={12} /> -14% vs Goal
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center text-[10px] font-sans uppercase text-slate-400 font-bold">
              <span>Parts Waiting (S03)</span>
              <HelpTooltip term="bottleneck" className="ml-1" />
            </div>
            <p className="font-mono font-bold text-lg text-red-600 mt-0.5">142 <span className="text-xs font-normal text-slate-500 font-sans">units</span></p>
            <span className="text-[10px] font-sans text-red-600 font-semibold">96.4% Busy (Clogged)</span>
          </div>

          {/* Metric 3 */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center text-[10px] font-sans uppercase text-slate-400 font-bold">
              <span>All Waiting Parts</span>
              <HelpTooltip term="buffer" className="ml-1" />
            </div>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">{totalQueue} <span className="text-xs font-normal text-slate-500 font-sans">units</span></p>
            <span className="text-[10px] font-sans text-slate-500">Across 6 Machines</span>
          </div>

          {/* Metric 4 */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center text-[10px] font-sans uppercase text-slate-400 font-bold">
              <span>Bad Parts %</span>
              <HelpTooltip term="defect" className="ml-1" />
            </div>
            <p className="font-mono font-bold text-lg text-amber-600 mt-0.5">5.8% <span className="text-xs font-normal text-slate-500 font-sans">average</span></p>
            <span className="text-[10px] font-sans text-red-600 font-semibold">7.7% on Variant B</span>
          </div>

          {/* Metric 5 */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center text-[10px] font-sans uppercase text-slate-400 font-bold">
              <span>Factory Health</span>
            </div>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">{avgHealth}%</p>
            <span className="text-[10px] font-sans text-amber-600 font-semibold">1 Alert, 1 Warning</span>
          </div>

          {/* Metric 6 */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center text-[10px] font-sans uppercase text-slate-400 font-bold">
              <span>Money at Risk</span>
              <HelpTooltip term="scrap" className="ml-1" />
            </div>
            <p className="font-mono font-bold text-lg text-red-600 mt-0.5">-$116,100</p>
            <span className="text-[10px] font-sans text-slate-500">Ruined parts + delays</span>
          </div>
        </div>
      </div>
    </div>
  );
};
