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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
            Supervisors & Petty Cash Float
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-600">
            Manage operational cash floats, vehicle daily disbursements, and supervisor bill clearances.
          </p>
        </div>

        <Link
          href="/supervisors/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          <span>+ Add Supervisor</span>
        </Link>
      </div>

      {/* Logistics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {logisticsAccounts.map((acc) => {
          const s = acc.summary;
          const balance = s?.currentBalance || 0;
          const isHealthy = balance >= 0;
          const Icon = acc.icon;

          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border-2 border-slate-300 p-6 flex flex-col justify-between shadow-sm hover:border-slate-500 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-950 uppercase">
                      {acc.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-600">
                      {acc.subtitle}
                    </p>
                  </div>
                </div>

                {/* Available Balance */}
                <div className={`mt-5 rounded-xl p-4 border-2 ${
                  isHealthy ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-300'
                }`}>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Available Float
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                    <span className="text-xs font-black text-slate-700">AED</span>
                    <div className={`text-3xl font-black tracking-tight tabular-nums ${
                      isHealthy ? 'text-slate-950' : 'text-rose-700'
                    }`}>
                      <NumberFlow
                        value={balance}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-slate-200 pt-3 text-xs font-mono">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Float Credited</span>
                    <div className="flex items-center gap-1 font-black text-emerald-800 text-sm mt-0.5">
                      <span>AED</span>
                      <NumberFlow
                        value={s?.totalReceived || 0}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Bills Settled</span>
                    <div className="flex items-center gap-1 font-black text-slate-950 text-sm mt-0.5">
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
              <div className="mt-6 flex items-center justify-between border-t-2 border-slate-200 pt-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/transactions/new?projectId=${acc.id}&mode=fund`}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Top-up Float
                  </Link>
                  <Link
                    href={`/transactions/new?projectId=${acc.id}&mode=expense`}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Settle Bill
                  </Link>
                </div>

                <Link
                  href={`/projects/${acc.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs"
                >
                  <span>Ledger</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-300" />
                </Link>
              </div>

            </div>
          );
        })}
      </div>

      {/* Authorized Supervisors Directory */}
      <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-base font-black tracking-tight text-slate-950 uppercase">
          Authorized Field Supervisors
        </h2>
        <p className="text-xs font-bold text-slate-600 mt-0.5">
          Personnel authorized to receive petty cash disbursements and submit project invoices.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Rizwan Saleem', role: 'Operations & Accounts Lead', phone: '+971 50 123 4567' },
            { name: 'Jeromy', role: 'Field Supervisor (Lulu & Coops)', phone: '+971 50 234 5678' },
            { name: 'Rona', role: 'Field Supervisor (Fujairah / Dibba)', phone: '+971 50 345 6789' },
            { name: 'Aisha', role: 'Field Supervisor (Dibba / Sharjah)', phone: '+971 50 456 7890' },
            { name: 'Rahla', role: 'Field Supervisor (Sampling Activations)', phone: '+971 50 567 8901' },
          ].map((sup) => (
            <div
              key={sup.name}
              className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 flex items-center justify-between"
            >
              <div>
                <span className="font-black text-xs text-slate-950 block uppercase">
                  {sup.name}
                </span>
                <span className="text-[11px] text-slate-700 font-bold block mt-0.5">
                  {sup.role}
                </span>
              </div>
              <span className="font-mono text-xs font-black text-slate-900 bg-slate-200 px-2 py-1 rounded-lg border border-slate-300">
                {sup.phone}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
