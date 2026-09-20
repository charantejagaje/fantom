import React from 'react';
import { 
  Factory, 
  Layers, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  Eye, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  Cpu, 
  Sliders 
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';
import { SimulatedPlantArea, PlantQualityStatus, PlantProductionStatus } from '../../../types/simulatedPlant';

interface VirtualPlantOverviewProps {
  onSelectAreaForInspection?: (areaId: string) => void;
}

export const VirtualPlantOverview: React.FC<VirtualPlantOverviewProps> = ({
  onSelectAreaForInspection
}) => {
  const { 
    areas, 
    selectedAreaId, 
    setSelectedAreaId, 
    pauseLine, 
    resumeLine, 
    setShowCriticalStopModal,
    openCrackWorkflow
  } = useSimulatedPlantStore();

  const getQualityBadge = (status: PlantQualityStatus) => {
    switch (status) {
      case 'STOP RECOMMENDED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
            <AlertOctagon size={11} />
            <span>STOP RECOMMENDED</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
            <AlertTriangle size={11} />
            <span>CRITICAL</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            WARNING
          </span>
        );
      case 'WATCH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            WATCH
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>NORMAL</span>
          </span>
        );
    }
  };

  const getProductionBadge = (prodStatus: PlantProductionStatus) => {
    switch (prodStatus) {
      case 'PAUSED — SIMULATED':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[10px] font-mono font-bold">
            PAUSED — SIMULATED
          </span>
        );
      case 'UNDER REVIEW':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[10px] font-mono font-bold">
            UNDER REVIEW
          </span>
        );
      case 'QUALITY HOLD — SIMULATED':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30 text-[10px] font-mono font-bold">
            QUALITY HOLD — SIMULATED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">
            RUNNING
          </span>
        );
    }
  };

  return (
    <div id="virtual-plant-visualization-root" className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Factory size={16} className="text-emerald-400" />
            <span className="text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
              VIRTUAL PLANT VISUALIZATION // SIMULATED FACTORY CELLS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time simulated telemetry across 7 primary manufacturing inspection zones. Click any zone to view camera stacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            7 Inspection Zones Active (Simulated)
          </span>
        </div>
      </div>

      {/* 7 Plant Area Industrial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {areas.map((area, idx) => {
          const isSelected = selectedAreaId === area.id;
          const isStopRecommended = area.qualityStatus === 'STOP RECOMMENDED';
          const isCritical = area.qualityStatus === 'CRITICAL' || isStopRecommended;

          return (
            <div
              key={area.id}
              id={`plant-area-card-${area.id}`}
              onClick={() => {
                setSelectedAreaId(area.id);
                if (onSelectAreaForInspection) onSelectAreaForInspection(area.id);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'border-emerald-400 bg-slate-800/95 ring-2 ring-emerald-400/30 shadow-lg'
                  : isStopRecommended
                  ? 'border-rose-500/80 bg-rose-950/30 hover:bg-rose-950/45'
                  : isCritical
                  ? 'border-red-500/60 bg-red-950/20 hover:bg-red-950/35'
                  : 'border-slate-800 bg-slate-900/90 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Highlight bar atop card */}
              {isStopRecommended && (
                <div className="absolute top-0 inset-x-0 h-1 bg-rose-500 animate-pulse"></div>
              )}

              <div>
                {/* Station numbering & Quality Status */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    STAGE {idx + 1}
                  </span>
                  {getQualityBadge(area.qualityStatus)}
                </div>

                {/* Station Name */}
                <h4 className="font-sans font-black text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {area.name}
                </h4>
                <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                  {area.line}
                </span>

                {/* Batch & Production Status */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Batch:</span>
                    <span className="text-white font-bold bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                      {area.currentBatch}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Processed:</span>
                    <span className="text-slate-200">{area.productsProcessed} u</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Defects:</span>
                    <span className={area.defectsDetected > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {area.defectsDetected} {area.criticalDefects > 0 && `(${area.criticalDefects} crit)`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Inspection:</span>
                    <span className={`text-[9px] font-bold ${
                      area.inspectionStatus === 'HOLD' 
                        ? 'text-rose-400' 
                        : area.inspectionStatus === 'ELEVATED' 
                        ? 'text-amber-400' 
                        : 'text-emerald-400'
                    }`}>
                      {area.inspectionStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom footer state & quick triggers */}
              <div className="mt-3 pt-2 border-t border-slate-800/90 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Status:</span>
                  {getProductionBadge(area.productionStatus)}
                </div>

                {isStopRecommended && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCriticalStopModal(true);
                    }}
                    className="w-full mt-1 py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono text-[9px] font-bold transition-colors flex items-center justify-center gap-1 shadow-xs animate-pulse"
                  >
                    <AlertOctagon size={11} />
                    <span>REVIEW STOP ALERT</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
