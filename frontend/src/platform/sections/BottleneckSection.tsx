import React, { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Bars, Card, ErrorBox, Loading, Stat, Table } from '../ui';

export const BottleneckSection: React.FC = () => {
  const [bl, setBl] = useState<any>(null);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    api.bottlenecks().then(setBl).catch(setErr);
  }, []);

  if (err) return <ErrorBox error={err} />;
  if (!bl) return <Loading what="bottleneck analysis" />;

  const sorted = bl.stations.slice().sort((a: any, b: any) => a.rank - b.rank);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
        <strong>Terminology:</strong> {bl.terminology}. Rule applied: {bl.rule}.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {bl.potential_bottlenecks.length ? (
          bl.potential_bottlenecks.map((h: string) => {
            const s = bl.stations.find((x: any) => x.station === h);
            return (
              <Stat
                key={h}
                label={`${h.replace('queue_', '').toUpperCase()} — potential bottleneck`}
                value={fmt(s?.mean)}
                note={`rank #${s?.rank} · ${s?.congestion_share_pct}% of queue`}
              />
            );
          })
        ) : (
          <Stat label="Potential bottlenecks" value="none" note="no station exceeded the rule" />
        )}
        <Stat label="Stations analyzed" value={bl.stations.length} note="observed queue columns" />
      </div>

      <Card title="Station ranking (observed)">
        <Bars data={sorted.map((s: any) => ({ label: s.station, value: s.mean }))} />
      </Card>

      <Card title="Evidence table (all computed from the observed dataset)">
        <Table head={['Rank', 'Station', 'Mean', 'Median', 'Std', 'CV %', 'P95', 'Max', 'Share %', 'Flag']}>
          {sorted.map((s: any) => (
            <tr key={s.station} className="border-b border-slate-100">
              <td className="py-1.5 pr-3">#{s.rank}</td>
              <td className="py-1.5 pr-3 font-bold">{s.station}</td>
              <td className="py-1.5 pr-3">{fmt(s.mean, 1)}</td>
              <td className="py-1.5 pr-3">{fmt(s.median, 1)}</td>
              <td className="py-1.5 pr-3">{fmt(s.std, 1)}</td>
              <td className="py-1.5 pr-3">{s.cv_pct.toFixed(1)}</td>
              <td className="py-1.5 pr-3">{fmt(s.p95)}</td>
              <td className="py-1.5 pr-3">{fmt(s.max)}</td>
              <td className="py-1.5 pr-3">{s.congestion_share_pct.toFixed(1)}</td>
              <td className="py-1.5 pr-3">
                {s.potential_bottleneck ? (
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                    POTENTIAL BOTTLENECK
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};
