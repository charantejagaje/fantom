import React from 'react';
import {
  Database,
  BarChart3,
  Cpu,
  Users,
  ShieldCheck,
  AlertTriangle,
  PlayCircle,
  Terminal,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Info,
  Factory,
  GitBranch,
  Layers,
  FlaskConical,
  ScanSearch,
} from 'lucide-react';
import { useIndustrialStore } from '../../../store/useIndustrialStore';
import { JudgeVerificationBench } from './JudgeVerificationBench';

/**
 * ROUND 2 PRESENTATION SHOWCASE
 * A single self-contained page for judging round 2: project features,
 * live real-data metrics (observed simulation dataset), and how to use
 * the working prototype. Additive only - no existing page is modified.
 *
 * Open with: http://localhost:3001/?view=showcase
 */

const FEATURES = [
  {
    icon: Database,
    title: 'Real Manufacturing Dataset',
    tag: 'DATA',
    points: [
      'Mendeley 10.17632/3rw227zxt7.2 (CC BY 4.0) - Arena discrete-event simulation of a shared facility',
      '605,616 observed runs: 4 cell WIP inputs -> 8 station queues',
      'Safe preprocessing pipeline: validated, deduplicated, fully logged (raw data untouched)',
    ],
  },
  {
    icon: BarChart3,
    title: 'Queue & Production Metrics',
    tag: 'STEP 5',
    points: [
      'Per-station mean / median / std / CV / P90 / P95 / P99 / max',
      'Congestion shares and cross-station ranking',
      'Unavailable metrics (utilization, cost, defects) are shown as unavailable - never invented',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Bottleneck Detection',
    tag: 'STEP 6',
    points: [
      'Documented rule: mean queue > 2x median of station means',
      'Hotspots found: c1s2 (rank 1) and c4s3 (rank 2)',
      'Labeled "potential bottleneck" - never a proven root cause',
    ],
  },
  {
    icon: GitBranch,
    title: 'Factor / Association Analysis',
    tag: 'STEP 7',
    points: [
      'Marginal vs conditional (joint OLS) views with VIF + condition-number diagnostics',
      'c1s2 associated with cell-2 WIP (r ~ 0.99); c4s3 with cell-3 WIP (r ~ 1.00)',
      'Strict association language: correlation is NOT causation',
    ],
  },
  {
    icon: Cpu,
    title: 'Live Analytics API',
    tag: 'BACKEND',
    points: [
      'Express server, CSV loaded once and cached (no per-request reprocessing)',
      'Endpoints: /api/overview, /api/stations, /api/bottlenecks, /api/associations, /api/wip, /api/metrics, /api/analysis',
      'ANN predictions isolated at /api/ann/:station and always labeled "Model-predicted"',
    ],
  },
  {
    icon: Users,
    title: 'Multi-Role Decision Support',
    tag: 'UI',
    points: [
      'Owner / Engineer / Worker portals on one shared factory state',
      'Observational caveats and data-limitation banners built into the UI',
      'Software-only advisory system: no machine control, no live camera feed',
    ],
  },
];

const NA = 'Not available in current dataset';
const fmt = (n: any, d = 0) =>
  typeof n === 'number' ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : '...';

export const Round2Showcase: React.FC = () => {
  const { realAnalytics, loadRealAnalytics } = useIndustrialStore();
  const stations: any[] = realAnalytics?.stations ?? [];
  const overview: any = realAnalytics?.overview ?? null;
  const hotspots: string[] = overview?.potentialBottlenecks ?? [];

  const liveCards = [
    { label: 'Observed runs analyzed', value: overview ? overview.rowCount.toLocaleString() : '...', note: 'facility_sim_clean.csv (observed simulation)' },
    { label: 'Facility mean WIP', value: fmt(overview?.totalWipMean), note: 'parts, balanced across 4 cells' },
    { label: 'Mean total queue', value: fmt(overview?.totalQueueMean), note: 'parts waiting across 8 stations' },
    { label: 'Potential bottlenecks', value: hotspots.length ? hotspots.map((h) => h.replace('queue_', '').toUpperCase()).join(' + ') : '...', note: 'potential only - not proven root causes' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 mb-2">
          <Factory size={13} />
          <span>FANTOM - ROUND 2: FEATURES & WORKING PROTOTYPE</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Industrial AI Decision Intelligence</h1>
        <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
          A software-only decision-support system for metal-component manufacturing. It analyzes
          manufacturing data and presents evidence-based insights, potential contributing factors,
          and simulated what-if guidance for human decision-making. It does NOT control machines,
          use a live camera feed, or claim causation from correlation.
        </p>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <button
            onClick={loadRealAnalytics}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Refresh Live Data</span>
          </button>
          <a
            href="/"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <PlayCircle size={13} />
            <span>Open the Interactive Prototype</span>
            <ArrowRight size={12} />
          </a>
          <a
            href="https://data.mendeley.com/datasets/3rw227zxt7/2"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={13} />
            <span>Dataset Source (Mendeley)</span>
          </a>
        </div>
      </div>

      {/* Live real-data cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveCards.map((c) => (
          <div key={c.label} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] font-sans uppercase text-slate-500 font-semibold">{c.label}</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">{c.value}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-sans">{c.note}</div>
          </div>
        ))}
      </div>

      {/* Live station table (real data) */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Live Station Analytics (observed simulation data)</h3>
          </div>
          {realAnalytics?.loading && <span className="text-[11px] font-mono text-blue-600">loading real data...</span>}
          {realAnalytics?.error && (
            <span className="text-[11px] font-mono text-red-600">
              backend offline - start it with: PORT=8000 node backend/server.js
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-3">Station</th>
                <th className="py-2 pr-3">Mean queue</th>
                <th className="py-2 pr-3">P95</th>
                <th className="py-2 pr-3">CV %</th>
                <th className="py-2 pr-3">Congestion share</th>
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2">Flag</th>
              </tr>
            </thead>
            <tbody>
              {stations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">
                    {realAnalytics?.error
                      ? 'No backend connection - live values unavailable (no demo numbers substituted).'
                      : 'Loading observed data...'}
                  </td>
                </tr>
              )}
              {stations.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-3 font-bold text-slate-800">{s.id}</td>
                  <td className="py-2 pr-3">{fmt(s.mean)}</td>
                  <td className="py-2 pr-3">{fmt(s.p95)}</td>
                  <td className="py-2 pr-3">{typeof s.cvPct === 'number' ? s.cvPct.toFixed(1) : '...'}</td>
                  <td className="py-2 pr-3">{typeof s.congestionSharePct === 'number' ? `${s.congestionSharePct.toFixed(1)}%` : '...'}</td>
                  <td className="py-2 pr-3">#{s.congestionRank}</td>
                  <td className="py-2">
                    {s.potentialBottleneck ? (
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                        POTENTIAL BOTTLENECK
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 font-sans">
          All values above are computed live from the observed simulation dataset. Metrics that do not
          exist in the source data (utilization, throughput, cycle time, downtime, defect rates, costs)
          are deliberately not shown as numbers anywhere in this system.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <f.icon size={18} />
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {f.tag}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
            <ul className="space-y-1.5">
              {f.points.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-relaxed">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How to demo the prototype */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">How to Run the Prototype</h3>
          </div>
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 text-[11px] font-mono space-y-1">
            <div><span className="text-slate-500"># terminal 1 - analytics API</span></div>
            <div>cd fantom/backend &amp;&amp; PORT=8000 node server.js</div>
            <div><span className="text-slate-500"># terminal 2 - web app</span></div>
            <div>cd fantom/frontend &amp;&amp; npm install --legacy-peer-deps</div>
            <div>cd fantom/frontend &amp;&amp; npm run dev</div>
            <div><span className="text-slate-500"># open</span> http://localhost:3000</div>
          </div>
          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
            The backend loads the 605,616-row observed dataset once (~25 seconds) and caches all
            statistics. The frontend then serves every dashboard number from that API - no hardcoded
            analytics.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Suggested 5-Minute Demo Flow</h3>
          </div>
          <ol className="space-y-2 text-[11px] text-slate-600 font-sans leading-relaxed list-decimal pl-4">
            <li><strong>This page:</strong> features + live dataset metrics (proof of real data).</li>
            <li><strong>Owner portal:</strong> executive KPIs, congestion hotspots, pipeline with observed station stats.</li>
            <li><strong>Flow Intelligence:</strong> per-station queue evidence, bottleneck flags with the documented rule.</li>
            <li><strong>Root Cause Explorer:</strong> WIP-queue associations (r values), explicitly labeled association-only.</li>
            <li><strong>Engineer/Worker portals:</strong> the role-based collaboration story (scripted demo scenario, labeled as such).</li>
            <li><strong>Honesty checkpoint:</strong> point at any "Not available in current dataset" chip - the system never fabricates missing fields.</li>
          </ol>
        </div>
      </div>

      {/* Live judge verification bench (separate section) */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ScanSearch size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Live Dataset Check - upload & verify on stage</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            INTERACTIVE - FOR JUDGES
</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            NEU-DET STEEL DEFECT DATASET (BUNDLED)
          </span>
        </div>
        <JudgeVerificationBench />
      </div>

      {/* Integrity & limitations banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
        <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="uppercase text-[11px] font-bold block">Data Integrity Statement</strong>
          <p className="leading-relaxed">
            All analytics derive from the cited Mendeley dataset (observed Arena simulation outputs).
            Scenario/economics screens are part of the demo narrative and are labeled as such, because
            the source dataset contains no cost, defect, or telemetry fields. ANN queue predictions
            (model3.csv) are served only through a dedicated endpoint and are always labeled
            "Model-predicted", never "Observed". Association does not establish causation.
          </p>
        </div>
      </div>
    </div>
  );
};
