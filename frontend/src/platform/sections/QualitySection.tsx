import React, { useEffect, useState } from 'react';
import { api, NA } from '../api';
import { Card, Empty, ErrorBox, Loading, NaChip, Table } from '../ui';

export const QualitySection: React.FC = () => {
  const [ml, setMl] = useState<any>(null);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    api.ml().then(setMl).catch(setErr);
  }, []);

  if (err) return <ErrorBox error={err} />;
  if (!ml) return <Loading what="ML registry" />;

  return (
    <div className="space-y-4">
      <Card title="Quality analytics availability">
        <div className="flex flex-wrap gap-2">
          <NaChip label="defect/quality metrics" />
          <NaChip label="inspection labels" />
          <NaChip label="scrap / rework" />
        </div>
        <p className="text-[11px] text-slate-500 font-sans mt-2 leading-relaxed">
          The observed manufacturing dataset contains queue and WIP variables only — no inspection
          results or defect labels exist, so no quality metrics are computed or invented. When a
          labeled quality dataset is added and registered, this section will consume it through the
          same API contract.
        </p>
      </Card>

      <Card title="ML model registry (real artifacts only)">
        {ml.models.length === 0 ? (
          <Empty what="trained models" />
        ) : (
          <Table head={['Model', 'Loaded', 'Trained on', 'Kind']}>
            {ml.models.map((m: any) => (
              <tr key={m.name} className="border-b border-slate-100">
                <td className="py-1.5 pr-3 font-bold">{m.name}</td>
                <td className="py-1.5 pr-3">{m.loaded ? 'yes' : 'failed to load'}</td>
                <td className="py-1.5 pr-3">{m.trained_on ?? '—'}</td>
                <td className="py-1.5 pr-3">{m.kind ?? '—'}</td>
              </tr>
            ))}
          </Table>
        )}
        <p className="text-[11px] text-slate-500 font-sans mt-2 leading-relaxed">{ml.integration_note}</p>
      </Card>
    </div>
  );
};
