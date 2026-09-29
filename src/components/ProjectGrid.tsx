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
  onOpenAddModal: (projectId: string, mode: 'fund' | 'expense') => void;
}

export function ProjectGrid({ summaries, onOpenAddModal }: ProjectGridProps) {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects (e.g. Sadia, Van, Listerine)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((summary) => {
          const isDeficit = summary.currentBalance < 0;
          const spentRatio = summary.totalReceived > 0 
            ? Math.min(100, Math.max(0, (summary.totalSpentWithVat / summary.totalReceived) * 100))
            : (summary.totalSpentWithVat > 0 ? 100 : 0);

          return (
            <div
              key={summary.project.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-400 hover:shadow-md transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: summary.project.color || '#2563eb' }}
                    />
                    <Link
                      href={`/projects/${summary.project.id}`}
                      className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors"
                    >
                      {summary.project.name}
                    </Link>
                  </div>

                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {summary.project.category}
                  </span>
                </div>

                {/* Balance Display with NumberFlow */}
                <div className={`mt-4 rounded-xl p-3.5 border transition-all ${
                  isDeficit ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Available Balance
                  </span>
                  <div className="mt-0.5 flex items-baseline gap-1 font-mono">
                    <span className="text-xs font-bold text-slate-400">AED</span>
                    <div className={`text-2xl font-extrabold tracking-tight tabular-nums ${
                      isDeficit ? 'text-rose-600' : 'text-slate-900'
                    }`}>
                      <NumberFlow
                        value={summary.currentBalance}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDeficit ? 'bg-rose-500' : (spentRatio > 85 ? 'bg-amber-500' : 'bg-emerald-500')
                      }`}
                      style={{ width: `${spentRatio}%` }}
                    />
                  </div>
                </div>

                {/* Sub Stats with NumberFlow */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Funds Inflow</span>
                    <div className="flex items-center gap-0.5 font-bold text-emerald-700">
                      <span>AED</span>
                      <NumberFlow
                        value={summary.totalReceived}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Total Spent</span>
                    <div className="flex items-center gap-0.5 font-bold text-slate-800">
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
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-amber-50 p-2 text-xs font-medium text-amber-900 border border-amber-200">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      <span><NumberFlow value={summary.pendingBillsCount} /> unsubmitted bills</span>
                    </div>
                    <span className="font-mono font-bold text-amber-950">
                      AED <NumberFlow value={summary.pendingBillsAmount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                    </span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAddModal(summary.project.id, 'fund')}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-200 cursor-pointer active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Inflow
                  </button>
                  <button
                    onClick={() => onOpenAddModal(summary.project.id, 'expense')}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all border border-rose-200 cursor-pointer active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Expense
                  </button>
                </div>

                <Link
                  href={`/projects/${summary.project.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>Ledger</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
