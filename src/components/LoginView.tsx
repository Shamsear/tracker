'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { loginAction } from '@/lib/actions';

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('admin@tracker.com');
  const [password, setPassword] = useState('admin123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('email', email);
    formData.set('password', password);

    startTransition(async () => {
      try {
        const res = await loginAction(formData);
        if (res.success) {
          setIsSuccess(true);
          setTimeout(() => {
            router.push(callbackUrl);
            router.refresh();
          }, 600);
        } else {
          setError(res.error || 'Invalid credentials');
        }
      } catch {
        setError('Authentication service error. Please try again.');
      }
    });
  };

  const handleQuickFill = () => {
    setEmail('admin@tracker.com');
    setPassword('admin123456');
    setError(null);
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-[#07090e] overflow-hidden px-4 py-12 selection:bg-indigo-500/30">
      {/* Background Decorative Gradients & Mesh (GPU Optimized) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[150px]" />
        {/* Subtle grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Main Login Card - Double Bezel Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px] z-10"
      >
        {/* Outer Bezel Shell */}
        <div className="rounded-[2.25rem] bg-slate-900/60 p-2 sm:p-2.5 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80">
          {/* Inner Core */}
          <div className="rounded-[calc(2.25rem-0.625rem)] bg-[#0c1017]/95 px-6 py-8 sm:px-8 sm:py-10 border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            
            {/* Brand Eyebrow & Header */}
            <div className="flex flex-col items-center text-center space-y-3 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enterprise Secure Gate</span>
              </div>

              <div className="flex items-center gap-2.5 mt-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                    Financial Tracker
                  </h1>
                  <span className="text-[11px] text-slate-400 tracking-wide">
                    Ledger & Petty Cash System
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Sign in with authorized administrator credentials to access real-time financial ledgers.
              </p>
            </div>

            {/* Error / Status Alert */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </motion.div>
              )}

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-300 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Authenticated successfully! Redirecting...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tracker.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-fill Demo</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button with Button-in-Button Pattern */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending || isSuccess}
                  className="group relative w-full flex items-center justify-between pl-6 pr-2 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-medium rounded-full shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="text-sm tracking-wide font-semibold">
                    {isPending ? 'Authenticating...' : isSuccess ? 'Access Granted' : 'Enter Dashboard'}
                  </span>
                  
                  {/* Nested trailing icon badge */}
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:translate-x-0.5">
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Quick Access Credentials Pill */}
            <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-col items-center text-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/70 border border-white/5 px-3 py-1.5 rounded-full">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Default Access:</span>
                <code className="text-slate-200 font-mono">admin@tracker.com</code>
                <span className="text-slate-500">/</span>
                <code className="text-slate-200 font-mono">admin123456</code>
              </div>
              <span className="text-[10px] text-slate-500">
                Encrypted via Neon PostgreSQL with BCrypt & HttpOnly Sessions
              </span>
            </div>

          </div>
        </div>

        {/* Brand Bottom Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Enterprise Construction & Project Financials.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
