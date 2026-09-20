import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { api, AuthUser } from '../api';
import { errText } from '../auth';
import { Card, Empty, ErrorBox, Loading } from '../ui';

export const IssuesSection: React.FC<{ user: AuthUser; compact?: boolean }> = ({ user, compact }) => {
  const [issues, setIssues] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [station, setStation] = useState(user.assigned_station ?? '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.issues();
      setIssues(res.issues);
    } catch (e) {
      setError(errText(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3) return;
    setSending(true); setSent(false); setError(null);
    try {
      await api.createIssue(message.trim(), station || undefined, severity);
      setMessage('');
      setSent(true);
      await load();
    } catch (err) {
      setError(errText(err));
    } finally {
      setSending(false);
    }
  };

  const sevColor: Record<string, string> = {
    info: 'bg-slate-100 text-slate-700',
    warning: 'bg-amber-100 text-amber-800',
    critical: 'bg-red-100 text-red-700',
  };
  const stColor: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    acknowledged: 'bg-amber-50 text-amber-700',
    resolved: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBox error={error} />}

      <Card title="Report an issue">
        <form onSubmit={submit} className="space-y-3">
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm min-h-20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            placeholder="Describe the problem (what, where, since when)…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={3}
            maxLength={2000}
          />
          <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <select
              className="px-2 py-2 rounded-lg border border-slate-300 text-xs"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="critical">critical</option>
            </select>
            <select
              className="px-2 py-2 rounded-lg border border-slate-300 text-xs"
              value={station}
              onChange={(e) => setStation(e.target.value)}
            >
              <option value="">my station</option>
              {['c1s2','c1s4','c2s2','c2s4','c3s2','c3s3','c4s3','c4s4'].map((s) => (
                <option key={s} value={`queue_${s}`}>{s.toUpperCase()}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={sending}
              className="py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send size={12} /> {sending ? 'Sending…' : 'Submit'}
            </button>
          </div>
          {sent && (
            <p className="text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Report submitted. Engineers have been notified.
            </p>
          )}
        </form>
      </Card>

      <Card title={user.role === 'worker' ? 'My reports' : 'All reported issues'}>
        {issues === null ? (
          <Loading what="issue reports" />
        ) : issues.length === 0 ? (
          <Empty what="reported issues" />
        ) : (
          <ul className="space-y-2">
            {issues.map((i) => (
              <li key={i.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${sevColor[i.severity] ?? ''}`}>
                    {i.severity}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${stColor[i.status] ?? ''}`}>
                    {i.status}
                  </span>
                  {i.station && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {i.station.replace('queue_', '').toUpperCase()}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-400 ml-auto">
                    {new Date(i.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{i.message}</p>
                {i.resolution_note && (
                  <p className="text-[11px] text-slate-500 mt-1 border-t border-slate-100 pt-1">
                    Response: {i.resolution_note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
