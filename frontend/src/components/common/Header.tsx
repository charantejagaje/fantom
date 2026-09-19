import React from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  GitPullRequest, 
  GitBranch, 
  TrendingUp, 
  FlaskConical, 
  Sparkles, 
  Play, 
  RotateCcw, 
  AlertTriangle,
  Flame,
  Wrench,
  GraduationCap
} from 'lucide-react';

export type ActiveTab = 
  | 'overview' 
  | 'command' 
  | 'quality' 
  | 'flow' 
  | 'rootcause' 
  | 'profitability' 
  | 'simulation' 
  | 'insights';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  demoRunning: boolean;
  demoStep: number;
  demoTotalSteps: number;
  demoStepTitle: string;
  onToggleDemo: () => void;
  onResetDemo: () => void;
  onInjectDefect: () => void;
  onOpenWorkerDispatch?: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  demoRunning,
  demoStep,
  demoTotalSteps,
  demoStepTitle,
  onToggleDemo,
  onResetDemo,
  onInjectDefect,
  onOpenWorkerDispatch,
  onOpenAimlGuide,
  unreadAlertsCount = 2
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-slate-200 shadow-xs">
      {/* Top Banner Ticker with Demo status & AI monitoring */}
      <div className="bg-[#11141B] text-slate-300 text-[11px] font-mono px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-white font-medium">AI MONITORING ACTIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">18 STATIONS (6 TELEMETRY TWINS)</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">4 PRODUCT VARIANTS</span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <AlertTriangle size={12} />
            <span>2 ANOMALIES FLAGGED [S03: BOTTLENECK, S05: NOVEL DEFECT]</span>
          </div>
        </div>

        {/* Demo Controller Quick Strip & AIML Guide */}
        <div className="flex items-center gap-2 pl-4">
          {onOpenAimlGuide && (
            <button
              id="btn-ticker-aiml-guide"
              onClick={() => onOpenAimlGuide()}
              className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] text-purple-200 bg-purple-950/80 border border-purple-700 hover:bg-purple-900/80 rounded transition-colors font-mono font-bold"
              title="Open AIML 2nd-Year Curriculum Glossary & Rosetta Stone"
            >
              <GraduationCap size={12} className="text-purple-300" />
              <span>AIML 2ND-YEAR GUIDE</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 bg-[#1A1F2B] px-2.5 py-0.5 rounded border border-slate-700 text-[10px]">
            <span className="text-slate-400">DEMO SCENARIO:</span>
            <span className="text-[#38E08A] font-bold truncate max-w-[140px]">{demoStepTitle}</span>
            <span className="text-slate-500">[{demoStep}/{demoTotalSteps}]</span>
          </div>

          <button
            id="btn-header-toggle-demo"
            onClick={onToggleDemo}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              demoRunning 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse' 
                : 'bg-[#159A62] text-white hover:bg-[#21C47A]'
            }`}
          >
            <Play size={12} className={demoRunning ? 'animate-spin' : ''} />
            <span>{demoRunning ? 'PAUSE DEMO' : 'START FULL DEMO'}</span>
          </button>

          <button
            id="btn-header-reset-demo"
            onClick={onResetDemo}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Reset Demo State"
          >
            <RotateCcw size={13} />
          </button>

          <button
            id="btn-header-inject-defect"
            onClick={onInjectDefect}
            className="hidden lg:flex items-center gap-1 px-2 py-0.5 text-[10px] text-red-300 bg-red-950/60 border border-red-800 rounded hover:bg-red-900/60 transition-colors"
            title="Inject Batch B17 Defect Surge"
          >
            <Flame size={11} />
            <span>INJECT DEFECT</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark & Geometric F Logo */}
          <div 
            id="fantom-brand-logo"
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#11141B] flex items-center justify-center p-1.5 shadow-sm border border-slate-800 transition-transform group-hover:scale-105">
              {/* Minimalist Geometric F mark connecting factory flow nodes */}
              <svg viewBox="0 0 32 32" className="w-full h-full text-[#21C47A]" fill="currentColor">
                <rect x="6" y="6" width="20" height="4" rx="1" fill="#21C47A" />
                <rect x="6" y="10" width="5" height="16" rx="1" fill="#21C47A" />
                <rect x="11" y="14" width="11" height="3.5" rx="1" fill="#38E08A" />
                <circle cx="24" cy="8" r="2.2" fill="#38E08A" />
                <circle cx="20" cy="15.5" r="1.8" fill="#159A62" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-[#1A1F2B] font-sans">FANTOM</span>
                <span className="bg-[#159A62]/10 text-[#159A62] text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border border-[#159A62]/20">
                  DECISION AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                See the defect. Find the cause. Understand the impact.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-tab-overview"
              onClick={() => onTabChange('overview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-100 text-[#1A1F2B] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity size={15} />
              <span>Overview</span>
            </button>

            <button
              id="nav-tab-command"
              onClick={() => onTabChange('command')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'command'
                  ? 'bg-[#159A62]/10 text-[#159A62] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Cpu size={15} />
              <span>Command Center</span>
            </button>

            <button
              id="nav-tab-quality"
              onClick={() => onTabChange('quality')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'quality'
                  ? 'bg-[#159A62]/10 text-[#159A62] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers size={15} />
              <span>Quality</span>
            </button>

            <button
              id="nav-tab-flow"
              onClick={() => onTabChange('flow')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'flow'
                  ? 'bg-[#159A62]/10 text-[#159A62] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitPullRequest size={15} />
              <span>Production Flow</span>
            </button>

            <button
              id="nav-tab-rootcause"
              onClick={() => onTabChange('rootcause')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'rootcause'
                  ? 'bg-[#159A62]/10 text-[#159A62] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitBranch size={15} />
              <span>Root Cause</span>
            </button>

            <button
              id="nav-tab-profitability"
              onClick={() => onTabChange('profitability')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'profitability'
                  ? 'bg-[#159A62]/10 text-[#159A62] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp size={15} />
              <span>Profitability</span>
            </button>

            <button
              id="nav-tab-simulation"
              onClick={() => onTabChange('simulation')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'simulation'
                  ? 'bg-[#159A62]/10 text-[#159A62] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FlaskConical size={15} />
              <span>Simulation</span>
            </button>

            <button
              id="nav-tab-insights"
              onClick={() => onTabChange('insights')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'insights'
                  ? 'bg-[#159A62]/10 text-[#159A62] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={15} />
              <span>Recommendations</span>
            </button>
          </nav>

          {/* Action Quick Hub & Mobile Nav Toggle */}
          <div className="flex items-center gap-2">
            {/* AIML Student Lens Trigger */}
            {onOpenAimlGuide && (
              <button
                id="btn-header-aiml-guide"
                onClick={() => onOpenAimlGuide()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 transition-colors border border-purple-200 shadow-2xs"
                title="Open 2nd-Year AIML Concept Glossary & Rosetta Stone"
              >
                <GraduationCap size={15} className="text-purple-700" />
                <span className="hidden md:inline font-mono">AIML Student Lens</span>
              </button>
            )}

            {/* Worker Response Trigger */}
            {onOpenWorkerDispatch && (
              <button
                id="btn-header-worker-dispatch"
                onClick={onOpenWorkerDispatch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
                title="Simulate Worker Dispatch"
              >
                <Wrench size={14} className="text-[#159A62]" />
                <span className="hidden sm:inline">Worker Response</span>
              </button>
            )}

            {/* Persistent AI Insight Indicator */}
            <div 
              id="fantom-persistent-ai-indicator"
              onClick={() => onTabChange('insights')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium cursor-pointer hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              <span className="font-semibold hidden sm:inline">AI Advisory:</span>
              <span className="text-[11px] font-mono">1 Load Balance Rec</span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Strip */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto pb-2 pt-1 border-t border-slate-100 no-scrollbar text-xs">
          {(['overview', 'command', 'quality', 'flow', 'rootcause', 'profitability', 'simulation', 'insights'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-2.5 py-1 rounded-md capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#159A62] text-white font-semibold'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {tab === 'command' ? 'Command Center' : tab === 'rootcause' ? 'Root Cause' : tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
