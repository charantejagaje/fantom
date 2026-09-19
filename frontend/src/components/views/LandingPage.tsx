import React from 'react';
import { 
  ArrowRight, 
  Cpu, 
  Layers, 
  GitPullRequest, 
  TrendingUp, 
  FlaskConical, 
  ShieldCheck, 
  Sparkles,
  Play,
  Eye,
  Search,
  PieChart,
  HelpCircle,
  Wrench,
  GraduationCap
} from 'lucide-react';
import { FactoryCanvas } from '../3d/FactoryCanvas';
import { StationTelemetry } from '../../types';

interface LandingPageProps {
  stations: StationTelemetry[];
  onEnterCommandCenter: () => void;
  onRunSimulation: () => void;
  onExploreQuality: () => void;
  onExploreFlow: () => void;
  onExploreRootCause: () => void;
  onExploreProfitability: () => void;
  onLaunchMachineInspection: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  stations,
  onEnterCommandCenter,
  onRunSimulation,
  onExploreQuality,
  onExploreFlow,
  onExploreRootCause,
  onExploreProfitability,
  onLaunchMachineInspection,
  onOpenAimlGuide
}) => {
  return (
    <div id="fantom-landing-page" className="w-full bg-[#F4F6F8] text-[#1A1F2B]">
      {/* Interactive Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-between bg-[#11141B] overflow-hidden border-b border-slate-800">
        {/* Background 3D Digital Twin Interactive Canvas */}
        <div className="absolute inset-0 z-0 opacity-70">
          <FactoryCanvas
            stations={stations}
            selectedStationId={null}
            onSelectStation={() => {}}
            cameraPreset="overview"
          />
        </div>

        {/* Ambient Gradient Overlays for High-Tech Contrast */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#11141B] via-transparent to-[#11141B]/80" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#11141B]/90 via-[#11141B]/40 to-transparent" />

        {/* Hero Top Live Status Pill Bar */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-8">
          <div className="inline-flex flex-wrap items-center gap-3 bg-[#1A1F2B]/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-full text-xs font-mono text-slate-300 shadow-xl">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              ● 18 Stations
            </span>
            <span className="text-slate-600">|</span>
            <span>● 4 Product Variants</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#38E08A]">● AI Monitoring Active</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-medium">● 2 Active Anomalies (Simulated)</span>
            {onOpenAimlGuide && (
              <>
                <span className="text-slate-600">|</span>
                <button
                  id="btn-hero-aiml-guide"
                  onClick={() => onOpenAimlGuide()}
                  className="flex items-center gap-1.5 text-purple-300 hover:text-purple-100 transition-colors font-bold"
                >
                  <GraduationCap size={13} className="text-purple-400" />
                  <span>AIML 2nd-Year Guide &rarr;</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Central Headline & CTAs */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16 lg:py-24 flex flex-col items-start justify-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#159A62]/20 border border-[#21C47A]/30 text-[#38E08A] text-xs font-mono font-bold tracking-widest uppercase mb-4">
              Industrial AI Decision Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 font-sans">
              Manufacturing intelligence,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#38E08A] to-[#21C47A]">
                from defect to decision.
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed mb-8 font-normal max-w-xl">
              Connect product quality, production flow, and economics through one intelligent industrial view.
              Trace surface micro-cracks back to spindle harmonics and simulate margin recovery in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                id="btn-hero-enter-command"
                onClick={onEnterCommandCenter}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#159A62] hover:bg-[#21C47A] text-white shadow-lg shadow-[#159A62]/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight size={16} />
              </button>

              <button
                id="btn-hero-run-simulation"
                onClick={onRunSimulation}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all"
              >
                <Play size={15} />
                <span>RUN LIVE SIMULATION</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Bottom Architectural Strip */}
        <div className="relative z-10 w-full bg-[#171D28]/95 backdrop-blur-md border-t border-slate-800/80 py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#38E08A]" />
              <span className="text-slate-200 font-semibold">ADVISORY & SIMULATION PROTOCOL:</span>
              <span>NO LIVE PLC OR ACTUATOR CONTROL. DECISION SUPPORT ONLY.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300">CORE ARCHETYPE: QUALITY + FLOW + ECONOMICS</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 12-Step Decision Journey ("How It Works") */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#159A62]">
            END-TO-END DECISION JOURNEY
          </span>
          <h2 className="text-3xl font-extrabold text-[#1A1F2B] tracking-tight mt-2 font-sans">
            From Defect Detection to Economic Action
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Traditional manufacturing silos separate QA inspectors from plant engineers and finance.
            FANTOM synthesizes inspection, telemetry, and economics into a unified pipeline.
          </p>
        </div>

        {/* 3 Unified Intelligence Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Pillar 1: Inspection Data */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#21C47A]/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#159A62]/10 flex items-center justify-center text-[#159A62] mb-5">
              <Eye size={24} />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Pillar 01</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">Inspection Intelligence</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Optical scanners flag defects, assess classification confidence (91%), and identify novel/unseen anomaly signatures.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs text-slate-700 space-y-1">
              <div>• Optical Coordinate Mapping</div>
              <div>• Uncertainty & Novel Pattern Engine</div>
              <div>• Multi-Variant Tolerances</div>
            </div>
            <button
              onClick={onExploreQuality}
              className="mt-5 text-xs font-semibold text-[#159A62] hover:text-[#21C47A] flex items-center gap-1"
            >
              Explore Quality Intelligence &rarr;
            </button>
          </div>

          {/* Pillar 2: Production Process Data */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#21C47A]/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-5">
              <GitPullRequest size={24} />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Pillar 02</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">Production Flow & Twin</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Real-time 3D simulation of machine states, queue pressure accumulation, cycle time variances, and bottleneck constraints.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs text-slate-700 space-y-1">
              <div>• 3D Factory Floor Telemetry</div>
              <div>• Dynamic Bottleneck Pinpointing</div>
              <div>• Exploded Component Diagnostics</div>
            </div>
            <button
              onClick={onExploreFlow}
              className="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Inspect Flow & Bottlenecks &rarr;
            </button>
          </div>

          {/* Pillar 3: Economic Data */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-[#21C47A]/60 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-5">
              <TrendingUp size={24} />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Pillar 03</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">Economic Decision Impact</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Calculates direct financial consequences: scrap costs, rework losses, downtime overhead, and margin erosion.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs text-slate-700 space-y-1">
              <div>• Interactive Margin Waterfall</div>
              <div>• Sensitivity Loss Drivers</div>
              <div>• Real-time Profit Recovery Projections</div>
            </div>
            <button
              onClick={onExploreProfitability}
              className="mt-5 text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Analyze Margin Waterfall &rarr;
            </button>
          </div>
        </div>

        {/* Step-by-Step Horizontal Journey Tracker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">System Workflow</span>
              <h3 className="text-xl font-bold text-slate-900">Deterministic Operator Workflow</h3>
            </div>
            <button
              onClick={onEnterCommandCenter}
              className="px-4 py-2 rounded-lg bg-[#159A62] text-white text-xs font-semibold hover:bg-[#21C47A] transition-colors"
            >
              Launch Workflow Now
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
            {[
              { step: '01', title: 'Factory Overview', desc: 'Monitor 18-station floor status' },
              { step: '02', title: 'Detect Anomaly', desc: 'Flag quality drift in Batch B17' },
              { step: '03', title: 'Inspect Defect', desc: 'Identify blade root surface chatter' },
              { step: '04', title: 'Process Linking', desc: 'Correlate with S03 spindle vibration' },
              { step: '05', title: 'Bottleneck Loss', desc: 'Quantify 142-unit queue & -$41k loss' },
              { step: '06', title: 'Simulate Fix', desc: 'Test S03 → S04 workload offload' }
            ].map((item) => (
              <div key={item.step} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[#159A62] font-bold">{item.step}</span>
                <p className="font-bold text-slate-800 mt-1 font-sans text-xs">{item.title}</p>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Teaser: 3D Machine Inspection Mode */}
      <section className="bg-[#11141B] py-20 px-6 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#21C47A]/20 border border-[#21C47A]/30 text-[#38E08A] text-xs font-mono font-bold uppercase mb-4">
              Sub-Assembly Digital Twin
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 font-sans">
              Exploded 3D Inspection with Micro-Sensor Diagnostics
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6 font-normal">
              When a machine flags abnormal vibration, transition into focused component inspection.
              Dynamically explode the spindle drive to isolate the Stator, Rotor, Shaft, and Bearing #02.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#1A1F2B] border border-slate-800">
                <span className="text-slate-400">BEARING #02 STATUS:</span>
                <p className="text-red-400 font-bold text-sm mt-1">Degraded (6.8 mm/s RMS)</p>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1F2B] border border-slate-800">
                <span className="text-slate-400">THERMAL VARIATION:</span>
                <p className="text-amber-400 font-bold text-sm mt-1">+14.2°C Above Baseline</p>
              </div>
            </div>

            <button
              id="btn-landing-open-machine-inspection"
              onClick={onLaunchMachineInspection}
              className="px-6 py-3 rounded-xl bg-[#21C47A] text-slate-950 font-bold text-sm hover:bg-[#38E08A] flex items-center gap-2 transition-all shadow-lg shadow-[#21C47A]/20"
            >
              <Wrench size={16} />
              <span>Launch 3D Machine Inspection Mode</span>
            </button>
          </div>

          {/* Interactive Feature Visual Preview Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-[#161C26] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-mono text-xs text-[#38E08A]">STATION 03 // 5-AXIS CNC-04 SPINDLE</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                SUB-HARMONIC DEFECT
              </span>
            </div>

            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#21C47A]/10 border border-[#21C47A]/30 flex items-center justify-center text-[#38E08A] mb-4 animate-pulse">
                <Cpu size={48} />
              </div>
              <h4 className="font-bold text-lg text-white">Full Interactive 3D Exploded View Ready</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-2">
                Manipulate explosion offsets, rotate components, and view sensor wear profiles across 8 sub-systems.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Rotor • Stator • Shaft • Bearings</span>
              <span className="text-[#38E08A]">Interactive in browser</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#11141B] to-[#1C2330] rounded-3xl p-10 sm:p-14 text-white text-center flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-xl">
          <span className="text-xs font-mono font-bold text-[#38E08A] uppercase tracking-widest mb-3">
            FANTOM DECISION INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mb-4 font-sans">
            Ready to experience real industrial decision intelligence?
          </h2>
          <p className="text-slate-300 max-w-xl text-sm sm:text-base mb-8">
            Access the live 3D factory twin, trigger the Batch B17 scenario, investigate root causes, and run comparative simulations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterCommandCenter}
              className="px-8 py-4 rounded-xl font-bold text-sm bg-[#159A62] hover:bg-[#21C47A] text-white shadow-xl shadow-[#159A62]/30 flex items-center gap-2 transition-all"
            >
              <span>ENTER COMMAND CENTER</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onRunSimulation}
              className="px-8 py-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <FlaskConical size={16} />
              <span>TEST SIMULATION LAB</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
