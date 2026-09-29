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
  purpose: string;
  amount: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  bill_status?: string;
  received: number;
  date_received?: string;
  available_credit: number;
  balance: number;
  supervisor_name?: string;
  remarks?: string;
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

export async function getAllProjects(): Promise<Project[]> {
  try {
    await ensureDbSeeded();
    return await prisma.project.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (err) {
    console.error('Error in getAllProjects:', err);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    await ensureDbSeeded();
    return await prisma.project.findUnique({
      where: { id },
    });
  } catch (err) {
    console.error(`Error in getProjectById(${id}):`, err);
    return null;
  }
}

export async function getProjectLedger(projectId: string): Promise<{
  summary: ProjectSummary;
  ledger: ProjectLedgerRow[];
  receipts: FundReceipt[];
  expenses: Expense[];
}> {
  await ensureDbSeeded();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const receipts = await prisma.fundReceipt.findMany({
    where: { projectId },
    orderBy: [{ receivedDate: 'asc' }, { createdAt: 'asc' }],
  });

  const expenses = await prisma.expense.findMany({
    where: { projectId },
    orderBy: [{ expenseDate: 'asc' }, { createdAt: 'asc' }],
  });

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
      totalReceived += fund.amount;
      const availableCredit = runningBalance + fund.amount;
      runningBalance = availableCredit;

      ledger.push({
        id: fund.id,
        type: 'fund',
        date: fund.receivedDate,
        purpose: fund.receivedFrom ? `Fund Received: ${fund.receivedFrom}` : 'Fund Received',
        amount: 0,
        vat_rate: 0,
        vat_amount: 0,
        total_amount: 0,
        received: fund.amount,
        date_received: fund.receivedDate,
        available_credit: availableCredit,
        balance: runningBalance,
        remarks: fund.notes || undefined,
      });
    } else {
      const exp = entry.item as Expense;
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
        date: exp.expenseDate,
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
  const projects = await getAllProjects();
  const projectSummaries: ProjectSummary[] = [];

  let totalFundsReceived = 0;
  let totalExpensesWithVat = 0;
  let totalExpensesBase = 0;
  let totalVatPaid = 0;
  let totalPendingBillsAmount = 0;
  let totalPendingBillsCount = 0;

  for (const proj of projects) {
    const { summary } = await getProjectLedger(proj.id);
    projectSummaries.push(summary);

    totalFundsReceived += summary.totalReceived;
    totalExpensesWithVat += summary.totalSpentWithVat;
    totalExpensesBase += summary.totalSpentBase;
    totalVatPaid += summary.totalVat;
    totalPendingBillsAmount += summary.pendingBillsAmount;
    totalPendingBillsCount += summary.pendingBillsCount;
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
}
