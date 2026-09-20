import React, { useRef, useState } from 'react';
import {
  FileUp,
  Loader2,
  PlayCircle,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

/**
 * LIVE DATA EVALUATION - feature UI (extension area)
 * Evaluator uploads a CSV; the backend validates it, stores it as evaluation
 * data ONLY, and runs the existing analytics pipeline on it. Results shown
 * here are computed from the upload; unsupported metrics arrive as
 * "Not available in uploaded dataset" and are displayed as-is - never invented.
 */

interface UploadInfo {
  evaluation_id: string;
  filename: string;
  records: number;
  features: number;
  columns: { name: string; dtype: string; missing: number }[];
  validation: string;
  note: string;
}

interface Results {
  evaluation_id: string;
  dataset_summary: {
    records: number;
    features: number;
    numeric_features: number;
    queue_like_columns: string[];
    wip_like_columns: string[];
    columns: { name: string; dtype: string; missing: number; unique: number }[];
  };
  results: {
    records: number;
    feature_count: number;
    throughput: any;
    utilization: any;
    cycle_time: any;
    waiting_queue: any;
    bottleneck_indicators: any;
    anomalies: any;
    ml_predictions: any;
    simulation: any;
    not_available_metrics: string[];
  };
}

const NA_TEXT = 'Not available in uploaded dataset';

const apiPost = async (path: string, body: FormData) => {
  const res = await fetch(`/api/v1${path}`, { method: 'POST', body });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch { /* keep status */ }
    throw new Error(detail);
  }
  return res.json();
};

const apiGet = async (path: string) => {
  const res = await fetch(`/api/v1${path}`);
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch { /* keep status */ }
    throw new Error(detail);
  }
  return res.json();
};

const MetricSlot: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  const unavailable = typeof value === 'string';
  return (
    <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
      <div className="text-[9px] font-sans uppercase text-slate-500 font-semibold">{label}</div>
      {unavailable ? (
        <div className="text-[11px] font-mono text-slate-500 mt-1 leading-snug">{value}</div>
      ) : (
        <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
          {value?.column ?? '—'}
          {typeof value?.mean === 'number' && (
            <span className="text-[10px] font-normal text-slate-500 ml-1">
              mean {value.mean.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const LiveEvaluationFeature: React.FC = () => {
  const [upload, setUpload] = useState<UploadInfo | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [busy, setBusy] = useState<'upload' | 'analyze' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | null | undefined) => {
    if (!file) return;
    setBusy('upload');
    setError(null);
    setResults(null);
    setUpload(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const info = await apiPost('/evaluation/upload', fd);
      setUpload(info);
    } catch (e) {
      setError(String((e as Error).message));
    } finally {
      setBusy(null);
    }
  };

  const analyze = async () => {
    if (!upload) return;
    setBusy('analyze');
    setError(null);
    try {
      const r = await apiGet(`/evaluation/${encodeURIComponent(upload.evaluation_id)}/results`);
      setResults(r);
    } catch (e) {
      setError(String((e as Error).message));
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    setUpload(null);
    setResults(null);
    setError(null);
  };

  const wq = results?.results.waiting_queue;

  return (
    <div className="space-y-4">
      {/* Data separation notice */}
      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
        <ShieldCheck size={14} className="shrink-0 mt-0.5" />
        <span>
          Uploaded files are treated as <strong>evaluation/inference data only</strong>. They never
          modify the training dataset (model3.csv / facility datasets), never retrain or alter saved
          models, and never change application code. Analysis uses the platform's existing pipeline.
        </span>
      </div>

      {/* Upload zone */}
      {!upload && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Upload an evaluation dataset (CSV)</h3>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            {busy === 'upload' ? (
              <Loader2 size={22} className="mx-auto animate-spin text-slate-400" />
            ) : (
              <FileUp size={22} className="mx-auto text-slate-400" />
            )}
            <p className="text-xs font-sans text-slate-600 mt-2 font-semibold">
              Drag a CSV here, or click to browse
            </p>
            <p className="text-[11px] text-slate-500 font-sans mt-1">
              Validated server-side: non-empty, parsable, numeric content required. Max 50 MB.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span className="font-mono break-all">{error}</span>
        </div>
      )}

      {/* Validation status */}
      {upload && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Validation: <span className="text-emerald-700">PASSED</span> — {upload.filename}
            </h3>
            <button
              onClick={reset}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 flex items-center gap-1"
            >
              <RotateCcw size={11} /> New upload
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="text-[9px] uppercase text-slate-500 font-semibold">Evaluation ID</div>
              <div className="text-[11px] font-mono font-bold truncate">{upload.evaluation_id}</div>
            </div>
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="text-[9px] uppercase text-slate-500 font-semibold">Records</div>
              <div className="text-sm font-mono font-bold">{upload.records.toLocaleString()}</div>
            </div>
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="text-[9px] uppercase text-slate-500 font-semibold">Features</div>
              <div className="text-sm font-mono font-bold">{upload.features}</div>
            </div>
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="text-[9px] uppercase text-slate-500 font-semibold">Status</div>
              <div className="text-sm font-mono font-bold text-emerald-700">{upload.validation}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {upload.columns.map((c) => (
              <span
                key={c.name}
                className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600"
                title={`${c.dtype} · ${c.missing} missing`}
              >
                {c.name}
                {c.missing > 0 && <span className="text-amber-600"> ({c.missing}?)</span>}
              </span>
            ))}
          </div>
          <button
            onClick={analyze}
            disabled={busy === 'analyze'}
            className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
          >
            {busy === 'analyze' ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />}
            {busy === 'analyze' ? 'Analyzing with the platform pipeline…' : 'Start analysis'}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricSlot label="Throughput" value={results.results.throughput} />
            <MetricSlot label="Utilization" value={results.results.utilization} />
            <MetricSlot label="Cycle time" value={results.results.cycle_time} />
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="text-[9px] font-sans uppercase text-slate-500 font-semibold">Records × Features</div>
              <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {results.results.records.toLocaleString()} × {results.results.feature_count}
              </div>
              <div className="text-[10px] text-slate-500">{results.dataset_summary.numeric_features} numeric</div>
            </div>
          </div>

          {/* Queue / waiting information */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Waiting / queue information</h3>
            <p className="text-[11px] text-slate-500 font-sans mb-2">{wq?.framing}</p>
            {wq?.total_queue_mean !== undefined && (
              <div className="text-xs font-mono text-slate-700 mb-2">
                Total queue mean: <strong>{Number(wq.total_queue_mean).toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-1.5 pr-3">Column</th>
                    <th className="py-1.5 pr-3">Mean</th>
                    <th className="py-1.5 pr-3">Std</th>
                    <th className="py-1.5 pr-3">P95</th>
                    <th className="py-1.5 pr-3">Max</th>
                    {wq?.stations?.[0]?.congestion_share_pct !== undefined && <th className="py-1.5 pr-3">Share %</th>}
                    {wq?.stations?.[0]?.rank !== undefined && <th className="py-1.5 pr-3">Rank</th>}
                    {wq?.stations?.[0]?.potential_bottleneck !== undefined && <th className="py-1.5 pr-3">Flag</th>}
                  </tr>
                </thead>
                <tbody>
                  {(wq?.stations ?? []).map((s: any) => (
                    <tr key={s.station} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3 font-bold">{s.station}</td>
                      <td className="py-1.5 pr-3">{Number(s.mean).toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                      <td className="py-1.5 pr-3">{Number(s.std ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                      <td className="py-1.5 pr-3">{Number(s.p95 ?? 0).toLocaleString()}</td>
                      <td className="py-1.5 pr-3">{Number(s.max ?? 0).toLocaleString()}</td>
                      {s.congestion_share_pct !== undefined && <td className="py-1.5 pr-3">{s.congestion_share_pct?.toFixed?.(1) ?? '—'}</td>}
                      {s.rank !== undefined && <td className="py-1.5 pr-3">#{s.rank}</td>}
                      {s.potential_bottleneck !== undefined && (
                        <td className="py-1.5 pr-3">
                          {s.potential_bottleneck ? (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                              POTENTIAL BOTTLENECK
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {wq?.bottleneck_rule && (
              <p className="text-[10px] text-slate-500 font-sans mt-2">
                Bottleneck rule: {wq.bottleneck_rule} · potential bottlenecks:{' '}
                {wq.potential_bottlenecks?.length ? wq.potential_bottlenecks.join(', ') : 'none flagged'}
              </p>
            )}
          </div>

          {/* Anomalies */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Anomaly screening</h3>
            <p className="text-[11px] text-slate-500 font-sans mb-2">{results.results.anomalies.method}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(results.results.anomalies.by_variable).map(([v, info]: any) => (
                <div key={v} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="text-[10px] font-mono font-bold text-slate-700 truncate">{v}</div>
                  <div className="text-xs font-mono">
                    flagged <strong className={info.flagged > 0 ? 'text-red-700' : 'text-slate-500'}>{info.flagged.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              Total flagged: {results.results.anomalies.flagged_total.toLocaleString()} · screens are review triggers, not verdicts.
            </p>
          </div>

          {/* ML predictions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">ML predictions</h3>
            {results.results.ml_predictions.available ? (
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-slate-500">pipeline: {results.results.ml_predictions.pipeline}</p>
                {results.results.ml_predictions.runs.map((m: any, i: number) => (
                  <div key={i} className="space-y-1.5">
                    <div className="text-[11px] font-bold font-mono text-slate-700">{m.model}</div>
                    {(m.runs ?? []).map((r: any, j: number) => (
                      <div key={j} className="text-xs font-mono text-slate-600 pl-3">
                        {r.target}: {r.n_predictions} predictions
                        {r.summary?.mean !== undefined && r.summary?.mean !== null && (
                          <> · mean {Number(r.summary.mean).toLocaleString(undefined, { maximumFractionDigits: 1 })}</>
                        )}
                        {r.summary?.flagged_rows !== undefined && (
                          <> · flagged {Number(r.summary.flagged_rows).toLocaleString()} ({r.summary.flagged_fraction_pct}%)</>
                        )}
                        {' · '}<span className="text-slate-500">model-predicted (not observed)</span>
                        {r.first_values && (
                          <span className="text-slate-400"> · first: [{r.first_values.slice(0, 3).map((v: number) => Number(v).toFixed(0)).join(', ')}…]</span>
                        )}
                        {r.limitation && <div className="text-[10px] text-slate-500 pl-3 font-sans">{r.limitation}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] font-mono text-slate-500">{results.results.ml_predictions.reason ?? NA_TEXT}</p>
            )}
          </div>

          {/* Simulation */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Simulation</h3>
            {typeof results.results.simulation === 'string' ? (
              <p className="text-[11px] font-mono text-slate-500">{results.results.simulation}</p>
            ) : results.results.simulation?.supported ? (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 font-sans">{results.results.simulation.note}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-1.5 pr-3">Station</th>
                        <th className="py-1.5 pr-3">Baseline</th>
                        <th className="py-1.5 pr-3">Simulated</th>
                        <th className="py-1.5 pr-3">Δ</th>
                        <th className="py-1.5 pr-3">Δ %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.simulation.result.stations.map((s: any) => (
                        <tr key={s.station} className="border-b border-slate-100">
                          <td className="py-1.5 pr-3 font-bold">{s.station}</td>
                          <td className="py-1.5 pr-3">{Number(s.baseline_mean).toLocaleString()}</td>
                          <td className="py-1.5 pr-3">{Number(s.simulated_mean).toLocaleString()}</td>
                          <td className={`py-1.5 pr-3 font-bold ${s.delta >= 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                            {s.delta >= 0 ? '+' : ''}{s.delta}
                          </td>
                          <td className="py-1.5 pr-3">{s.delta_pct >= 0 ? '+' : ''}{s.delta_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-500 font-sans">{results.results.simulation.result.disclaimer}</p>
              </div>
            ) : (
              <p className="text-[11px] font-mono text-slate-500">{results.results.simulation?.reason ?? NA_TEXT}</p>
            )}
          </div>

          {/* Not available */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Metrics not computable from this upload</h3>
            <div className="flex flex-wrap gap-1.5">
              {results.results.not_available_metrics.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
