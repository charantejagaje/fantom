import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  DollarSign, 
  Activity, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  MessageSquare,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { Incident, UserRole } from '../../types';

interface SharedIncidentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  onOpenChat: () => void;
  onOpenWorkerDispatch?: () => void;
}

export const SharedIncidentDetailModal: React.FC<SharedIncidentDetailModalProps> = ({
  isOpen,
  onClose,
  incidentId,
  onOpenChat,
  onOpenWorkerDispatch
}) => {
  const { 
    incidents, 
    currentUser, 
    acknowledgeIncident, 
    tasks,
    stations,
    workers 
  } = useIndustrialStore();

  const currentRole = currentUser?.role || 'OWNER';
  const [activePerspective, setActivePerspective] = useState<UserRole>(currentRole);

  if (!isOpen) return null;

  const incident = incidents.find((i) => i.id === incidentId) || incidents[0];
  const relatedStation = stations.find((s) => s.id === incident.stationId);
  const relatedTask = tasks.find((t) => t.incidentId === incident.id);
  const assignedWorker = workers.find((w) => w.id === incident.assignedWorkerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="shared-incident-detail-modal"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                  {incident.id}
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Station {incident.stationId} • {incident.machineId}
                </span>
                <span className="text-xs font-mono text-slate-400">• Detected {incident.detectedAt}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  incident.status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : incident.status === 'IN_PROGRESS'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {incident.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-sans mt-1">
                {incident.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Perspective Switcher: Demonstrates "ONE INCIDENT, THREE PERSPECTIVES" */}
        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 font-semibold uppercase">
              Viewing Incident Lens:
            </span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setActivePerspective('OWNER')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePerspective === 'OWNER'
                    ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={14} className="text-amber-600" />
                <span>Owner Lens (Business)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePerspective('ENGINEER')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePerspective === 'ENGINEER'
                    ? 'bg-blue-100 text-blue-900 shadow-xs border border-blue-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu size={14} className="text-blue-600" />
                <span>Engineer Lens (Telemetry)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePerspective('WORKER')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activePerspective === 'WORKER'
                    ? 'bg-emerald-100 text-emerald-900 shadow-xs border border-emerald-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench size={14} className="text-emerald-600" />
                <span>Worker Lens (Operation)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenChat}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <MessageSquare size={14} />
              <span>Incident Chat</span>
            </button>
          </div>
        </div>

        {/* Perspective Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* ==================================================== */}
          {/* PERSPECTIVE 1: OWNER (BUSINESS & FINANCIAL IMPACT)   */}
          {/* ==================================================== */}
          {activePerspective === 'OWNER' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold uppercase text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-amber-600" />
                    Executive Business Impact Summary
                  </span>
                  <span className="text-xs font-mono text-amber-800">
                    Target: Line Margin Protection
                  </span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-sans">
                  The bottleneck on {incident.machineId} throttles production of Variant B high-margin components. If unmitigated for this shift, cumulative losses are projected at <strong className="text-red-700 font-mono">-${incident.estimatedFinancialImpactUsd?.toLocaleString()}</strong> due to starved downstream stations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-slate-500 mb-1">Projected Shift Margin Loss</div>
                  <div className="text-2xl font-black font-mono text-red-600">
                    -${incident.estimatedFinancialImpactUsd?.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingDown size={13} className="text-red-500" />
                    <span>Includes $31.4K scrap + $41.2K throughput loss</span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-slate-500 mb-1">Upstream Queue Stagnation</div>
                  <div className="text-2xl font-black font-mono text-amber-600">
                    {incident.queueUnitsThrottled || 142} <span className="text-sm font-medium text-slate-400">units</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Buffer capacity at 118% of nominal buffer
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-slate-500 mb-1">Executive Acknowledgment</div>
                  <div className="text-base font-bold text-slate-800 mt-1 flex items-center gap-2">
                    {incident.acknowledgedByOwner ? (
                      <>
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-emerald-700 font-mono text-sm">Acknowledged</span>
                      </>
                    ) : (
                      <button
                        onClick={() => acknowledgeIncident(incident.id)}
                        className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                      >
                        Acknowledge as Owner
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Logged in Executive Incident Audit Log
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-700">
                  Field Response Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Assigned Mechatronics Tech:</span>
                    <span className="font-bold text-slate-900">{assignedWorker?.name || 'Ravi Patel (WRK-01)'}</span>
                    <span className="text-slate-500 block text-[11px] mt-1">Status: {relatedTask?.state || 'IN_PROGRESS'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Lead Systems Engineer:</span>
                    <span className="font-bold text-slate-900">Dr. Ananya Ray</span>
                    <span className="text-slate-500 block text-[11px] mt-1">Supervising simulated component calibration</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* PERSPECTIVE 2: ENGINEER (TELEMETRY & ROOT CAUSE)     */}
          {/* ==================================================== */}
          {activePerspective === 'ENGINEER' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold uppercase text-blue-900 flex items-center gap-1.5">
                    <Cpu size={16} className="text-blue-600" />
                    Engineering Diagnostic Telemetry & Causal Link
                  </span>
                  <span className="text-xs font-mono text-blue-700">
                    Model Confidence: {incident.confidence}%
                  </span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed font-sans">
                  {incident.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-slate-500 mb-1">Spindle Bearing Vibration</div>
                  <div className="text-2xl font-black font-mono text-red-600">
                    6.8 <span className="text-xs font-medium text-slate-500">mm/s</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Baseline threshold: &lt; 1.8 mm/s (+277% surge)
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-slate-500 mb-1">Spindle Temperature</div>
                  <div className="text-2xl font-black font-mono text-amber-600">
                    58.6 <span className="text-xs font-medium text-slate-500">°C</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Thermal expansion driving tool deflection
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-slate-500 mb-1">Bayesian Correlation</div>
                  <div className="text-2xl font-black font-mono text-blue-600">
                    r = 0.94
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Causal link to Variant B blade root chatter
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-700">
                    AI Recommended Countermeasure
                  </h4>
                  {onOpenWorkerDispatch && (
                    <button
                      onClick={onOpenWorkerDispatch}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck size={14} />
                      <span>Dispatch Field Worker</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {incident.recommendedAction}
                </p>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* PERSPECTIVE 3: WORKER (OPERATIONAL REPAIR INSTRUCTIONS)*/}
          {/* ==================================================== */}
          {activePerspective === 'WORKER' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                    <Wrench size={16} className="text-emerald-600" />
                    Field Work Order & Maintenance Instructions
                  </span>
                  <span className="text-xs font-mono text-emerald-700">
                    Task State: {relatedTask?.state || 'IN_PROGRESS'}
                  </span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed font-sans">
                  Target Component: <strong>{incident.targetComponent}</strong> at Station {incident.stationId} (Zone B). Safety protocol requires Lockout/Tagout (LOTO) prior to drive housing decoupling.
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-700">
                  Standard Operating Repair Procedure (SOP)
                </h4>
                <div className="space-y-2 text-xs">
                  {relatedTask?.steps.map((step, idx) => (
                    <div 
                      key={step.id} 
                      className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                        step.completed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                        step.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{step.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{step.details}</div>
                      </div>
                      {step.completed && (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Same underlying Incident ID: <strong className="text-slate-800">{incident.id}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Close Incident View
          </button>
        </div>
      </div>
    </div>
  );
};
