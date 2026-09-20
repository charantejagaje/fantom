import React, { useEffect, useState } from 'react';
import { api, fmt, NA } from '../api';
import { Bars, Card, ErrorBox, Loading, NaChip, Stat, Table } from '../ui';

export const ProductionSection: React.FC = () => {
  const [prod, setProd] = useState<any>(null);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    api.production().then(setProd).catch(setErr);
  }, []);

  if (err) return <ErrorBox error={err} />;
  if (!prod) return <Loading what="production analytics" />;

  const cells = prod.variables.filter((v: any) => v.variable.startsWith('wip_'));
  const stations = prod.variables.filter((v: any) => v.variable.startsWith('queue_'));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Mean total WIP" value={fmt(prod.wip_totals?.total_wip_mean)} note="facility input load" />
        <Stat label="Mean total queue" value={fmt(prod.total_queue_mean)} note="all 8 stations" />
        <Stat label="Observations" value={fmt(prod.row_count)} note="simulation runs" />
        <Stat label="Throughput" value={<NaChip />} note="no throughput fields in dataset" />
      </div>

      <Card title="Production variables — observed statistics">
        <Table head={['Variable', 'Mean', 'Std', 'P95', 'Max', 'CV %']}>
          {[...cells, ...stations].map((v: any) => (
            <tr key={v.variable} className="border-b border-slate-100">
              <td className="py-1.5 pr-3 font-bold">{v.variable}</td>
              <td className="py-1.5 pr-3">{fmt(v.mean, 1)}</td>
              <td className="py-1.5 pr-3">{fmt(v.std, 1)}</td>
              <td className="py-1.5 pr-3">{fmt(v.p95, 0)}</td>
              <td className="py-1.5 pr-3">{fmt(v.max, 0)}</td>
              <td className="py-1.5 pr-3">{((100 * v.std) / v.mean).toFixed(1)}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Cell WIP means (observed)">
          <Bars data={cells.map((v: any) => ({ label: v.variable, value: v.mean }))} />
        </Card>
        <Card title="Not computed (fields absent from dataset)">
          <div className="flex flex-wrap gap-2">
            {prod.not_available.map((x: string) => (
              <NaChip key={x} label={x} />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 font-sans mt-2">
            These metrics would require utilization/cycle-time/count/cost fields that the source dataset
            does not contain. They appear nowhere as numbers — {NA} is the contract.
          </p>
        </Card>
      </div>
    </div>
  );
};
