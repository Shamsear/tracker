import React from 'react';
import { getGlobalDashboardStats } from '@/lib/ledger';
import { MasterSummaryCards } from '@/components/MasterSummaryCards';
import { DashboardClientView } from '@/components/DashboardClientView';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const stats = getGlobalDashboardStats();

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Swiss Typography */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
            Master Accounts Overview
          </h1>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time project fund allocations, live available credits, and expense ledger
          </p>
        </div>

        {/* Action Tool Bar */}
        <div className="flex items-center gap-2">
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-xs transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>Export Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <MasterSummaryCards stats={stats} />

      {/* Interactive Project Matrix & Action Modals */}
      <DashboardClientView 
        summaries={stats.projectSummaries}
        allProjects={stats.projectSummaries.map((s) => s.project)}
      />
    </div>
  );
}
