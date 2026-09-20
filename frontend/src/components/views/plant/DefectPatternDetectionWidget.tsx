import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  AlertOctagon, 
  History, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useSimulatedPlantStore } from '../../../store/useSimulatedPlantStore';

export const DefectPatternDetectionWidget: React.FC = () => {
  const { 
    defectPatterns, 
    actionHistory, 
    setShowCriticalStopModal,
    openCrackWorkflow
  } = useSimulatedPlantStore();

  return (
    <div id="defect-pattern-detection-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Defect Pattern Across Batches Comparison */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-rose-600" />
              <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">
                DEFECT PATTERN DETECTION // BATCH COMPARISON
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200">
              REPEATED PATTERN
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Statistical tracking of severe linear discontinuities across chronological production batches.
          </p>

          {/* Batch Comparison Bars */}
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
              CRACK DEFECT FREQUENCY BY BATCH:
            </span>

            <div className="space-y-2">
              {defectPatterns.batchHistory.map((item) => {
                const isCurrent = item.batchNumber === 'B-2048';
                return (
                  <div key={item.batchNumber} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className={isCurrent ? 'font-bold text-slate-900' : 'text-slate-500'}>
                        Batch {item.batchNumber} {isCurrent && '(Active Line 02)'}:
                      </span>
                      <span className={`font-bold ${
                        item.detectedCount >= 3 
                          ? 'text-rose-600' 
                          : item.detectedCount > 0 
                          ? 'text-amber-600' 
                          : 'text-emerald-600'
                      }`}>
                        {item.detectedCount} detected {item.detectedCount >= 3 ? '(Critical Surge)' : ''}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.detectedCount >= 3
                            ? 'bg-rose-600 w-[95%]'
                            : item.detectedCount > 0
                            ? 'bg-amber-500 w-[35%]'
                            : 'bg-emerald-500 w-[5%]'
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observations & Recommendations */}
          <div className="mt-4 space-y-2.5 text-xs font-sans">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="font-mono text-[10px] uppercase font-bold text-amber-900 block mb-0.5">
                AI OBSERVATION
              </span>
              <p className="text-amber-950 font-medium">
                &quot;{defectPatterns.observation}&quot;
              </p>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="font-mono text-[10px] uppercase font-bold text-rose-900 block mb-0.5">
                ESCALATION RULE TRIGGERED
              </span>
              <p className="text-rose-950 font-medium">
                &quot;{defectPatterns.recommendation}&quot;
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCriticalStopModal(true)}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <AlertOctagon size={14} />
          <span>REVIEW PRODUCTION STOP RECOMMENDATION</span>
        </button>
      </div>

      {/* Right: Command History (Engineering Action History) */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-700" />
              <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">
                COMMAND HISTORY // SIMULATED AUDIT TRAIL
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
              {actionHistory.length} Actions Recorded
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Immutable log of all virtual control decisions and dispatch commands executed by engineers.
          </p>

          {/* Action History Table / List */}
          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
            {actionHistory.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-400">
                No simulated actions logged yet.
              </div>
            ) : (
              actionHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-150 text-xs font-sans space-y-1.5 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-400" />
                      <span>{item.timestamp}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                      Result: {item.result}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-semibold font-sans text-xs">
                      {item.engineerAction}
                    </strong>
                    <span className="font-mono text-[11px] text-blue-600 font-bold">
                      Batch {item.batchNumber}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-sans leading-tight">
                    <span className="text-slate-400 font-mono">Reason:</span> {item.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-slate-400 shrink-0" />
          <span>Audit records stored locally for demo simulation verification.</span>
        </div>
      </div>
    </div>
  );
};
