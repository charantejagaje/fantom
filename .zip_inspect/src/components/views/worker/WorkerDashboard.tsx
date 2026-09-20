import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  Tablet, 
  ShieldAlert, 
  Send, 
  Check, 
  ChevronRight, 
  Info,
  Radio,
  Sparkles,
  ArrowRight,
  BatteryCharging,
  Wifi,
  Volume2,
  Lock,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { useIndustrialStore } from '../../../store/useIndustrialStore';
import { WorkerUser, MaintenanceTask, WorkerTaskState } from '../../../types';
import { HelpTooltip } from '../../common/HelpTooltip';

interface WorkerDashboardProps {
  onOpenIncidentChat: (incidentId: string) => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  onOpenIncidentChat,
  onOpenAimlGuide
}) => {
  const { 
    currentUser, 
    tasks, 
    incidents, 
    updateTaskState, 
    completeTaskStep,
    addWorkerNote,
    sendMessage,
    workerSmartphoneView,
    toggleSmartphoneView
  } = useIndustrialStore();

  const [activeTab, setActiveTab] = useState<'tasks' | 'incident' | 'navigation' | 'service' | 'messages' | 'profile'>('tasks');
  const [navCountdown, setNavCountdown] = useState<number>(38);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [tactileVibrationMeasured, setTactileVibrationMeasured] = useState<number>(6.8);
  const [quickNote, setQuickNote] = useState<string>('');

  const worker = currentUser as WorkerUser;
  const currentTask = tasks.find((t) => t.assignedWorkerId === worker?.id) || tasks[0];
  const currentIncident = incidents.find((i) => i.id === currentTask?.incidentId) || incidents[0];

  // Navigation countdown simulator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNavigating && navCountdown > 0) {
      timer = setInterval(() => {
        setNavCountdown((prev) => {
          if (prev <= 5) {
            clearInterval(timer);
            setIsNavigating(false);
            updateTaskState(currentTask.id, 'ARRIVED');
            return 0;
          }
          return prev - 5;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isNavigating, navCountdown, currentTask?.id, updateTaskState]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setNavCountdown(currentTask.distanceMeters || 38);
    updateTaskState(currentTask.id, 'NAVIGATING');
    setActiveTab('navigation');
  };

  const handleArriveAtMachine = () => {
    setIsNavigating(false);
    setNavCountdown(0);
    updateTaskState(currentTask.id, 'ARRIVED');
    setActiveTab('service');
  };

  const handleOpenMachineService = () => {
    updateTaskState(currentTask.id, 'INSPECTING');
    setActiveTab('service');
  };

  const handleExecuteReplacement = () => {
    updateTaskState(currentTask.id, 'REPAIRING');
  };

  const handleCompleteRepair = () => {
    updateTaskState(currentTask.id, 'COMPLETED');
    setTactileVibrationMeasured(1.4);
    setActiveTab('tasks');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    addWorkerNote(currentTask.id, quickNote.trim());
    setQuickNote('');
  };

  // Render the core operational worker content
  const renderOperationalContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Worker Terminal Status Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-sans tracking-widest text-emerald-400 font-bold uppercase">
              FANTOM TECHNICIAN TOOL
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <Wifi size={12} className="text-emerald-400" />
            <span>5G MESH</span>
            <BatteryCharging size={13} className="text-emerald-400" />
            <span>94%</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight font-sans">
              GOOD MORNING, {worker?.name?.split(' ')[0] || 'RAVI'}
            </h2>
            <div className="flex items-center gap-2 text-xs font-sans text-slate-400 mt-0.5">
              <span>{worker?.workerId || 'WRK-01'}</span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{worker?.zone || 'Zone B'}</span>
            </div>
          </div>

          <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border ${
            worker?.availability === 'AVAILABLE'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
              : 'bg-amber-950/80 text-amber-300 border-amber-700'
          }`}>
            {worker?.availability === 'AVAILABLE' ? 'READY FOR WORK' : 'BUSY ON TASK'}
          </span>
        </div>
      </div>

      {/* Primary Task State Visual Flow Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px] font-sans shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">WORK STATUS:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            {currentTask?.state === 'PENDING' ? 'WAITING FOR YOU' : currentTask?.state === 'ACCEPTED' ? 'TASK ACCEPTED' : currentTask?.state === 'NAVIGATING' ? 'WALKING TO MACHINE' : currentTask?.state === 'ARRIVED' ? 'AT MACHINE' : currentTask?.state === 'INSPECTING' ? 'CHECKING MACHINE' : currentTask?.state === 'REPAIRING' ? 'FIXING PART' : 'COMPLETED'}
          </span>
        </div>
        <div className="text-slate-400 font-mono text-xs">
          {currentTask?.stationId} • {currentTask?.machineId}
        </div>
      </div>

      {/* Main Operational Body with Tabs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ==================================================== */}
        {/* VIEW 1: MY TASKS & URGENT ALERT CARD                */}
        {/* ==================================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Urgent Maintenance Alert Card */}
            {currentTask?.state !== 'COMPLETED' ? (
              <div className="p-4 bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-900 border-2 border-red-500/80 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-sans text-[10px] font-black uppercase tracking-wider animate-pulse">
                      🚨 URGENT TASK
                    </span>
                    <span className="text-[10px] font-mono text-red-300">
                      {currentTask.id}
                    </span>
                  </div>
                  <span className="text-xs font-sans text-amber-400 font-bold">
                    PRIORITY: HIGH (Do First)
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white font-sans">
                    {currentTask.machineId} — {currentTask.issue}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs font-sans text-slate-300 mt-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin size={13} className="text-red-400" />
                      <span>Area: <strong className="text-white">Production Zone B</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Navigation size={13} className="text-emerald-400" />
                      <span>Distance: <strong className="text-white">{currentTask.distanceMeters} meters</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <span className="font-sans text-amber-400 font-bold block flex items-center">
                    What the AI found & What to do:
                    <HelpTooltip term="vibration" className="ml-1" />
                  </span>
                  <p className="font-sans leading-relaxed">
                    Spindle Bearing #02 is shaking too much (6.8 mm/s vs safe 2.5 mm/s). Check the bearing holder at the back of the machine and confirm it is loose before taking it apart.
                  </p>
                </div>

                {/* Primary Action Button based on task state */}
                <div className="pt-1">
                  {currentTask.state === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateTaskState(currentTask.id, 'ACCEPTED')}
                        className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-center"
                      >
                        [ ACCEPT TASK ]
                      </button>
                      <button
                        className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs font-sans uppercase rounded-xl transition-colors text-center"
                      >
                        [ DECLINE ]
                      </button>
                    </div>
                  )}

                  {currentTask.state === 'ACCEPTED' && (
                    <button
                      onClick={handleStartNavigation}
                      className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                    >
                      <Navigation size={16} />
                      <span>[ START WALKING ROUTE ({currentTask.distanceMeters} METERS) ]</span>
                    </button>
                  )}

                  {currentTask.state === 'NAVIGATING' && (
                    <button
                      onClick={handleArriveAtMachine}
                      className="w-full py-3.5 px-4 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <MapPin size={16} />
                      <span>[ I AM AT CNC-04 ]</span>
                    </button>
                  )}

                  {currentTask.state === 'ARRIVED' && (
                    <button
                      onClick={handleOpenMachineService}
                      className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      <Wrench size={16} />
                      <span>[ START FIXING MACHINE ]</span>
                    </button>
                  )}

                  {(currentTask.state === 'INSPECTING' || currentTask.state === 'REPAIRING') && (
                    <button
                      onClick={() => setActiveTab('service')}
                      className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Wrench size={16} />
                      <span>[ CONTINUE REPAIR ]</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 bg-emerald-950/60 border border-emerald-600/60 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-sans">TASK COMPLETED</h3>
                  <p className="text-xs text-emerald-300 font-sans mt-1">
                    CNC-04 Spindle Restored • Vibration: 1.4 mm/s (Smooth & Safe)
                  </p>
                </div>
                <button
                  onClick={() => updateTaskState(currentTask.id, 'ACCEPTED')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-bold rounded-lg transition-colors"
                >
                  Simulate New Incident Assignment
                </button>
              </div>
            )}

            {/* Step-by-Step Task Checklist */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase text-slate-400 font-bold">
                  Step-by-Step Task Checklist (SOP)
                </span>
                <span className="text-[10px] font-sans text-emerald-400">
                  {currentTask?.steps.filter(s => s.completed).length} / {currentTask?.steps.length} steps done
                </span>
              </div>

              <div className="space-y-2">
                {currentTask?.steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => completeTaskStep(currentTask.id, step.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      step.completed
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 mt-0.5 border ${
                      step.completed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-600 bg-slate-800 text-slate-400'
                    }`}>
                      {step.completed ? <Check size={11} /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-bold font-sans ${step.completed ? 'line-through text-emerald-300' : 'text-slate-200'}`}>
                        {step.label}
                      </div>
                      {step.details && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-sans">
                          {step.details}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Contextual Comms */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase text-slate-400 font-bold">
                  Send Quick Note to Lead Engineer
                </span>
                <button
                  onClick={() => onOpenIncidentChat(currentTask.incidentId)}
                  className="text-[10px] font-sans text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MessageSquare size={12} />
                  <span>Open Full Chat</span>
                </button>
              </div>

              <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Type an update to Engineer (e.g., done with inspection)..."
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={!quickNote.trim()}
                  className="px-3 py-2 bg-emerald-500 disabled:opacity-30 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: LIVE PLANT NAVIGATION                       */}
        {/* ==================================================== */}
        {activeTab === 'navigation' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-emerald-400 font-bold flex items-center gap-1.5">
                  <Navigation size={14} />
                  WALKING MAP TO MACHINE
                </span>
                <span className="text-xs font-sans text-slate-400">
                  Destination: CNC-04 (Zone B)
                </span>
              </div>

              {/* Simulated Map / Distance Graphic */}
              <div className="h-44 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 z-10">
                  <span>Current: Tech Staging Bay (Zone B)</span>
                  <span className="text-emerald-400 font-bold">Walking Speed: 1.1 m/s</span>
                </div>

                {/* Animated Route Line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-48 h-px bg-emerald-500/50 relative">
                    <div className="absolute -top-1 left-1/4 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                </div>

                <div className="text-center z-10 space-y-1">
                  <div className="text-3xl font-black font-mono text-emerald-400">
                    {navCountdown} <span className="text-sm font-medium text-slate-400 font-sans">METERS AWAY</span>
                  </div>
                  <div className="text-xs font-sans text-slate-300">
                    Estimated Time: ~{Math.ceil(navCountdown / 1.1)} seconds
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-sans text-slate-400 z-10">
                  <span>Path: Hallway B-4 &rarr; Station 03 &rarr; Back of Machine</span>
                  <span className="text-amber-400 font-bold">Safety Lock Ready</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleArriveAtMachine}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MapPin size={16} />
                  <span>[ I AM AT THE MACHINE ]</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: MACHINE SERVICE MODE (TACTILE REPAIR)       */}
        {/* ==================================================== */}
        {activeTab === 'service' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-amber-400 font-bold flex items-center gap-1.5">
                  <Wrench size={14} />
                  FIXING MACHINE — CNC-04
                </span>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                  POWER LOCKED (Safe to Touch)
                </span>
              </div>

              {/* Real-time handheld vibration readout */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-2">
                <div className="text-[11px] font-sans text-slate-400 uppercase font-semibold flex items-center justify-center">
                  Vibration Sensor Reading (Bearing #02)
                  <HelpTooltip term="vibration" className="ml-1" />
                </div>
                <div className={`text-4xl font-black font-mono ${tactileVibrationMeasured > 2.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {tactileVibrationMeasured} <span className="text-sm font-medium text-slate-500">mm/s</span>
                </div>
                <div className="text-xs font-sans text-slate-400">
                  {tactileVibrationMeasured > 2.0 ? 'High shaking detected (Part is worn out)' : 'Shaking is safe & smooth'}
                </div>
              </div>

              {/* Interactive Procedure Steps */}
              <div className="space-y-2 text-xs font-sans">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">1. Turn off air brake safely</span>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">2. Take off protective cover</span>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">3. Take out worn Bearing #02</span>
                  {currentTask.state === 'REPAIRING' || currentTask.state === 'COMPLETED' ? (
                    <CheckCircle2 size={15} className="text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold font-sans">IN PROGRESS</span>
                  )}
                </div>
              </div>

              {/* Service Action Buttons */}
              <div className="pt-2 space-y-2">
                {currentTask.state !== 'REPAIRING' && currentTask.state !== 'COMPLETED' && (
                  <button
                    onClick={handleExecuteReplacement}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>[ PUT IN NEW BEARING (ISO-P4) ]</span>
                  </button>
                )}

                {currentTask.state === 'REPAIRING' && (
                  <button
                    onClick={handleCompleteRepair}
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs font-sans uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>[ TEST RUN AT HIGH SPEED & COMPLETE TASK ]</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 4: INCIDENT MESSAGES TAB                       */}
        {/* ==================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-emerald-400 font-bold">
                  {currentTask.incidentId} Problem Chat
                </span>
                <button
                  onClick={() => onOpenIncidentChat(currentTask.incidentId)}
                  className="text-xs text-slate-400 hover:text-white underline font-sans"
                >
                  Open Dialog
                </button>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans space-y-2">
                <div>
                  <span className="text-blue-400 font-bold">Dr. Ananya Ray (Engineer):</span>
                  <p className="text-slate-200 mt-0.5">
                    &quot;Please inspect Bearing #02 first using handheld vibration sensor.&quot;
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-amber-400 font-bold">Vikramaditya (Owner):</span>
                  <p className="text-slate-200 mt-0.5">
                    &quot;Update me when the machine is fixed.&quot;
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sendMessage(currentTask.incidentId, 'Bearing #02 inspected. New bearing installed. Machine vibration is now smooth at 1.4 mm/s.', 'TEXT');
                }}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-bold rounded-xl transition-colors text-center"
              >
                Send &quot;Repair Completed&quot; Update to Team
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 5: WORKER PROFILE & CERTIFICATIONS             */}
        {/* ==================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="text-xs font-sans text-slate-400 uppercase font-bold block">
                My Skills & Training Certificates
              </span>
              <div className="space-y-1.5">
                {worker?.skills.map((skill, i) => (
                  <div key={i} className="p-2 bg-slate-900 rounded-lg border border-slate-800 font-sans flex items-center justify-between text-slate-300">
                    <span>{skill}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">CERTIFIED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Worker Bottom Navigation Bar */}
      <div className="p-2 bg-slate-950 border-t border-slate-800 grid grid-cols-5 gap-1 shrink-0 text-center">
        {[
          { id: 'tasks', label: 'Tasks', icon: Wrench },
          { id: 'navigation', label: 'Route', icon: Navigation },
          { id: 'service', label: 'Repair', icon: Sliders },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'profile', label: 'Profile', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              <span className="text-[10px] font-sans tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Device Viewport Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-sans font-bold text-emerald-400">
            <Wrench size={13} />
            <span>TECHNICIAN WORK TOOL (Mobile Terminal)</span>
          </div>
          <h1 className="text-xl font-black tracking-tight font-sans text-white">
            Field Technician Workspace
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Fast tools for the factory floor: see urgent tasks, find machines, lock out power for safety, and fix parts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Form Factor Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={toggleSmartphoneView}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all flex items-center gap-1.5 ${
                workerSmartphoneView
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to smartphone terminal view"
            >
              <Smartphone size={14} />
              <span>Phone View</span>
            </button>

            <button
              type="button"
              onClick={toggleSmartphoneView}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all flex items-center gap-1.5 ${
                !workerSmartphoneView
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to tablet wide-view mode"
            >
              <Tablet size={14} />
              <span>Tablet View</span>
            </button>
          </div>

          {onOpenAimlGuide && (
            <button
              onClick={() => onOpenAimlGuide('recommendations')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-sans font-bold"
              title="AI Help Guide"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span className="hidden sm:inline">AI Help Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Smartphone Frame OR Tablet Mode */}
      {workerSmartphoneView ? (
        <div className="flex justify-center py-4">
          {/* Realistic Rugged Industrial Smartphone Bezel */}
          <div className="w-full max-w-[390px] h-[780px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-4 ring-slate-900/80 relative flex flex-col overflow-hidden">
            {/* Top speaker & front camera notch */}
            <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
              <span className="w-8 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Inner Phone Screen Content */}
            <div className="flex-1 rounded-[32px] overflow-hidden border border-slate-800/80 flex flex-col shadow-inner">
              {renderOperationalContent()}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2 shrink-0 opacity-40" />
          </div>
        </div>
      ) : (
        /* Wide Field Tablet View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[700px]">
          {renderOperationalContent()}
        </div>
      )}
    </div>
  );
};
