import React, { useState } from 'react';
import { api, fmt } from '../api';
import { Card, ErrorBox, Stat, Table } from '../ui';

const CELLS = ['wip_cell1', 'wip_cell2', 'wip_cell3', 'wip_cell4'];

export const SimulationSection: React.FC = () => {
  const [mults, setMults] = useState<Record<string, number>>({ wip_cell2: 1.1 });
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  const run = () => {
    setBusy(true);
    api
      .simulation(mults, `what-if ${new Date().toLocaleTimeString()}`)
      .then(setResult)
      .catch(setErr)
      .finally(() => setBusy(false));
  };

  return (
    <div className="space-y-4">
      <Card title="Scenario builder (multipliers on observed mean cell WIP)">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {CELLS.map((c) => (
            <label key={c} className="text-xs font-sans text-slate-600 block">
              {c.replace('wip_', 'cell ')} ×
              <input
                type="number"
                step={0.05}
                min={0.1}
                max={3}
                value={mults[c] ?? 1.0}
                onChange={(e) =>
                  setMults((m) => ({ ...m, [c]: Number(e.target.value) || 1.0 }))
                }
                className="mt-1 w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
              />
            </label>
          ))}
        </div>
        <button
          onClick={run}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? 'simulating…' : 'Run what-if'}
        </button>
        {result && (
          <p className="text-[11px] text-slate-500 font-sans mt-2 leading-relaxed">
            {result.method}
          </p>
        )}
      </Card>

      {err && <ErrorBox error={err} />}

      {result && (
        <>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
            <strong>SIMULATED ESTIMATE</strong> — {result.disclaimer}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Stat
              label="Scenario"
              value={Object.entries(result.scenario)
                .map(([k, v]) => `${k.replace('wip_', '')}×${v}`)
                .join(' ')}
            />
            <Stat label="Baseline total queue" value={fmt(result.baseline_total_queue_mean)} note="observed mean" />
            <Stat label="Simulated total queue" value={fmt(result.simulated_total_queue_mean)} note="estimate" />
          </div>
          <Card title="Per-station estimates">
            <Table head={['Station', 'Baseline mean', 'Simulated mean', 'Δ', 'Δ %']}>
              {result.stations.map((s: any) => (
                <tr key={s.station} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-bold">{s.station}</td>
                  <td className="py-1.5 pr-3">{fmt(s.baseline_mean, 1)}</td>
                  <td className="py-1.5 pr-3">{fmt(s.simulated_mean, 1)}</td>
                  <td className={`py-1.5 pr-3 font-bold ${s.delta >= 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {s.delta >= 0 ? '+' : ''}
                    {fmt(s.delta, 1)}
                  </td>
                  <td className="py-1.5 pr-3">
                    {s.delta_pct >= 0 ? '+' : ''}
                    {s.delta_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}
    </div>
  );
};
