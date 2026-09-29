import React, { Suspense } from 'react';
import { getAllProjects } from '@/lib/ledger';
import { TransactionFormView } from '@/components/TransactionFormView';

export const dynamic = 'force-dynamic';

export default async function NewTransactionPage() {
  const projects = await getAllProjects();

  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 font-mono">
        Loading transaction form...
      </div>
    }>
      <TransactionFormView projects={projects} />
    </Suspense>
  );
}
