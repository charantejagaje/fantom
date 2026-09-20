import React, { useEffect, useState } from 'react';
import { api, fmt } from '../api';
import { Card, ErrorBox, Loading, Table } from '../ui';

export const DataSection: React.FC = () => {
  const [datasets, setDatasets] = useState<any[] | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    api
      .datasets()
      .then(async (list) => {
        setDatasets(list);
        const primary = list.find((d) => d.kind === 'observed') ?? list[0];
        if (primary) setDetail(await api.dataset(primary.name));
      })
      .catch(setErr);
  }, []);

  if (err) return <ErrorBox error={err} />;
  if (!datasets) return <Loading what="dataset registry" />;

  return (
    <div className="space-y-4">
      <Card title="Registered datasets (from the application database)">
        <Table head={['Name', 'Kind', 'Rows', 'Cols', 'Status']}>
          {datasets.map((d) => (
            <tr
              key={d.id}
              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
              onClick={() => api.dataset(d.name).then(setDetail).catch(setErr)}
            >
              <td className="py-2 pr-3 font-bold text-slate-800">{d.name}</td>
              <td className="py-2 pr-3">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    d.kind === 'observed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {d.kind === 'model_predicted' ? 'MODEL-PREDICTED' : 'OBSERVED'}
                </span>
              </td>
              <td className="py-2 pr-3">{fmt(d.row_count)}</td>
              <td className="py-2 pr-3">{d.column_count ?? '—'}</td>
              <td className="py-2 pr-3">{d.status}</td>
            </tr>
          ))}
        </Table>
      </Card>

      {detail && (
        <>
          <Card title={`${detail.name} — schema`}>
            <Table head={['Column', 'Dtype', 'Role', 'Missing', 'Unique']}>
              {detail.columns.map((c: any) => (
                <tr key={c.name} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-bold">{c.name}</td>
                  <td className="py-1.5 pr-3">{c.dtype}</td>
                  <td className="py-1.5 pr-3">{c.role}</td>
                  <td className="py-1.5 pr-3">{c.missing}</td>
                  <td className="py-1.5 pr-3">{fmt(c.unique)}</td>
                </tr>
              ))}
            </Table>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              Provenance: <strong>{detail.provenance}</strong>
              {detail.source ? ` · ${detail.source}` : ''}
            </p>
          </Card>

          <Card title={`${detail.name} — preview (first ${detail.preview_rows.length} rows)`}>
            <Table head={Object.keys(detail.preview_rows[0] ?? {})}>
              {detail.preview_rows.map((row: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                  {Object.values(row).map((v: any, j: number) => (
                    <td key={j} className="py-1.5 pr-3 whitespace-nowrap">
                      {typeof v === 'number' ? fmt(v, 1) : String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </Table>
          </Card>
        </>
      )}
    </div>
  );
};
