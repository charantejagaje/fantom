import React, { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Bars, Card, ErrorBox, Loading, NaChip, Stat } from '../ui';

export const DashboardSection: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [bl, setBl] = useState<any>(null);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    Promise.all([api.analytics(), api.bottlenecks()])
      .then(([s, b]) => {
        setSummary(s);
        setBl(b);
      })
      .catch(setErr);
  }, []);

  if (err) return <ErrorBox error={err} />;
  if (!summary || !bl) return <Loading what="dashboard analytics" />;

  const wip = summary.wip_totals?.per_cell_means ?? {};
  const queueBars = bl.stations
    .slice()
    .sort((a: any, b: any) => b.mean - a.mean)
    .map((s: any) => ({ label: s.station, value: s.mean }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Observed runs" value={fmt(summary.row_count)} note="facility_sim_clean.csv" />
        <Stat label="Mean total WIP" value={fmt(summary.wip_totals?.total_wip_mean)} note="4 cells combined" />
        <Stat label="Mean total queue" value={fmt(summary.total_queue_mean)} note="8 stations" />
        <Stat
          label="Potential bottlenecks"
          value={summary.potential_bottlenecks.length ? summary.potential_bottlenecks.map((h: string) => h.replace('queue_', '').toUpperCase()).join(' + ') : 'none'}
          note="screened, not proven causes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Mean queue by station (observed)">
          <Bars data={queueBars} />
        </Card>
        <Card title="Mean cell WIP inputs (observed)">
          <Bars data={Object.entries(wip).map(([label, value]) => ({ label, value: Number(value) }))} />
        </Card>
      </div>

      <Card title="Metric availability (honest scope)">
        <div className="flex flex-wrap gap-2">
          {[
            'queue statistics',
            'congestion shares',
            'potential bottleneck flags',
            'WIP-queue associations',
            'robust z-score anomaly screen',
            'what-if simulation (labeled estimate)',
          ].map((x) => (
            <span key={x} className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700">
              ✓ {x}
            </span>
          ))}
          {summary.not_available.map((x: string) => (
            <NaChip key={x} label={x} />
          ))}
        </div>
      </Card>
    </div>
  );
};
