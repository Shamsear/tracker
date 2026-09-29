'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import { 
  ArrowUpRight, 
  Search, 
  Plus, 
  ArrowDownLeft, 
  AlertCircle
} from 'lucide-react';
import { ProjectSummary } from '@/lib/ledger';

interface ProjectGridProps {
  summaries: ProjectSummary[];
}

export function ProjectGrid({ summaries }: ProjectGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Project', 'Logistics', 'Petty Cash', 'Event'];

  const filtered = summaries.filter((s) => {
    const matchesSearch = 
      s.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.project.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      
      {/* Search & Category Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          <input
            type="text"
            placeholder="Search projects (e.g. Sadia, Van, Listerine)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border-2 border-slate-300 bg-white py-2.5 pl-10 pr-3 text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((summary) => {
          const isDeficit = summary.currentBalance < 0;
          const spentRatio = summary.totalReceived > 0 
            ? Math.min(100, Math.max(0, (summary.totalSpentWithVat / summary.totalReceived) * 100))
            : (summary.totalSpentWithVat > 0 ? 100 : 0);

          return (
            <div
              key={summary.project.id}
              className="flex flex-col justify-between rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm hover:border-slate-600 hover:shadow-md transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="h-4 w-4 rounded-full shrink-0 shadow-xs border border-slate-300" 
                      style={{ backgroundColor: summary.project.color || '#2563eb' }}
                    />
                    <Link
                      href={`/projects/${summary.project.id}`}
                      className="text-base font-black tracking-tight text-slate-950 group-hover:text-blue-700 transition-colors"
                    >
                      {summary.project.name}
                    </Link>
                  </div>

                  <span className="rounded-lg bg-slate-200 border border-slate-300 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-900">
                    {summary.project.category}
                  </span>
                </div>

                {/* Balance Display with NumberFlow */}
                <div className={`mt-4 rounded-xl p-4 border-2 transition-all ${
                  isDeficit ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Available Balance
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                    <span className="text-xs font-black text-slate-700">AED</span>
                    <div className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
                      isDeficit ? 'text-rose-700' : 'text-slate-950'
                    }`}>
                      <NumberFlow
                        value={summary.currentBalance}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDeficit ? 'bg-rose-600' : (spentRatio > 85 ? 'bg-amber-500' : 'bg-emerald-600')
                      }`}
                      style={{ width: `${spentRatio}%` }}
                    />
                  </div>
                </div>

                {/* Sub Stats with NumberFlow */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-slate-200 pt-3 text-xs font-mono">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Funds Inflow</span>
                    <div className="flex items-center gap-1 font-black text-emerald-800 text-sm mt-0.5">
                      <span>AED</span>
                      <NumberFlow
                        value={summary.totalReceived}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Total Spent</span>
                    <div className="flex items-center gap-1 font-black text-slate-950 text-sm mt-0.5">
                      <span>AED</span>
                      <NumberFlow
                        value={summary.totalSpentWithVat}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pending Invoices Pill */}
                {summary.pendingBillsCount > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-100 p-2.5 text-xs font-bold text-amber-950 border-2 border-amber-300">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                      <span><NumberFlow value={summary.pendingBillsCount} /> unsubmitted bills</span>
                    </div>
                    <span className="font-mono font-black text-amber-950">
                      AED <NumberFlow value={summary.pendingBillsAmount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                    </span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 flex items-center justify-between border-t-2 border-slate-200 pt-3.5">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/transactions/new?projectId=${summary.project.id}&mode=fund`}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Inflow
                  </Link>
                  <Link
                    href={`/transactions/new?projectId=${summary.project.id}&mode=expense`}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Expense
                  </Link>
                </div>

                <Link
                  href={`/projects/${summary.project.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <span>Ledger</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
