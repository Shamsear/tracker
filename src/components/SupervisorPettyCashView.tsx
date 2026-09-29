'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import { 
  ArrowUpRight, 
  Plus,
  Building2,
  Truck,
  ShieldCheck,
  Search,
  Users
} from 'lucide-react';
import { Project, ProjectSummary, SupervisorItem } from '@/lib/ledger';
import { Pagination } from '@/components/ui/Pagination';

interface SupervisorPettyCashViewProps {
  projects: Project[];
  supervisors?: SupervisorItem[];
  vanExpensesSummary: ProjectSummary | undefined;
  warehousePettyCashSummary: ProjectSummary | undefined;
  vanRenewalSummary: ProjectSummary | undefined;
}

export function SupervisorPettyCashView({
  supervisors = [],
  vanExpensesSummary,
  warehousePettyCashSummary,
  vanRenewalSummary,
}: SupervisorPettyCashViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fallbackSupervisors: SupervisorItem[] = [
    { id: 'sup-1', name: 'Rizwan Saleem', role: 'Operations & Accounts Lead', phone: '+971 50 123 4567' },
    { id: 'sup-2', name: 'Jeromy', role: 'Field Supervisor (Lulu & Coops)', phone: '+971 50 234 5678' },
    { id: 'sup-3', name: 'Rona', role: 'Field Supervisor (Fujairah / Dibba)', phone: '+971 50 345 6789' },
    { id: 'sup-4', name: 'Aisha', role: 'Field Supervisor (Dibba / Sharjah)', phone: '+971 50 456 7890' },
    { id: 'sup-5', name: 'Rahla', role: 'Field Supervisor (Sampling Activations)', phone: '+971 50 567 8901' },
  ];

  const allSupervisors = supervisors.length > 0 ? supervisors : fallbackSupervisors;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredSupervisors = allSupervisors.filter((sup) => {
    const q = searchTerm.toLowerCase();
    return (
      sup.name.toLowerCase().includes(q) ||
      sup.role.toLowerCase().includes(q) ||
      (sup.phone && sup.phone.toLowerCase().includes(q))
    );
  });

  const paginatedSupervisors = filteredSupervisors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
            Supervisors & Petty Cash Float
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-500">
            Manage operational cash floats, vehicle daily disbursements, and supervisor bill clearances.
          </p>
        </div>

        <Link
          href="/supervisors/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition-all shadow-xs shrink-0 cursor-pointer"
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
              className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-xs hover:border-slate-400 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-950 uppercase">
                      {acc.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-500">
                      {acc.subtitle}
                    </p>
                  </div>
                </div>

                {/* Available Balance */}
                <div className={`mt-5 rounded-xl p-4 border transition-all ${
                  isHealthy ? 'bg-slate-50/70 border-slate-200/60' : 'bg-rose-50/60 border-rose-200/90'
                }`}>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 block whitespace-nowrap">
                    Available Float
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5 font-mono whitespace-nowrap">
                    <span className="text-xs font-black text-slate-600">AED</span>
                    <div className={`text-3xl font-black tracking-tight tabular-nums ${
                      isHealthy ? 'text-slate-950' : 'text-rose-700'
                    }`}>
                      <NumberFlow
                        locales="en-US"
                        value={balance}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs font-mono">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block whitespace-nowrap">Float Credited</span>
                    <div className="flex items-center gap-1 font-black text-emerald-800 text-sm mt-0.5 whitespace-nowrap">
                      <span>AED</span>
                      <NumberFlow
                        locales="en-US"
                        value={s?.totalReceived || 0}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block whitespace-nowrap">Bills Settled</span>
                    <div className="flex items-center gap-1 font-black text-slate-950 text-sm mt-0.5 whitespace-nowrap">
                      <span>AED</span>
                      <NumberFlow
                        locales="en-US"
                        value={s?.totalSpentWithVat || 0}
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/transactions/new?projectId=${acc.id}&mode=fund`}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Top-up Float
                  </Link>
                  <Link
                    href={`/transactions/new?projectId=${acc.id}&mode=expense`}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Settle Bill
                  </Link>
                </div>

                <Link
                  href={`/projects/${acc.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs whitespace-nowrap"
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
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>Authorized Field Supervisors</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Personnel authorized to receive petty cash disbursements and submit project invoices.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search supervisors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-all"
            />
          </div>
        </div>

        {paginatedSupervisors.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            No supervisors found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedSupervisors.map((sup) => (
              <div
                key={sup.id || sup.name}
                className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-black text-xs text-slate-950 block uppercase truncate">
                    {sup.name}
                  </span>
                  <span className="text-[11px] text-slate-600 font-bold block mt-0.5 truncate">
                    {sup.role}
                  </span>
                </div>
                {sup.phone ? (
                  <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                    {sup.phone}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">No phone</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSupervisors.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[6, 12, 24, 48]}
          itemLabel="supervisors"
        />
      </div>

    </div>
  );
}

