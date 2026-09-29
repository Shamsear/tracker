import { prisma, ensureDbSeeded } from './db';

export interface Project {
  id: string;
  name: string;
  code: string;
  category: string;
  sheetName?: string | null;
  color?: string | null;
  description?: string | null;
  createdAt: Date;
}

export interface FundReceipt {
  id: string;
  projectId: string;
  amount: number;
  receivedDate: string;
  receivedFrom?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export interface Expense {
  id: string;
  projectId: string;
  expenseDate: string;
  purpose: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  billStatus: string;
  supervisorName?: string | null;
  remarks?: string | null;
  receiptImage?: string | null;
  createdAt: Date;
}

export interface ProjectLedgerRow {
  id: string;
  type: 'fund' | 'expense';
  date: string;
  time?: string;
  full_date?: string;
  purpose: string;
  amount: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  bill_status?: string;
  received: number;
  date_received?: string;
  time_received?: string;
  available_credit: number;
  balance: number;
  supervisor_name?: string;
  remarks?: string;
}

export function parseDateAndTime(rawDate: string, createdAt?: Date): { date: string; time: string; full: string } {
  if (!rawDate) {
    const d = createdAt ? new Date(createdAt) : new Date();
    const date = d.toISOString().split('T')[0];
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time, full: `${date} ${time}` };
  }

  if (rawDate.includes('T') || (rawDate.includes(':') && rawDate.includes(' '))) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const date = d.toISOString().split('T')[0];
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date, time, full: `${date} ${time}` };
    }
  }

  const date = rawDate.split('T')[0].split(' ')[0];
  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date, time, full: `${date} ${time}` };
    }
  }

  return { date, time: '', full: date };
}


export interface ProjectSummary {
  project: Project;
  totalReceived: number;
  totalSpentBase: number;
  totalVat: number;
  totalSpentWithVat: number;
  currentBalance: number;
  pendingBillsCount: number;
  pendingBillsAmount: number;
  expenseCount: number;
  receiptCount: number;
}

export interface GlobalDashboardStats {
  totalProjects: number;
  totalFundsReceived: number;
  totalExpensesWithVat: number;
  totalExpensesBase: number;
  totalVatPaid: number;
  netAvailableBalance: number;
  totalPendingBillsAmount: number;
  totalPendingBillsCount: number;
  projectSummaries: ProjectSummary[];
}

export interface SupervisorItem {
  id: string;
  name: string;
  phone?: string | null;
  role: string;
  notes?: string | null;
}

export async function getAllSupervisors(): Promise<SupervisorItem[]> {
  try {
    const list = await prisma.supervisor.findMany({
      orderBy: { name: 'asc' },
    });
    if (list.length > 0) return list;
  } catch (err: any) {
    console.warn('Prisma getAllSupervisors query failed:', err?.message);
  }
  return [
    { id: 'sup-1', name: 'Rizwan Saleem', phone: '+971 50 123 4567', role: 'Operations & Accounts Lead' },
    { id: 'sup-2', name: 'Jeromy', phone: '+971 50 234 5678', role: 'Field Supervisor (Lulu & Coops)' },
    { id: 'sup-3', name: 'Rona', phone: '+971 50 345 6789', role: 'Field Supervisor (Fujairah / Dibba)' },
    { id: 'sup-4', name: 'Aisha', phone: '+971 50 456 7890', role: 'Field Supervisor (Dibba / Sharjah)' },
    { id: 'sup-5', name: 'Rahla', phone: '+971 50 567 8901', role: 'Field Supervisor (Sampling Activations)' },
  ];
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    await ensureDbSeeded();
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
    });
    if (projects.length > 0) return projects;
  } catch (err: any) {
    console.warn('Prisma project query failed, using offline fallback:', err?.message);
  }
  return getFallbackProjects();
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    await ensureDbSeeded();
    const project = await prisma.project.findUnique({
      where: { id },
    });
    if (project) return project;
  } catch (err: any) {
    console.warn(`Prisma getProjectById(${id}) query failed:`, err?.message);
  }
  const fallback = getFallbackProjects().find((p) => p.id === id);
  return fallback || null;
}

function getFallbackProjects(): Project[] {
  return [
    { id: 'sadia', name: 'Sadia', code: 'SADIA', category: 'Project', color: '#dc2626', createdAt: new Date() },
    { id: 'lesieur', name: 'Lesieur', code: 'LESIEUR', category: 'Project', color: '#ea580c', createdAt: new Date() },
    { id: 'listerine', name: 'Listerine', code: 'LISTERINE', category: 'Project', color: '#0284c7', createdAt: new Date() },
    { id: 'remarkable', name: 'reMARKABLE', code: 'REMARKABLE', category: 'Project', color: '#4f46e5', createdAt: new Date() },
    { id: 'india-gate', name: 'India Gate', code: 'INDIA_GATE', category: 'Project', color: '#16a34a', createdAt: new Date() },
    { id: 'la-lushe', name: 'LA LUSHE', code: 'LA_LUSHE', category: 'Project', color: '#db2777', createdAt: new Date() },
    { id: 'jbaby', name: 'Jbaby', code: 'JBABY', category: 'Project', color: '#0891b2', createdAt: new Date() },
    { id: 'energizer', name: 'Energizer', code: 'ENERGIZER', category: 'Project', color: '#eab308', createdAt: new Date() },
    { id: 'french-apple', name: 'French Apple', code: 'FRENCH_APPLE', category: 'Project', color: '#84cc16', createdAt: new Date() },
    { id: 'colgate', name: 'Colgate', code: 'COLGATE', category: 'Project', color: '#e11d48', createdAt: new Date() },
    { id: 'aveeno', name: 'Aveeno', code: 'AVEENO', category: 'Project', color: '#65a30d', createdAt: new Date() },
    { id: 'french-cheese', name: 'French Cheese', code: 'FRENCH_CHEESE', category: 'Project', color: '#f59e0b', createdAt: new Date() },
    { id: 'kenvue', name: 'Kenvue / NTG', code: 'KENVUE', category: 'Project', color: '#059669', createdAt: new Date() },
    { id: 'usa-cheese', name: 'USA Cheese', code: 'USA_CHEESE', category: 'Project', color: '#d97706', createdAt: new Date() },
    { id: 'taste-of-dubai', name: 'Taste Of Dubai', code: 'TASTE_OF_DUBAI', category: 'Event', color: '#9333ea', createdAt: new Date() },
    { id: 'pinar', name: 'Pinar', code: 'PINAR', category: 'Project', color: '#2563eb', createdAt: new Date() },
    { id: 'stayfree', name: 'Stayfree', code: 'STAYFREE', category: 'Project', color: '#c026d3', createdAt: new Date() },
    { id: 'ogx', name: 'OGX', code: 'OGX', category: 'Project', color: '#475569', createdAt: new Date() },
    { id: 'van-expenses', name: 'Van Expenses', code: 'VAN_EXPENSES', category: 'Logistics', color: '#0284c7', createdAt: new Date() },
    { id: 'van-renewal', name: 'Van Renewal Expenses', code: 'VAN_RENEWAL', category: 'Logistics', color: '#0d9488', createdAt: new Date() },
    { id: 'warehouse-petty-cash', name: 'Warehouse Petty Cash', code: 'WAREHOUSE_PETTY_CASH', category: 'Petty Cash', color: '#7c3aed', createdAt: new Date() },
  ];
}

export async function getProjectLedger(projectId: string): Promise<{
  summary: ProjectSummary;
  ledger: ProjectLedgerRow[];
  receipts: FundReceipt[];
  expenses: Expense[];
}> {
  await ensureDbSeeded();
  let project: Project | null = null;
  let receipts: FundReceipt[] = [];
  let expenses: Expense[] = [];

  try {
    project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (project) {
      receipts = await prisma.fundReceipt.findMany({
        where: { projectId },
        orderBy: [{ receivedDate: 'asc' }, { createdAt: 'asc' }],
      });

      expenses = await prisma.expense.findMany({
        where: { projectId },
        orderBy: [{ expenseDate: 'asc' }, { createdAt: 'asc' }],
      });
    }
  } catch (err: any) {
    console.warn(`Database query for project ${projectId} failed, using local fallback:`, err?.message);
  }

  if (!project) {
    project = getFallbackProjects().find((p) => p.id === projectId) || {
      id: projectId,
      name: projectId.replace(/-/g, ' ').toUpperCase(),
      code: projectId.toUpperCase().replace(/-/g, '_'),
      category: 'Project',
      createdAt: new Date(),
    };
  }

  type UnifiedItem = {
    type: 'fund' | 'expense';
    item: FundReceipt | Expense;
    sortDate: string;
    sortOrder: number;
  };

  const unified: UnifiedItem[] = [];

  for (const r of receipts) {
    unified.push({
      type: 'fund',
      item: r,
      sortDate: r.receivedDate,
      sortOrder: 1,
    });
  }

  for (const e of expenses) {
    unified.push({
      type: 'expense',
      item: e,
      sortDate: e.expenseDate,
      sortOrder: 2,
    });
  }

  unified.sort((a, b) => {
    if (a.sortDate !== b.sortDate) {
      return a.sortDate.localeCompare(b.sortDate);
    }
    return a.sortOrder - b.sortOrder;
  });

  let runningBalance = 0;
  let totalReceived = 0;
  let totalSpentBase = 0;
  let totalVat = 0;
  let totalSpentWithVat = 0;
  let pendingBillsCount = 0;
  let pendingBillsAmount = 0;

  const ledger: ProjectLedgerRow[] = [];

  for (const entry of unified) {
    if (entry.type === 'fund') {
      const fund = entry.item as FundReceipt;
      const dt = parseDateAndTime(fund.receivedDate, fund.createdAt);
      totalReceived += fund.amount;
      const availableCredit = runningBalance + fund.amount;
      runningBalance = availableCredit;

      ledger.push({
        id: fund.id,
        type: 'fund',
        date: dt.date,
        time: dt.time,
        full_date: dt.full,
        purpose: fund.receivedFrom ? `Fund Received: ${fund.receivedFrom}` : 'Fund Received',
        amount: 0,
        vat_rate: 0,
        vat_amount: 0,
        total_amount: 0,
        received: fund.amount,
        date_received: dt.date,
        time_received: dt.time,
        available_credit: availableCredit,
        balance: runningBalance,
        remarks: fund.notes || undefined,
      });
    } else {
      const exp = entry.item as Expense;
      const dt = parseDateAndTime(exp.expenseDate, exp.createdAt);
      totalSpentBase += exp.amount;
      totalVat += exp.vatAmount;
      totalSpentWithVat += exp.totalAmount;

      if (exp.billStatus === 'Pending To Submit' || exp.billStatus === 'Pending') {
        pendingBillsCount++;
        pendingBillsAmount += exp.totalAmount;
      }

      const availableCredit = runningBalance;
      runningBalance = availableCredit - exp.totalAmount;

      ledger.push({
        id: exp.id,
        type: 'expense',
        date: dt.date,
        time: dt.time,
        full_date: dt.full,
        purpose: exp.purpose,
        amount: exp.amount,
        vat_rate: exp.vatRate,
        vat_amount: exp.vatAmount,
        total_amount: exp.totalAmount,
        bill_status: exp.billStatus,
        received: 0,
        available_credit: availableCredit,
        balance: runningBalance,
        supervisor_name: exp.supervisorName || undefined,
        remarks: exp.remarks || undefined,
      });
    }
  }

  const summary: ProjectSummary = {
    project,
    totalReceived,
    totalSpentBase,
    totalVat,
    totalSpentWithVat,
    currentBalance: runningBalance,
    pendingBillsCount,
    pendingBillsAmount,
    expenseCount: expenses.length,
    receiptCount: receipts.length,
  };

  return {
    summary,
    ledger: ledger.reverse(),
    receipts,
    expenses,
  };
}

export async function getGlobalDashboardStats(): Promise<GlobalDashboardStats> {
  try {
    const projects = await getAllProjects();
    const projectSummaries: ProjectSummary[] = [];

    let totalFundsReceived = 0;
    let totalExpensesWithVat = 0;
    let totalExpensesBase = 0;
    let totalVatPaid = 0;
    let totalPendingBillsAmount = 0;
    let totalPendingBillsCount = 0;

    for (const proj of projects) {
      try {
        const { summary } = await getProjectLedger(proj.id);
        projectSummaries.push(summary);

        totalFundsReceived += summary.totalReceived;
        totalExpensesWithVat += summary.totalSpentWithVat;
        totalExpensesBase += summary.totalSpentBase;
        totalVatPaid += summary.totalVat;
        totalPendingBillsAmount += summary.pendingBillsAmount;
        totalPendingBillsCount += summary.pendingBillsCount;
      } catch (err) {
        console.error(`Error loading ledger for ${proj.id}:`, err);
      }
    }

    return {
      totalProjects: projects.length,
      totalFundsReceived,
      totalExpensesWithVat,
      totalExpensesBase,
      totalVatPaid,
      netAvailableBalance: totalFundsReceived - totalExpensesWithVat,
      totalPendingBillsAmount,
      totalPendingBillsCount,
      projectSummaries,
    };
  } catch (err) {
    console.error('Error in getGlobalDashboardStats:', err);
    return {
      totalProjects: 0,
      totalFundsReceived: 0,
      totalExpensesWithVat: 0,
      totalExpensesBase: 0,
      totalVatPaid: 0,
      netAvailableBalance: 0,
      totalPendingBillsAmount: 0,
      totalPendingBillsCount: 0,
      projectSummaries: [],
    };
  }
}
