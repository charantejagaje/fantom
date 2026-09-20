import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Layers, 
  HelpCircle,
  FileCheck,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Flame,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { useIndustrialStore } from '../../../store/useIndustrialStore';
import { EconomicService } from '../../../services/economicService';
import { Incident, AIRecommendation, UserRole } from '../../../types';
import { DEMO_SCENARIOS_CONFIG } from '../../../data/precisionManufacturingData';
import { DemoScenarioKey } from '../../../types';
import { HelpTooltip } from '../../common/HelpTooltip';

interface OwnerDashboardProps {
  onOpenIncidentDetail: (incidentId: string) => void;
  onOpenIncidentChat: (incidentId: string) => void;
  onOpenAimlGuide?: (termId?: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  onOpenIncidentDetail,
  onOpenIncidentChat,
  onOpenAimlGuide
}) => {
  const { 
    stations, 
    incidents, 
    workers, 
    economicBaseline, 
    recommendations,
    approvedRecommendationIds,
    approveRecommendation,
    acknowledgeIncident,
    currentScenario,
    setDemoScenario,
    stageBottlenecks,
    economicBreakdown,
    throughputLoss
  } = useIndustrialStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'economics' | 'production' | 'quality' | 'incidents' | 'recommendations'>('overview');

  // Compute live business summary
  const summary = EconomicService.calculateBusinessSummary(
    stations,
    incidents,
    workers,
    economicBaseline
  );

  const criticalIncident = incidents.find((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED');

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-sans font-bold text-amber-400">
            <ShieldCheck size={13} />
            <span>FACTORY OPERATIONS & PROFIT OVERVIEW (Plant Governance)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight font-sans text-white">
            Factory Executive Overview
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl font-sans">
            Tracking factory profit, machine capacity, line slowdowns, and lost money across all 5 production stages.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-sans uppercase text-amber-400 font-bold">Demo Situation:</span>
            <select
              value={currentScenario}
              onChange={(e) => setDemoScenario(e.target.value as DemoScenarioKey)}
              className="bg-transparent text-xs font-sans font-bold text-white focus:outline-none cursor-pointer"
            >
              {Object.entries(DEMO_SCENARIOS_CONFIG).map(([key, sc]) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {(sc as { name: string }).name}
                </option>
              ))}
            </select>
          </div>

          <div className="px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700 text-right">
            <div className="text-[10px] font-sans uppercase text-slate-400">
              Expected Profit This Shift
              <HelpTooltip term="margin" className="ml-1" />
            </div>
            <div className="text-lg font-black font-mono text-emerald-400">
              ${summary.estimatedNetMarginUsd.toLocaleString()}
            </div>
            <div className="text-[10px] font-sans text-red-400">
              -${summary.totalShiftLossUsd.toLocaleString()} lost to problems (-{summary.marginErosionPct}%)
            </div>
          </div>

          {onOpenAimlGuide && (
            <button
              onClick={() => onOpenAimlGuide('waterfall')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-sans font-bold"
              title="View How Machine Losses Are Calculated"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>AI Loss Explanation</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Incident Emergency Marquee (if active) */}
      {criticalIncident && (
        <div className="p-4 bg-red-950/80 border border-red-800/90 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 mt-0.5">
              <AlertOctagon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-bold px-2 py-0.5 rounded bg-red-900/60 border border-red-700 text-red-200">
                  {criticalIncident.id} • URGENT LINE SLOWDOWN
                </span>
                <span className="text-xs text-red-300 font-mono">
                  {criticalIncident.machineId} ({criticalIncident.stationId})
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 font-sans">
                {criticalIncident.title} — Money at Risk: -${criticalIncident.estimatedFinancialImpactUsd?.toLocaleString()}
              </h3>
              <p className="text-xs text-red-200/90 mt-0.5 font-sans">
                {criticalIncident.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenIncidentChat(criticalIncident.id)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare size={14} />
              <span>Ask About Problem</span>
            </button>

            <button
              onClick={() => onOpenIncidentDetail(criticalIncident.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <span>See Cost Breakdown</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Owner Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'economics', label: 'Money & Losses' },
          { id: 'production', label: 'Factory Line' },
          { id: 'quality', label: 'Quality Problems' },
          { id: 'incidents', label: `Urgent Problems (${incidents.filter(i => i.status !== 'RESOLVED').length})` },
          { id: 'recommendations', label: 'Suggested Fixes' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`owner-nav-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold font-sans tracking-wide border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-600 text-slate-900 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW                                 */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top 6 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[10px] font-sans uppercase text-slate-500 font-semibold flex items-center">
                Factory Health
                <HelpTooltip term="health" className="ml-1" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {summary.factoryHealthScore}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">6 Stages Monitored</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[10px] font-sans uppercase text-slate-500 font-semibold flex items-center">
                Parts Made Today
                <HelpTooltip term="throughput" className="ml-1" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {summary.totalThroughputUnits.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-sans">
                {summary.goodUnitsProduced.toLocaleString()} good parts
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[10px] font-sans uppercase text-slate-500 font-semibold flex items-center">
                Defect Rate
                <HelpTooltip term="defect" className="ml-1" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 mt-1">
                {summary.overallDefectRatePct}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">Normal goal: 1.2%</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[10px] font-sans uppercase text-slate-500 font-semibold flex items-center">
                Ruined & Fixed Parts
                <HelpTooltip term="scrap" className="ml-1" />
              </div>
              <div className="text-2xl font-black font-mono text-red-600 mt-1">
                ${(summary.totalScrapCostUsd + summary.totalReworkCostUsd).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">Ruined: ${summary.totalScrapCostUsd.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[10px] font-sans uppercase text-slate-500 font-semibold flex items-center">
                Slowest Stage
                <HelpTooltip term="bottleneck" className="ml-1" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 mt-1">
                {summary.activeBottlenecksCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">Station 03 (CNC-04)</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-[10px] font-sans uppercase text-slate-500 font-semibold flex items-center">
                Available Workers
                <HelpTooltip term="workers" className="ml-1" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {summary.availableWorkersCount} / {summary.totalWorkersCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-sans">Ready to fix machines</div>
            </div>
          </div>

          {/* 5-Stage Precision Metal Manufacturing Pipeline */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Factory Line Flow (5 Stages from Raw Metal to Packing)
                </h3>
              </div>
              <span className="text-[11px] font-sans text-slate-500">
                Raw Material &rarr; CNC Machining &rarr; Washing &rarr; Inspection &rarr; Packing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stageBottlenecks.map((stage) => (
                <div
                  key={stage.stageId}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    stage.isBottleneck
                      ? 'border-red-500 bg-red-50/70 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/70'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-bold text-slate-500 uppercase">
                        Stage {stage.stageId}
                      </span>
                      {stage.isBottleneck ? (
                        <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">
                          SLOWEST STAGE
                        </span>
                      ) : (
                        <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          RUNNING OK
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-tight font-sans">
                      {stage.stageName}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 space-y-1 text-[11px] font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Machine Busyness:
                        <HelpTooltip term="utilization" className="ml-1" />
                      </span>
                      <strong className={stage.utilizationPct > 90 ? 'text-red-600 font-mono' : 'text-slate-800 font-mono'}>
                        {stage.utilizationPct}%
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Time for 1 Part:
                        <HelpTooltip term="cycleTime" className="ml-1" />
                      </span>
                      <strong className={stage.isBottleneck ? 'text-red-600 font-mono' : 'text-slate-800 font-mono'}>
                        {stage.averageCycleTimeSec}s
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Parts Waiting:
                        <HelpTooltip term="buffer" className="ml-1" />
                      </span>
                      <strong className={stage.queueUnits > 80 ? 'text-red-600 font-mono' : 'text-slate-800 font-mono'}>
                        {stage.queueUnits} parts
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Stopped Time:
                        <HelpTooltip term="downtime" className="ml-1" />
                      </span>
                      <span className="text-slate-700 font-mono">{stage.downtimeMinutes}m / shift</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-sans uppercase text-[11px] block font-bold">Why the line is slowed down:</strong>
                <span className="font-sans">
                  Stage S02 (CNC Machining) is <strong>94% busy</strong> and taking <strong>68 seconds per part</strong> instead of 45 seconds. Because it is slow, <strong>142 parts</strong> are backed up waiting in line, starving the next washing and packing stages.
                </span>
              </div>
            </div>
          </div>

          {/* Core Decision Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Business Impact Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Money Impact: What is happening and how much is lost?
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('economics')}
                  className="text-xs font-sans text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                >
                  <span>See Full Cost Breakdown &rarr;</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between font-sans">
                  <div>
                    <span className="font-bold text-slate-900 block">Station 03 Line Slowdown (Bottleneck)</span>
                    <span className="text-slate-500">142 parts waiting in queue; machine 96% busy</span>
                  </div>
                  <span className="text-sm font-mono font-black text-red-600">-$41,200 loss</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between font-sans">
                  <div>
                    <span className="font-bold text-slate-900 block">Ruined Parts from Machine Shaking (Scrap)</span>
                    <span className="text-slate-500">89% of rough-surface parts come from CNC-04 tool vibration</span>
                  </div>
                  <span className="text-sm font-mono font-black text-red-600">-$31,400 scrap</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between font-sans">
                  <div>
                    <span className="font-bold text-slate-900 block">Slow Cycle Time & Stopped Time</span>
                    <span className="text-slate-500">Time per part took 54s instead of 42s, slowing down the line</span>
                  </div>
                  <span className="text-sm font-mono font-black text-red-600">-$23,700 downtime</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between font-sans">
                <span className="font-semibold">Total Money Lost This Shift:</span>
                <span className="font-mono font-black text-sm text-red-700">
                  -${summary.totalShiftLossUsd.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Recommendations & Action Plan */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Suggested Fixes Ready for Owner Approval
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="text-xs font-sans text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                >
                  <span>All Fixes ({recommendations.length}) &rarr;</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {recommendations.slice(0, 2).map((rec) => {
                  const isApproved = approvedRecommendationIds.includes(rec.id);
                  return (
                    <div key={rec.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{rec.title}</span>
                        <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          +{rec.simulatedDelta.throughputPct}% More Parts
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {rec.reason}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-[11px] font-bold text-emerald-700">
                          +${rec.simulatedDelta.marginUsd.toLocaleString()} profit recovered
                        </span>

                        {isApproved ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => approveRecommendation(rec.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs transition-colors shadow-xs"
                          >
                            Approve Fix
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between font-sans">
                <span>Task Sent to Worker:</span>
                <span className="font-sans font-bold text-slate-900">
                  Technician Ravi Patel dispatched to CNC-04
                </span>
              </div>
            </div>
          </div>

          {/* Plant Team Availability & Status */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Technicians On Duty (Factory Team)
                </h3>
              </div>
              <span className="text-xs font-sans text-slate-500">
                Ready across all 3 Zones
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {workers.map((worker) => (
                <div key={worker.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold font-mono text-xs flex items-center justify-center">
                        {worker.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 font-sans">{worker.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{worker.workerId} • {worker.zone}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold ${
                      worker.availability === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {worker.availability === 'AVAILABLE' ? 'READY' : 'ON TASK'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    {worker.department}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BUSINESS IMPACT (FINANCIAL WATERFALL)              */}
      {/* ========================================================= */}
      {activeTab === 'economics' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  How Factory Profit Drops When Problems Occur (Waterfall Breakdown)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Showing how slowed machines, ruined parts, and stopped lines eat away at shift earnings.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-sans uppercase text-slate-500 block">Goal Profit (Zero Flaws)</span>
                <span className="text-lg font-black font-mono text-slate-900">$480,000</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block text-sm font-sans">Goal Profit (If Everything Went Right)</span>
                  <span className="text-emerald-800 text-[11px] font-sans">8,420 parts planned @ $57.00 profit contribution per piece</span>
                </div>
                <span className="font-mono font-black text-emerald-800 text-base">+$480,000</span>
              </div>

              <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-red-950 block font-sans">
                    Ruined Metal Thrown Away (Scrap Loss)
                    <HelpTooltip term="scrap" className="ml-1" />
                  </span>
                  <span className="text-red-700 text-[11px] font-mono">
                    {economicBreakdown.calculationFormulas.scrapFormula}
                  </span>
                </div>
                <span className="font-mono font-black text-red-700 text-sm">-${economicBreakdown.scrapCostUsd.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-950 block font-sans">
                    Worker Time Spent Fixing Parts (Rework Cost)
                    <HelpTooltip term="rework" className="ml-1" />
                  </span>
                  <span className="text-amber-800 text-[11px] font-mono">
                    {economicBreakdown.calculationFormulas.reworkFormula}
                  </span>
                </div>
                <span className="font-mono font-black text-amber-700 text-sm">-${economicBreakdown.reworkCostUsd.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-950 block font-sans">
                    Cost of Stopped Machines (Downtime Loss)
                    <HelpTooltip term="downtime" className="ml-1" />
                  </span>
                  <span className="text-amber-800 text-[11px] font-mono">
                    {economicBreakdown.calculationFormulas.downtimeFormula}
                  </span>
                </div>
                <span className="font-mono font-black text-amber-700 text-sm">-${economicBreakdown.downtimeCostUsd.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-950 block font-sans">
                    Lost Sales from Missing Parts (Opportunity Loss)
                    <HelpTooltip term="deficit" className="ml-1" />
                  </span>
                  <span className="text-purple-800 text-[11px] font-mono">
                    {economicBreakdown.calculationFormulas.throughputFormula}
                  </span>
                </div>
                <span className="font-mono font-black text-purple-700 text-sm">-${economicBreakdown.throughputOpportunityLossUsd.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs shadow-md">
                <div>
                  <span className="font-bold text-white block text-sm font-sans">Actual Estimated Profit Left This Shift</span>
                  <span className="text-slate-400 text-[11px] font-sans">Current profit rate: 36.8% (Target: 44.0%)</span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-emerald-400 text-lg block">
                    ${summary.estimatedNetMarginUsd.toLocaleString()}
                  </div>
                  <span className="font-sans text-[10px] text-red-400">
                    Total Lost: -${economicBreakdown.totalEstimatedLossUsd.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk of Doing Nothing Assessment */}
            <div className="p-4 bg-red-950/20 border border-red-200 rounded-xl space-y-2 mt-4">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertOctagon size={16} />
                <span className="uppercase font-sans tracking-wider font-bold">What Happens If We Do Nothing (Cost of Inaction)</span>
              </div>
              <ul className="text-xs text-red-900/90 space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
                <li>
                  <strong>Machine Breakdown Risk:</strong> Continuous machine shaking (7.2 mm/s vs 2.5 mm/s safe limit) will break spindle bearings within 4 to 6 shifts, costing an estimated <strong>$12,400 to repair</strong> and stopping the line for over 8 hours.
                </li>
                <li>
                  <strong>More Money Lost Each Shift:</strong> Doing nothing will waste an extra <strong>+$4,800 per shift</strong> in ruined parts as the cutting tool wears down further.
                </li>
                <li>
                  <strong>Customer Delivery Delays:</strong> Slowdowns at the CNC machine reduce factory output by 280 parts per shift, risking customer delivery fines.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PRODUCTION & FLOW SUMMARY                          */}
      {/* ========================================================= */}
      {activeTab === 'production' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Factory Line Flow & Parts Waiting at Each Machine
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stations.map((st) => (
                <div key={st.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-bold text-slate-700">{st.id} • {st.shortCode}</span>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold ${
                      st.status === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : st.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {st.status === 'CRITICAL' ? 'NEEDS ATTENTION' : st.status === 'WARNING' ? 'WATCH CLOSELY' : 'RUNNING OK'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-sans">{st.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 font-sans">
                    <div>Machine Busyness: <strong className="text-slate-800 font-mono">{st.utilizationPct}%</strong></div>
                    <div>Parts Waiting: <strong className="text-slate-800 font-mono">{st.queueUnits} parts</strong></div>
                    <div>Time for 1 Part: <strong className="text-slate-800 font-mono">{st.cycleTimeSec}s</strong></div>
                    <div>Factory Area: <strong className="text-slate-800 font-mono">{st.zone}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: QUALITY SUMMARY (EXECUTIVE BUSINESS IMPACT)        */}
      {/* ========================================================= */}
      {activeTab === 'quality' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Defect Financial Banner */}
          <div className="p-5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/40 rounded-2xl text-white shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-sans font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  QUALITY PROBLEM FOUND
                </span>
                <span className="text-xs font-sans text-slate-300">
                  Batch: <strong className="text-amber-300">B-204</strong> | Machine: <strong className="text-white">Inspection Station 04</strong>
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-sans font-bold">
                MONEY AT RISK: -$22,700
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 uppercase block">Ruined Parts Thrown Away (Scrap)</span>
                <strong className="text-lg font-mono text-red-400">$18,500</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">10 coils with scratches cannot be sold</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 uppercase block">Worker Time to Fix Parts (Rework)</span>
                <strong className="text-lg font-mono text-amber-400">$4,200</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">Manual grinding and polishing required</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 uppercase block">Parts Held in Warehouse (Quarantine)</span>
                <strong className="text-lg font-mono text-amber-300">STOPPED</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">Held so customer does not get bad parts</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-300 font-sans leading-relaxed">
              <strong>Quick Summary:</strong> Sensor camera found scratches on Batch B-204 metal. We stopped these parts from shipping to the car company customer so we do not get fined or damage our reputation.
            </div>
          </div>

          {/* Plant-Wide Defect Stream Financial Breakdown */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  Types of Problems Found & Cost of Ruined Parts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Total money lost to each type of defect found across the factory today.
                </p>
              </div>
              <span className="text-xs font-sans font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Ruined Metal Cost: $46,550
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Scratches on Metal (Sc)', station: 'Station 04 (Cold Finish)', cost: '$18,500', pct: 40, color: 'bg-red-500', note: 'Guide plate rubbing on Batch B-204' },
                { name: 'Rough Pressed Scale (RS)', station: 'Station 03 (Breakdown Mill)', cost: '$9,750', pct: 21, color: 'bg-amber-500', note: 'Water spray pressure dropped' },
                { name: 'Trapped Slag Particles (In)', station: 'Station 01 (Casting Feed)', cost: '$7,800', pct: 17, color: 'bg-purple-500', note: 'Ladle changeover leftover residue' },
                { name: 'Tiny Surface Cracks (Cr)', station: 'Station 04 (Roll Stand 04)', cost: '$6,300', pct: 13, color: 'bg-blue-500', note: 'Hot roll cooled down too fast' },
                { name: 'Discolored Patches (Pa)', station: 'Station 02 (Intermediate)', cost: '$4,200', pct: 9, color: 'bg-slate-500', note: 'Water spray missed a small area' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-sans">{item.name}</span>
                      <span className="text-[10px] font-sans text-slate-500">({item.station})</span>
                    </div>
                    <span className="text-slate-600 text-[11px] block">{item.note}</span>
                  </div>

                  <div className="flex items-center gap-4 sm:text-right">
                    <div className="w-28">
                      <span className="font-mono font-black text-slate-900 text-sm block">{item.cost}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{item.pct}% of ruined parts</span>
                    </div>
                    <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Boundaries Notice */}
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 font-sans">
                <span className="font-bold uppercase text-[10px] text-slate-700 block">
                  Who Sees What:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Deep sensor charts and mathematical models are kept in the <strong>Engineer Portal</strong>. Direct task checklists are sent to the <strong>Worker Portal</strong>. Here in the <strong>Owner Portal</strong>, you see overall profit, line slowdowns, and approvals.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: INCIDENTS & EXECUTIVE ACKNOWLEDGMENTS              */}
      {/* ========================================================= */}
      {activeTab === 'incidents' && (
        <div className="space-y-4 animate-in fade-in">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 font-sans">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {incident.id}
                  </span>
                  <span className="text-xs font-sans text-slate-500">
                    {incident.machineId} ({incident.stationId})
                  </span>
                  <span className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold ${
                    incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {incident.severity === 'CRITICAL' ? 'URGENT' : 'WARNING'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenIncidentChat(incident.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 font-sans"
                  >
                    <MessageSquare size={14} />
                    <span>Ask Questions</span>
                  </button>

                  <button
                    onClick={() => onOpenIncidentDetail(incident.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 font-sans"
                  >
                    <span>View Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 font-sans">
                {incident.title}
              </h4>
              <p className="text-xs text-slate-600 font-sans">
                {incident.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                <span className="font-mono text-red-600 font-bold">
                  Estimated Money Lost: -${incident.estimatedFinancialImpactUsd?.toLocaleString()}
                </span>

                {incident.acknowledgedByOwner ? (
                  <span className="text-emerald-700 font-sans font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Acknowledged by Owner</span>
                  </span>
                ) : (
                  <button
                    onClick={() => acknowledgeIncident(incident.id)}
                    className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors font-sans"
                  >
                    Acknowledge Problem
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: RECOMMENDATIONS & APPROVALS                        */}
      {/* ========================================================= */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4 animate-in fade-in">
          {recommendations.map((rec) => {
            const isApproved = approvedRecommendationIds.includes(rec.id);
            return (
              <div key={rec.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {rec.category}
                    </span>
                    <span className="font-sans text-xs text-slate-400">Target Machine: {rec.stationId}</span>
                  </div>
                  <span className="text-xs font-sans font-bold text-emerald-700">
                    +{rec.simulatedDelta.throughputPct}% More Parts • +${rec.simulatedDelta.marginUsd.toLocaleString()} Profit Saved
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 font-sans">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{rec.reason}</p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1 text-xs font-sans">
                  <span className="font-bold text-slate-800">Proof from Machine Sensors & History:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                    {rec.evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between font-sans">
                  <span className="text-xs text-slate-500">
                    System Certainty: {rec.confidencePct}%
                  </span>

                  {isApproved ? (
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>Approved by Owner (Tested in Simulation)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => approveRecommendation(rec.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                    >
                      Approve Fix
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
