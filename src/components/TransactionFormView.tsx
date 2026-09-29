'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import NumberFlow from '@number-flow/react';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Check, 
  AlertCircle,
  Building2,
  Calendar,
  Wallet,
  Receipt,
  FileText
} from 'lucide-react';
import { Project } from '@/lib/ledger';
import { recordFundReceipt, recordExpense } from '@/lib/actions';

interface TransactionFormViewProps {
  projects: Project[];
}

export function TransactionFormView({ projects }: TransactionFormViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialMode = (searchParams.get('mode') === 'fund' ? 'fund' : 'expense') as 'fund' | 'expense';
  const initialProjectId = searchParams.get('projectId') || projects[0]?.id || '';

  const [mode, setMode] = useState<'fund' | 'expense'>(initialMode);
  const [projectId, setProjectId] = useState<string>(initialProjectId);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Fund Inflow Fields
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [receivedFrom, setReceivedFrom] = useState<string>('');
  const [fundNotes, setFundNotes] = useState<string>('');

  // Expense Fields
  const [purpose, setPurpose] = useState<string>('');
  const [baseAmount, setBaseAmount] = useState<string>('');
  const [vatRate, setVatRate] = useState<number>(0.05); // Standard 5% UAE VAT
  const [billStatus, setBillStatus] = useState<string>('Pending To Submit');
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];

  const numBase = parseFloat(baseAmount) || 0;
  const numVat = Number((numBase * vatRate).toFixed(2));
  const numTotal = Number((numBase + numVat).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'fund') {
        const amt = parseFloat(receivedAmount);
        if (!amt || amt <= 0) throw new Error('Please enter a valid amount.');
        await recordFundReceipt({
          projectId,
          amount: amt,
          receivedDate: date,
          receivedFrom: receivedFrom.trim() || undefined,
          notes: fundNotes.trim() || undefined,
        });
      } else {
        const amt = parseFloat(baseAmount);
        if (!amt || amt <= 0) throw new Error('Please enter a valid base amount.');
        if (!purpose.trim()) throw new Error('Please enter a purpose / description.');
        await recordExpense({
          projectId,
          expenseDate: date,
          purpose: purpose.trim(),
          amount: amt,
          vatRate,
          billStatus,
          supervisorName: supervisorName.trim() || undefined,
          remarks: remarks.trim() || undefined,
        });
      }

      // Navigate back to project ledger or home
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
              {mode === 'fund' ? 'Record Fund Inflow' : 'Record Project Expense'}
            </h1>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              {mode === 'fund' ? 'Credit funds into project ledger' : 'Deduct expense & compute 5% UAE VAT'}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center rounded-xl border-2 border-slate-300 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-800 hover:text-slate-950'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setMode('fund')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'fund'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-800 hover:text-slate-950'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Inflow
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border-2 border-rose-400 bg-rose-50 p-4 text-xs font-bold text-rose-950 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Dedicated Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-sm space-y-6">
        
        {/* Project Selector & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
              Project Account *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-950 focus:border-slate-900 focus:outline-none min-h-[46px]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
            {selectedProject && (
              <span className="mt-1 block text-[11px] font-mono font-bold text-slate-600">
                Sheet: {selectedProject.sheetName || selectedProject.name}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
              {mode === 'fund' ? 'Date Amount Received *' : 'Expense Date *'}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-mono font-bold text-slate-950 focus:border-slate-900 focus:outline-none min-h-[46px]"
            />
          </div>
        </div>

        {/* FUND INFLOW MODE */}
        {mode === 'fund' && (
          <div className="space-y-5 border-t-2 border-slate-200 pt-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                Amount Received (AED) *
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-slate-700">
                  AED
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-slate-300 bg-white py-3 pl-16 pr-4 font-mono text-xl sm:text-2xl font-black tabular-nums text-emerald-800 focus:border-slate-900 focus:outline-none min-h-[52px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  Received From / Payer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accounts Department, Client, Head Office"
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none min-h-[46px]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  Notes / Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank Transfer Ref #1234, Float Allocation"
                  value={fundNotes}
                  onChange={(e) => setFundNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none min-h-[46px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPENSE MODE */}
        {mode === 'expense' && (
          <div className="space-y-5 border-t-2 border-slate-200 pt-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                Purpose / Expense Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Badges, Sampling Approval, Fuel, Transport, Consumables"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none min-h-[46px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  Base Amount (AED) *
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-slate-700">
                    AED
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(e.target.value)}
                    required
                    className="w-full rounded-xl border-2 border-slate-300 bg-white py-3 pl-16 pr-4 font-mono text-lg font-black tabular-nums text-slate-950 focus:border-slate-900 focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  VAT Rate
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-mono font-bold text-slate-950 focus:border-slate-900 focus:outline-none min-h-[48px]"
                >
                  <option value={0.05}>5% (Standard UAE VAT)</option>
                  <option value={0.00}>0% (VAT Exempt)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Real-time Calculation Panel with NumberFlow */}
            <div className="rounded-2xl border-2 border-slate-300 bg-slate-100 p-4 font-mono text-xs shadow-2xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold whitespace-nowrap">Base Expense:</span>
                <div className="flex items-center gap-1 font-black tabular-nums text-slate-950 whitespace-nowrap">
                  <span>AED</span>
                  <NumberFlow locales="en-US" value={numBase} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-700 mt-2">
                <span className="font-bold whitespace-nowrap">VAT (<NumberFlow locales="en-US" value={vatRate * 100} />%):</span>
                <div className="flex items-center gap-1 font-black tabular-nums text-emerald-800 whitespace-nowrap">
                  <span>+AED</span>
                  <NumberFlow locales="en-US" value={numVat} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                </div>
              </div>
              <div className="mt-2.5 flex justify-between items-center border-t-2 border-slate-300 pt-2.5 font-black text-slate-950 text-base">
                <span className="whitespace-nowrap">Total Payable:</span>
                <div className="flex items-center gap-1 tabular-nums text-slate-950 whitespace-nowrap">
                  <span>AED</span>
                  <NumberFlow locales="en-US" value={numTotal} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  Bill Status
                </label>
                <select
                  value={billStatus}
                  onChange={(e) => setBillStatus(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-950 focus:border-slate-900 focus:outline-none min-h-[46px]"
                >
                  <option value="Pending To Submit">Pending To Submit</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  Supervisor / Payee
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rizwan, Jeromy, Aisha"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                Remarks / Invoice Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Invoice #, Store Name, Receipt Note"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="mt-1.5 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:border-slate-900 focus:outline-none min-h-[46px]"
              />
            </div>
          </div>
        )}

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t-2 border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[46px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-black text-white shadow-sm transition-all disabled:opacity-50 min-h-[46px] cursor-pointer ${
              mode === 'fund'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>{isSubmitting ? 'Saving...' : (mode === 'fund' ? 'Confirm Inflow Receipt' : 'Save & Deduct Expense')}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
