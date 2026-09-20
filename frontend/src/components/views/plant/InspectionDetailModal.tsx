import React from 'react';
import { 
  X, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';

export const InspectionDetailModal: React.FC = () => {
  const { 
    activeInspectionImage, 
    setActiveInspectionImage,
    pauseLine,
    holdBatch,
    requestRecheck
  } = useSimulatedPlantStore();

  if (!activeInspectionImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Eye size={20} />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                INSPECTION IMAGE DOSSIER // {activeInspectionImage.plantAreaName}
              </span>
              <h3 className="font-sans font-black text-lg text-white">
                {activeInspectionImage.defectType}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setActiveInspectionImage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative flex items-center justify-center h-64">
              <img
                src={activeInspectionImage.imageUrl}
                alt={activeInspectionImage.defectType}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-slate-800">
                Simulated inspection image
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-white border border-slate-700">
                {activeInspectionImage.qualityGroup}
              </div>
            </div>

            {/* Assessment info */}
            <div className="space-y-3 text-xs font-sans">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block">
                  AI ASSESSMENT DETAILS
                </span>
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>Confidence:</span>
                  <span className="font-mono text-blue-400">{activeInspectionImage.confidenceScore}%</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>Severity:</span>
                  <span className="font-mono text-amber-400">{activeInspectionImage.severity}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>Batch:</span>
                  <span className="font-mono text-slate-200">{activeInspectionImage.batchNumber}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block">
                  SUMMARY
                </span>
                <p className="text-slate-300 leading-snug">{activeInspectionImage.summary}</p>
              </div>
            </div>
          </div>

          {/* Evidence and Causes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                VISUAL EVIDENCE
              </span>
              <div className="space-y-1">
                {activeInspectionImage.visualEvidence.map((ev, i) => (
                  <div key={i} className="text-slate-300 flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-blue-400 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block">
                POSSIBLE PROCESS CAUSES
              </span>
              <div className="space-y-1">
                {activeInspectionImage.possibleCauses.map((cause, i) => (
                  <div key={i} className="text-slate-300 flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{cause}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Next Step */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3 text-xs">
            <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[10px] font-bold text-blue-300 uppercase block mb-1">
                RECOMMENDED NEXT STEP
              </span>
              <p className="text-slate-200 font-sans font-medium">{activeInspectionImage.recommendedNextStep}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500">
              Simulated action — no real machinery connected.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  holdBatch(activeInspectionImage.batchNumber, 'Quarantine requested from inspection dossier');
                  setActiveInspectionImage(null);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-lg transition-colors"
              >
                HOLD BATCH
              </button>
              <button
                onClick={() => {
                  requestRecheck(activeInspectionImage.batchNumber);
                  setActiveInspectionImage(null);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-lg border border-slate-700 transition-colors"
              >
                REQUEST RECHECK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
