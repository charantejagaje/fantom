import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  Database,
  FlaskConical,
  Gauge,
  Home,
  LineChart,
  Megaphone,
  ShieldQuestion,
  Sparkles,
  UploadCloud,
  Users,
  WifiOff,
} from 'lucide-react';
import { api } from './api';
import { AuthProvider, errText, useAuth } from './auth';
import { AuthPages } from './AuthPages';
import { DashboardSection } from './sections/DashboardSection';
import { DataSection } from './sections/DataSection';
import { ProductionSection } from './sections/ProductionSection';
import { QualitySection } from './sections/QualitySection';
import { BottleneckSection } from './sections/BottleneckSection';
import { AnomalySection } from './sections/AnomalySection';
import { SimulationSection } from './sections/SimulationSection';
import { RecommendationsSection } from './sections/RecommendationsSection';
import { TeamFeatureSection } from './sections/TeamFeatureSection';
import { ProfileSection } from './sections/ProfileSection';
import { IssuesSection } from './sections/IssuesSection';
import { OwnerSection } from './sections/OwnerSection';
import { WorkerSection } from './sections/WorkerSection';

type SectionKey =
  | 'home'
  | 'dashboard'
  | 'data'
  | 'production'
  | 'quality'
  | 'bottlenecks'
  | 'anomalies'
  | 'simulation'
  | 'recommendations'
  | 'alerts'
  | 'issues'
  | 'users'
  | 'evaluation'
  | 'team'
  | 'profile';

interface NavItem {
  key: SectionKey;
  label: string;
  icon: typeof Gauge;
}

// Role-based navigation (the backend independently enforces the same rules).
const NAV: Record<'worker' | 'engineer' | 'owner', NavItem[]> = {
  worker: [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'production', label: 'Production', icon: LineChart },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'issues', label: 'Report Issue', icon: Megaphone },
    { key: 'profile', label: 'Profile', icon: Users },
  ],
  engineer: [
    { key: 'dashboard', label: 'Dashboard', icon: Gauge },
    { key: 'data', label: 'Dataset', icon: Database },
    { key: 'production', label: 'Production Analytics', icon: LineChart },
    { key: 'quality', label: 'Quality / ML', icon: Boxes },
    { key: 'bottlenecks', label: 'Bottlenecks', icon: BarChart3 },
    { key: 'anomalies', label: 'Anomalies', icon: ShieldQuestion },
    { key: 'simulation', label: 'Simulation', icon: FlaskConical },
    { key: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'issues', label: 'Issues', icon: Megaphone },
    { key: 'evaluation', label: 'Live Data', icon: UploadCloud },
    { key: 'team', label: 'Team Feature', icon: Users },
    { key: 'profile', label: 'Profile', icon: Users },
  ],
  owner: [
    { key: 'dashboard', label: 'Executive Dashboard', icon: Gauge },
    { key: 'production', label: 'Production', icon: LineChart },
    { key: 'quality', label: 'Quality', icon: Boxes },
    { key: 'bottlenecks', label: 'Bottlenecks', icon: BarChart3 },
    { key: 'simulation', label: 'Simulations', icon: FlaskConical },
    { key: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'team', label: 'Team Feature', icon: Users },
    { key: 'profile', label: 'Profile', icon: Users },
  ],
};

const UsersAdminSection: React.FC = () => {
  const [data, setData] = useState<{ count: number; users: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('engineer');

  const load = () => api.users().then(setData).catch((e) => setError(errText(e)));
  useEffect(() => {
    load();
  }, []);

  const promote = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setError(null);
    try {
      await api.promote(email, role);
      setMsg(`Role ${role} assigned to ${email}. If the account is new, an invite/verification email was sent.`);
      setEmail('');
      load();
    } catch (err) {
      setError(errText(err));
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
      <div className="p-4 rounded-lg bg-white border border-slate-200">
        <h3 className="text-sm font-bold mb-2">Assign a role (invite)</h3>
        <p className="text-[11px] text-slate-500 mb-3">
          The only path to OWNER accounts. New users receive a verification link by email.
        </p>
        <form onSubmit={promote} className="flex flex-wrap gap-2">
          <input
            className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-slate-300 text-sm"
            type="email" required placeholder="email@company.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
            value={role} onChange={(e) => setRole(e.target.value)}
          >
            <option value="worker">worker</option>
            <option value="engineer">engineer</option>
            <option value="owner">owner</option>
          </select>
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
            Assign
          </button>
        </form>
        {msg && <p className="text-xs text-emerald-700 mt-2">{msg}</p>}
      </div>
      <div className="p-4 rounded-lg bg-white border border-slate-200">
        <h3 className="text-sm font-bold mb-3">All users ({data?.count ?? '…'})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Verified</th>
              </tr>
            </thead>
            <tbody>
              {(data?.users ?? []).map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-mono">{u.email}</td>
                  <td className="py-2 pr-3">{u.full_name ?? '—'}</td>
                  <td className="py-2 pr-3"><span className="font-mono font-bold uppercase">{u.role}</span></td>
                  <td className="py-2 pr-3">{u.email_verified ? '✓' : 'pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AlertsSection: React.FC<{ canRefresh: boolean }> = ({ canRefresh }) => {
  const [data, setData] = useState<{ count: number; alerts: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.alerts().then(setData).catch((e) => setError(errText(e)));
  useEffect(() => {
    load();
  }, []);

  const refresh = async () => {
    setBusy(true); setError(null);
    try {
      setData(await api.refreshAlerts());
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-mono">
          Generated only from real dataset screens — never invented.
        </p>
        {canRefresh && (
          <button
            onClick={refresh}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? 'Recomputing…' : 'Refresh from dataset'}
          </button>
        )}
      </div>
      {data === null ? (
        <p className="text-xs text-slate-500">Loading…</p>
      ) : data.alerts.length === 0 ? (
        <p className="text-xs text-slate-500">No active alerts.</p>
      ) : (
        <ul className="space-y-2">
          {data.alerts.map((a) => (
            <li key={a.id} className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  a.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                }`}>{a.severity}</span>
                <strong className="text-xs">{a.title}</strong>
                <span className="text-[10px] font-mono text-slate-400 ml-auto">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Shell: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [section, setSection] = useState<SectionKey>('home');
  const [health, setHealth] = useState<any>(null);
  const [offline, setOffline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setOffline(true));
  }, []);

  useEffect(() => {
    if (user) setSection(user.role === 'worker' ? 'home' : 'dashboard');
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-xs font-mono text-slate-500">checking session…</p>
      </div>
    );
  }
  if (!user) return <AuthPages />;

  const nav = NAV[user.role];
  const effective = nav.some((n) => n.key === section) ? section : nav[0].key;
  const isWorker = user.role === 'worker';

  const body = () => {
    switch (effective) {
      case 'home':           return <WorkerSection user={user} onReport={() => setSection('issues')} />;
      case 'dashboard':      return user.role === 'owner' ? <OwnerSection /> : <DashboardSection />;
      case 'data':           return <DataSection />;
      case 'production':     return <ProductionSection />;
      case 'quality':        return <QualitySection />;
      case 'bottlenecks':    return <BottleneckSection />;
      case 'anomalies':      return <AnomalySection />;
      case 'simulation':     return <SimulationSection />;
      case 'recommendations':return <RecommendationsSection />;
      case 'alerts':         return <AlertsSection canRefresh={user.role !== 'worker'} />;
      case 'issues':         return <IssuesSection user={user} compact={isWorker} />;
      case 'users':          return <UsersAdminSection />;
      case 'evaluation':     return null; // replaced below (kept for type completeness)
      case 'team':           return <TeamFeatureSection />;
      case 'profile':        return <ProfileSection user={user} />;
      default:               return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 ${isWorker ? 'flex flex-col' : 'flex'}`}>
      {/* Desktop sidebar (engineer/owner) */}
      {!isWorker && (
        <aside className="w-60 shrink-0 bg-slate-900 text-slate-300 flex-col hidden md:flex">
          <div className="px-5 py-5 border-b border-slate-800">
            <div className="text-lg font-black text-white tracking-tight">FANTOM</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">{user.role} workspace</div>
          </div>
          <nav className="flex-1 py-3 overflow-y-auto">
            {nav.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-xs font-semibold transition-colors ${
                  effective === key
                    ? 'bg-slate-800 text-white border-r-2 border-emerald-400'
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon size={15} className={effective === key ? 'text-emerald-400' : 'text-slate-500'} />
                {label}
              </button>
            ))}
          </nav>
          <div className="px-5 py-4 border-t border-slate-800 text-[10px] font-mono text-slate-500 space-y-1">
            <div className={`flex items-center gap-1.5 ${offline ? 'text-red-400' : 'text-emerald-400'}`}>
              <Activity size={11} />
              {offline ? 'API OFFLINE' : `API ${health?.status ?? '…'} · ${health?.database ?? '…'}`}
            </div>
            <div>advisory-only · no machine control</div>
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between md:hidden">
          <div>
            <div className="text-sm font-black tracking-tight">FANTOM</div>
            <div className="text-[9px] font-mono text-slate-500 uppercase">{user.role} workspace</div>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold"
          >
            {nav.find((n) => n.key === effective)?.label ?? 'Menu'} ▾
          </button>
        </header>
        {isWorker && menuOpen && (
          <nav className="bg-slate-800 text-slate-200 flex flex-col md:hidden">
            {nav.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setSection(key); setMenuOpen(false); }}
                className={`flex items-center gap-2 px-5 py-3 text-sm border-b border-slate-700 ${
                  effective === key ? 'text-emerald-400 font-bold' : ''
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
            <button onClick={logout} className="flex items-center gap-2 px-5 py-3 text-sm text-red-400">
              Sign out
            </button>
          </nav>
        )}

        {!isWorker && (
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
            <h1 className="text-base font-bold">{nav.find((n) => n.key === effective)?.label}</h1>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                {offline
                  ? 'backend unreachable'
                  : health
                    ? `${health.environment} · dataset ${health.dataset_loaded ? 'loaded' : 'missing'}`
                    : 'connecting…'}
              </span>
              <button
                onClick={logout}
                className="text-[11px] font-mono text-slate-500 hover:text-red-600 underline"
              >
                sign out
              </button>
            </div>
          </header>
        )}

        {offline && (
          <div className="mx-4 md:mx-8 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <WifiOff size={14} /> Backend unreachable. No numbers will be shown without real API data.
          </div>
        )}

        <main className={`flex-1 ${isWorker ? 'px-3 py-3 max-w-lg w-full mx-auto' : 'p-4 md:p-8 max-w-6xl w-full'}`}>
          {effective === 'evaluation' ? <TeamFeatureSection /> : body()}
        </main>

        {/* Mobile bottom tab bar for workers */}
        {isWorker && (
          <nav className="sticky bottom-0 bg-white border-t border-slate-200 flex md:hidden">
            {nav.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-mono font-bold uppercase ${
                  effective === key ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                <Icon size={18} />
                {label.split(' ')[0]}
              </button>
            ))}
          </nav>
        )}

        <footer className="px-4 md:px-8 py-3 text-[10px] font-mono text-slate-400 border-t border-slate-200">
          FANTOM · observed simulation data via FastAPI/PostgreSQL · association ≠ causation
        </footer>
      </div>
    </div>
  );
};

export const PlatformApp: React.FC = () => (
  <AuthProvider>
    <Shell />
  </AuthProvider>
);
