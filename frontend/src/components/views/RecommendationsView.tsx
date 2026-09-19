import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Cpu, 
  HelpCircle,
  Clock,
  Layers,
  FlaskConical,
  Wrench
} from 'lucide-react';
import { AIRecommendation } from '../../types';
import { INITIAL_AI_RECOMMENDATIONS } from '../../data/mockData';
import { AimlBadge } from '../common/AimlConceptExplainer';

interface RecommendationsViewProps {
  onOpenSimulationLab: () => void;
  onOpenMachineInspection: (stationId: string) => void;
  onOpenWorkerDispatch?: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  onOpenSimulationLab,
  onOpenMachineInspection,
  onOpenWorkerDispatch,
  onOpenAimlGuide
}) => {
  const [recommendations] = useState<AIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);
  const [selectedRecId, setSelectedRecId] = useState<string>(recommendations[0].id);

  const activeRec = recommendations.find((r) => r.id === selectedRecId) || recommendations[0];

  return (
    <div id="fantom-recommendations-root" className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              DECISION-SUPPORT INTELLIGENCE
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              3 ACTIVE ADVISORIES
            </span>
            <AimlBadge termId="decision-support" onOpenGuide={onOpenAimlGuide} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">AI Recommendations & Evidence Dossiers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, evidence-backed decision guidance with quantified impact, operational risks, and confidence scores.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={onOpenSimulationLab}
            className="px-3.5 py-1.5 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] flex items-center gap-1.5 font-semibold transition-colors"
          >
            <FlaskConical size={14} />
            <span>Simulate Actions in Lab</span>
          </button>
        </div>
      </div>

      {/* Main Grid: List of Recommendations (Left) vs Deep Evidence Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Recommendation Cards (Col 1-5) */}
        <div className="lg:col-span-5 space-y-3">
          {recommendations.map((rec) => {
            const isSelected = selectedRecId === rec.id;
            return (
              <div
                key={rec.id}
                id={`rec-card-${rec.id}`}
                onClick={() => setSelectedRecId(rec.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#159A62] bg-[#159A62]/5 shadow-xs ring-2 ring-[#159A62]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{rec.id}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.priority} PRIORITY
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {rec.confidencePct}% Conf
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{rec.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{rec.expectedEffect}</p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Target: <strong className="text-slate-800">{rec.stationId}</strong></span>
                  <span className="text-emerald-700 font-bold">+${rec.simulatedDelta.marginUsd.toLocaleString()} / shift</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Detailed Evidence & Impact Breakdown for Selected Recommendation (Col 6-12) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          
          {/* Header & Action Summary */}
          <div className="pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#159A62] uppercase">
                {activeRec.id} // {activeRec.stationId}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{activeRec.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
                <strong>Projected Operational Outcome:</strong> {activeRec.expectedEffect}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Confidence</span>
              <strong className="text-xl font-mono text-emerald-700 font-extrabold">
                {activeRec.confidencePct}%
              </strong>
            </div>
          </div>

          {/* WHY FANTOM RECOMMENDS IT (Section 22) */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-700 mb-2">
              <Sparkles size={14} className="text-[#159A62]" />
              <span>WHY FANTOM RECOMMENDS THIS</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
              {activeRec.reason}
            </p>
          </div>

          {/* SUPPORTING EVIDENCE (Section 22) */}
          <div>
            <span className="text-xs font-mono font-bold uppercase text-slate-700 block mb-2">
              SUPPORTING EVIDENCE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeRec.evidence.map((ev, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-150 text-xs font-mono text-slate-700 flex items-start gap-2">
                  <span className="text-[#159A62] font-bold">•</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* EXPECTED IMPACT & POTENTIAL RISKS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Impact */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-900 block">
                EXPECTED IMPACT
              </span>
              <div className="text-xs font-mono text-emerald-950 space-y-1">
                <div>• Throughput: <strong>+{activeRec.simulatedDelta.throughputPct}%</strong></div>
                <div>• Queue Reduction: <strong>-{activeRec.simulatedDelta.queueReductionUnits} units</strong></div>
                <div>• Defect Rate Shift: <strong>{activeRec.simulatedDelta.defectRateDeltaPct}%</strong></div>
                <div className="pt-1.5 border-t border-emerald-200 font-bold text-emerald-800 text-sm">
                  Est. Margin Gain: +${activeRec.simulatedDelta.marginUsd.toLocaleString()} / shift
                </div>
              </div>
            </div>

            {/* Risks */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-amber-900 block">
                POTENTIAL OPERATIONAL RISKS
              </span>
              <div className="text-xs font-mono text-amber-950 space-y-1">
                <div>• Secondary station tooling wear rate may increase by 4-6%</div>
                <div>• Requires initial re-calibration pass for multi-axis spindle</div>
                <div>• Minor cycle time buffer overhead of 1.2s during changeovers</div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {activeRec.stationId === 'S03' && (
                <button
                  onClick={() => onOpenMachineInspection('S03')}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Cpu size={14} />
                  <span>Inspect 3D Spindle Components</span>
                </button>
              )}

              {onOpenWorkerDispatch && (
                <button
                  onClick={onOpenWorkerDispatch}
                  className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Wrench size={14} />
                  <span>Simulate Worker Dispatch</span>
                </button>
              )}
            </div>

            <button
              onClick={onOpenSimulationLab}
              className="px-4 py-2 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Verify in Simulation Lab &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
