import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Activity,
  DollarSign,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Info,
  Sliders,
  Play,
  RotateCcw,
  Eye,
  ShieldAlert,
  Search,
  Check,
  Flame,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Database,
  BarChart2
} from 'lucide-react';
import { useIndustrialStore } from '../../../store/useIndustrialStore';
import {
  PRECISION_METAL_STAGES,
  ML_MODEL_EVALUATIONS,
  OBSERVED_ASSOCIATIONS,
  DEMO_SCENARIOS_CONFIG
} from '../../../data/precisionManufacturingData';
import {
  PrecisionMetalUnit,
  StageBottleneckMetric,
  ExplainableRecommendation,
  DemoScenarioKey
} from '../../../types';
import { HelpTooltip } from '../../common/HelpTooltip';

export type InvestigationStep =
  | 'ALERT'
  | 'DEFECT_ANALYSIS'
  | 'CONTRIBUTING_FACTORS'
  | 'PRODUCTION_FLOW'
  | 'BOTTLENECK'
  | 'THROUGHPUT_LOSS'
  | 'ECONOMIC_IMPACT'
  | 'RECOMMENDATIONS';

interface EngineerInvestigationChainProps {
  onOpenWorkerDispatch?: () => void;
  onOpenIncidentChat?: (incidentId: string) => void;
}

export const EngineerInvestigationChain: React.FC<EngineerInvestigationChainProps> = ({
  onOpenWorkerDispatch,
  onOpenIncidentChat
}) => {
  const {
    precisionUnits,
    selectedInvestigationUnitId,
    setSelectedInvestigationUnitId,
    stageBottlenecks,
    throughputLoss,
    economicBreakdown,
    explainableRecommendations,
    runSimulatedImprovement,
    currentScenario,
    setDemoScenario,
    mlModelType,
    setMlModelType
  } = useIndustrialStore();

  const [activeStep, setActiveStep] = useState<InvestigationStep>('ALERT');
  const [visionMode, setVisionMode] = useState<'ORIGINAL' | 'OVERLAY' | 'COMPARISON'>('OVERLAY');
  const [simulatedRecId, setSimulatedRecId] = useState<string | null>(null);
  const [simulationApplied, setSimulationApplied] = useState<boolean>(false);

  // Active unit under investigation
  const activeUnit =
    precisionUnits.find((u) => u.unit_id === selectedInvestigationUnitId) || precisionUnits[0];

  const stepsList: { id: InvestigationStep; label: string; sub: string; tech: string; icon: React.ComponentType<any> }[] = [
    { id: 'ALERT', label: '1. Problem Alert', sub: 'Flawed Part Found', tech: 'Quality Alert', icon: AlertTriangle },
    { id: 'DEFECT_ANALYSIS', label: '2. Problem Found', sub: 'AI Result & Photo', tech: 'Defect Analysis', icon: Eye },
    { id: 'CONTRIBUTING_FACTORS', label: '3. Possible Reasons', sub: 'Patterns Found', tech: 'Contributing Factors', icon: Layers },
    { id: 'PRODUCTION_FLOW', label: '4. Factory Line', sub: '5 Stages of Work', tech: 'Production Flow', icon: Activity },
    { id: 'BOTTLENECK', label: '5. Slowest Stage', sub: 'Where Work Piles Up', tech: 'Bottleneck', icon: Cpu },
    { id: 'THROUGHPUT_LOSS', label: '6. Units Lost', sub: 'Speed Drop & Lost Parts', tech: 'Throughput Deficit', icon: TrendingDown },
    { id: 'ECONOMIC_IMPACT', label: '7. Cost Impact', sub: 'Money Lost & Saved', tech: 'Economic Waterfall', icon: DollarSign },
    { id: 'RECOMMENDATIONS', label: '8. Suggested Action', sub: 'Try a Change', tech: 'Simulation & Action', icon: Sparkles }
  ];

  const currentStepIndex = stepsList.findIndex((s) => s.id === activeStep);

  const goToNextStep = () => {
    if (currentStepIndex < stepsList.length - 1) {
      setActiveStep(stepsList[currentStepIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveStep(stepsList[currentStepIndex - 1].id);
    }
  };

  const handleSimulateRecommendation = (recId: string) => {
    setSimulatedRecId(recId);
    runSimulatedImprovement(recId);
    setSimulationApplied(true);
  };

  const currentMlEval = ML_MODEL_EVALUATIONS[mlModelType];

  return (
    <div className="space-y-6">
      {/* 1. CONTINUOUS INVESTIGATION CHAIN STEPPER HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                STEP-BY-STEP INVESTIGATION
              </span>
              <span className="text-xs text-slate-300 font-sans">
                Problem Found → Possible Reasons → Slowest Stage → Units Lost → Money Lost → Suggested Action
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-sans mt-1">
              Checking Part: <span className="font-mono text-blue-400">{activeUnit.unit_id}</span> ({activeUnit.batch_id})
            </h2>
          </div>

          {/* Quick Scenario Preset Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-sans text-slate-300">Choose Factory Situation:</span>
            <select
              value={currentScenario}
              onChange={(e) => setDemoScenario(e.target.value as DemoScenarioKey)}
              className="bg-slate-800 text-xs font-sans text-white px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="COMBINED_IMPACT">Critical Problem: Bad Parts + Slow Machine + High Loss</option>
              <option value="CNC_BOTTLENECK">Machine Slowdown: CNC Machine Backed Up</option>
              <option value="INCREASING_DEFECT_RATE">Defect Alert: More Damaged Parts Found</option>
              <option value="HIGH_UNCERTAINTY">Unsure AI: Batch Needs Human Double-Check (B-212)</option>
              <option value="NORMAL_PRODUCTION">Smooth Run: Factory Running Normally</option>
            </select>
          </div>
        </div>

        {/* 8-Link Chain Navigation Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-3">
          {stepsList.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={step.id}
                id={`chain-step-btn-${step.id.toLowerCase()}`}
                onClick={() => setActiveStep(step.id)}
                className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/50 shadow-sm'
                    : isCompleted
                    ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                  <Icon size={14} className={isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'} />
                </div>
                <div className="mt-2">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {step.label.replace(/^\d+\.\s*/, '')}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">{step.sub}</div>
                  <div className="text-[8px] font-mono text-slate-400 opacity-60 truncate">({step.tech})</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. STEP CONTENT AREA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        {/* ==================================================== */}
        {/* STEP 1: QUALITY ALERT */}
        {/* ==================================================== */}
        {activeStep === 'ALERT' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 1 OF 8 // PROBLEM ALERT (Quality Ingress)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  Parts Checked by AI on the Line
                </h3>
                <p className="text-xs text-slate-500">
                  Pick a part below to see why the AI flagged it and how it affects the factory speed and cost.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-medium">
                  {precisionUnits.filter((u) => u.prediction === 'DEFECTIVE').length} Flawed Parts Found
                </span>
              </div>
            </div>

            {/* Units Selection Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Part ID</th>
                    <th className="py-2.5 px-3">Batch</th>
                    <th className="py-2.5 px-3">Where in Line</th>
                    <th className="py-2.5 px-3">
                      <span>AI Result</span>
                      <HelpTooltip term="confidence" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Prediction</span>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>AI Confidence</span>
                      <HelpTooltip term="confidence" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Probability</span>
                    </th>
                    <th className="py-2.5 px-3">Review Status</th>
                    <th className="py-2.5 px-3">
                      <span>Problem Found</span>
                      <HelpTooltip term="defect" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Defect Type</span>
                    </th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {precisionUnits.map((unit) => {
                    const isSelected = unit.unit_id === activeUnit.unit_id;
                    const isDefective = unit.prediction === 'DEFECTIVE';
                    const isNeedsReview = unit.confidenceState === 'NEEDS REVIEW';
                    return (
                      <tr
                        key={unit.unit_id}
                        id={`unit-row-${unit.unit_id}`}
                        onClick={() => setSelectedInvestigationUnitId(unit.unit_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 font-medium'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {unit.unit_id}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {unit.batch_id}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {unit.production_stage}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                              isDefective
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isDefective ? 'FLAWED' : 'GOOD'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {(unit.confidence * 100).toFixed(0)}% sure
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                              isNeedsReview
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : unit.confidenceState === 'HIGH CONFIDENCE'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isNeedsReview ? 'Needs Double-Check' : 'High Confidence'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-sans">
                          {unit.defect_type}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvestigationUnitId(unit.unit_id);
                              setActiveStep('DEFECT_ANALYSIS');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold inline-flex items-center gap-1"
                          >
                            <span>Inspect Part</span>
                            <ArrowRight size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Unit Brief Dossier */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  CURRENTLY SELECTED PART
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h4 className="font-bold text-slate-900 font-sans">{activeUnit.unit_id}</h4>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">{activeUnit.defect_type}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">{activeUnit.production_stage}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{activeUnit.observedDefectInfo}</p>
              </div>

              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <span>Check Problem Photo & AI Evidence &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: DEFECT ANALYSIS & EVIDENCE */}
        {/* ==================================================== */}
        {activeStep === 'DEFECT_ANALYSIS' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 2 OF 8 // PROBLEM FOUND (Defect Analysis & Photo Evidence)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  Checking Part {activeUnit.unit_id}
                </h3>
                <p className="text-xs text-slate-500">
                  See what the AI saw on this part, where the flaw is located, and why it was flagged.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeUnit.hasLocalization && (
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-sans font-medium">
                    <button
                      onClick={() => setVisionMode('ORIGINAL')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        visionMode === 'ORIGINAL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
                      }`}
                    >
                      Original Photo
                    </button>
                    <button
                      onClick={() => setVisionMode('OVERLAY')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        visionMode === 'OVERLAY' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-500'
                      }`}
                    >
                      AI Highlight Box
                    </button>
                    <button
                      onClick={() => setVisionMode('COMPARISON')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        visionMode === 'COMPARISON' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
                      }`}
                    >
                      Compare with Good Part
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Structured Alert Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-900 text-white p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Problem Status</span>
                <span className={activeUnit.prediction === 'DEFECTIVE' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeUnit.prediction === 'DEFECTIVE' ? 'FLAWED PART' : 'GOOD PART'}
                </span>
                <span className="text-[9px] text-slate-500 block font-mono">({activeUnit.prediction})</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Part ID</span>
                <span className="text-white font-bold font-mono">{activeUnit.unit_id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Batch</span>
                <span className="text-white font-bold font-mono">{activeUnit.batch_id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">Where in Line</span>
                <span className="text-slate-200 font-sans">{activeUnit.production_stage}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">
                  <span>AI Result</span>
                  <HelpTooltip term="defect" className="ml-1" />
                </span>
                <span className={activeUnit.prediction === 'DEFECTIVE' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeUnit.prediction === 'DEFECTIVE' ? 'Problem Found' : 'Passes Inspection'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">
                  <span>AI Confidence</span>
                  <HelpTooltip term="confidence" className="ml-1" />
                </span>
                <span className="text-blue-400 font-bold font-mono">{(activeUnit.confidence * 100).toFixed(0)}% sure</span>
              </div>
            </div>

            {/* Visual Inspection Viewport */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 border border-slate-800 text-white flex flex-col justify-between min-h-[320px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-sans text-slate-400">
                  <span>Camera at {activeUnit.machine_id} (Optical Sensor)</span>
                  <span className="text-blue-400 font-bold font-mono">{activeUnit.confidenceState}</span>
                </div>

                {/* Case A: Dataset Has Localization (NEU-DET Steel Imagery) */}
                {activeUnit.hasLocalization ? (
                  <div className="relative w-full h-64 my-auto bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                    <img
                      src={activeUnit.remoteImageUrl || activeUnit.localImageUrl}
                      alt={activeUnit.defect_type}
                      className="w-full h-full object-cover grayscale"
                    />

                    {/* Bounding Box Overlays */}
                    {visionMode === 'OVERLAY' &&
                      activeUnit.boundingBoxes?.map((b) => (
                        <div
                          key={b.id}
                          className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
                          style={{
                            left: `${(b.xmin / 200) * 100}%`,
                            top: `${(b.ymin / 200) * 100}%`,
                            width: `${((b.xmax - b.xmin) / 200) * 100}%`,
                            height: `${((b.ymax - b.ymin) / 200) * 100}%`
                          }}
                        >
                          <span className="absolute -top-5 left-0 bg-red-600 text-white text-[9px] font-sans px-1 rounded font-bold">
                            Flaw: {b.name} ({((b.confidence || 0.9) * 100).toFixed(0)}% sure)
                          </span>
                        </div>
                      ))}

                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-sans text-slate-300">
                      View: {visionMode === 'OVERLAY' ? 'AI Box around flaw' : visionMode === 'ORIGINAL' ? 'Original Photo' : 'Compared to normal good piece'}
                    </div>
                  </div>
                ) : (
                  /* Case B: Tabular data notice in plain English */
                  <div className="w-full h-64 my-auto bg-slate-900/90 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-6 text-center">
                    <Info size={32} className="text-slate-400 mb-2" />
                    <h4 className="text-sm font-bold text-slate-200 font-sans">
                      Photo box not available for this part.
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mt-1">
                      This part was flagged using machine sensor measurements (spindle shaking, motor strain, and metal thickness). No camera box coordinates exist for this test.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-sans text-slate-400">
                  <span>Checked at: {activeUnit.inspectionTimestamp}</span>
                  <span className="font-mono">AI Model: {activeUnit.modelStatus}</span>
                </div>
              </div>

              {/* Right: Why was this flagged? & Telemetry */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs font-sans">
                    <Sparkles size={14} className="text-blue-600" />
                    <span>WHY DID THE AI FLAG THIS PART?</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {activeUnit.whyFlagged}
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 font-sans">
                    <strong className="text-slate-900 font-semibold">What was seen:</strong> {activeUnit.observedDefectInfo}
                  </div>
                </div>

                {/* Related Process Variables */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-sans font-bold uppercase text-slate-500">
                      Machine Conditions When Made
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">(Telemetry Sensors)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Spindle Speed</span>
                      </div>
                      <strong className="text-slate-900 font-mono text-sm block mt-0.5">{activeUnit.relatedProcessVariables.spindleRpm || 'N/A'} RPM</strong>
                      <span className="text-[9px] text-slate-400">Motor rotation speed</span>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Spindle Shaking</span>
                        <HelpTooltip term="vibration" />
                      </div>
                      <strong className={`font-mono text-sm block mt-0.5 ${activeUnit.relatedProcessVariables.vibrationMmSec > 4.5 ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                        {activeUnit.relatedProcessVariables.vibrationMmSec} mm/s
                      </strong>
                      <span className="text-[9px] text-red-500 font-medium">Shaking too hard!</span>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Time for One Unit</span>
                        <HelpTooltip term="cycleTime" />
                      </div>
                      <strong className="text-slate-900 font-mono text-sm block mt-0.5">{activeUnit.relatedProcessVariables.cycleTimeSec}s</strong>
                      <span className="text-[9px] text-slate-400">Normal is ~45s</span>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Cooling Liquid Temp</span>
                        <HelpTooltip term="coolant" />
                      </div>
                      <strong className="text-slate-900 font-mono text-sm block mt-0.5">{activeUnit.relatedProcessVariables.coolantTempCelsius}°C</strong>
                      <span className="text-[9px] text-slate-400">Coolant liquid temp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={goToPrevStep}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>&larr; Back to Problem Alert</span>
              </button>
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Check Possible Reasons (Patterns) &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: CONTRIBUTING FACTORS (ASSOCIATIONS ONLY) */}
        {/* ==================================================== */}
        {activeStep === 'CONTRIBUTING_FACTORS' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 3 OF 8 // POSSIBLE REASONS (Pattern Analysis)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  Patterns Found Across Machines & Batches
                </h3>
                <p className="text-xs text-slate-500">
                  Things that often happen at the same time as this problem. (These are patterns, not final physical proof).
                </p>
              </div>

              {/* Requirement 7 Mandatory Disclaimer */}
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-sans flex items-center gap-1.5">
                <Info size={14} className="shrink-0 text-amber-600" />
                <span>PATTERN FOUND — MUST BE CHECKED BY A TECHNICIAN</span>
              </div>
            </div>

            {/* Prominent Methodology Banner (Requirement 7) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold font-sans text-slate-900 text-xs flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" />
                <span>IMPORTANT: PATTERN DOES NOT MEAN 100% PROOF</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-sans">
                A pattern shows what usually happens together. For example, high machine vibration often happens when tools wear out. However, an engineer or technician must still inspect the physical machine to verify the actual cause.
              </p>
            </div>

            {/* Contributing Factors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OBSERVED_ASSOCIATIONS.map((factor, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-blue-600">
                        {factor.subsystem}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 font-sans mt-0.5">
                        {factor.factor}
                      </h4>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-sans font-bold whitespace-nowrap">
                      {factor.observedAssociationStrength}% Match
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {factor.evidenceDescription}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans text-slate-500">
                    <span>What to check: {factor.investigationProtocol}</span>
                    <span className="text-amber-600 font-bold font-mono text-[10px]">PATTERN ONLY</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Machine Learning Model Evaluation Toggle */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {currentMlEval.demoDataLabel}
                    </span>
                    <span className="text-xs font-sans text-slate-400">{currentMlEval.datasetSplit}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white font-sans mt-1">
                    AI Model Comparison: {currentMlEval.modelName}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Testing two different AI models to see which one spots flawed parts better.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-sans text-xs">
                  <span className="text-slate-400 text-[11px]">Choose Model:</span>
                  <button
                    onClick={() => setMlModelType('RANDOM_FOREST')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      mlModelType === 'RANDOM_FOREST' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Random Forest (Main Model)
                  </button>
                  <button
                    onClick={() => setMlModelType('LOGISTIC_REGRESSION')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      mlModelType === 'LOGISTIC_REGRESSION' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Logistic Regression (Simple Baseline)
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-sans">Accuracy</span>
                    <HelpTooltip term="accuracy" />
                  </div>
                  <strong className="text-lg text-white font-mono">{(currentMlEval.accuracy * 100).toFixed(1)}%</strong>
                  <span className="text-[9px] text-slate-400 block">Overall correct answers</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-sans">Precision</span>
                    <HelpTooltip term="precision" />
                  </div>
                  <strong className="text-lg text-emerald-400 font-mono">{(currentMlEval.precision * 100).toFixed(1)}%</strong>
                  <span className="text-[9px] text-slate-400 block">When it says "Bad", it's right</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-sans">Recall</span>
                    <HelpTooltip term="recall" />
                  </div>
                  <strong className="text-lg text-blue-400 font-mono">{(currentMlEval.recall * 100).toFixed(1)}%</strong>
                  <span className="text-[9px] text-slate-400 block">Caught almost all bad parts</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-sans">F1 Score</span>
                    <HelpTooltip term="f1Score" />
                  </div>
                  <strong className="text-lg text-amber-400 font-mono">{(currentMlEval.f1Score * 100).toFixed(1)}%</strong>
                  <span className="text-[9px] text-slate-400 block">Balanced test score</span>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div className="text-slate-400 text-xs">
                  <span className="font-bold text-slate-300">Test Scorecard (Confusion Matrix):</span>
                  <span className="block text-[10px] text-slate-500">How the AI scored on real factory tests</span>
                </div>
                <div className="flex items-center gap-3 text-center">
                  <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Correctly Caught</span>
                    <strong className="text-emerald-400 font-mono">{currentMlEval.confusionMatrix.truePositive}</strong>
                    <span className="text-[8px] text-slate-500 block">True Defects</span>
                  </div>
                  <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">False Alarm</span>
                    <strong className="text-red-400 font-mono">{currentMlEval.confusionMatrix.falsePositive}</strong>
                    <span className="text-[8px] text-slate-500 block">Wrong Alarms</span>
                  </div>
                  <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Passed Good Parts</span>
                    <strong className="text-slate-200 font-mono">{currentMlEval.confusionMatrix.trueNegative}</strong>
                    <span className="text-[8px] text-slate-500 block">True Normal</span>
                  </div>
                  <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Missed Flaws</span>
                    <strong className="text-amber-400 font-mono">{currentMlEval.confusionMatrix.falseNegative}</strong>
                    <span className="text-[8px] text-slate-500 block">Slipped Through</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={goToPrevStep}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>&larr; Back to Problem Photo</span>
              </button>
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Check Factory Line (5 Stages) &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: PRODUCTION FLOW STREAM (5 STAGES) */}
        {/* ==================================================== */}
        {activeStep === 'PRODUCTION_FLOW' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 4 OF 8 // FACTORY LINE (5 Stages of Work)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  How Parts Move Through the 5 Stages
                </h3>
                <p className="text-xs text-slate-500">
                  From Raw Metal Bars to Final Packed Boxes.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-100 font-sans text-xs text-slate-600 font-bold">
                5 Stages in Sequence
              </span>
            </div>

            {/* 5-Stage Sequential Pipeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {PRECISION_METAL_STAGES.map((stage, idx) => {
                const bottleneckInfo = stageBottlenecks.find((b) => b.stageId === stage.id);
                const isBottleneck = bottleneckInfo?.isBottleneck;
                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-xl border relative flex flex-col justify-between min-h-[170px] ${
                      isBottleneck
                        ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">STAGE 0{idx + 1}</span>
                        {isBottleneck ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-red-600 text-white animate-pulse">
                            SLOWEST STAGE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-emerald-100 text-emerald-800">
                            FLOW OK
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 font-sans mt-2">
                        {stage.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-sans leading-snug">
                        {stage.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-2 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 flex items-center">
                          Time for 1 Unit
                          <HelpTooltip term="cycleTime" className="ml-0.5" />
                        </span>
                        <strong className="text-slate-900 font-mono text-[11px]">{bottleneckInfo?.averageCycleTimeSec || stage.nominalCycleSec}s</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 flex items-center">
                          Machine Busy
                          <HelpTooltip term="utilization" className="ml-0.5" />
                        </span>
                        <strong className={`font-mono text-[11px] ${isBottleneck ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                          {bottleneckInfo?.utilizationPct || 70}%
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 flex items-center">
                          Parts per Hour
                          <HelpTooltip term="throughput" className="ml-0.5" />
                        </span>
                        <strong className="text-slate-900 font-mono text-[11px]">{bottleneckInfo?.throughputUnitsPerHour || 80} u/hr</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={goToPrevStep}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>&larr; Back to Possible Reasons</span>
              </button>
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Find the Slowest Stage (Bottleneck) &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 5: BOTTLENECK ANALYSIS */}
        {/* ==================================================== */}
        {activeStep === 'BOTTLENECK' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 5 OF 8 // SLOWEST STAGE (Bottleneck)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  Where Work Is Piling Up
                </h3>
                <p className="text-xs text-slate-500">
                  Looking at which machine is running too slow and making the other stages wait.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans font-bold flex items-center gap-1.5">
                <Flame size={14} className="text-red-500" />
                <span>SLOWEST MACHINE: CNC MACHINING (S02)</span>
              </div>
            </div>

            {/* Detailed Stage Metrics Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="py-2.5 px-3">Stage Name</th>
                    <th className="py-2.5 px-3">Machine ID</th>
                    <th className="py-2.5 px-3">
                      <span>Machine Busy</span>
                      <HelpTooltip term="utilization" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Utilization</span>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>Time for 1 Unit</span>
                      <HelpTooltip term="cycleTime" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Cycle Time</span>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>Time Stopped</span>
                      <HelpTooltip term="downtime" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Downtime</span>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>Parts / Hour</span>
                      <HelpTooltip term="throughput" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Throughput</span>
                    </th>
                    <th className="py-2.5 px-3">
                      <span>Parts in Line</span>
                      <HelpTooltip term="queue" className="ml-1" />
                      <span className="block text-[8px] text-slate-400 font-normal">Queue Buffer</span>
                    </th>
                    <th className="py-2.5 px-3">Slowdown Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stageBottlenecks.map((stage) => {
                    const isBottleneck = stage.isBottleneck;
                    return (
                      <tr
                        key={stage.stageId}
                        className={isBottleneck ? 'bg-red-50/70 font-semibold' : 'hover:bg-slate-50/50'}
                      >
                        <td className="py-3 px-3 font-sans font-bold text-slate-900">
                          {stage.stageName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{stage.machineId}</td>
                        <td className="py-3 px-3">
                          <span className={stage.utilizationPct > 90 ? 'text-red-600 font-bold font-mono' : 'text-slate-900 font-mono'}>
                            {stage.utilizationPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={stage.averageCycleTimeSec > stage.nominalCycleTimeSec * 1.2 ? 'text-red-600 font-bold font-mono' : 'text-slate-900 font-mono'}>
                            {stage.averageCycleTimeSec.toFixed(1)}s
                          </span>{' '}
                          <span className="text-[10px] text-slate-400 font-sans">(normal: {stage.nominalCycleTimeSec}s)</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-mono">{stage.downtimeMinutes} min</td>
                        <td className="py-3 px-3 text-slate-900 font-mono">{stage.throughputUnitsPerHour} u/hr</td>
                        <td className="py-3 px-3">
                          <span className={stage.queueUnits > 100 ? 'text-red-600 font-bold font-mono' : 'text-slate-700 font-mono'}>
                            {stage.queueUnits} / {stage.queueMax}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                              stage.bottleneckScore === 'CRITICAL'
                                ? 'bg-red-600 text-white'
                                : stage.bottleneckScore === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {stage.bottleneckScore === 'CRITICAL' ? 'Severe Slowdown' : stage.bottleneckScore === 'HIGH' ? 'Watch Closely' : 'Running Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Why was the Stage Highlighted? */}
            <div className="bg-red-950 text-white rounded-xl p-4 border border-red-800 space-y-2">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-red-400" />
                <h4 className="font-bold text-sm font-sans">
                  Why is CNC Machining the slowest stage?
                </h4>
              </div>
              <p className="text-xs text-red-200 leading-relaxed font-sans">
                This machine is <strong>94% busy</strong> and takes <strong>68 seconds per part</strong> instead of 45 seconds. Because it is slow, <strong>142 parts</strong> are backed up waiting in line. The next washing stage ran out of parts and had to stop for almost 2 hours.
              </p>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={goToPrevStep}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>&larr; Back to Factory Line</span>
              </button>
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>See How Many Parts Were Lost &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 6: THROUGHPUT / LOSS CONNECTION */}
        {/* ==================================================== */}
        {activeStep === 'THROUGHPUT_LOSS' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 6 OF 8 // LOST PARTS (Throughput Deficit)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  How Many Parts Were Lost Today
                </h3>
                <p className="text-xs text-slate-500">
                  Showing how the machine problem cut down the total number of parts produced.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-sans font-bold">
                PROBLEM ON MACHINE &rarr; FEWER PARTS MADE &rarr; MONEY LOST
              </div>
            </div>

            {/* Throughput Impact Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">
                  Parts Made / Hour
                  <HelpTooltip term="throughput" className="ml-1" />
                </span>
                <strong className="text-xl text-slate-900 font-mono">{throughputLoss.currentThroughputUnitsHr} u/hr</strong>
                <span className="text-[10px] text-slate-500 block mt-1 font-sans">Goal: {throughputLoss.nominalThroughputUnitsHr} u/hr</span>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <span className="text-[11px] text-red-600 block font-sans font-bold">
                  Missing Parts / Hour
                  <HelpTooltip term="deficit" className="ml-1" />
                </span>
                <strong className="text-xl text-red-600 font-mono">-{throughputLoss.throughputDeficitUnitsHr} u/hr</strong>
                <span className="text-[10px] text-red-600 block mt-1 font-sans font-semibold">{throughputLoss.affectedUnitsTotal} parts lost this shift</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">
                  Ruined Parts (Scrap)
                  <HelpTooltip term="scrap" className="ml-1" />
                </span>
                <strong className="text-xl text-slate-900 font-mono">{throughputLoss.scrapUnitsTotal} units</strong>
                <span className="text-[10px] text-slate-500 block mt-1 font-sans">Cannot be saved (thrown away)</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">
                  Fixable Parts (Rework)
                  <HelpTooltip term="rework" className="ml-1" />
                </span>
                <strong className="text-xl text-amber-600 font-mono">{throughputLoss.reworkUnitsTotal} units</strong>
                <span className="text-[10px] text-slate-500 block mt-1 font-sans">Waiting for hand trimming</span>
              </div>
            </div>

            {/* Impact Flow Chain Visualization */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
              <h4 className="text-xs font-sans font-bold uppercase text-slate-300">
                Chain Reaction: From Machine Flaw to Missed Delivery
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <span className="text-[10px] font-sans text-red-400 font-bold uppercase block">1. Where Problem Began</span>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    Tool shaking on CNC-04 ruined 34 parts and caused 48 parts to need extra trimming work.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <span className="text-[10px] font-sans text-amber-400 font-bold uppercase block">2. Production Slowdown</span>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    Each part took 68 seconds instead of 45 seconds, slowing the line to 52 parts/hr and leaving 142 parts waiting.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <span className="text-[10px] font-sans text-blue-400 font-bold uppercase block">3. Business Result</span>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    224 unproduced parts this shift delay customer delivery and lower company revenue.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={goToPrevStep}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>&larr; Back to Slowest Stage</span>
              </button>
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>See Estimated Cost Breakdown &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 7: ECONOMIC IMPACT WITH TRANSPARENT FORMULAS */}
        {/* ==================================================== */}
        {activeStep === 'ECONOMIC_IMPACT' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 7 OF 8 // ESTIMATED COST (Economic Loss)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  How Much This Problem Costs the Factory
                </h3>
                <p className="text-xs text-slate-500">
                  Total estimated dollar loss from ruined parts, rework labor, stopped machines, and missed sales.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 font-sans text-xs font-bold">
                ESTIMATED COST (SIMULATION)
              </span>
            </div>

            {/* Total Loss Hero Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider font-bold">
                  TOTAL ESTIMATED LOSS THIS SHIFT
                </span>
                <div className="text-3xl font-black font-mono text-red-400">
                  ${economicBreakdown.totalEstimatedLossUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Sum of ruined metal, worker trimming hours, stopped machine time, and missed part sales.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Ruined Metal (Scrap)
                    <HelpTooltip term="scrap" className="ml-1" />
                  </span>
                  <strong className="text-white font-mono text-sm">${economicBreakdown.scrapCostUsd.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Worker Fixing (Rework)
                    <HelpTooltip term="rework" className="ml-1" />
                  </span>
                  <strong className="text-white font-mono text-sm">${economicBreakdown.reworkCostUsd.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Stopped Machine Time
                    <HelpTooltip term="downtime" className="ml-1" />
                  </span>
                  <strong className="text-white font-mono text-sm">${economicBreakdown.downtimeCostUsd.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Missed Part Sales
                    <HelpTooltip term="throughput" className="ml-1" />
                  </span>
                  <strong className="text-white font-mono text-sm">${economicBreakdown.throughputOpportunityLossUsd.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* How This Is Calculated */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900 font-sans">
                  How We Calculated These Numbers (Clear Math Formulas)
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase font-sans">1. Ruined Metal Cost (Scrap)</span>
                  <div className="text-slate-900 font-mono text-xs">{economicBreakdown.calculationFormulas.scrapFormula}</div>
                  <p className="text-[11px] text-slate-500 font-sans">Parts thrown in the trash × cost of raw metal per piece.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase font-sans">2. Worker Fixing Cost (Rework)</span>
                  <div className="text-slate-900 font-mono text-xs">{economicBreakdown.calculationFormulas.reworkFormula}</div>
                  <p className="text-[11px] text-slate-500 font-sans">Fixable parts × technician wage per minute for secondary deburring.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase font-sans">3. Stopped Machine Cost (Downtime)</span>
                  <div className="text-slate-900 font-mono text-xs">{economicBreakdown.calculationFormulas.downtimeFormula}</div>
                  <p className="text-[11px] text-slate-500 font-sans">Minutes the machine was stopped × overhead operating cost per hour.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase font-sans">4. Missed Sales (Opportunity Loss)</span>
                  <div className="text-slate-900 font-mono text-xs">{economicBreakdown.calculationFormulas.throughputFormula}</div>
                  <p className="text-[11px] text-slate-500 font-sans">Unproduced parts that could not be shipped × net profit margin per unit.</p>
                </div>
              </div>

              {/* Underlying Assumptions */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  Factory Numbers Used in Calculations:
                </span>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 font-sans">
                  {economicBreakdown.assumptions.map((assump, idx) => (
                    <li key={idx}>{assump}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={goToPrevStep}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>&larr; Back to Lost Parts</span>
              </button>
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Check What to Do Next & Test &rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 8: RECOMMENDATION ENGINE & SIMULATION */}
        {/* ==================================================== */}
        {activeStep === 'RECOMMENDATIONS' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  STEP 8 OF 8 // WHAT TO DO NEXT (Action Steps & What-If Test)
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  Suggested Next Steps to Fix the Line
                </h3>
                <p className="text-xs text-slate-500">
                  Clear steps recommended by the system. Technicians and managers decide whether to apply them.
                </p>
              </div>

              {simulationApplied && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>WHAT-IF TEST APPLIED: LINE REBALANCED</span>
                </div>
              )}
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              {explainableRecommendations.map((rec) => {
                return (
                  <div
                    key={rec.id}
                    id={`rec-item-${rec.id}`}
                    className={`p-5 rounded-2xl border transition-all ${
                      rec.status === 'COMPLETED'
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                              rec.priority === 'HIGH'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {rec.priority === 'HIGH' ? 'URGENT' : 'HELPFUL'}
                          </span>
                          <span className="text-xs font-sans text-slate-500">{rec.stageName} ({rec.stationId})</span>
                          {rec.status === 'COMPLETED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-100 text-emerald-800">
                              TESTED IN SIMULATION
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-base text-slate-900 font-sans mt-1">
                          {rec.title}
                        </h4>
                      </div>

                      {/* Simulation Trigger Button */}
                      <button
                        onClick={() => handleSimulateRecommendation(rec.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          rec.status === 'COMPLETED'
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#159A62] hover:bg-[#21C47A] text-white shadow-md'
                        }`}
                      >
                        {rec.status === 'COMPLETED' ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Tested in What-If Test</span>
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            <span>Test This Solution (What-If)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 4 Structured Sections: WHAT TO DO, WHY, PROOF, EXPECTED BENEFIT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                      {/* WHAT */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">
                          WHAT TO DO (Action to Take)
                        </span>
                        <p className="text-slate-800 font-sans leading-relaxed">{rec.what}</p>
                      </div>

                      {/* WHY */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">
                          WHY (Reason for this step)
                        </span>
                        <p className="text-slate-800 font-sans leading-relaxed">{rec.why}</p>
                      </div>

                      {/* EVIDENCE */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">
                          PROOF (Sensor Readings)
                        </span>
                        <ul className="text-slate-700 list-disc list-inside space-y-0.5 font-sans text-xs">
                          {rec.evidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>

                      {/* EXPECTED IMPACT */}
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <span className="text-[10px] font-sans font-bold text-emerald-700 uppercase">
                          EXPECTED BENEFIT (Expected Improvement)
                        </span>
                        <p className="text-emerald-900 font-sans font-medium leading-relaxed">{rec.expectedImpact}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Before vs After Counterfactual Comparison */}
            {simulationApplied && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <h4 className="font-bold text-sm text-white font-sans">
                    What-If Test Results: Before vs. After
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Time for 1 Part (Cycle Time)</span>
                    <div className="flex items-center gap-1.5 mt-1 font-mono">
                      <span className="line-through text-slate-400">68.4s</span>
                      <span className="text-emerald-400 font-bold">50.2s</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Parts Made / Hour</span>
                    <div className="flex items-center gap-1.5 mt-1 font-mono">
                      <span className="line-through text-slate-400">52 u/hr</span>
                      <span className="text-emerald-400 font-bold">{throughputLoss.currentThroughputUnitsHr} u/hr</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Parts Waiting in Line</span>
                    <div className="flex items-center gap-1.5 mt-1 font-mono">
                      <span className="line-through text-slate-400">142 units</span>
                      <span className="text-emerald-400 font-bold">42 units</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-sans">Money Saved</span>
                    <div className="text-emerald-400 font-bold text-base mt-0.5 font-mono">
                      +$5,400 / shift
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                onClick={goToPrevStep}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>&larr; Back to Cost Breakdown</span>
              </button>

              <div className="flex items-center gap-2">
                {onOpenWorkerDispatch && (
                  <button
                    onClick={onOpenWorkerDispatch}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Send Task to Factory Worker &rarr;</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveStep('ALERT')}
                  className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-sans font-bold flex items-center gap-1"
                >
                  <RotateCcw size={13} />
                  <span>Start Over</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
