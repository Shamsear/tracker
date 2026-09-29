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
import { TransactionModal } from './TransactionModal';

interface NavigationProps {
  projects: Project[];
}

export function Navigation({ projects }: NavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'fund' | 'expense'>('expense');

  const openQuickAdd = (mode: 'fund' | 'expense') => {
    setModalMode(mode);
    setModalOpen(true);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Master Overview', href: '/', icon: LayoutDashboard },
    { label: 'Supervisors & Petty Cash', href: '/supervisors', icon: Users },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900 text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-sm shadow-sm">
                PT
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white uppercase">
                  Project Fund Tracker
                </span>
                <span className="text-[11px] font-mono tracking-wider text-slate-400">
                  Master Multi-Account
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
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
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export Excel</span>
            </a>

            <button
              onClick={() => openQuickAdd('fund')}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>+ Receive Inflow</span>
            </button>

            <button
              onClick={() => openQuickAdd('expense')}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-colors shadow-sm"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>+ Record Expense</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => openQuickAdd('expense')}
              className="rounded-md bg-rose-500 p-2 text-white"
              aria-label="Add transaction"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-slate-300 hover:bg-slate-800"
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
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold uppercase ${
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
                <button
                  onClick={() => openQuickAdd('fund')}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-emerald-500 py-2.5 text-xs font-bold text-slate-950"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Inflow
                </button>
                <button
                  onClick={() => openQuickAdd('expense')}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-rose-500 py-2.5 text-xs font-bold text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Expense
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Transaction Modal */}
      {modalOpen && (
        <TransactionModal
          isOpen={modalOpen}
          initialMode={modalMode}
          projects={projects}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
