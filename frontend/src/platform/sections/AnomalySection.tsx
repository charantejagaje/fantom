import React, { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Card, ErrorBox, Loading, Stat, Table } from '../ui';

export const AnomalySection: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [threshold, setThreshold] = useState(3.5);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  const run = (z: number) => {
    setBusy(true);
    api
      .anomalies(z)
      .then(setResult)
      .catch(setErr)
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    run(3.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Card title="Screen configuration">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-sans text-slate-600">
            Robust z threshold:
            <input
              type="range"
              min={2}
              max={6}
              step={0.1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mx-2 align-middle"
            />
            <span className="font-mono font-bold">{threshold.toFixed(1)}</span>
          </label>
          <button
            onClick={() => run(threshold)}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? 'scanning…' : 'Run screen'}
          </button>
        </div>
        {result && (
          <p className="text-[11px] text-slate-500 font-sans mt-2 leading-relaxed">
            {result.method} · {result.disclaimer}
          </p>
        )}
      </Card>

      {err && <ErrorBox error={err} />}
      {!result && !err && <Loading what="anomaly screen" />}

      {result && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Points scored" value={fmt(result.total_points_scored)} note="12 variables × runs" />
            <Stat label="Flagged" value={fmt(result.anomalies_flagged)} note={`|z| > ${result.threshold_z}`} />
            <Stat
              label="Flag rate"
              value={`${((100 * result.anomalies_flagged) / result.total_points_scored).toFixed(3)}%`}
            />
            <Stat label="Provenance" value={result.provenance} note="observed simulation" />
          </div>

          <Card title="Flagged values by variable (up to 50 shown per variable)">
            {result.anomalies_flagged === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                No points exceeded the threshold at this setting — the observed distribution is compact.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(result.by_variable)
                  .filter(([, rows]: any) => rows.length > 0)
                  .map(([v, rows]: any) => (
                    <div key={v}>
                      <div className="text-[11px] font-bold text-slate-700 mb-1">
                        {v} — {rows.length} shown
                      </div>
                      <Table head={['Row index', 'Value', 'z']}>
                        {rows.map((r: any) => (
                          <tr key={r.row_index} className="border-b border-slate-100">
                            <td className="py-1.5 pr-3">{r.row_index.toLocaleString()}</td>
                            <td className="py-1.5 pr-3">{fmt(r.value, 1)}</td>
                            <td className="py-1.5 pr-3 font-bold text-red-700">{r.z.toFixed(2)}</td>
                          </tr>
                        ))}
                      </Table>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
