'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  FileSpreadsheet, 
  Trash2
} from 'lucide-react';
import { Project, ProjectLedgerRow, ProjectSummary } from '@/lib/ledger';
import { updateExpenseStatus, deleteTransaction } from '@/lib/actions';

interface ProjectLedgerViewProps {
  project: Project;
  summary: ProjectSummary;
  ledger: ProjectLedgerRow[];
  allProjects: Project[];
}

export function ProjectLedgerView({
  project,
  summary,
  ledger,
}: ProjectLedgerViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fund' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleStatusChange = async (expenseId: string, currentStatus: string) => {
    const sequence = ['Pending To Submit', 'Submitted', 'Approved', 'Closed'];
    const nextIdx = (sequence.indexOf(currentStatus) + 1) % sequence.length;
    const nextStatus = sequence[nextIdx];
    await updateExpenseStatus(expenseId, nextStatus, project.id);
  };

  const handleDelete = async (id: string, type: 'fund' | 'expense') => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    setIsDeleting(id);
    try {
      await deleteTransaction(id, type, project.id);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredLedger = ledger.filter((row) => {
    const matchesSearch = 
      row.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.remarks && row.remarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.supervisor_name && row.supervisor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || row.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || row.bill_status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const isHealthy = summary.currentBalance >= 0;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-950 transition-colors shadow-2xs"
            aria-label="Back to overview"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span 
                className="h-3.5 w-3.5 rounded-full shadow-xs ring-2 ring-slate-100" 
                style={{ backgroundColor: project.color || '#2563eb' }}
              />
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                {project.name}
              </h1>
              <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-slate-700">
                {project.category}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Synced from Sheet: {project.sheetName || project.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`/api/export?projectId=${project.id}`}
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span>Export Sheet (.xlsx)</span>
          </a>
          <Link
            href={`/transactions/new?projectId=${project.id}&mode=fund`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-xs"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>+ Receive Inflow</span>
          </Link>
          <Link
            href={`/transactions/new?projectId=${project.id}&mode=expense`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 transition-all shadow-xs"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>+ Record Expense</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        
        {/* Available Balance */}
        <div className={`rounded-2xl border p-4 shadow-xs ${
          isHealthy ? 'border-emerald-200/90 bg-emerald-50/70' : 'border-rose-200/90 bg-rose-50/70'
        }`}>
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block whitespace-nowrap">
            Current Balance
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono whitespace-nowrap">
            <span className="text-xs font-black text-slate-600">AED</span>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${
              isHealthy ? 'text-emerald-800' : 'text-rose-800'
            }`}>
              <NumberFlow
                locales="en-US"
                value={summary.currentBalance}
                format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
              />
            </div>
          </div>
          <span className="mt-1 block text-xs font-bold text-slate-600 whitespace-nowrap">
            {isHealthy ? 'Available Credit' : 'Deficit / Overdrawn'}
          </span>
        </div>

        {/* Total Inflows */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block whitespace-nowrap">
            Total Funds Inflow
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono text-2xl sm:text-3xl font-black tracking-tight tabular-nums text-emerald-700 whitespace-nowrap">
            <span className="text-xs font-black text-slate-600">AED</span>
            <NumberFlow
              locales="en-US"
              value={summary.totalReceived}
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
          <span className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-600 whitespace-nowrap">
            <NumberFlow locales="en-US" value={summary.receiptCount} /> receipts credited
          </span>
        </div>

        {/* Total Spent */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block whitespace-nowrap">
            Total Spent (Inc. VAT)
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono text-2xl sm:text-3xl font-black tracking-tight tabular-nums text-slate-950 whitespace-nowrap">
            <span className="text-xs font-black text-slate-600">AED</span>
            <NumberFlow
              locales="en-US"
              value={summary.totalSpentWithVat}
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between gap-1 text-xs font-mono font-bold text-slate-600 whitespace-nowrap">
            <span>Base: AED <NumberFlow locales="en-US" value={summary.totalSpentBase} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
            <span className="text-emerald-800">+VAT: AED <NumberFlow locales="en-US" value={summary.totalVat} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 shadow-xs">
          <span className="text-xs font-black uppercase tracking-wider text-amber-950 block whitespace-nowrap">
            Pending Bills
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono text-2xl sm:text-3xl font-black tracking-tight tabular-nums text-amber-950 whitespace-nowrap">
            <span className="text-xs font-black text-amber-900">AED</span>
            <NumberFlow
              locales="en-US"
              value={summary.pendingBillsAmount}
              format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            />
          </div>
          <span className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-950 whitespace-nowrap">
            <NumberFlow locales="en-US" value={summary.pendingBillsCount} /> bills unsubmitted
          </span>
        </div>

      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search purpose, remarks, supervisor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Filter */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/70 p-0.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                typeFilter === 'all' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setTypeFilter('fund')}
              className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                typeFilter === 'fund' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              INFLOWS
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              EXPENSES
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800 transition-all"
          >
            <option value="all">Status: All</option>
            <option value="Pending To Submit">Pending To Submit</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Ledger Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-black uppercase text-[11px] tracking-wider text-slate-700">
            <tr>
              <th className="py-4 px-4">Date</th>
              <th className="py-4 px-4">Purpose / Description</th>
              <th className="py-4 px-4 text-right">Base Amount</th>
              <th className="py-4 px-4 text-right">VAT (5%)</th>
              <th className="py-4 px-4 text-right">Total Payable</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-4 text-right text-emerald-800">Received</th>
              <th className="py-4 px-4 text-right font-black text-slate-950">Running Balance</th>
              <th className="py-4 px-4">Remarks / Supervisor</th>
              <th className="py-4 px-3 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-200 font-mono">
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500 font-sans text-xs font-bold">
                  No transaction records found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredLedger.map((row) => {
                const isFund = row.type === 'fund';
                const isDeficit = row.balance < 0;

                return (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-slate-100/80 transition-colors ${
                      isFund ? 'bg-emerald-50/60' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-slate-800 font-bold whitespace-nowrap">
                      {row.date}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-bold text-slate-950 max-w-xs truncate">
                      {isFund ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-800 font-black">
                          <ArrowDownLeft className="h-4 w-4 shrink-0" />
                          {row.purpose}
                        </span>
                      ) : (
                        row.purpose
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-800 font-bold whitespace-nowrap">
                      {!isFund && row.amount > 0 ? (
                        <NumberFlow locales="en-US" value={row.amount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                      ) : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-700 font-bold whitespace-nowrap">
                      {!isFund && row.vat_amount > 0 ? (
                        <span className="text-emerald-800 font-black">
                          +<NumberFlow locales="en-US" value={row.vat_amount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                        </span>
                      ) : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums font-black text-slate-950 whitespace-nowrap">
                      {!isFund ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-700">AED</span>
                          <NumberFlow locales="en-US" value={row.total_amount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                        </div>
                      ) : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {!isFund && row.bill_status && (
                        <button
                          onClick={() => handleStatusChange(row.id, row.bill_status!)}
                          title="Click to advance status"
                          className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border cursor-pointer active:scale-95 transition-all ${
                            row.bill_status === 'Closed'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : row.bill_status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                                : row.bill_status === 'Submitted'
                                  ? 'bg-blue-50 text-blue-950 border-blue-300'
                                  : 'bg-amber-50 text-amber-950 border-amber-300'
                          }`}
                        >
                          {row.bill_status}
                        </button>
                      )}
                      {isFund && (
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-950 border border-emerald-300 uppercase">
                          CREDITED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right tabular-nums font-black text-emerald-800 whitespace-nowrap">
                      {isFund ? (
                        <div className="flex items-center justify-end gap-1">
                          <span>+AED</span>
                          <NumberFlow locales="en-US" value={row.received} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                        </div>
                      ) : '-'}
                    </td>

                    <td className={`py-3.5 px-4 text-right tabular-nums font-black whitespace-nowrap ${
                      isDeficit ? 'text-rose-700' : 'text-slate-950'
                    }`}>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-500">AED</span>
                        <NumberFlow locales="en-US" value={row.balance} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-xs text-slate-700 font-medium max-w-xs truncate">
                      {row.supervisor_name && (
                        <span className="mr-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-800 border border-slate-200">
                          {row.supervisor_name}
                        </span>
                      )}
                      {row.remarks || '-'}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleDelete(row.id, row.type)}
                        disabled={isDeleting === row.id}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredLedger.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 font-bold">
            No records found.
          </div>
        ) : (
          filteredLedger.map((row) => {
            const isFund = row.type === 'fund';
            const isDeficit = row.balance < 0;

            return (
              <div
                key={row.id}
                className={`rounded-2xl border p-4 shadow-xs transition-all ${
                  isFund 
                    ? 'border-emerald-200/90 bg-emerald-50/70' 
                    : 'border-slate-200/90 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-slate-500 block">{row.date}</span>
                    <span className="font-black text-sm text-slate-950 block mt-0.5 truncate">
                      {row.purpose}
                    </span>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className={`text-base font-black tabular-nums flex items-center justify-end gap-1 whitespace-nowrap ${
                      isFund ? 'text-emerald-800' : 'text-slate-950'
                    }`}>
                      <span>{isFund ? '+AED' : '-AED'}</span>
                      <NumberFlow 
                        locales="en-US"
                        value={isFund ? row.received : row.total_amount} 
                        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} 
                      />
                    </div>
                    {!isFund && row.vat_amount > 0 && (
                      <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-slate-700 whitespace-nowrap mt-0.5">
                        <span>Base: AED <NumberFlow locales="en-US" value={row.amount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
                        <span className="text-emerald-800 font-black">+VAT: AED <NumberFlow locales="en-US" value={row.vat_amount} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} /></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] font-black uppercase block whitespace-nowrap">Running Balance</span>
                    <div className={`tabular-nums font-black flex items-center gap-1 whitespace-nowrap ${isDeficit ? 'text-rose-700' : 'text-slate-950'}`}>
                      <span>AED</span>
                      <NumberFlow locales="en-US" value={row.balance} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isFund && row.bill_status && (
                      <button
                        onClick={() => handleStatusChange(row.id, row.bill_status!)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase border whitespace-nowrap ${
                          row.bill_status === 'Closed'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        {row.bill_status}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(row.id, row.type)}
                      className="rounded-lg p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
