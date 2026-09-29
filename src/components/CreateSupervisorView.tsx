'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UserPlus, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { createSupervisor } from '@/lib/actions';

const ROLES = [
  'Field Supervisor',
  'Operations Lead',
  'Driver / Logistics',
  'Sampling Supervisor',
  'Warehouse Lead',
];

export function CreateSupervisorView() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!name.trim()) throw new Error('Please enter supervisor name.');

      const res = await createSupervisor({
        name: name.trim(),
        phone: phone.trim() || undefined,
        role,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        router.push('/supervisors');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add supervisor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase">
            Add New Field Supervisor
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Register authorized personnel for petty cash advances and bill settlements
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Supervisor Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Imran Khan, Mohammed Ali"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[46px]"
          />
        </div>

        {/* Phone & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Phone Number / Contact
            </label>
            <input
              type="text"
              placeholder="e.g. +971 50 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-mono text-slate-900 focus:border-slate-900 focus:outline-none min-h-[46px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Assigned Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[46px]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Assigned Territory / Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Handles Dubai & Sharjah hypermarkets, sampling team lead"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[46px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all disabled:opacity-50 min-h-[46px] cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{isSubmitting ? 'Registering...' : 'Register Supervisor'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
