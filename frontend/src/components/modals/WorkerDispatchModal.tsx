import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  PauseCircle
} from 'lucide-react';

interface WorkerDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchWorker: (taskType: string, technicianName: string) => void;
  onHoldBatch: () => void;
  batchOnHold: boolean;
  workerNavigating: boolean;
}

export const WorkerDispatchModal: React.FC<WorkerDispatchModalProps> = ({
  isOpen,
  onClose,
  onDispatchWorker,
  onHoldBatch,
  batchOnHold,
  workerNavigating
}) => {
  const [selectedTask, setSelectedTask] = useState<string>('spindle-bearing-inspection');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('Marcus Vance (Level III CNC Specialist)');
  const [taskDispatched, setTaskDispatched] = useState<boolean>(workerNavigating);

  if (!isOpen) return null;

  const handleDispatch = () => {
    setTaskDispatched(true);
    onDispatchWorker(selectedTask, selectedTechnician);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        id="worker-dispatch-modal"
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#159A62]/10 text-[#159A62] flex items-center justify-center">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-sans">
                Worker Response & Maintenance Dispatch
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Physical Line Interventions • Work Orders • 3D Autonomous Agent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Target Context */}
          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <div>
                <span className="font-mono font-bold text-red-900 uppercase block">TARGET: STATION 03 (CNC-04)</span>
                <span className="text-red-700">Bearing #02 Vibration degradation (6.8 mm/s)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-red-100 text-red-800">
              URGENT INTERVENTION
            </span>
          </div>

          {/* Action Choice: Create Work Order */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase text-slate-400 block">
              1. Select Dispatch Action & Work Order
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                {
                  id: 'spindle-bearing-inspection',
                  title: 'Spindle Diagnostic & Runout Calibration',
                  eta: '12 min',
                  desc: 'Deploy field technician with vibration accelerometer probe to S03.'
                },
                {
                  id: 'tooling-rebalance',
                  title: 'Offload Finishing Passes to S04',
                  eta: '5 min',
                  desc: 'Adjust CAM routing table to transfer 25% of rough passes to Station 04.'
                },
                {
                  id: 'feed-rate-trim',
                  title: 'Feed-Rate RPM Optimization',
                  eta: '3 min',
                  desc: 'Set spindle speed to 11,800 RPM (-8%) to eliminate chatter resonance.'
                },
                {
                  id: 'full-maintenance-hold',
                  title: 'Full Spindle Re-pack & Tool Service',
                  eta: '45 min',
                  desc: 'Schedule spindle bearing cartridge replacement at next shift handoff.'
                }
              ].map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedTask === task.id
                      ? 'border-[#159A62] bg-[#159A62]/5 ring-2 ring-[#159A62]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-slate-900">{task.title}</strong>
                    <span className="text-[10px] font-mono text-slate-500">{task.eta}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{task.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Assignment */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-slate-400 block">
              2. Assign On-Duty Plant Technician
            </label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="Marcus Vance (Level III CNC Specialist)">Marcus Vance (Level III CNC Specialist) — Bay 2</option>
              <option value="Elena Rostova (Condition Monitoring Engineer)">Elena Rostova (Condition Monitoring Engineer) — QA Lab</option>
              <option value="David Chen (Lead Reliability Tech)">David Chen (Lead Reliability Tech) — Floor West</option>
            </select>
          </div>

          {/* Secondary Protective Measure: Hold Batch B17 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Containment: Flag Batch B17 for QA Hold</span>
              <span className="text-[11px] text-slate-500">
                Prevents downstream shipping until 100% optical verification of blade root surfaces.
              </span>
            </div>
            <button
              onClick={onHoldBatch}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                batchOnHold
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {batchOnHold ? 'BATCH ON HOLD' : 'PLACE HOLD'}
            </button>
          </div>

          {/* 3D Simulation Note */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-900 flex items-center gap-2">
            <UserCheck size={16} className="text-[#159A62]" />
            <span>
              Dispatching triggers the 3D technician agent in the digital twin to walk directly to S03.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            Audit Log ID: <strong className="text-slate-700">WO-2026-0941</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-dispatch-worker"
              onClick={handleDispatch}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-[#159A62] text-white hover:bg-[#21C47A] flex items-center gap-2 shadow-xs transition-colors"
            >
              <Send size={13} />
              <span>DISPATCH TECHNICIAN NOW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
