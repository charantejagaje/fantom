import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Bell, MapPin, RefreshCw } from 'lucide-react';
import { api, AuthUser, fmt } from '../api';
import { errText } from '../auth';
import { Card, ErrorBox, Loading, Stat } from '../ui';

/**
 * WORKER home: mobile-first. Shows the worker's station (real observed queue
 * stats), active alerts affecting their station, and a big touch-friendly
 * button to report an issue. No financial or administrative data.
 */
export const WorkerSection: React.FC<{ user: AuthUser; onReport: () => void }> = ({ user, onReport }) => {
  const [bn, setBn] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const [b, a] = await Promise.all([api.bottlenecks(), api.alerts()]);
      setBn(b);
      setAlerts(a);
      setError(null);
    } catch (e) {
      setError(errText(e));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const myStation = user.assigned_station;
  const myStats = bn?.stations?.find((s: any) => s.station === myStation);
  const stationAlerts = (alerts?.alerts ?? []).filter(
    (a: any) => !myStation || a.entity === myStation || !a.entity?.startsWith('queue_'),
  );

  return (
    <div className="space-y-3">
      {error && <ErrorBox error={error} />}

      {myStation && (
        <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center gap-3">
          <MapPin size={18} className="text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Your station</div>
            <div className="text-sm font-bold font-mono">{myStation.replace('queue_', '').toUpperCase()}</div>
          </div>
        </div>
      )}

      <Card title="Production status (observed)">
        {myStats ? (
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Mean queue" value={`${fmt(myStats.mean)} u`} note="parts waiting (observed mean)" />
            <Stat label="Peak (P95)" value={`${fmt(myStats.p95)} u`} note="observed 95th percentile" />
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            {bn
              ? 'No station assigned yet - ask your supervisor to assign one in your profile.'
              : 'Loading…'}
          </p>
        )}
        <p className="text-[10px] text-slate-400 font-mono mt-2">
          Facility-wide figures are available on the Production page.
        </p>
      </Card>

      <Card title={`Alerts (${stationAlerts.length})`}>
        {alerts === null ? (
          <Loading what="alerts" />
        ) : stationAlerts.length === 0 ? (
          <p className="text-xs text-slate-500">No active alerts. All clear.</p>
        ) : (
          <ul className="space-y-2">
            {stationAlerts.slice(0, 6).map((a: any) => (
              <li key={a.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <strong className="block">{a.title}</strong>
                  <span className="text-[11px] text-amber-800 leading-relaxed">{a.body}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={load}
          disabled={refreshing}
          className="mt-3 w-full py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </Card>

      <button
        onClick={onReport}
        className="w-full py-4 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
      >
        Report an issue <ArrowRight size={16} />
      </button>

      <p className="text-[10px] text-slate-400 font-mono text-center pb-2">
        advisory system · never controls machinery · data: observed simulation dataset
      </p>
    </div>
  );
};
