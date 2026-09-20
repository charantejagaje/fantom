import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Factory, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useIndustrialStore } from '../../store/useIndustrialStore';

interface LoginPageProps {
  onSuccessLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login } = useIndustrialStore();
  const [username, setUsername] = useState<string>('engineer@fantom.ai');
  const [password, setPassword] = useState<string>('engineer123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    // Provide immediate responsive feedback
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (res.success) {
        if (onSuccessLogin) onSuccessLogin();
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your username and password.');
      }
    }, 150);
  };

  return (
    <div 
      id="fantom-login-container" 
      className="min-h-screen bg-white text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden"
    >
      {/* 1st child: Subtle architectural grid background on clean white */}
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* 2nd child: Soft radiant ambient accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* 3rd child: Content container */}
      <div className="w-full max-w-md relative z-10 space-y-7">
        {/* Child 1 of 3rd child: Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-700">
            <Factory size={13} className="text-emerald-600" />
            <span className="tracking-wide">INDUSTRIAL AI DECISION PLATFORM</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              FANTOM <span className="text-emerald-600">AI</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Plant digital twin telemetry, defect inspection, and operational decisions.
            </p>
          </div>
        </div>

        {/* Child 2 of 3rd child: Single Login Card (CSS selector 2 target) */}
        <div 
          id="fantom-login-card" 
          className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 shadow-xl shadow-slate-200/60 transition-all"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <KeyRound size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Sign In</h2>
                <p className="text-xs text-slate-500 font-normal">Enter your username and password</p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div 
              id="login-error-alert" 
              className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block">Authentication Error</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="input-login-username" 
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 font-mono"
              >
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail size={16} />
                </div>
                <input
                  id="input-login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="e.g. engineer@fantom.ai"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all font-sans outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="input-login-password" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  {showPassword ? (
                    <>
                      <EyeOff size={13} />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye size={13} />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all font-sans outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 transition-colors"
                />
                <span className="text-xs text-slate-600">Remember session</span>
              </label>

              <span className="text-xs text-slate-500 font-mono">
                SSL Secured
              </span>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 active:scale-[0.99] disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="text-emerald-400" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Default single login credentials:
            </p>
            <p className="text-xs font-mono text-slate-700 mt-1 font-medium bg-slate-50 border border-slate-200/80 rounded-lg py-1.5 px-2">
              <span className="text-slate-900 font-semibold">engineer@fantom.ai</span> &bull; pw: <span className="text-slate-900 font-semibold">engineer123</span>
            </p>
          </div>
        </div>

        {/* Footer info banner on white */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-mono">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>FANTOM Autonomous Quality & Digital Twin Terminal</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Unified multi-role industrial operational decision system
          </p>
        </div>
      </div>
    </div>
  );
};

