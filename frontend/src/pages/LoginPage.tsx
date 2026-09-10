import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.error || 'Authentication failed');
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoRoleLabel: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login(demoEmail, 'Password123!');
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(`Quick Login for ${demoRoleLabel} failed: ${res.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center space-x-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-2.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-mono">
            GeM<span className="text-emerald-400">COMPLY</span>
          </span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-200">
          Government e-Marketplace
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 uppercase tracking-widest font-mono">
          AI Compliance & Seller Verification Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-8">
          
          {errorMessage && (
            <div className="mb-6 rounded-lg bg-red-950/80 border border-red-500/30 p-4 flex items-start space-x-3 text-red-200">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">{errorMessage}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Official Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@gem.gov.in"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating JWT Session...</span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Sign In to Platform</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase flex items-center space-x-1.5">
                <UserCheck className="h-4 w-4" />
                <span>Phase 1.5 Quick Role Logins</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Password: Password123!</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('procurement.demo@gembid.local', 'Procurement Officer')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs transition-colors group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-emerald-400 group-hover:text-emerald-300">Procurement Officer</span>
                  <span className="block text-[11px] text-slate-400">procurement.demo@gembid.local</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-mono">
                  Full Authority
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('reviewer.demo@gembid.local', 'Compliance Reviewer')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs transition-colors group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-blue-400 group-hover:text-blue-300">Compliance Reviewer</span>
                  <span className="block text-[11px] text-slate-400">reviewer.demo@gembid.local</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-[10px] text-blue-300 font-mono">
                  Review & Override
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin.demo@gembid.local', 'System Admin')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-xs transition-colors group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-purple-400 group-hover:text-purple-300">System Administrator</span>
                  <span className="block text-[11px] text-slate-400">admin.demo@gembid.local</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-[10px] text-purple-300 font-mono">
                  System Admin
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('auditor.demo@gembid.local', 'Auditor')}
                  className="text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-amber-400 block text-[11px]">Auditor</span>
                  <span className="text-[10px] text-slate-400 truncate block">auditor.demo...</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('bidder.demo@gembid.local', 'Bidder Vendor')}
                  className="text-left px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-cyan-400 block text-[11px]">Bidder / Vendor</span>
                  <span className="text-[10px] text-slate-400 truncate block">bidder.demo...</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
