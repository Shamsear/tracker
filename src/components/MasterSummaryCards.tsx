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
      <div className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
        isHealthy 
          ? 'border-emerald-200 bg-emerald-50/50' 
          : 'border-rose-200 bg-rose-50/50'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Net Available Balance
          </span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-xs ${
            isHealthy ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <Wallet className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono">
          <span className="text-xs font-bold text-slate-500">AED</span>
          <div className={`text-3xl font-extrabold tracking-tight tabular-nums ${
            isHealthy ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            <NumberFlow 
              value={stats.netAvailableBalance} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">
            <NumberFlow value={stats.totalProjects} /> active project accounts
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shadow-xs ${
            isHealthy ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
          }`}>
            {isHealthy ? 'SOLVENT' : 'DEFICIT'}
          </span>
        </div>
      </div>

      {/* 2. Total Inflows (Received) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Total Funds Received
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
            <ArrowDownLeft className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono">
          <span className="text-xs font-bold text-slate-500">AED</span>
          <div className="text-3xl font-extrabold tracking-tight tabular-nums text-emerald-700">
            <NumberFlow 
              value={stats.totalFundsReceived} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-2.5 text-xs font-medium text-slate-500">
          Total credited capital across ledgers
        </div>
      </div>

      {/* 3. Total Outflows (Spent inc. VAT) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Total Spent (Inc. VAT)
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-xs">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono">
          <span className="text-xs font-bold text-slate-500">AED</span>
          <div className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
            <NumberFlow 
              value={stats.totalExpensesWithVat} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <span>Base: AED</span>
            <NumberFlow value={stats.totalExpensesBase} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
          </div>
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <span>VAT: AED</span>
            <NumberFlow value={stats.totalVatPaid} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
          </div>
        </div>
      </div>

      {/* 4. Pending Clearance */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
            Pending Clearance
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 font-mono">
          <span className="text-xs font-bold text-amber-800">AED</span>
          <div className="text-3xl font-extrabold tracking-tight tabular-nums text-amber-950">
            <NumberFlow 
              value={stats.totalPendingBillsAmount} 
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1 text-xs font-medium text-amber-900">
          <NumberFlow value={stats.totalPendingBillsCount} /> unsubmitted supervisor invoices
        </div>
      </div>

    </div>
  );
}
