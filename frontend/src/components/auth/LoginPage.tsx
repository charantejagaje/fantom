import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Factory, 
  UserCheck, 
  Cpu, 
  Wrench, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  Mail,
  Info
} from 'lucide-react';
import { useIndustrialStore } from '../../store/useIndustrialStore';
import { DEMO_CREDENTIALS, DemoCredential } from '../../data/authData';

interface LoginPageProps {
  onSuccessLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login } = useIndustrialStore();
  const [email, setEmail] = useState<string>('owner@fantom.ai');
  const [password, setPassword] = useState<string>('owner123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = login(email, password);
    if (res.success) {
      if (onSuccessLogin) onSuccessLogin();
    } else {
      setErrorMessage(res.error || 'Invalid credentials');
    }
  };

  const handleSelectDemoAccount = (cred: DemoCredential) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setErrorMessage(null);
    // Instant demo sign-in for seamless evaluation
    const res = login(cred.email, cred.password);
    if (res.success && onSuccessLogin) {
      onSuccessLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background industrial grid aesthetics */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-emerald-400">
            <Factory size={14} />
            <span>ROLE-BASED INDUSTRIAL DECISION PLATFORM</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-sans">
            FANTOM <span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Synchronized decision intelligence connecting Factory Owners, Lead Engineers, and Field Workers on a unified plant digital twin.
          </p>
        </div>

        {/* Main Grid: Sign In Form + Demo Accounts Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Left: Interactive Form */}
          <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
            <div>
              <div className="flex items-center gap-2 text-slate-300 font-bold mb-4">
                <Lock size={16} className="text-emerald-400" />
                <span>Sign in to Plant Terminal</span>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="input-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. owner@fantom.ai"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="input-login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                    />
                  </div>
                </div>

                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  <span>Enter Platform</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-400">Prototype Note:</span> Select any demo account on the right for 1-click automatic authentication with pre-configured plant permissions.
            </div>
          </div>

          {/* Right: Demo Accounts List with 1-Click Sign-in */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  DEMO LOGIN ACCOUNTS (1-CLICK ACCESS)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Seeded RBAC
              </span>
            </div>

            <div className="space-y-2.5">
              {DEMO_CREDENTIALS.map((cred) => {
                const isSelected = email === cred.email;
                const roleIcon = cred.role === 'OWNER' 
                  ? <ShieldCheck size={18} className="text-amber-400" /> 
                  : cred.role === 'ENGINEER' 
                  ? <Cpu size={18} className="text-blue-400" /> 
                  : <Wrench size={18} className="text-emerald-400" />;

                const roleBadgeClass = cred.role === 'OWNER'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  : cred.role === 'ENGINEER'
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';

                return (
                  <button
                    key={cred.email}
                    id={`demo-account-${cred.email.replace(/[@.]/g, '-')}`}
                    onClick={() => handleSelectDemoAccount(cred)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mt-0.5">
                        {roleIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{cred.label}</span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${roleBadgeClass}`}>
                            {cred.badge}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          {cred.email} • pw: <span className="text-slate-300 font-semibold">{cred.password}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {cred.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Three Roles Value Proposition Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-left space-y-1">
            <span className="text-[11px] font-mono text-amber-400 font-bold block">1. OWNER PERSPECTIVE</span>
            <p className="text-xs text-slate-300">
              &quot;What is the business impact?&quot; Focuses on EBIT margin erosion, throughput units, scrap cost, and approving process adjustments.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-left space-y-1">
            <span className="text-[11px] font-mono text-blue-400 font-bold block">2. ENGINEER PERSPECTIVE</span>
            <p className="text-xs text-slate-300">
              &quot;Why is this happening?&quot; Focuses on 3D machine twin, vibration telemetry, Bayesian root causes, simulation lab, and field dispatch.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-left space-y-1">
            <span className="text-[11px] font-mono text-emerald-400 font-bold block">3. WORKER PERSPECTIVE</span>
            <p className="text-xs text-slate-300">
              &quot;What do I need to do right now?&quot; Mobile-first smartphone terminal with machine location, LOTO safety, bearing inspection, and repair mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
