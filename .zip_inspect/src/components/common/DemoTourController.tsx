import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  X,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { AimlBadge } from './AimlConceptExplainer';

export interface DemoStep {
  stepNumber: number;
  tab: 'overview' | 'command' | 'quality' | 'flow' | 'rootcause' | 'profitability' | 'simulation' | 'insights';
  title: string;
  subtitle: string;
  badge: string;
  stationFocus?: string;
  narrative: string;
  aimlTermId?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    tab: 'overview',
    title: '1. Plant Overview & Telemetry Twin',
    subtitle: '18 Stations • 4 Product Variants • Real-Time Digital Twin',
    badge: 'STAGE 01',
    narrative: 'Welcome to FANTOM. 18 factory stations operating under standard telemetry. Real-time 3D conveyor stream monitors cycle times and worker status.',
    aimlTermId: 'telemetry-twin'
  },
  {
    stepNumber: 2,
    tab: 'command',
    title: '2. Anomaly Drift in Batch B17',
    subtitle: 'Quality Drift Detected at Station 03 • Queue Throttling',
    badge: 'STAGE 02',
    stationFocus: 'S03',
    narrative: 'A developing constraint triggers an alert on Station 03 (5-Axis CNC Milling Center). Defect frequency on Product Variant B begins surging.',
    aimlTermId: 'covariate-shift'
  },
  {
    stepNumber: 3,
    tab: 'quality',
    title: '3. Quality Intelligence & Defect Localization',
    subtitle: 'Optical Coordinate Mapping • Sample PRD-B17-4092 (91% Conf)',
    badge: 'STAGE 03',
    narrative: 'Inspect optical coordinates on the turbine impeller. Notice blade root surface chatter. FANTOM flags statistical association with S03 machine vibration.',
    aimlTermId: 'optical-localization'
  },
  {
    stepNumber: 4,
    tab: 'rootcause',
    title: '4. Root Cause Association Graph',
    subtitle: 'Hierarchical Bayesian Graph linking Defect to Spindle Physics',
    badge: 'STAGE 04',
    stationFocus: 'S03',
    narrative: 'Trace the evidence tree: Defect → Batch B17 → Station 03 → Bearing #02 Vibration (6.8 mm/s). Epidemiological correlation factor r = 0.94.',
    aimlTermId: 'bayesian-dag'
  },
  {
    stepNumber: 5,
    tab: 'flow',
    title: '5. Bottleneck Throttling & Flow Pressure',
    subtitle: '142-Unit Queue Accumulation at S03 • -14% Throughput Loss',
    badge: 'STAGE 05',
    stationFocus: 'S03',
    narrative: 'Examine horizontal line pressure. Station 03 is choked at 96.4% utilization with 142 units buffered. Downstream S04 has 38.8% idle capacity.',
    aimlTermId: 'queuing-bottleneck'
  },
  {
    stepNumber: 6,
    tab: 'profitability',
    title: '6. Profitability Margin Waterfall',
    subtitle: 'Connecting Scrap, Rework, Downtime, and Bottlenecks to EBIT',
    badge: 'STAGE 06',
    narrative: 'Financial impact calculated in real-time: -$31,400 scrap + -$41,200 throughput loss results in -$116,100 total run margin erosion.',
    aimlTermId: 'profitability-waterfall'
  },
  {
    stepNumber: 7,
    tab: 'simulation',
    title: '7. Counterfactual Evaluation: Predictive Interventions',
    subtitle: 'Test Workload Shift (S03 → S04) and Feed Rate Dampening',
    badge: 'STAGE 07',
    narrative: 'Test digital intervention before execution. Shifting 25% passes to S04 restores throughput (+10.2%) and recovers +$38,400 margin per shift.',
    aimlTermId: 'simulation-lab'
  },
  {
    stepNumber: 8,
    tab: 'insights',
    title: '8. Evidence-Based Decision & Dispatch',
    subtitle: 'Transparent AI Recommendations & 3D Worker Response',
    badge: 'STAGE 08',
    narrative: 'Review full evidence dossiers with risks and confidence ratings. Dispatch field technician to S03 and contain Batch B17 with one click.',
    aimlTermId: 'decision-support'
  }
];

interface DemoTourControllerProps {
  currentStepIndex: number;
  isRunning: boolean;
  onNext: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onJumpToStep: (index: number) => void;
  onClose: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const DemoTourController: React.FC<DemoTourControllerProps> = ({
  currentStepIndex,
  isRunning,
  onNext,
  onPrev,
  onTogglePlay,
  onJumpToStep,
  onClose,
  onOpenAimlGuide
}) => {
  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];

  return (
    <aside aria-label="Demo Presentation Tour Guide" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 pointer-events-none">
      <div 
        id="demo-tour-controller-banner"
        className="pointer-events-auto bg-[#11141B]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white flex flex-col gap-3 transition-all"
      >
        {/* Top Header Strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38E08A] animate-pulse"></span>
            <span className="font-mono text-xs font-bold tracking-wider text-[#38E08A] uppercase">
              HACKATHON DEMO TOUR SCRIPT
            </span>
            <span className="text-slate-500 font-mono text-xs">
              [{currentStep.stepNumber} of {DEMO_STEPS.length}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                isRunning
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-[#159A62] text-white hover:bg-[#21C47A]'
              }`}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              <span>{isRunning ? 'AUTO-PLAYING' : 'PLAY TOUR'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Story Narrative Card */}
        <div className="bg-[#171E2B] p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-white font-sans">{currentStep.title}</h4>
              {currentStep.aimlTermId && (
                <AimlBadge termId={currentStep.aimlTermId} onOpenGuide={onOpenAimlGuide} />
              )}
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">{currentStep.narrative}</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#159A62]/20 text-[#38E08A] border border-[#159A62]/40 whitespace-nowrap">
            {currentStep.badge}
          </span>
        </div>

        {/* Step Progress Pills & Navigation Buttons */}
        <div className="flex items-center justify-between pt-1">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => onJumpToStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-7 bg-[#21C47A]'
                    : idx < currentStepIndex
                    ? 'w-3 bg-emerald-700'
                    : 'w-2 bg-slate-700'
                }`}
                title={`Jump to ${s.title}`}
              />
            ))}
          </div>

          {/* Next / Previous Controls */}
          <div className="flex items-center gap-2">
            <button
              id="btn-demo-prev-step"
              onClick={onPrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={14} />
              <span>PREV</span>
            </button>
            <button
              id="btn-demo-next-step"
              onClick={onNext}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="px-4 py-1.5 rounded-lg bg-[#21C47A] hover:bg-[#38E08A] text-slate-950 font-bold text-xs font-mono flex items-center gap-1 transition-colors shadow-xs"
            >
              <span>NEXT STEP</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
