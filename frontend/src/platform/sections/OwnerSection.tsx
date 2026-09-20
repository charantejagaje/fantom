import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { api, fmt, NA } from '../api';
import { errText } from '../auth';
import { Bars, Card, ErrorBox, Loading, NaChip, Stat, Table } from '../ui';

/**
 * OWNER executive dashboard: high-level, business-focused.
 * Economic metrics that the dataset does not support are shown as
 * "Not available in current dataset" - never invented.
 */
export const OwnerSection: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [bn, setBn] = useState<any>(null);
  const [recs, setRecs] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [a, b, r, al] = await Promise.all([
          api.analytics(),
          api.bottlenecks(),
          api.recommendations().catch(() => null),
          api.alerts().catch(() => null),
        ]);
        setAnalytics(a);
        setBn(b);
        setRecs(r);
        setAlerts(al);
      } catch (e) {
        setError(errText(e));
      }
    })();
  }, []);

  if (error) return <ErrorBox error={error} />;
  if (!analytics || !bn) return <Loading what="executive analytics" />;

  const stations: any[] = bn.stations ?? [];
  const hotspots: string[] = bn.potential_bottlenecks ?? [];

  return (
    <div className="space-y-4">
      <Card title="Factory performance (observed simulation dataset)">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Observed runs" value={fmt(analytics.row_count)} note={analytics.dataset} />
          <Stat label="Mean facility WIP" value={fmt(analytics.wip_totals?.total_wip_mean)} note="4 cells combined" />
          <Stat label="Mean total queue" value={fmt(analytics.total_queue_mean)} note="8 stations" />
          <Stat
            label="Potential bottlenecks"
            value={hotspots.length ? hotspots.map((h) => h.replace('queue_', '').toUpperCase()).join(' + ') : '—'}
            note="screened, not proven causes"
          />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Station load (mean queue, observed)">
          <Bars data={stations.map((s) => ({ label: s.station.replace('queue_', ''), value: s.mean }))} unit=" u" />
        </Card>

        <Card title="Business impact (economic)">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Info size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-amber-800 font-semibold">Economic metrics not available in current dataset</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  The observed dataset contains WIP/queue columns only - no cost, price, revenue,
                  downtime-cost or defect-cost fields. Loss, margin and profitability figures would be
                  invented, so they are not shown. Upload a dataset with cost columns to enable this view.
                </p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex justify-between"><span>Throughput / units produced</span><NaChip /></li>
              <li className="flex justify-between"><span>Quality / defect rate</span><NaChip /></li>
              <li className="flex justify-between"><span>Loss estimates</span><NaChip /></li>
              <li className="flex justify-between"><span>Profitability / margin impact</span><NaChip /></li>
              <li className="flex justify-between"><span>Utilization %</span><NaChip /></li>
            </ul>
            <p className="text-[10px] text-slate-400 font-mono pt-1">
              Available now: queue congestion, WIP levels, potential bottleneck screening, what-if queue
              estimates (labeled simulated), advisory recommendations.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Major bottlenecks (evidence-based screening)">
          {hotspots.length === 0 ? (
            <p className="text-xs text-slate-500">No station exceeds the documented screening rule.</p>
          ) : (
            <div className="space-y-2">
              {hotspots.map((h) => {
                const st = stations.find((s) => s.station === h);
                return (
                  <div key={h} className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber-600 mt-0.5" />
                    <div className="text-xs">
                      <strong>{h.replace('queue_', '').toUpperCase()}</strong> — mean queue {fmt(st?.mean)} parts,
                      rank #{st?.rank}, {fmt(st?.congestion_share_pct, 1)}% of facility congestion.
                      <span className="block text-[10px] text-amber-700 mt-0.5">
                        Potential bottleneck / congestion hotspot - NOT a proven root cause. Rule: {bn.rule}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Recommendation summaries (advisory)">
          {!recs ? (
            <p className="text-xs text-slate-500">Sign in as engineer+ to generate recommendations.</p>
          ) : recs.items?.length ? (
            <ul className="space-y-2">
              {recs.items.slice(0, 4).map((r: any) => (
                <li key={r.id} className="p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <CheckCircle2 size={13} className="text-emerald-600" /> {r.title}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{r.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No recommendations stored yet.</p>
          )}
          <p className="text-[10px] text-slate-400 font-mono mt-2">advisory only · never controls machinery</p>
        </Card>
      </div>

      <Card title="Operational alerts (real-data screens)">
        {alerts?.alerts?.length ? (
          <Table head={['Severity', 'Alert', 'Detail']}>
            {alerts.alerts.map((a: any) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="py-2 pr-3">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    a.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>{a.severity}</span>
                </td>
                <td className="py-2 pr-3 font-bold">{a.title}</td>
                <td className="py-2 pr-3 text-slate-600 font-sans">{a.body}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <p className="text-xs text-slate-500">No active alerts. Engineers can refresh screens from the Alerts page.</p>
        )}
      </Card>
    </div>
  );
};
