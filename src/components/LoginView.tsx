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
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-slate-50 overflow-hidden px-4 py-12 selection:bg-emerald-500/20">
      {/* Subtle Background Ambient Aura */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-slate-200/40 blur-[140px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px] z-10"
      >
        {/* Card Frame */}
        <div className="rounded-3xl bg-white p-7 sm:p-9 border border-slate-200/90 shadow-xl shadow-slate-200/60">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-7">
            {/* Logo Badge */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white font-mono font-black text-lg shadow-md ring-4 ring-slate-100">
                PT
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enterprise Secure Portal</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                Project Fund Tracker
              </h1>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Multi-Account Ledger & Petty Cash System
              </p>
            </div>
          </div>

          {/* Error / Status Alert */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Authenticated successfully! Opening dashboard...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[11px] font-black uppercase tracking-wider text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || isSuccess}
                className="group relative w-full flex items-center justify-center gap-2 py-3 px-5 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer min-h-[46px]"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Access Credentials Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center text-center gap-2">
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer font-bold"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span>Demo:</span>
              <code className="text-slate-900 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin@tracker.com</code>
              <span className="text-slate-400">/</span>
              <code className="text-slate-900 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin123456</code>
            </button>
            <span className="text-[11px] font-medium text-slate-400">
              Encrypted Neon PostgreSQL Authentication & HttpOnly Cookie
            </span>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-5">
          <p className="text-xs font-bold text-slate-400">
            &copy; {new Date().getFullYear()} Project Financial Tracker. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
