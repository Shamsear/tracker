'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Menu, 
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  LayoutDashboard,
  Users,
  LogOut,
  FolderPlus,
  UserPlus,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Project } from '@/lib/ledger';
import { logoutAction } from '@/lib/actions';

interface NavigationProps {
  projects?: Project[];
}

export function Navigation({ projects }: NavigationProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Do not render top navigation on login page
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      router.push('/login');
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { label: 'Master Overview', href: '/', icon: LayoutDashboard },
    { label: 'Supervisors & Petty Cash', href: '/supervisors', icon: Users },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-900/95 backdrop-blur-md text-white shadow-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-mono font-black text-sm sm:text-base shadow-sm">
                PT
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white uppercase truncate">
                  Project Fund Tracker
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-emerald-400 truncate">
                  Master Multi-Account
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide uppercase transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Quick Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="/api/export"
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-300" />
              <span>Export Excel</span>
            </a>

            <Link
              href="/transactions/new?mode=fund"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition-all shadow-sm"
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>+ Inflow</span>
            </Link>

            <Link
              href="/transactions/new?mode=expense"
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-black text-white hover:bg-rose-700 transition-all shadow-sm"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>+ Expense</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign Out"
              className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 hover:border-slate-700 transition-all ml-1 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/transactions/new?mode=expense"
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-rose-600 text-white shadow-xs active:scale-95 transition-all"
              aria-label="Add transaction"
            >
              <Plus className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Floating Overlay Mobile Slide-Over Drawer (Never pushes page content) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Slide-over Drawer Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-800/90 bg-slate-950/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs shadow-xs">
                      PT
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-black tracking-tight text-white uppercase truncate">
                        Project Fund Tracker
                      </span>
                      <span className="block text-[10px] font-mono text-emerald-400 truncate">
                        Quick Menu
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Primary Navigation Links */}
                <div className="p-4 space-y-1.5">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    Navigation
                  </span>
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold uppercase transition-all ${
                          isActive
                            ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Transaction Actions */}
                <div className="px-4 py-2 space-y-2">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    Quick Actions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/transactions/new?mode=fund"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 px-2 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-xs transition-all text-center"
                    >
                      <ArrowDownLeft className="h-4 w-4 shrink-0" />
                      <span>+ Inflow</span>
                    </Link>
                    <Link
                      href="/transactions/new?mode=expense"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-3 px-2 text-xs font-black text-white hover:bg-rose-700 shadow-xs transition-all text-center"
                    >
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                      <span>+ Expense</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/projects/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-2 text-[11px] font-bold text-slate-200 hover:bg-slate-700 transition-all text-center"
                    >
                      <FolderPlus className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                      <span>+ Project</span>
                    </Link>
                    <Link
                      href="/supervisors/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-2 text-[11px] font-bold text-slate-200 hover:bg-slate-700 transition-all text-center"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                      <span>+ Supervisor</span>
                    </Link>
                  </div>

                  <a
                    href="/api/export"
                    download
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 px-3 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all w-full"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Download Master Excel (.xlsx)</span>
                  </a>
                </div>
              </div>

              {/* Drawer Bottom - Account & Logout */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Administrator Session Active</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign Out of Account'}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
