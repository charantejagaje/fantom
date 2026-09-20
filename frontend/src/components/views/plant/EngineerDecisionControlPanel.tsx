import React, { useState } from 'react';
import { 
  PauseCircle, 
  PlayCircle, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  ShieldAlert, 
  Sliders, 
  FileText, 
  UserCheck, 
  Clock, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';

const PRESET_WORKER_INSTRUCTIONS = [
  'Inspect Batch B-2048 again.',
  'Hold the affected components.',
  'Check the component surface.',
  'Move defective components to inspection.',
  'Perform reinspection of Line 02 output.',
  'Do not release the affected batch.',
  'Send the selected parts for engineering review.',
  'Increase inspection frequency.'
];

export const EngineerDecisionControlPanel: React.FC = () => {
  const { 
    areas,
    batches,
    selectedBatchId,
    pauseLine, 
    resumeLine, 
    holdBatch, 
    releaseBatchForReview, 
    increaseInspection, 
    requestRecheck, 
    escalateQualityIssue, 
    markForEngineeringReview,
    issueWorkerInstruction,
    workerInstructions,
    lastSimulatedActionNotice,
    dismissActionNotice
  } = useSimulatedPlantStore();

  const [customInstruction, setCustomInstruction] = useState('');
  const [targetArea, setTargetArea] = useState('Final Inspection');

  const currentBatch = batches.find((b) => b.batchNumber === selectedBatchId) || batches[0];
  const activeArea = areas.find((a) => a.name === targetArea) || areas[5];

  const handleSendCustomInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInstruction.trim()) return;
    issueWorkerInstruction(customInstruction.trim(), targetArea, currentBatch.batchNumber);
    setCustomInstruction('');
  };

  return (
    <div id="engineer-decision-control-root" className="space-y-6">
      {/* 1. Live Simulated Production State Callout & Status Feedback */}
      {lastSimulatedActionNotice && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{lastSimulatedActionNotice}</span>
          </div>
          <button 
            onClick={dismissActionNotice}
            className="text-[10px] text-emerald-400 hover:text-white underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Virtual Production-Control Panel (8 Actions) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-emerald-400" />
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  VIRTUAL PRODUCTION-CONTROL PANEL
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                Batch {currentBatch.batchNumber} Target
              </span>
            </div>

            {/* Current Selected Line Status Display */}
            <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT MONITORED LINE:</span>
                <strong className="text-white text-sm">{activeArea.line}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">PRODUCTION STATUS:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  activeArea.productionStatus.includes('PAUSED')
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : activeArea.productionStatus.includes('HOLD')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {activeArea.productionStatus}
                </span>
              </div>
            </div>

            {/* The 8 Simulated Decision Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. PAUSE LINE */}
              <button
                id="btn-ctrl-pause-line"
                onClick={() => pauseLine('Line 02', 'Manual engineer simulated halt for defect review')}
                className="p-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">PAUSE LINE</span>
                  <PauseCircle size={14} className="text-rose-400" />
                </div>
                <span className="text-[10px] text-rose-300/80 font-sans">Simulated stop</span>
              </button>

              {/* 2. RESUME LINE */}
              <button
                id="btn-ctrl-resume-line"
                onClick={() => resumeLine('Line 02')}
                className="p-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">RESUME LINE</span>
                  <PlayCircle size={14} className="text-emerald-400" />
                </div>
                <span className="text-[10px] text-emerald-300/80 font-sans">Restart feed</span>
              </button>

              {/* 3. HOLD BATCH */}
              <button
                id="btn-ctrl-hold-batch"
                onClick={() => holdBatch(currentBatch.batchNumber)}
                className="p-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">HOLD BATCH</span>
                  <AlertTriangle size={14} className="text-amber-400" />
                </div>
                <span className="text-[10px] text-amber-300/80 font-sans">Quarantine parts</span>
              </button>

              {/* 4. RELEASE BATCH FOR REVIEW */}
              <button
                id="btn-ctrl-release-batch"
                onClick={() => releaseBatchForReview(currentBatch.batchNumber)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">RELEASE BATCH</span>
                  <CheckCircle2 size={14} className="text-blue-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Gated sample</span>
              </button>

              {/* 5. INCREASE INSPECTION */}
              <button
                id="btn-ctrl-increase-inspection"
                onClick={() => increaseInspection(currentBatch.batchNumber)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">INCREASE QA</span>
                  <RefreshCw size={14} className="text-blue-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-sans">100% optical</span>
              </button>

              {/* 6. REQUEST RECHECK */}
              <button
                id="btn-ctrl-request-recheck"
                onClick={() => requestRecheck(currentBatch.batchNumber)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">REQUEST RECHECK</span>
                  <RefreshCw size={14} className="text-amber-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Manual micrometer</span>
              </button>

              {/* 7. ESCALATE QUALITY ISSUE */}
              <button
                id="btn-ctrl-escalate-quality"
                onClick={() => escalateQualityIssue(currentBatch.batchNumber)}
                className="p-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-purple-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">ESCALATE</span>
                  <Sparkles size={14} className="text-purple-400" />
                </div>
                <span className="text-[10px] text-purple-300/80 font-sans">Executive alert</span>
              </button>

              {/* 8. MARK FOR ENGINEERING REVIEW */}
              <button
                id="btn-ctrl-mark-review"
                onClick={() => markForEngineeringReview(currentBatch.batchNumber)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-left transition-all flex flex-col justify-between min-h-[85px] active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs font-bold">MARK REVIEW</span>
                  <FileText size={14} className="text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Engineering log</span>
              </button>
            </div>
          </div>

          {/* Safety Notice Footer */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <ShieldAlert size={15} className="text-emerald-400 shrink-0" />
            <span>
              Simulated action — no real machinery connected. All changes affect simulated plant models only.
            </span>
          </div>
        </div>

        {/* Right: Worker Instructions (Simulated Command System) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-blue-600" />
                <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">
                  WORKER INSTRUCTIONS // SIMULATED COMMAND
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                SIMULATED COMMAND
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Dispatch simulated operational instructions to field operators and inspection bays.
            </p>

            {/* Quick Presets Picker */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                1-CLICK STANDARD INSTRUCTION PRESETS:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {PRESET_WORKER_INSTRUCTIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => issueWorkerInstruction(preset, targetArea, currentBatch.batchNumber)}
                    className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-sans text-slate-700 transition-colors truncate"
                  >
                    &quot;{preset}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instruction Dispatch Form */}
            <form onSubmit={handleSendCustomInstruction} className="mt-4 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Enter custom operator instruction..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-sans text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-mono text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>

          {/* Recent Worker Instructions Log */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>RECENT SIMULATED INSTRUCTIONS</span>
              <span>{workerInstructions.length} Logged</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {workerInstructions.slice(0, 3).map((instr) => (
                <div key={instr.id} className="p-2 rounded-lg bg-slate-50 border border-slate-150 text-xs font-sans space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{instr.area} • Batch {instr.batchNumber}</span>
                    <span>{instr.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-medium leading-tight">
                    &quot;{instr.instructionText}&quot;
                  </p>
                  <span className="text-[9px] font-mono text-blue-600 font-bold block">
                    STATUS: SIMULATED COMMAND
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[10px] font-mono text-slate-400 text-center pt-1">
              Notice: Do NOT send these instructions to real workers or external systems.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
