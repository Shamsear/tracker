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
      <div className={`rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md ${
        isHealthy 
          ? 'border-emerald-300 bg-emerald-50' 
          : 'border-rose-300 bg-rose-50'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 whitespace-nowrap">
            Net Available Balance
          </span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm shrink-0 ${
            isHealthy ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
          }`}>
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono whitespace-nowrap">
          <span className="text-sm font-black text-slate-700">AED</span>
          <div className={`text-3xl sm:text-4xl font-black tracking-tight tabular-nums ${
            isHealthy ? 'text-emerald-800' : 'text-rose-800'
          }`}>
            <NumberFlow 
              locales="en-US"
              value={stats.netAvailableBalance} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-800 border-t border-slate-200/80 pt-2.5 whitespace-nowrap">
          <span className="font-bold">
            <NumberFlow locales="en-US" value={stats.totalProjects} /> project accounts
          </span>
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs ${
            isHealthy ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
          }`}>
            {isHealthy ? 'SOLVENT' : 'DEFICIT'}
          </span>
        </div>
      </div>

      {/* 2. Total Inflows (Received) */}
      <div className="rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 whitespace-nowrap">
            Total Funds Received
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono whitespace-nowrap">
          <span className="text-sm font-black text-slate-700">AED</span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-emerald-700">
            <NumberFlow 
              locales="en-US"
              value={stats.totalFundsReceived} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 text-xs font-bold text-slate-700 border-t border-slate-100 pt-2.5 whitespace-nowrap">
          Total credited float deposits
        </div>
      </div>

      {/* 3. Total Outflows (Spent inc. VAT) */}
      <div className="rounded-2xl border-2 border-slate-300 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 whitespace-nowrap">
            Total Spent (Inc. VAT)
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono whitespace-nowrap">
          <span className="text-sm font-black text-slate-700">AED</span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-slate-950">
            <NumberFlow 
              locales="en-US"
              value={stats.totalExpensesWithVat} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold text-slate-800 border-t border-slate-100 pt-2.5 whitespace-nowrap gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-600">Base:</span>
            <span className="tabular-nums">AED <NumberFlow locales="en-US" value={stats.totalExpensesBase} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
          </div>
          <div className="flex items-center gap-1 text-slate-900">
            <span className="text-slate-600">VAT:</span>
            <span className="tabular-nums text-emerald-800">+AED <NumberFlow locales="en-US" value={stats.totalVatPaid} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
          </div>
        </div>
      </div>

      {/* 4. Pending Clearance */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-amber-950 whitespace-nowrap">
            Pending Clearance
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono whitespace-nowrap">
          <span className="text-sm font-black text-amber-900">AED</span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-amber-950">
            <NumberFlow 
              locales="en-US"
              value={stats.totalPendingBillsAmount} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-950 border-t border-amber-200/80 pt-2.5 whitespace-nowrap">
          <NumberFlow locales="en-US" value={stats.totalPendingBillsCount} /> unsubmitted supervisor invoices
        </div>
      </div>

    </div>
  );
}
