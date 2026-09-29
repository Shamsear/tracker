import React from 'react';
import Link from 'next/link';
import { getGlobalDashboardStats } from '@/lib/ledger';
import { MasterSummaryCards } from '@/components/MasterSummaryCards';
import { DashboardClientView } from '@/components/DashboardClientView';
import { Download, FolderPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stats = await getGlobalDashboardStats();

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase">
            Master Accounts Overview
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Real-time project fund allocations, live available credits, and expense ledger
          </p>
        </div>

        {/* Action Tool Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
          >
            <FolderPlus className="h-4 w-4 text-emerald-400" />
            <span>+ New Project</span>
          </Link>

          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4 text-slate-600" />
            <span>Export Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <MasterSummaryCards stats={stats} />

      {/* Interactive Project Matrix */}
      <DashboardClientView 
        summaries={stats.projectSummaries}
        allProjects={stats.projectSummaries.map((s) => s.project)}
      />
    </div>
  );
}
