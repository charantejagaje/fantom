import React, { useCallback, useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Card, Empty, ErrorBox, Loading } from '../ui';

export const RecommendationsSection: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  const load = useCallback(() => {
    api.recommendations().then(setData).catch(setErr);
  }, []);

  useEffect(load, [load]);

  const generate = (analysis_type: string) => {
    setBusy(true);
    api
      .createRecommendation(analysis_type)
      .then(load)
      .catch(setErr)
      .finally(() => setBusy(false));
  };

  if (err) return <ErrorBox error={err} />;
  if (!data) return <Loading what="recommendations" />;

  return (
    <div className="space-y-4">
      <Card title="Generate advisory from a structured analysis">
        <div className="flex gap-2 flex-wrap">
          {[
            ['bottleneck', 'From bottleneck screen'],
            ['association', 'From association analysis'],
            ['queue_stats', 'From queue statistics'],
          ].map(([type, label]) => (
            <button
              key={type}
              onClick={() => generate(type)}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? 'working…' : label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 font-sans mt-2">
          Generated only from structured results stored in the database. Advisory for a human engineer —
          the system never acts on machinery and never invents evidence.
        </p>
      </Card>

      {data.items.length === 0 ? (
        <Empty what="recommendations" />
      ) : (
        data.items.map((r: any) => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
              <h4 className="text-sm font-bold text-slate-900">{r.title}</h4>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  r.status === 'open'
                    ? 'bg-slate-100 text-slate-600'
                    : r.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {r.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">{r.body}</p>
            {r.basis_json && (
              <details className="mt-2">
                <summary className="text-[10px] font-mono text-slate-500 cursor-pointer">
                  evidence basis (structured results)
                </summary>
                <pre className="mt-1 p-2 bg-slate-50 border border-slate-100 rounded text-[10px] font-mono text-slate-600 overflow-x-auto">
                  {JSON.stringify(r.basis_json, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))
      )}
    </div>
  );
};
