'use client';

import React from 'react';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import { 
  ArrowUpRight, 
  Plus,
  Building2,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { Project, ProjectSummary } from '@/lib/ledger';

interface SupervisorPettyCashViewProps {
  projects: Project[];
  vanExpensesSummary: ProjectSummary | undefined;
  warehousePettyCashSummary: ProjectSummary | undefined;
  vanRenewalSummary: ProjectSummary | undefined;
}

export function SupervisorPettyCashView({
  vanExpensesSummary,
  warehousePettyCashSummary,
  vanRenewalSummary,
}: SupervisorPettyCashViewProps) {
  const logisticsAccounts = [
    {
      title: 'Warehouse Petty Cash',
      subtitle: 'Office & warehouse operations daily float',
      summary: warehousePettyCashSummary,
      id: 'warehouse-petty-cash',
      icon: Building2,
      color: '#4f46e5',
    },
    {
      title: 'Van Daily Expenses',
      subtitle: 'Fuel, salik, delivery supervisor advances',
      summary: vanExpensesSummary,
      id: 'van-expenses',
      icon: Truck,
      color: '#0284c7',
    },
    {
      title: 'Van Renewal Expenses',
      subtitle: 'Vehicle insurance & RTA registrations',
      summary: vanRenewalSummary,
      id: 'van-renewal',
      icon: ShieldCheck,
      color: '#0d9488',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
          Supervisors & Petty Cash Float
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Manage operational cash floats, vehicle daily disbursements, and supervisor bill clearances.
        </p>
      </div>

      {/* Logistics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {logisticsAccounts.map((acc) => {
          const s = acc.summary;
          const balance = s?.currentBalance || 0;
          const isHealthy = balance >= 0;
          const Icon = acc.icon;

          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-400 transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-slate-900 uppercase">
                      {acc.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {acc.subtitle}
                    </p>
                  </div>
                </div>

                {/* Available Balance */}
                <div className={`mt-5 rounded-xl p-4 border ${
                  isHealthy ? 'bg-slate-50 border-slate-100' : 'bg-rose-50 border-rose-200'
                }`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Available Float
                  </span>
                  <div className="mt-1 flex items-baseline gap-1 font-mono">
                    <span className="text-xs font-bold text-slate-400">AED</span>
                    <div className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                      isHealthy ? 'text-slate-900' : 'text-rose-600'
                    }`}>
                      <NumberFlow
                        value={balance}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Float Credited</span>
                    <div className="flex items-center gap-0.5 font-bold text-emerald-700">
                      <span>AED</span>
                      <NumberFlow
                        value={s?.totalReceived || 0}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Bills Settled</span>
                    <div className="flex items-center gap-0.5 font-bold text-slate-800">
                      <span>AED</span>
                      <NumberFlow
                        value={s?.totalSpentWithVat || 0}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/transactions/new?projectId=${acc.id}&mode=fund`}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Top-up Float
                  </Link>
                  <Link
                    href={`/transactions/new?projectId=${acc.id}&mode=expense`}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Settle Bill
                  </Link>
                </div>

                <Link
                  href={`/projects/${acc.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600"
                >
                  <span>Ledger</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>

      {/* Authorized Supervisors Directory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold tracking-tight text-slate-900 uppercase">
          Authorized Field Supervisors
        </h2>
        <p className="text-xs text-slate-500">
          Personnel authorized to receive petty cash disbursements and submit project invoices.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Rizwan Saleem', role: 'Operations & Accounts Lead', phone: '+971 50 123 4567' },
            { name: 'Jeromy', role: 'Field Supervisor (Lulu & Coops)', phone: '+971 50 234 5678' },
            { name: 'Rona', role: 'Field Supervisor (Fujairah / Dibba)', phone: '+971 50 345 6789' },
            { name: 'Aisha', role: 'Field Supervisor (Dibba / Sharjah)', phone: '+971 50 456 7890' },
            { name: 'Rahla', role: 'Field Supervisor (Sampling Activations)', phone: '+971 50 567 8901' },
          ].map((sup) => (
            <div
              key={sup.name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block uppercase">
                  {sup.name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">
                  {sup.role}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-600">
                {sup.phone}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
