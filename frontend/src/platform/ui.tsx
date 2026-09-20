import React from 'react';
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { NA } from './api';

export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-xs ${className}`}>
    {title && <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>}
    {children}
  </div>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode; note?: string }> = ({
  label,
  value,
  note,
}) => (
  <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
    <div className="text-[9px] font-sans uppercase text-slate-500 font-semibold">{label}</div>
    <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{value}</div>
    {note && <div className="text-[10px] text-slate-500 mt-0.5 font-sans">{note}</div>}
  </div>
);

export const NaChip: React.FC<{ label?: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600">
    {label || NA}
  </span>
);

export const Loading: React.FC<{ what: string }> = ({ what }) => (
  <div className="flex items-center gap-2 text-xs text-slate-500 py-6">
    <Loader2 size={14} className="animate-spin" /> Loading {what} from the API…
  </div>
);

export const ErrorBox: React.FC<{ error: unknown }> = ({ error }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
    <span className="font-mono break-all">{String((error as Error)?.message || error)}</span>
  </div>
);

export const Empty: React.FC<{ what: string }> = ({ what }) => (
  <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
    <Inbox size={14} /> No {what} available yet.
  </div>
);

export const Table: React.FC<{ head: string[]; children: React.ReactNode }> = ({ head, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-200">
          {head.map((h) => (
            <th key={h} className="py-2 pr-3 font-semibold whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const Bars: React.FC<{ data: { label: string; value: number }[]; unit?: string }> = ({
  data,
  unit = '',
}) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="w-32 shrink-0 text-[10px] font-mono text-slate-600 truncate">{d.label}</span>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="w-16 text-right text-[10px] font-mono text-slate-600">
            {d.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
};
