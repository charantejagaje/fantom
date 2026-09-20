import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Layers, 
  AlertTriangle, 
  ArrowRight,
  Info,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { EconomicBaseline } from '../../types';
import { INITIAL_ECONOMIC_BASELINE } from '../../data/mockData';
import { AimlBadge } from '../common/AimlConceptExplainer';

interface ProfitabilityViewProps {
  onOpenSimulationLab: () => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const ProfitabilityView: React.FC<ProfitabilityViewProps> = ({
  onOpenSimulationLab,
  onOpenAimlGuide
}) => {
  const [baseline, setBaseline] = useState<EconomicBaseline>(INITIAL_ECONOMIC_BASELINE);
  const [selectedDriver, setSelectedDriver] = useState<string>('throughput');

  const totalLoss =
    baseline.actualScrapLossUsd +
    baseline.actualReworkLossUsd +
    baseline.actualDowntimeLossUsd +
    baseline.actualThroughputLossUsd;

  const adjustedMargin = baseline.expectedMarginTotalUsd - totalLoss;
  const marginRetentionPct = ((adjustedMargin / baseline.expectedMarginTotalUsd) * 100).toFixed(1);

  // Waterfall items calculation
  const waterfallSteps = [
    {
      id: 'expected',
      label: 'Expected Target Margin',
      value: baseline.expectedMarginTotalUsd,
      type: 'base',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      desc: 'Projected gross margin assuming 100% nominal cycle yield and standard batch completion.'
    },
    {
      id: 'scrap',
      label: 'Scrap Direct Losses',
      value: -baseline.actualScrapLossUsd,
      type: 'loss',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      desc: '245 scrapped units @ $128/unit due to blade root micro-cracks and chatter on Variant B.'
    },
    {
      id: 'rework',
      label: 'Secondary Rework Overhead',
      value: -baseline.actualReworkLossUsd,
      type: 'loss',
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      desc: '450 units diverted to manual secondary grinding and deburring @ $42/unit labor & tooling.'
    },
    {
      id: 'downtime',
      label: 'Unplanned Downtime',
      value: -baseline.actualDowntimeLossUsd,
      type: 'loss',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      desc: '1.73 hours of accumulated machine stops and tool changes across Shift 02-B.'
    },
    {
      id: 'throughput',
      label: 'Throughput Bottleneck Throttling',
      value: -baseline.actualThroughputLossUsd,
      type: 'loss',
      color: 'bg-rose-600',
      textColor: 'text-rose-700',
      desc: 'S03 queue accumulation restricted overall line rate by -14%, forfeiting ~980 saleable units.'
    },
    {
      id: 'adjusted',
      label: 'Adjusted Realized Margin',
      value: adjustedMargin,
      type: 'net',
      color: 'bg-slate-900',
      textColor: 'text-slate-900',
      desc: 'Current operational profit margin realized after quality, flow, and downtime deductions.'
    }
  ];

  return (
    <div id="fantom-profitability-view" className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              ECONOMIC DECISION INTELLIGENCE
            </span>
            <AimlBadge termId="profitability-waterfall" onOpenGuide={onOpenAimlGuide} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">Profitability & Margin Impact Waterfall</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connecting defect generation, scrap rates, downtime events, and bottleneck constraints to bottom-line EBIT.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-400 text-[10px] block">EXPECTED MARGIN</span>
            <strong className="text-slate-800 text-sm">${baseline.expectedMarginTotalUsd.toLocaleString()}</strong>
          </div>
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <span className="text-red-600 text-[10px] block">CUMULATIVE RUN LOSS</span>
            <strong className="text-sm">-${totalLoss.toLocaleString()}</strong>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
            <span className="text-emerald-600 text-[10px] block">REALIZED MARGIN</span>
            <strong className="text-sm">${adjustedMargin.toLocaleString()} ({marginRetentionPct}%)</strong>
          </div>
        </div>
      </div>

      {/* Interactive Margin Waterfall Visualization (Section 20) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A62]">
              EBIT PROFITABILITY WATERFALL
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Shift 02-B Impact Breakdown
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Values in USD ($)</span>
        </div>

        {/* Visual Waterfall Chart Bars */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-6 pb-2">
          {waterfallSteps.map((step) => {
            const isSelected = selectedDriver === step.id;
            const isLoss = step.type === 'loss';
            return (
              <div
                key={step.id}
                id={`waterfall-step-${step.id}`}
                onClick={() => setSelectedDriver(step.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                  isSelected
                    ? 'border-[#159A62] bg-[#159A62]/5 ring-2 ring-[#159A62]/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    {step.type.toUpperCase()}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 font-sans line-clamp-2">{step.label}</h4>
                </div>

                {/* Vertical Bar representation */}
                <div className="my-4 flex flex-col items-center">
                  <div className="w-full bg-slate-200 h-24 rounded-lg flex items-end p-1 overflow-hidden">
                    <div
                      className={`w-full rounded-md ${step.color} transition-all`}
                      style={{
                        height: `${Math.max(15, Math.min(100, (Math.abs(step.value) / 512000) * 100))}%`
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <span className={`text-base font-mono font-bold ${step.textColor}`}>
                    {step.value > 0 && !isLoss ? '+' : ''}
                    ${Math.abs(step.value).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Loss Driver Inspection & Unit Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Driver Detail Inspector (Col 1-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                LOSS DRIVER DIAGNOSTIC
              </span>
              <span className="text-xs font-mono text-[#159A62] font-semibold">Interactive Selection</span>
            </div>

            {waterfallSteps
              .filter((w) => w.id === selectedDriver)
              .map((driver) => (
                <div key={driver.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{driver.label}</h3>
                    <span className={`text-xl font-mono font-extrabold ${driver.textColor}`}>
                      ${Math.abs(driver.value).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{driver.desc}</p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Margin Share Impact:</span>
                      <strong className="text-slate-900">
                        {((Math.abs(driver.value) / baseline.expectedMarginTotalUsd) * 100).toFixed(1)}% of Target Margin
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Recovery Capability:</span>
                      <strong className="text-emerald-700">Simulatable via Workload Rebalance</strong>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              Target Recovery: <strong className="text-emerald-700">+$38,400 / shift</strong>
            </span>
            <button
              onClick={onOpenSimulationLab}
              className="px-4 py-2 rounded-lg bg-[#159A62] text-white hover:bg-[#21C47A] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Simulate Margin Recovery &rarr;</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Factory Unit Economics Baseline (Col 8-12) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              UNIT ECONOMIC PARAMETERS
            </span>
            <span className="text-xs font-mono text-slate-500">Configured Baseline</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-600">Unit Manufacturing Cost</span>
              <strong className="text-slate-900">${baseline.unitCostUsd.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-600">Direct Scrap Cost / Unit</span>
              <strong className="text-red-600">${baseline.scrapCostPerUnitUsd.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-600">Rework Remediation / Unit</span>
              <strong className="text-amber-600">${baseline.reworkCostPerUnitUsd.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-600">Hourly Production Value</span>
              <strong className="text-slate-900">${baseline.productionValuePerHourUsd.toLocaleString()} / hr</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-150">
              <span className="text-slate-600">Downtime Opportunity Cost</span>
              <strong className="text-slate-900">${baseline.downtimeCostPerHourUsd.toLocaleString()} / hr</strong>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed font-sans">
            <strong>Key Insight:</strong> Scrap and bottleneck throughput losses account for 62.5% of total margin erosion.
            Intervening at Station 03 yields the highest ROI across the plant floor.
          </div>
        </div>
      </div>
    </div>
  );
};
