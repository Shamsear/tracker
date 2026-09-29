import React from 'react';
import { getAllProjects, getProjectLedger } from '@/lib/ledger';
import { SupervisorPettyCashView } from '@/components/SupervisorPettyCashView';

export const dynamic = 'force-dynamic';

export default async function SupervisorsPage() {
  const projects = await getAllProjects();

  let vanExpensesSummary;
  let warehousePettyCashSummary;
  let vanRenewalSummary;

  try {
    const res = await getProjectLedger('van-expenses');
    vanExpensesSummary = res.summary;
  } catch {}

  try {
    const res = await getProjectLedger('warehouse-petty-cash');
    warehousePettyCashSummary = res.summary;
  } catch {}

  try {
    const res = await getProjectLedger('van-renewal');
    vanRenewalSummary = res.summary;
  } catch {}

  return (
    <SupervisorPettyCashView
      projects={projects}
      vanExpensesSummary={vanExpensesSummary}
      warehousePettyCashSummary={warehousePettyCashSummary}
      vanRenewalSummary={vanRenewalSummary}
    />
  );
}
