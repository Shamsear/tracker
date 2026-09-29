'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  Menu, 
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { Project } from '@/lib/ledger';

interface NavigationProps {
  projects: Project[];
}

export function Navigation({ projects }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Master Overview', href: '/', icon: LayoutDashboard },
    { label: 'Supervisors & Petty Cash', href: '/supervisors', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900 text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-mono font-black text-base shadow-sm">
              PT
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white uppercase">
                Project Fund Tracker
              </span>
              <span className="text-[11px] font-mono font-semibold tracking-wider text-emerald-400">
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

        {/* Quick Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-300" />
            <span>Export Excel</span>
          </a>

          <Link
            href="/transactions/new?mode=fund"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition-all shadow-sm"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>+ Receive Inflow</span>
          </Link>

          <Link
            href="/transactions/new?mode=expense"
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 transition-all shadow-sm"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>+ Record Expense</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/transactions/new?mode=expense"
            className="rounded-xl bg-rose-500 p-2.5 text-white"
            aria-label="Add transaction"
          >
            <Plus className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:hidden">
          <div className="space-y-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold uppercase ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
              <Link
                href="/transactions/new?mode=fund"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950"
              >
                <ArrowDownLeft className="h-4 w-4" />
                Inflow
              </Link>
              <Link
                href="/transactions/new?mode=expense"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-3 text-xs font-bold text-white"
              >
                <ArrowUpRight className="h-4 w-4" />
                Expense
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
