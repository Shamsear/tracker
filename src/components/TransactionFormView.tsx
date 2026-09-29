'use client';

import React, { useState, useMemo } from 'react';
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
  FileText,
  Clock
} from 'lucide-react';
import { Project } from '@/lib/ledger';
import { recordFundReceipt, recordExpense } from '@/lib/actions';
import { CustomSelect } from '@/components/ui/CustomSelect';

function getLocalDateTimeString() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

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
  const [date, setDate] = useState<string>(getLocalDateTimeString());
  
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
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/70 text-slate-800 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
              {mode === 'fund' ? 'Record Fund Inflow' : 'Record Project Expense'}
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {mode === 'fund' ? 'Credit funds into project ledger' : 'Deduct expense & compute 5% UAE VAT'}
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/70 p-1">
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
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
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Inflow
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-950 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Dedicated Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        
        {/* Project Selector & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
              Project Account *
            </label>
            <CustomSelect
              options={projects.map((p) => ({
                value: p.id,
                label: p.name,
                description: `Sheet: ${p.sheetName || p.name}`,
                badge: p.category,
                color: p.color || '#2563eb',
              }))}
              value={projectId}
              onChange={(val) => setProjectId(val)}
              placeholder="Search or select project account..."
              searchPlaceholder="Type project name or sheet..."
            />
            {selectedProject && (
              <span className="mt-1.5 block text-[11px] font-mono font-bold text-slate-500">
                Sheet: {selectedProject.sheetName || selectedProject.name}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                {mode === 'fund' ? 'Date & Time Received *' : 'Expense Date & Time *'}
              </label>
              <button
                type="button"
                onClick={() => setDate(getLocalDateTimeString())}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Clock className="h-3 w-3" />
                <span>Set to Current Time</span>
              </button>
            </div>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-mono font-bold text-slate-950 focus:border-slate-800 focus:outline-none min-h-[46px]"
            />
          </div>
        </div>

        {/* FUND INFLOW MODE */}
        {mode === 'fund' && (
          <div className="space-y-5 border-t border-slate-100 pt-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                Amount Received (AED) *
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-slate-500">
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
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-16 pr-4 font-mono text-xl sm:text-2xl font-black tabular-nums text-emerald-800 focus:border-slate-800 focus:outline-none min-h-[52px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Received From / Payer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accounts Department, Client, Head Office"
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none min-h-[46px]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Notes / Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank Transfer Ref #1234, Float Allocation"
                  value={fundNotes}
                  onChange={(e) => setFundNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-900 focus:border-slate-800 focus:outline-none min-h-[46px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPENSE MODE */}
        {mode === 'expense' && (
          <div className="space-y-5 border-t border-slate-100 pt-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                Purpose / Expense Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Badges, Sampling Approval, Fuel, Transport, Consumables"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none min-h-[46px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Base Amount (AED) *
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-slate-500">
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
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-16 pr-4 font-mono text-lg font-black tabular-nums text-slate-950 focus:border-slate-800 focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  VAT Rate
                </label>
                <CustomSelect
                  options={[
                    { value: '0.05', label: '5% (Standard UAE VAT)', badge: 'Standard 5%' },
                    { value: '0', label: '0% (VAT Exempt)', badge: 'Zero VAT' },
                  ]}
                  value={String(vatRate)}
                  onChange={(val) => setVatRate(parseFloat(val))}
                  placeholder="Select VAT rate..."
                  searchPlaceholder="Search VAT rate..."
                />
              </div>
            </div>

            {/* Dynamic Real-time Calculation Panel with NumberFlow */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 font-mono text-xs shadow-2xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold whitespace-nowrap text-slate-600">Base Expense:</span>
                <div className="flex items-center gap-1 font-black tabular-nums text-slate-950 whitespace-nowrap">
                  <span>AED</span>
                  <NumberFlow locales="en-US" value={numBase} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-700 mt-2">
                <span className="font-bold whitespace-nowrap text-slate-600">VAT (<NumberFlow locales="en-US" value={vatRate * 100} />%):</span>
                <div className="flex items-center gap-1 font-black tabular-nums text-emerald-800 whitespace-nowrap">
                  <span>+AED</span>
                  <NumberFlow locales="en-US" value={numVat} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                </div>
              </div>
              <div className="mt-2.5 flex justify-between items-center border-t border-slate-200 pt-2.5 font-black text-slate-950 text-base">
                <span className="whitespace-nowrap">Total Payable:</span>
                <div className="flex items-center gap-1 tabular-nums text-slate-950 whitespace-nowrap">
                  <span>AED</span>
                  <NumberFlow locales="en-US" value={numTotal} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Bill Status
                </label>
                <CustomSelect
                  options={[
                    { value: 'Pending To Submit', label: 'Pending To Submit', badge: 'Pending' },
                    { value: 'Submitted', label: 'Submitted', badge: 'Review' },
                    { value: 'Approved', label: 'Approved', badge: 'Approved' },
                    { value: 'Closed', label: 'Closed', badge: 'Cleared' },
                  ]}
                  value={billStatus}
                  onChange={(val) => setBillStatus(val)}
                  placeholder="Select bill status..."
                  searchPlaceholder="Filter statuses..."
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                  Supervisor / Payee
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rizwan, Jeromy, Aisha"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                Remarks / Invoice Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Invoice #, Store Name, Receipt Note"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none min-h-[46px]"
              />
            </div>
          </div>
        )}

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors min-h-[46px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-black text-white shadow-xs transition-all disabled:opacity-50 min-h-[46px] cursor-pointer ${
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
