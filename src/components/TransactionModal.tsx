'use client';

import React, { useState, useEffect } from 'react';
import NumberFlow from '@number-flow/react';
import { X, ArrowDownLeft, ArrowUpRight, Check, AlertCircle } from 'lucide-react';
import { Project } from '@/lib/ledger';
import { recordFundReceipt, recordExpense } from '@/lib/actions';

interface TransactionModalProps {
  isOpen: boolean;
  initialMode: 'fund' | 'expense';
  projects: Project[];
  defaultProjectId?: string;
  onClose: () => void;
}

export function TransactionModal({
  isOpen,
  initialMode,
  projects,
  defaultProjectId,
  onClose,
}: TransactionModalProps) {
  const [mode, setMode] = useState<'fund' | 'expense'>(initialMode);
  const [projectId, setProjectId] = useState<string>(defaultProjectId || projects[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Fund Fields
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [receivedFrom, setReceivedFrom] = useState<string>('');
  const [fundNotes, setFundNotes] = useState<string>('');

  // Expense Fields
  const [purpose, setPurpose] = useState<string>('');
  const [baseAmount, setBaseAmount] = useState<string>('');
  const [vatRate, setVatRate] = useState<number>(0.05);
  const [billStatus, setBillStatus] = useState<string>('Pending To Submit');
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    if (defaultProjectId) setProjectId(defaultProjectId);
  }, [initialMode, defaultProjectId]);

  if (!isOpen) return null;

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
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setMode('expense')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setMode('fund')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === 'fund'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Inflow
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          
          {/* Project Selection */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
              Project Account *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
              {mode === 'fund' ? 'Date Amount Received *' : 'Expense Date *'}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
            />
          </div>

          {/* FUND MODE */}
          {mode === 'fund' && (
            <>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                  Amount Received (AED) *
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
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
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-12 pr-4 font-mono text-base sm:text-lg font-extrabold tabular-nums text-emerald-700 focus:border-slate-900 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                  Received From / Payer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accounts Department, Client, Rizwan"
                  value={receivedFrom}
                  onChange={(e) => setReceivedFrom(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank Transfer, Cheque #, Float Allocation"
                  value={fundNotes}
                  onChange={(e) => setFundNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                />
              </div>
            </>
          )}

          {/* EXPENSE MODE */}
          {mode === 'expense' && (
            <>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                  Purpose / Expense Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Badges, Sampling Approval, Transport, Consumables"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                    Base Amount (AED) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold tabular-nums text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                    VAT Rate
                  </label>
                  <select
                    value={vatRate}
                    onChange={(e) => setVatRate(parseFloat(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                  >
                    <option value={0.05}>5% (Standard UAE VAT)</option>
                    <option value={0.00}>0% (VAT Exempt)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Animated VAT Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Amount:</span>
                  <div className="flex items-center gap-0.5 font-bold tabular-nums">
                    <span>AED</span>
                    <NumberFlow value={numBase} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                  </div>
                </div>
                <div className="flex justify-between text-slate-600 mt-1">
                  <span>VAT ({vatRate * 100}%):</span>
                  <div className="flex items-center gap-0.5 font-bold tabular-nums text-emerald-700">
                    <span>+AED</span>
                    <NumberFlow value={numVat} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                  </div>
                </div>
                <div className="mt-2 flex justify-between border-t border-slate-200 pt-1.5 font-extrabold text-slate-900 text-sm">
                  <span>Total Payable:</span>
                  <div className="flex items-center gap-0.5 tabular-nums">
                    <span>AED</span>
                    <NumberFlow value={numTotal} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                    Bill Status
                  </label>
                  <select
                    value={billStatus}
                    onChange={(e) => setBillStatus(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                  >
                    <option value="Pending To Submit">Pending To Submit</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                    Supervisor / Payee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rizwan, Jeromy, Aisha"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                  Remarks / Invoice Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #, Store Name, Receipt Note"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none min-h-[42px]"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 min-h-[44px] cursor-pointer ${
                mode === 'fund'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? 'Recording…' : (mode === 'fund' ? 'Record Inflow' : 'Record Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
