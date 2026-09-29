'use client';

import React, { useState, useEffect } from 'react';
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
import { Pagination } from '@/components/ui/Pagination';

interface ProjectGridProps {
  summaries: ProjectSummary[];
}

export function ProjectGrid({ summaries }: ProjectGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const categories = ['ALL', 'Project', 'Logistics', 'Petty Cash', 'Event'];

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const filtered = summaries.filter((s) => {
    const matchesSearch = 
      s.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.project.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedSummaries = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  return (
    <div className="space-y-4">
      
      {/* Search & Category Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects (e.g. Sadia, Van, Listerine)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects */}
      {paginatedSummaries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-500 shadow-xs">
          No projects found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedSummaries.map((summary) => {
            const isDeficit = summary.currentBalance < 0;
            const hasInflow = summary.totalReceived > 0;
            const remainingRatio = hasInflow
              ? Math.max(0, Math.min(100, (summary.currentBalance / summary.totalReceived) * 100))
              : 0;

            return (
              <div
                key={summary.project.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-400 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-slate-100" 
                        style={{ backgroundColor: summary.project.color || '#2563eb' }}
                      />
                      <Link
                        href={`/projects/${summary.project.id}`}
                        className="text-base font-black tracking-tight text-slate-950 group-hover:text-blue-700 transition-colors truncate"
                      >
                        {summary.project.name}
                      </Link>
                    </div>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-700 shrink-0 whitespace-nowrap">
                      {summary.project.category}
                    </span>
                  </div>

                  {/* Balance Display with NumberFlow */}
                  <div className={`mt-4 rounded-xl p-4 border transition-all ${
                    isDeficit ? 'bg-rose-50/60 border-rose-200/90' : 'bg-slate-50/70 border-slate-200/60'
                  }`}>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600 block whitespace-nowrap">
                      Available Balance
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5 font-mono whitespace-nowrap">
                      <span className="text-xs font-black text-slate-600">AED</span>
                      <div className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
                        isDeficit ? 'text-rose-700' : 'text-slate-950'
                      }`}>
                        <NumberFlow
                          locales="en-US"
                          value={summary.currentBalance}
                          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                        />
                      </div>
                    </div>

                    {/* Float Remaining Progress Bar with Dynamic Status */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className={isDeficit ? 'text-rose-700' : 'text-slate-500'}>
                          {isDeficit
                            ? 'Deficit (Over budget)'
                            : !hasInflow
                            ? 'No Funds Inflow'
                            : summary.currentBalance === 0
                            ? 'Fully Utilized'
                            : 'Float Remaining'}
                        </span>
                        <span className={`font-mono tabular-nums ${
                          isDeficit 
                            ? 'text-rose-700 font-black' 
                            : !hasInflow || summary.currentBalance === 0 
                            ? 'text-slate-400' 
                            : remainingRatio > 50 
                            ? 'text-emerald-700 font-bold' 
                            : remainingRatio > 15 
                            ? 'text-blue-700 font-bold' 
                            : 'text-amber-700 font-bold'
                        }`}>
                          {isDeficit ? 'Overdrawn' : !hasInflow ? '0%' : `${remainingRatio.toFixed(0)}%`}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDeficit 
                              ? 'bg-rose-600' 
                              : !hasInflow || summary.currentBalance === 0
                              ? 'bg-transparent'
                              : remainingRatio > 50
                              ? 'bg-emerald-500'
                              : remainingRatio > 15
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${isDeficit ? 100 : remainingRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sub Stats with NumberFlow */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs font-mono">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block whitespace-nowrap">Funds Inflow</span>
                      <div className="flex items-center gap-1 font-black text-emerald-800 text-sm mt-0.5 whitespace-nowrap">
                        <span>AED</span>
                        <NumberFlow
                          locales="en-US"
                          value={summary.totalReceived}
                          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block whitespace-nowrap">Total Spent</span>
                      <div className="flex items-center gap-1 font-black text-slate-950 text-sm mt-0.5 whitespace-nowrap">
                        <span>AED</span>
                        <NumberFlow
                          locales="en-US"
                          value={summary.totalSpentWithVat}
                          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pending Invoices Pill */}
                  {summary.pendingBillsCount > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-950 border border-amber-200/80 whitespace-nowrap gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                        <span className="truncate"><NumberFlow locales="en-US" value={summary.pendingBillsCount} /> unsubmitted bills</span>
                      </div>
                      <span className="font-mono font-black text-amber-950 shrink-0">
                        AED <NumberFlow locales="en-US" value={summary.pendingBillsAmount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Toolbar */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/transactions/new?projectId=${summary.project.id}&mode=fund`}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Inflow
                    </Link>
                    <Link
                      href={`/transactions/new?projectId=${summary.project.id}&mode=expense`}
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Expense
                    </Link>
                  </div>

                  <Link
                    href={`/projects/${summary.project.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
                  >
                    <span>Ledger</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[6, 9, 12, 18, 30]}
        itemLabel="projects"
      />
    </div>
  );
}

