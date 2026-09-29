import React from 'react';
import { getAllProjects, getProjectLedger } from '@/lib/ledger';
import { SupervisorPettyCashView } from '@/components/SupervisorPettyCashView';

export const dynamic = 'force-dynamic';

export default function SupervisorsPage() {
  const projects = getAllProjects();

  let vanExpensesSummary;
  let warehousePettyCashSummary;
  let vanRenewalSummary;

  try {
    vanExpensesSummary = getProjectLedger('van-expenses').summary;
  } catch {}

  try {
    warehousePettyCashSummary = getProjectLedger('warehouse-petty-cash').summary;
  } catch {}

  try {
    vanRenewalSummary = getProjectLedger('van-renewal').summary;
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
