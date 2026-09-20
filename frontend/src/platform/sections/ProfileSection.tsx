import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, LogOut, ShieldCheck, Smartphone } from 'lucide-react';
import { AuthUser } from '../api';
import { useAuth } from '../auth';
import { Card } from '../ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export const ProfileSection: React.FC<{ user: AuthUser }> = ({ user }) => {
  const { logout } = useAuth();
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const row = 'flex justify-between gap-4 py-2 border-b border-slate-100 text-sm';

  return (
    <div className="space-y-4 max-w-xl">
      <Card title="Profile">
        <div className="space-y-1">
          <div className={row}><span className="text-slate-500">Name</span><strong>{user.full_name ?? '—'}</strong></div>
          <div className={row}><span className="text-slate-500">Email</span><strong>{user.email}</strong></div>
          <div className={row}>
            <span className="text-slate-500">Role</span>
            <strong className="uppercase font-mono text-xs bg-slate-900 text-white px-2 py-0.5 rounded">{user.role}</strong>
          </div>
          <div className={row}>
            <span className="text-slate-500">Email verified</span>
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <CheckCircle2 size={13} /> {user.email_verified ? 'verified' : 'pending'}
            </span>
          </div>
          <div className={row}>
            <span className="text-slate-500">Assigned station</span>
            <strong>{user.assigned_station ? user.assigned_station.replace('queue_', '').toUpperCase() : '—'}</strong>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 flex items-center gap-2"
        >
          <LogOut size={13} /> Sign out
        </button>
      </Card>

      <Card title="Install as app (PWA)">
        {installed ? (
          <p className="text-xs text-emerald-700 flex items-center gap-2">
            <Smartphone size={14} /> Running as an installed app.
          </p>
        ) : installEvt ? (
          <button
            onClick={() => installEvt.prompt()}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2"
          >
            <Download size={13} /> Add to Home Screen
          </button>
        ) : (
          <div className="text-xs text-slate-600 space-y-1">
            <p className="flex items-center gap-2"><Smartphone size={14} /> Install via your browser menu:</p>
            <p className="text-slate-500 font-mono text-[11px]">
              Android/Chrome: ⋮ → "Add to Home screen" · iPhone/Safari: Share → "Add to Home Screen"
            </p>
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
          <ShieldCheck size={10} /> No Docker or special software needed on phones - just the browser.
        </p>
      </Card>
    </div>
  );
};
