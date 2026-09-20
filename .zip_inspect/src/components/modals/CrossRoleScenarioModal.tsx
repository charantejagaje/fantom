import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { UserRole } from '../../types';

interface CrossRoleScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIncidentChat: (incidentId: string) => void;
}

interface ScenarioStep {
  stepNumber: number;
  actor: 'AI' | 'ENGINEER' | 'SYSTEM' | 'WORKER' | 'OWNER';
  roleTarget: UserRole;
  title: string;
  description: string;
  actionPayload?: () => void;
  chatSnippet?: { senderRole: UserRole; senderName: string; text: string };
}

export const CrossRoleScenarioModal: React.FC<CrossRoleScenarioModalProps> = ({
  isOpen,
  onClose,
  onOpenIncidentChat
}) => {
  const { 
    switchRole, 
    switchUserById, 
    updateTaskState, 
    sendMessage, 
    injectCriticalDefect, 
    restoreFactoryDefaults,
    acknowledgeIncident,
    tasks,
    incidents
  } = useIndustrialStore();

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scenarioSteps: ScenarioStep[] = [
    {
      stepNumber: 1,
      actor: 'AI',
      roleTarget: 'ENGINEER',
      title: 'Multivariate Anomaly Detected',
      description: 'Spindle sensor detects harmonic vibration surge to 6.8 mm/s (baseline: 1.8 mm/s) on CNC-04 (Station 03). AI flags 89% probability of spindle bearing cage failure.',
      actionPayload: () => {
        injectCriticalDefect();
        switchRole('ENGINEER');
      }
    },
    {
      stepNumber: 2,
      actor: 'ENGINEER',
      roleTarget: 'ENGINEER',
      title: 'Technical Triage & Telemetry Inspection',
      description: 'Lead Engineer Dr. Ananya Ray reviews 3D twin, confirms FFT frequency spike at 3,200 RPM, and correlates with blade root surface chatter.',
      actionPayload: () => {
        acknowledgeIncident('INC-0042');
        switchRole('ENGINEER');
      }
    },
    {
      stepNumber: 3,
      actor: 'SYSTEM',
      roleTarget: 'ENGINEER',
      title: 'Deterministic Worker Dispatch Optimization',
      description: 'FANTOM spatial engine calculates worker distances in Zone B. Ravi Patel (WRK-01) matches CNC/Bearing skill matrix and is only 38 meters away.',
      actionPayload: () => {
        updateTaskState('TSK-101', 'PENDING');
      }
    },
    {
      stepNumber: 4,
      actor: 'WORKER',
      roleTarget: 'WORKER',
      title: 'Mobile Urgent Work Order Received',
      description: 'Ravi Patel receives high-priority haptic alarm on rugged field terminal. Reviews SOP instructions, accepts task, and engages live navigation.',
      actionPayload: () => {
        switchUserById('usr-wrk-01');
        updateTaskState('TSK-101', 'ACCEPTED');
      }
    },
    {
      stepNumber: 5,
      actor: 'WORKER',
      roleTarget: 'WORKER',
      title: 'Worker En Route & Arrival at CNC-04',
      description: 'Worker traverses Corridor B-4 (38m countdown). Arrives at CNC-04, executes Lockout/Tagout (LOTO) protocol, and enters Machine Service Mode.',
      actionPayload: () => {
        updateTaskState('TSK-101', 'ARRIVED');
        sendMessage('INC-0042', 'I have arrived at CNC-04. LOTO engaged, starting inspection of rear spindle.', 'TEXT');
      }
    },
    {
      stepNumber: 6,
      actor: 'ENGINEER',
      roleTarget: 'ENGINEER',
      title: 'Contextual Engineering Advice in Chat',
      description: 'Engineer Dr. Ray responds via contextual incident channel: "Please inspect Bearing #02 first. Transducer reading confirms resonance in outer race."',
      actionPayload: () => {
        sendMessage('INC-0042', 'Please inspect Bearing #02 first. Confirm clearance before pulling cartridge.', 'TEXT');
      }
    },
    {
      stepNumber: 7,
      actor: 'WORKER',
      roleTarget: 'WORKER',
      title: 'Physical Replacement & Verification Spin',
      description: 'Worker extracts degraded bearing cartridge, installs precision ISO-P4 replacement, and completes 3,000 RPM verification spin. Vibration drops to 1.4 mm/s.',
      actionPayload: () => {
        updateTaskState('TSK-101', 'COMPLETED');
        restoreFactoryDefaults();
        sendMessage('INC-0042', 'Bearing #02 replaced. 3,000 RPM spin verified at 1.4 mm/s. Restoring machine to production.', 'TEXT');
      }
    },
    {
      stepNumber: 8,
      actor: 'OWNER',
      roleTarget: 'OWNER',
      title: 'Executive Financial Impact & Resolution',
      description: 'Owner Vikramaditya sees incident marked RESOLVED, bottleneck relieved, and $116,100 potential shift downtime loss mitigated.',
      actionPayload: () => {
        switchRole('OWNER');
      }
    }
  ];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= scenarioSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          scenarioSteps[next]?.actionPayload?.();
          return next;
        });
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, scenarioSteps]);

  if (!isOpen) return null;

  const currentStep = scenarioSteps[currentStepIdx];

  const handleStepSelect = (idx: number) => {
    setCurrentStepIdx(idx);
    scenarioSteps[idx]?.actionPayload?.();
  };

  const handleNext = () => {
    if (currentStepIdx < scenarioSteps.length - 1) {
      handleStepSelect(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      handleStepSelect(currentStepIdx - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    handleStepSelect(0);
  };

  const actorBadge = (actor: string) => {
    switch (actor) {
      case 'AI':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ENGINEER':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'WORKER':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'OWNER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="cross-role-scenario-modal"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  DETERMINISTIC COLLABORATION TOUR
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {currentStepIdx + 1} of {scenarioSteps.length}
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-sans mt-0.5">
                Full 3-Role Industrial Incident & Resolution Lifecycle
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Timeline Bar */}
        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 overflow-x-auto flex items-center gap-2">
          {scenarioSteps.map((st, i) => (
            <button
              key={st.stepNumber}
              onClick={() => handleStepSelect(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentStepIdx === i
                  ? 'bg-slate-900 text-white shadow-xs'
                  : currentStepIdx > i
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'bg-white text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span>{st.stepNumber}.</span>
              <span>{st.actor}</span>
            </button>
          ))}
        </div>

        {/* Current Active Step Showcase */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-slate-50">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded font-bold border ${actorBadge(currentStep.actor)}`}>
                PRIMARY ACTOR: {currentStep.actor}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Target Role Interface: <strong className="text-slate-800">{currentStep.roleTarget}</strong>
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 font-sans">
              {currentStep.title}
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {currentStep.description}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <span className="text-slate-500">
                Switches interface to: <strong className="text-slate-900">{currentStep.roleTarget} Dashboard</strong>
              </span>

              <button
                onClick={() => {
                  onClose();
                  onOpenIncidentChat('INC-0042');
                }}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <MessageSquare size={13} />
                <span>Open Incident Chat Live</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controller Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Story'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              title="Reset Scenario to Step 1"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIdx === scenarioSteps.length - 1}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Next Step</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
