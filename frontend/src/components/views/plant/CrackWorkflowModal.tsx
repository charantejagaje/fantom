import React from 'react';
import { 
  AlertOctagon, 
  X, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  PauseCircle, 
  PlayCircle, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';
import { SimulatedInspectionImage } from '../../../types/simulatedPlant';

export const CrackWorkflowModal: React.FC = () => {
  const { 
    showCrackWorkflowModal, 
    closeCrackWorkflow, 
    selectedCrackImage, 
    images, 
    batches, 
    areas,
    pauseLine, 
    holdBatch, 
    requestRecheck,
    openCrackWorkflow
  } = useSimulatedPlantStore();

  if (!showCrackWorkflowModal || !selectedCrackImage) return null;

  const currentBatch = batches.find((b) => b.batchNumber === selectedCrackImage.batchNumber) || batches[0];
  const currentArea = areas.find((a) => a.id === selectedCrackImage.plantAreaId) || areas[5];

  // Find other crack indications or similar defects from this batch
  const otherBatchCracks = images.filter(
    (img) => img.batchNumber === selectedCrackImage.batchNumber && img.id !== selectedCrackImage.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div 
        id="crack-specific-workflow-modal"
        className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <AlertOctagon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-rose-400">
                  SPECIALIZED CRACK INSPECTION WORKFLOW
                </span>
                <span className="px-2 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                  Batch {selectedCrackImage.batchNumber}
                </span>
              </div>
              <h3 className="font-sans font-black text-lg text-white">
                Defect Dossier: {selectedCrackImage.defectType}
              </h3>
            </div>
          </div>

          <button
            onClick={closeCrackWorkflow}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Section: Inspection Image & Localization alongside Primary Defect Specs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Inspection Camera Frame with Bounding Box Localization */}
            <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <Eye size={13} className="text-blue-400" />
                  <span>Optical Camera // {selectedCrackImage.plantAreaName}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedCrackImage.inspectionTimestamp}
                </span>
              </div>

              {/* Viewport with visual crack bounding highlight */}
              <div className="relative w-full h-60 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                <img
                  src={selectedCrackImage.imageUrl}
                  alt={selectedCrackImage.defectType}
                  className="w-full h-full object-contain"
                />

                {/* Reliable Defect Localization Box */}
                <div className="absolute inset-x-12 inset-y-10 border-2 border-dashed border-rose-500 bg-rose-500/15 rounded pointer-events-none flex items-start justify-end p-1">
                  <span className="bg-rose-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold shadow-xs">
                    Linear Discontinuity ({selectedCrackImage.confidenceScore}%)
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-slate-800">
                  Simulated inspection image
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Coordinates: X:142 Y:88 (Δ 14.2mm)</span>
                <span className="text-emerald-400">Localization: Reliable</span>
              </div>
            </div>

            {/* Right: The Structured 10-Point Breakdown */}
            <div className="md:col-span-6 space-y-3 font-sans">
              {/* Point 1, 3, 4: Defect Identified, Confidence & Severity */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    DEFECT IDENTIFIED
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold">
                      {selectedCrackImage.severity} SEVERITY
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[10px] font-bold">
                      {selectedCrackImage.confidenceScore}% AI Confidence
                    </span>
                  </div>
                </div>
                <h4 className="text-base font-extrabold text-white">
                  {selectedCrackImage.defectType}
                </h4>
              </div>

              {/* Point 5: What the AI Noticed */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  WHAT THE AI NOTICED
                </span>
                <p className="text-slate-200 leading-relaxed italic">
                  &quot;{selectedCrackImage.summary}&quot;
                </p>
                <div className="pt-1.5 space-y-1">
                  {selectedCrackImage.visualEvidence.map((ev, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 font-sans">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Point 6: Possible Causes */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                  POSSIBLE CAUSES (Line Telemetry Correlation)
                </span>
                <div className="space-y-1 pt-1">
                  {selectedCrackImage.possibleCauses.map((cause, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 font-sans">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{cause}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Affected Batch & Other Similar Defects in Batch */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Affected Batch & Current Plant Status */}
            <div className="md:col-span-5 p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                AFFECTED BATCH & SIMULATED PRODUCTION STATUS
              </span>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Batch Number:</span>
                <span className="text-white font-bold">{currentBatch.batchNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Component:</span>
                <span className="text-slate-200">{currentBatch.component}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Production Line:</span>
                <span className="text-slate-200">{currentBatch.productionLine}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Line Status:</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold text-[10px]">
                  {currentArea.productionStatus}
                </span>
              </div>
            </div>

            {/* Other Similar Defects from that Batch */}
            <div className="md:col-span-7 p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  OTHER DEFECTS DETECTED IN BATCH {currentBatch.batchNumber} ({otherBatchCracks.length})
                </span>
                <span className="text-[10px] font-mono text-rose-400 font-bold">Repeated Pattern</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {otherBatchCracks.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openCrackWorkflow(item)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700 transition-colors flex flex-col gap-1.5"
                  >
                    <div className="w-full h-14 rounded overflow-hidden bg-slate-900">
                      <img src={item.imageUrl} alt={item.defectType} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] font-bold text-white block truncate">{item.defectType}</span>
                      <span className="font-mono text-[8px] text-slate-400 block truncate">{item.inspectionTimestamp}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Engineering Action */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3">
            <Sparkles size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-mono text-[11px] font-bold text-blue-300 uppercase block">
                RECOMMENDED ENGINEERING ACTION
              </span>
              <p className="text-slate-200 font-sans font-medium leading-relaxed">
                {selectedCrackImage.recommendedNextStep}
              </p>
            </div>
          </div>

          {/* Engineer Decision Actions */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                ENGINEER SIMULATED DECISION CONTROL
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Simulated action — no real machinery connected.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="btn-modal-pause-line"
                onClick={() => {
                  pauseLine('Line 02', `Repeated crack detected: ${selectedCrackImage.defectType}`);
                  closeCrackWorkflow();
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PauseCircle size={14} />
                <span>PAUSE LINE</span>
              </button>

              <button
                id="btn-modal-hold-batch"
                onClick={() => {
                  holdBatch(selectedCrackImage.batchNumber, 'Quarantine batch due to visible crack signature');
                  closeCrackWorkflow();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <AlertTriangle size={14} />
                <span>HOLD BATCH</span>
              </button>

              <button
                id="btn-modal-request-recheck"
                onClick={() => {
                  requestRecheck(selectedCrackImage.batchNumber);
                  closeCrackWorkflow();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>REQUEST RECHECK</span>
              </button>

              <button
                id="btn-modal-continue-monitoring"
                onClick={closeCrackWorkflow}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <PlayCircle size={14} />
                <span>CONTINUE MONITOR</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
