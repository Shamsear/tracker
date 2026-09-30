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
import { CustomSelect } from '@/components/ui/CustomSelect';


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
      <div className="flex items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs min-w-0">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/70 text-slate-800 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-950 uppercase truncate">
            Create New Project Account
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">
            Add a new client account, marketing campaign, or operational ledger
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-950 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        
        {/* Project Name */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
            Project / Brand Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Al Kabeer, Americana, Lipton Activations"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none min-h-[46px]"
          />
        </div>

        {/* Category & Color Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
              Account Category *
            </label>
            <CustomSelect
              options={CATEGORIES.map((cat) => ({
                value: cat,
                label: cat,
                badge: cat === 'Project' ? 'Core' : undefined,
              }))}
              value={category}
              onChange={(val) => setCategory(val)}
              placeholder="Select category..."
              searchPlaceholder="Search category..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                Color Accent
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <span
                  className="h-2.5 w-2.5 rounded-full inline-block"
                  style={{ backgroundColor: color }}
                />
                <span>{color}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-white p-2 min-h-[44px] shadow-2xs">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-slate-950 ring-offset-2 ring-offset-white shadow-xs'
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  >
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-white stroke-[3] drop-shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Initial Opening Credit */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
            Initial Opening Fund Deposit (AED) — Optional
          </label>
          <div className="relative mt-1.5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono font-black text-slate-500">
              AED
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={initialFund}
              onChange={(e) => setInitialFund(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-16 pr-4 font-mono text-lg font-black tabular-nums text-emerald-800 focus:border-slate-800 focus:outline-none min-h-[48px]"
            />
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">
            If provided, this amount will immediately be credited as the opening available balance.
          </p>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
            Description & Reference Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g. In-store promoter sampling activations across UAE Lulu & Carrefour hypermarkets"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-bold text-slate-950 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto rounded-xl px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[46px] cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3 text-xs font-black text-white hover:bg-slate-800 shadow-xs transition-all disabled:opacity-50 min-h-[46px] cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{isSubmitting ? 'Creating Project...' : 'Create Project Account'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
