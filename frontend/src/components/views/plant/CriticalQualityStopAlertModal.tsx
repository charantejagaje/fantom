import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  Eye, 
  PauseCircle, 
  CheckCircle2, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';

export const CriticalQualityStopAlertModal: React.FC = () => {
  const { 
    showCriticalStopModal, 
    setShowCriticalStopModal, 
    acknowledgeAndSimulateStop,
    openCrackWorkflow,
    batches
  } = useSimulatedPlantStore();

  if (!showCriticalStopModal) return null;

  const targetBatch = batches.find((b) => b.batchNumber === 'B-2048') || batches[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div 
        id="critical-quality-stop-alert-modal"
        className="w-full max-w-2xl bg-slate-950 border-2 border-rose-500 rounded-2xl text-white shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Urgent Header Banner */}
        <div className="bg-rose-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-black/20 text-white animate-pulse">
              <AlertOctagon size={24} />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest font-black text-rose-100 block">
                SAFETY LEVEL 1 // ESCALATION TRIGGER
              </span>
              <h3 className="font-sans font-black text-lg tracking-tight text-white">
                CRITICAL QUALITY ALERT
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowCriticalStopModal(false)}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-700/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Location Callout */}
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2">
            <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wide block">
              Repeated defect pattern detected in:
            </span>
            <div className="grid grid-cols-2 gap-2 text-sm font-sans">
              <div>
                <span className="text-slate-400 text-xs block">Production Batch:</span>
                <strong className="text-white text-base font-mono">{targetBatch.batchNumber}</strong>
                <span className="text-slate-400 text-xs block">({targetBatch.component})</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Production Line & Area:</span>
                <strong className="text-white text-base font-mono">Line 02 — Final Inspection</strong>
                <span className="text-slate-400 text-xs block">High-Resolution Optical Camera Bay</span>
              </div>
            </div>
          </div>

          {/* Details & AI Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                ISSUE IDENTIFIED
              </span>
              <p className="text-slate-200 text-sm font-bold">
                Multiple visible cracks detected (3 indications within current batch)
              </p>
              <p className="text-slate-400 text-[11px]">
                High-contrast linear discontinuity signature matches thermal fatigue cracking pattern.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block">
                AI ASSESSMENT
              </span>
              <p className="text-amber-300 text-sm font-bold">
                High concern (Statistical threshold breached)
              </p>
              <p className="text-slate-400 text-[11px]">
                Crack frequency surged by 300% relative to prior baseline batches B-2046 and B-2047.
              </p>
            </div>
          </div>

          {/* Recommended Action Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-mono text-[11px] font-bold text-rose-300 uppercase block">
                Recommended Action:
              </span>
              <p className="text-slate-200 font-sans text-sm font-semibold">
                PAUSE PRODUCTION FOR ENGINEERING REVIEW
              </p>
              <p className="text-slate-400 font-sans">
                Temporarily halt Line 02 infeed to inspect clamping tool pressure, spindle chatter, and guide roller alignment before further scrap is generated.
              </p>
            </div>
          </div>

          {/* Safety & Realism Rule Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <ShieldAlert size={16} className="text-emerald-400 shrink-0" />
            <span>
              Simulated action only — no real machinery connected. Action will update the simulated plant state to &quot;PAUSED — SIMULATED&quot;.
            </span>
          </div>

          {/* Two Primary User Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              id="btn-alert-review-evidence"
              onClick={() => {
                setShowCriticalStopModal(false);
                openCrackWorkflow();
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 shadow-sm"
            >
              <Eye size={15} className="text-blue-400" />
              <span>[ REVIEW EVIDENCE ]</span>
            </button>

            <button
              id="btn-alert-simulate-stop"
              onClick={() => acknowledgeAndSimulateStop(targetBatch.batchNumber)}
              className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <PauseCircle size={15} />
              <span>[ ACKNOWLEDGE & SIMULATE STOP ]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
