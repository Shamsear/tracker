'use client';

import React from 'react';
import NumberFlow from '@number-flow/react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock 
} from 'lucide-react';
import { GlobalDashboardStats } from '@/lib/ledger';

interface MasterSummaryCardsProps {
  stats: GlobalDashboardStats;
}

export function MasterSummaryCards({ stats }: MasterSummaryCardsProps) {
  const isHealthy = stats.netAvailableBalance >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      
      {/* 1. Net Available Liquidity */}
      <div className={`min-w-0 rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
        isHealthy 
          ? 'border-emerald-200/90 bg-emerald-50/70' 
          : 'border-rose-200/90 bg-rose-50/70'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 truncate">
            Net Available Balance
          </span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-xs shrink-0 ${
            isHealthy ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
          }`}>
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono min-w-0">
          <span className="text-sm font-black text-slate-600 shrink-0">AED</span>
          <div className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums truncate ${
            isHealthy ? 'text-emerald-800' : 'text-rose-800'
          }`}>
            <NumberFlow 
              locales="en-US"
              value={stats.netAvailableBalance} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-800 border-t border-slate-200/60 pt-2.5">
          <span className="font-bold text-slate-700 truncate">
            <NumberFlow locales="en-US" value={stats.totalProjects} /> project accounts
          </span>
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs shrink-0 ${
            isHealthy ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
          }`}>
            {isHealthy ? 'SOLVENT' : 'DEFICIT'}
          </span>
        </div>
      </div>

      {/* 2. Total Inflows (Received) */}
      <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 truncate">
            Total Funds Received
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono min-w-0">
          <span className="text-sm font-black text-slate-600 shrink-0">AED</span>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums text-emerald-700 truncate">
            <NumberFlow 
              locales="en-US"
              value={stats.totalFundsReceived} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 text-xs font-bold text-slate-600 border-t border-slate-100 pt-2.5 truncate">
          Total credited float deposits
        </div>
      </div>

      {/* 3. Total Outflows (Spent inc. VAT) */}
      <div className="min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 truncate">
            Total Spent (Inc. VAT)
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono min-w-0">
          <span className="text-sm font-black text-slate-600 shrink-0">AED</span>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums text-slate-950 truncate">
            <NumberFlow 
              locales="en-US"
              value={stats.totalExpensesWithVat} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs font-mono font-bold text-slate-700 border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-slate-500 shrink-0">Base:</span>
            <span className="tabular-nums truncate">AED <NumberFlow locales="en-US" value={stats.totalExpensesBase} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
          </div>
          <div className="flex items-center gap-1 text-slate-900 min-w-0">
            <span className="text-slate-500 shrink-0">VAT:</span>
            <span className="tabular-nums text-emerald-800 truncate">+AED <NumberFlow locales="en-US" value={stats.totalVatPaid} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
          </div>
        </div>
      </div>

      {/* 4. Pending Clearance */}
      <div className="min-w-0 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-950 truncate">
            Pending Clearance
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono min-w-0">
          <span className="text-sm font-black text-amber-900 shrink-0">AED</span>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight tabular-nums text-amber-950 truncate">
            <NumberFlow 
              locales="en-US"
              value={stats.totalPendingBillsAmount} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-950 border-t border-amber-200/60 pt-2.5 truncate">
          <NumberFlow locales="en-US" value={stats.totalPendingBillsCount} /> unsubmitted supervisor invoices
        </div>
      </div>

    </div>
  );
}
