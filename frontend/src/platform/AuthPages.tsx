import React, { useState } from 'react';
import { Activity, Factory, LogIn, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { api } from './api';
import { errText, useAuth } from './auth';

const input =
  'w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500';
const label = 'block text-[11px] font-mono font-semibold uppercase text-slate-500 mb-1';
const btn =
  'w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 ' +
  'transition-colors disabled:opacity-50 flex items-center justify-center gap-2';

const STATIONS = [
  'queue_c1s2', 'queue_c1s4', 'queue_c2s2', 'queue_c2s4',
  'queue_c3s2', 'queue_c3s3', 'queue_c4s3', 'queue_c4s4',
];

type Mode = 'login' | 'register' | 'forgot';

export const AuthPages: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'worker' | 'engineer'>('worker');
  const [station, setStation] = useState<string>('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await login(email, password);
      onDone?.();
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null); setNotice(null);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        assigned_station: role === 'worker' && station ? station : undefined,
        invite_code: role === 'engineer' && inviteCode ? inviteCode : undefined,
      });
      setNotice(
        'Registration successful. Check your email for a verification link, then log in. ' +
        '(Development: links are written to data/outbox/ or Mailpit.)',
      );
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  const doForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null); setNotice(null);
    try {
      await api.forgotPassword(email);
      setNotice('If that account exists, a password-reset link has been sent.');
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="px-5 py-3 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Factory size={18} className="text-emerald-400" />
          <span className="text-base font-black text-white tracking-tight">FANTOM</span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Industrial Decision Support</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <Activity size={11} /> advisory-only · no machine control
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <h1 className="text-lg font-bold mb-1">
              {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password'}
            </h1>
            <p className="text-xs text-slate-500 mb-5 font-mono">
              {mode === 'login'
                ? 'Role decides your workspace: worker / engineer / owner.'
                : mode === 'register'
                  ? 'Workers register freely. Engineers need an invite code. Owner accounts are assigned only by an existing owner.'
                  : 'We will email a reset link if the account exists.'}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}
            {notice && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {notice}
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={doLogin} className="space-y-3">
                <div>
                  <label className={label}>Email</label>
                  <input className={input} type="email" required value={email}
                         onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                         autoComplete="email" />
                </div>
                <div>
                  <label className={label}>Password</label>
                  <input className={input} type="password" required value={password}
                         onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                         autoComplete="current-password" />
                </div>
                <button className={btn} disabled={busy}>
                  <LogIn size={15} /> {busy ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={doRegister} className="space-y-3">
                <div>
                  <label className={label}>Full name</label>
                  <input className={input} required value={fullName}
                         onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className={label}>Email</label>
                  <input className={input} type="email" required value={email}
                         onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                         autoComplete="email" />
                </div>
                <div>
                  <label className={label}>Password (min 8 chars)</label>
                  <input className={input} type="password" required minLength={8} value={password}
                         onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                         autoComplete="new-password" />
                </div>
                <div>
                  <label className={label}>Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['worker', 'engineer'] as const).map((r) => (
                      <button type="button" key={r} onClick={() => setRole(r)}
                              className={`py-2 rounded-lg border text-xs font-mono font-bold uppercase transition-colors ${
                                role === r
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                              }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <ShieldCheck size={11} /> Owner cannot self-register (assigned by an owner).
                  </p>
                </div>
                {role === 'worker' && (
                  <div>
                    <label className={label}>Assigned station (optional)</label>
                    <select className={input} value={station} onChange={(e) => setStation(e.target.value)}>
                      <option value="">— not assigned yet —</option>
                      {STATIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('queue_', '').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                )}
                {role === 'engineer' && (
                  <div>
                    <label className={label}>Engineer invite code</label>
                    <input className={input} value={inviteCode}
                           onChange={(e) => setInviteCode(e.target.value)}
                           placeholder="Provided by an owner" />
                  </div>
                )}
                <button className={btn} disabled={busy}>
                  <UserPlus size={15} /> {busy ? 'Creating…' : 'Create account'}
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={doForgot} className="space-y-3">
                <div>
                  <label className={label}>Email</label>
                  <input className={input} type="email" required value={email}
                         onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
                </div>
                <button className={btn} disabled={busy}>
                  <Mail size={15} /> {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs font-mono">
            {mode !== 'login' && (
              <button className="text-emerald-700 hover:underline" onClick={() => { setMode('login'); setError(null); setNotice(null); }}>
                Sign in
              </button>
            )}
            {mode !== 'register' && (
              <button className="text-emerald-700 hover:underline" onClick={() => { setMode('register'); setError(null); setNotice(null); }}>
                Create account
              </button>
            )}
            {mode !== 'forgot' && (
              <button className="text-slate-500 hover:underline" onClick={() => { setMode('forgot'); setError(null); setNotice(null); }}>
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="px-5 py-3 text-[10px] font-mono text-slate-400 border-t border-slate-200">
        FANTOM · FastAPI + PostgreSQL · verification & reset links are single-use
      </footer>
    </div>
  );
};
