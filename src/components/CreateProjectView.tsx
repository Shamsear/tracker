'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FolderPlus, 
  Check, 
  AlertCircle,
  Palette,
  Sparkles
} from 'lucide-react';
import { createNewProject } from '@/lib/actions';

const COLOR_OPTIONS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#475569', // Slate
];

const CATEGORIES = ['Project', 'Logistics', 'Petty Cash', 'Event', 'Operational'];

export function CreateProjectView() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Project');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [initialFund, setInitialFund] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        throw new Error('Please provide a project name.');
      }

      const initAmt = parseFloat(initialFund) || 0;

      const res = await createNewProject({
        name: name.trim(),
        category,
        color,
        description: description.trim() || undefined,
        initialFund: initAmt > 0 ? initAmt : undefined,
      });

      if (res.success && res.id) {
        router.push(`/projects/${res.id}`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create project.');
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
            Create New Project Account
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Add a new client account, marketing campaign, or operational ledger
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Project Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Project / Brand Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Al Kabeer, Americana, Lipton Activations"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[46px]"
          />
        </div>

        {/* Category & Color Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Account Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-900 focus:border-slate-900 focus:outline-none min-h-[46px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Color Accent
            </label>
            <div className="mt-2.5 flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Initial Opening Credit */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Initial Opening Fund Deposit (AED) — Optional
          </label>
          <div className="relative mt-1.5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-slate-400">
              AED
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={initialFund}
              onChange={(e) => setInitialFund(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-16 pr-4 font-mono text-lg font-bold tabular-nums text-emerald-700 focus:border-slate-900 focus:outline-none min-h-[48px]"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            If provided, this amount will immediately be credited as the opening available balance.
          </p>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Description & Reference Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g. In-store promoter sampling activations across UAE Lulu & Carrefour hypermarkets"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            <span>{isSubmitting ? 'Creating Project...' : 'Create Project Account'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
