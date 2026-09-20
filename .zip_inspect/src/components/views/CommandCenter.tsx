import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon,
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
  Maximize2,
  Factory,
  Camera,
  Sliders,
  ShieldAlert,
  Play,
  Pause,
  Eye
} from 'lucide-react';
import { FactoryCanvas } from '../3d/FactoryCanvas';
import { StationTelemetry, AIRecommendation } from '../../types';
import { AimlBadge } from '../common/AimlConceptExplainer';
import { HelpTooltip } from '../common/HelpTooltip';

// Simulated Plant Components
import { VirtualPlantOverview } from './plant/VirtualPlantOverview';
import { SimulatedImageStackingGallery } from './plant/SimulatedImageStackingGallery';
import { CriticalQualityStopAlertModal } from './plant/CriticalQualityStopAlertModal';
import { CrackWorkflowModal } from './plant/CrackWorkflowModal';
import { InspectionDetailModal } from './plant/InspectionDetailModal';
import { EngineerDecisionControlPanel } from './plant/EngineerDecisionControlPanel';
import { DefectPatternDetectionWidget } from './plant/DefectPatternDetectionWidget';
import { LiveInspectionStreamBanner } from './plant/LiveInspectionStreamBanner';
import { useSimulatedPlantStore } from '../../store/useSimulatedPlantStore';

interface CommandCenterProps {
  stations: StationTelemetry[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  onInvestigateRootCause: () => void;
  onOpenQualityView: () => void;
  onOpenFlowView?: () => void;
  onOpenSimulationLab?: () => void;
  onOpenMachineInspection: (stationId: string) => void;
  onOpenWorkerDispatch: () => void;
  onOpenAIIntervention?: () => void;
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
  onOpenAIIntervention,
  recommendations,
  workerNavigating,
  onWorkerArrived,
  onOpenAimlGuide
}) => {
  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[2]; // Default to S03

  const {
    demoPlantMode,
    toggleDemoPlantMode,
    batches,
    areas,
    showCriticalStopModal,
    setShowCriticalStopModal,
    openCrackWorkflow,
    acknowledgeAndSimulateStop
  } = useSimulatedPlantStore();

  // Internal view mode switcher for Command Center
  const [commandViewMode, setCommandViewMode] = useState<'virtual_plant' | 'digital_twin' | 'control_panel' | 'full'>(
    'virtual_plant'
  );

  // Aggregate metrics from stations
  const totalQueue = stations.reduce((acc, s) => acc + s.queueUnits, 0);
  const avgHealth = (stations.reduce((acc, s) => acc + s.healthScore, 0) / stations.length).toFixed(1);

  // Active batch and alert status
  const batchB2048 = batches.find((b) => b.batchNumber === 'B-2048') || batches[0];
  const finalInspectionArea = areas.find((a) => a.id === 'AREA-06') || areas[5];
  const hasCriticalStopRecommended = finalInspectionArea.qualityStatus === 'STOP RECOMMENDED' || batchB2048.qualityStatus === 'STOP RECOMMENDED';

  return (
    <div id="fantom-command-center-root" className="flex flex-col gap-5 p-4 lg:p-6 max-w-[1700px] mx-auto min-h-[calc(100vh-120px)] animate-in fade-in">
      
      {/* 1. TOP STATUS & NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#159A62] animate-pulse"></div>
          <div>
            <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-bold">
              FACTORY TELEMETRY & DECISION INTELLIGENCE
            </span>
            <h1 className="text-xl font-black text-[#1A1F2B] font-sans tracking-tight">
              COMMAND CENTER // VIRTUAL MANUFACTURING PLANT
            </h1>
          </div>
          <span className="hidden md:inline text-slate-300">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span>Simulated Plant Prototype</span>
            <HelpTooltip term="digitalTwin" />
          </div>
        </div>

        {/* Action Controls & Demo Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Demo Plant Mode Toggle Button */}
          <button
            id="btn-toggle-demo-plant-mode"
            onClick={toggleDemoPlantMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
              demoPlantMode
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${demoPlantMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>DEMO PLANT MODE: {demoPlantMode ? 'ON (SIMULATED)' : 'OFF'}</span>
          </button>

          <button
            onClick={() => onOpenMachineInspection('S03')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11141B] text-white hover:bg-slate-800 transition-colors shadow-xs font-mono text-xs font-bold"
          >
            <Cpu size={14} className="text-[#38E08A]" />
            <span>Look Inside Machine (3D)</span>
          </button>

          <button
            onClick={onOpenWorkerDispatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition-colors font-mono text-xs font-bold"
          >
            <Wrench size={14} className="text-blue-600" />
            <span>Dispatch Worker</span>
          </button>
        </div>
      </div>

      {/* 2. SAFETY & SIMULATION REALISM NOTICE STRIP */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">DEMO SAFETY NOTICE:</strong> Plant, machines, cameras, production stops, and worker instructions are simulated in software. No physical PLCs connected.
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Line 02 Status: <strong className="text-amber-300">{finalInspectionArea.productionStatus}</strong>
        </span>
      </div>

      {/* 2.5 LIVE CONTINUOUS SIMULATED INSPECTION STREAM BANNER */}
      <LiveInspectionStreamBanner 
        onOpenDefectVision={onOpenQualityView}
        onOpenAIIntervention={onOpenAIIntervention}
      />

      {/* 3. CRITICAL QUALITY STOP ALERT BANNER (If Stop Recommended) */}
      {hasCriticalStopRecommended && (
        <div 
          id="critical-quality-stop-banner"
          className="bg-rose-950/80 border-2 border-rose-500 rounded-2xl p-4 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in"
        >
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white animate-pulse shrink-0">
              <AlertOctagon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-rose-300">
                  CRITICAL QUALITY ALERT // REPEATED DEFECT PATTERN DETECTED
                </span>
                <span className="px-2 py-0.2 rounded bg-rose-900 text-[10px] font-mono font-bold text-white border border-rose-700">
                  HIGH CONCERN
                </span>
              </div>
              <h3 className="font-sans font-black text-base md:text-lg text-white mt-0.5">
                Batch {batchB2048.batchNumber} (Line 02 — Final Inspection): Multiple Visible Cracks Detected
              </h3>
              <p className="text-xs text-rose-200/90 font-sans mt-0.5">
                Crack frequency surged by 300%. AI recommends pausing production for engineering review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="banner-btn-review-evidence"
              onClick={() => openCrackWorkflow()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Eye size={14} className="text-blue-400" />
              <span>[ REVIEW EVIDENCE ]</span>
            </button>

            <button
              id="banner-btn-simulate-stop"
              onClick={() => acknowledgeAndSimulateStop(batchB2048.batchNumber)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
            >
              <AlertOctagon size={14} />
              <span>[ ACKNOWLEDGE & SIMULATE STOP ]</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. SUB-VIEW NAVIGATION SWITCHER */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'virtual_plant', label: 'Virtual Plant & Image Stacks (7 Zones)', icon: Factory },
            { id: 'control_panel', label: 'Virtual Production Control & Worker Dispatch', icon: Sliders },
            { id: 'digital_twin', label: 'Digital Twin (3D Kinematic Model)', icon: Eye },
            { id: 'full', label: 'All-in-One Comprehensive View', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = commandViewMode === tab.id;
            return (
              <button
                key={tab.id}
                id={`cmd-view-tab-${tab.id}`}
                onClick={() => setCommandViewMode(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Batch B-2048 Active</span>
        </div>
      </div>

      {/* 5. DYNAMIC VIEW PANELS */}

      {/* VIEW A: VIRTUAL PLANT & IMAGE STACKS (Requested Primary Section) */}
      {(commandViewMode === 'virtual_plant' || commandViewMode === 'full') && (
        <div className="space-y-6">
          {/* 7 Simulated Plant Inspection Zones Overview */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-xl text-white">
            <VirtualPlantOverview
              onSelectAreaForInspection={() => {}}
            />
          </div>

          {/* Automatic Image Stacking & Inspection Gallery */}
          <SimulatedImageStackingGallery
            onOpenCrackDossier={(img) => openCrackWorkflow(img)}
          />

          {/* Defect Pattern Detection & Batch Comparison + Action History */}
          <DefectPatternDetectionWidget />
        </div>
      )}

      {/* VIEW B: VIRTUAL PRODUCTION CONTROL & DISPATCH */}
      {(commandViewMode === 'control_panel' || commandViewMode === 'full') && (
        <div className="space-y-6">
          <EngineerDecisionControlPanel />
        </div>
      )}

      {/* VIEW C: DIGITAL TWIN 3D SCENE & TELEMETRY (Preserved Existing View) */}
      {(commandViewMode === 'digital_twin' || commandViewMode === 'full') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* LEFT: Machine List */}
            <div className="lg:col-span-3 flex flex-col gap-3">
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
                            <div className="text-slate-400 text-[9px]">Busy</div>
                            <strong className="text-slate-800 font-mono">{st.utilizationPct}%</strong>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[9px]">Waiting</div>
                            <strong className={st.queueUnits > 100 ? 'text-red-600 font-bold font-mono' : 'text-slate-800 font-mono'}>
                              {st.queueUnits}
                            </strong>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[9px]">Cycle</div>
                            <strong className="text-slate-800 font-mono">{st.cycleTimeSec}s</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CENTER: 3D Factory Canvas */}
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
                          <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-sans font-bold">
                            BOTTLENECK
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px] font-sans flex flex-wrap items-center gap-x-2 mt-0.5">
                        <span>Speed: {selectedStation.operatingCondition.spindleRpm} RPM</span>
                        <span>•</span>
                        <span>Vibration: {selectedStation.operatingCondition.vibrationMmSec} mm/s</span>
                        <span>•</span>
                        <span>Temp: {selectedStation.operatingCondition.coolantTempCelsius}°C</span>
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
                      <span>Find Root Cause</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: AI Assistant Findings */}
            <div className="lg:col-span-3 flex flex-col gap-3">
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
                      <p className="font-sans">Production flow is smooth in Zones A and C.</p>
                      <p className="mt-1 font-medium text-red-900 font-sans">
                        <strong>Station 03 (CNC-04)</strong> is bottlenecked. Batch B-2048 shows crack indications on Line 02.
                      </p>
                    </div>

                    <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-lg text-red-950">
                      <span className="text-[10px] font-sans uppercase font-bold text-red-700 block mb-1">
                        DEFECT SPIKE DETECTED
                      </span>
                      <p className="font-sans">
                        Excessive flaw rate for <strong>Metal Housing</strong>: repeated micro-cracks flagged by AOI cameras.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={onInvestigateRootCause}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] font-bold text-xs flex items-center justify-center gap-2 transition-colors font-sans shadow-xs"
                  >
                    <span>[ FIND WHY THIS HAPPENED ]</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. BOTTOM STRIP: Live Production Numbers & Factory Health */}
      <div id="live-production-intelligence-strip" className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-bold">
            LIVE PRODUCTION NUMBERS & FACTORY HEALTH (SIMULATED TELEMETRY)
          </span>
          <span className="text-[11px] font-mono text-slate-500">UPDATED: JUST NOW (LIVE)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-sans uppercase text-slate-400 font-bold">Parts Made Today</div>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">8,200 <span className="text-xs font-normal text-slate-500 font-sans">units</span></p>
            <span className="text-[10px] font-sans text-red-600 flex items-center gap-0.5 font-bold">
              <TrendingDown size={12} /> -14% vs Goal
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-sans uppercase text-slate-400 font-bold">Active Batch</div>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">B-2048</p>
            <span className="text-[10px] font-mono text-rose-600 font-semibold">3 Cracks Detected</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-sans uppercase text-slate-400 font-bold">All Waiting Parts</div>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">{totalQueue} <span className="text-xs font-normal text-slate-500 font-sans">units</span></p>
            <span className="text-[10px] font-sans text-slate-500">Across 7 Zones</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-sans uppercase text-slate-400 font-bold">Defect Rate</div>
            <p className="font-mono font-bold text-lg text-amber-600 mt-0.5">5.8% <span className="text-xs font-normal text-slate-500 font-sans">average</span></p>
            <span className="text-[10px] font-sans text-red-600 font-semibold">7.5% on Batch B-2048</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-sans uppercase text-slate-400 font-bold">Factory Health</div>
            <p className="font-mono font-bold text-lg text-slate-900 mt-0.5">{avgHealth}%</p>
            <span className="text-[10px] font-sans text-amber-600 font-semibold">1 Alert, 1 Warning</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-sans uppercase text-slate-400 font-bold">Money at Risk</div>
            <p className="font-mono font-bold text-lg text-red-600 mt-0.5">-$116,100</p>
            <span className="text-[10px] font-sans text-slate-500">Simulated scrap + delays</span>
          </div>
        </div>
      </div>

      {/* 7. EMBEDDED MODALS */}
      <CriticalQualityStopAlertModal />
      <CrackWorkflowModal />
      <InspectionDetailModal />
    </div>
  );
};
