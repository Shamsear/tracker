import { getDb } from './db';

export interface Project {
  id: string;
  name: string;
  code: string;
  category: string;
  sheet_name?: string;
  color: string;
  description?: string;
  created_at: string;
}

export interface FundReceipt {
  id: string;
  project_id: string;
  amount: number;
  received_date: string;
  received_from?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  project_id: string;
  expense_date: string;
  purpose: string;
  amount: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  bill_status: 'Pending To Submit' | 'Submitted' | 'Approved' | 'Closed' | string;
  supervisor_name?: string;
  remarks?: string;
  receipt_image?: string;
  created_at: string;
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

/**
 * Fetch all projects
 */
export function getAllProjects(): Project[] {
  const db = getDb();
  return db.prepare('SELECT * FROM projects ORDER BY name ASC').all() as Project[];
}

/**
 * Fetch single project by ID
 */
export function getProjectById(id: string): Project | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
}

/**
 * Computes exact chronological ledger for a project matching Excel formula:
 * Available Credit = Previous Balance + Received Amount
 * Balance = Available Credit - Total Expense Amount
 */
export function getProjectLedger(projectId: string): {
  summary: ProjectSummary;
  ledger: ProjectLedgerRow[];
  receipts: FundReceipt[];
  expenses: Expense[];
} {
  const db = getDb();
  const project = getProjectById(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const receipts = db
    .prepare('SELECT * FROM fund_receipts WHERE project_id = ? ORDER BY received_date ASC, created_at ASC')
    .all(projectId) as FundReceipt[];

  const expenses = db
    .prepare('SELECT * FROM expenses WHERE project_id = ? ORDER BY expense_date ASC, created_at ASC')
    .all(projectId) as Expense[];

  // Merge items into unified chronological sequence
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
      sortDate: r.received_date,
      sortOrder: 1, // Funds credited first on same date
    });
  }

  for (const e of expenses) {
    unified.push({
      type: 'expense',
      item: e,
      sortDate: e.expense_date,
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
      runningBalance = availableCredit; // Balance before any expense is available credit

      ledger.push({
        id: fund.id,
        type: 'fund',
        date: fund.received_date,
        purpose: fund.received_from ? `Fund Received: ${fund.received_from}` : 'Fund Received',
        amount: 0,
        vat_rate: 0,
        vat_amount: 0,
        total_amount: 0,
        received: fund.amount,
        date_received: fund.received_date,
        available_credit: availableCredit,
        balance: runningBalance,
        remarks: fund.notes || undefined,
      });
    } else {
      const exp = entry.item as Expense;
      totalSpentBase += exp.amount;
      totalVat += exp.vat_amount;
      totalSpentWithVat += exp.total_amount;

      if (exp.bill_status === 'Pending To Submit' || exp.bill_status === 'Pending') {
        pendingBillsCount++;
        pendingBillsAmount += exp.total_amount;
      }

      const availableCredit = runningBalance;
      runningBalance = availableCredit - exp.total_amount;

      ledger.push({
        id: exp.id,
        type: 'expense',
        date: exp.expense_date,
        purpose: exp.purpose,
        amount: exp.amount,
        vat_rate: exp.vat_rate,
        vat_amount: exp.vat_amount,
        total_amount: exp.total_amount,
        bill_status: exp.bill_status,
        received: 0,
        available_credit: availableCredit,
        balance: runningBalance,
        supervisor_name: exp.supervisor_name || undefined,
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
    ledger: ledger.reverse(), // most recent at top for viewing
    receipts,
    expenses,
  };
}

/**
 * Calculates global stats for the entire application dashboard
 */
export function getGlobalDashboardStats(): GlobalDashboardStats {
  const projects = getAllProjects();
  const projectSummaries: ProjectSummary[] = [];

  let totalFundsReceived = 0;
  let totalExpensesWithVat = 0;
  let totalExpensesBase = 0;
  let totalVatPaid = 0;
  let totalPendingBillsAmount = 0;
  let totalPendingBillsCount = 0;

  for (const proj of projects) {
    const { summary } = getProjectLedger(proj.id);
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

/**
 * Currency formatter for UAE Dirhams (AED) or custom prefix
 */
export function formatCurrency(amount: number, currency: string = 'AED'): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount < 0) {
    return `-${currency} ${formatted}`;
  }
  return `${currency} ${formatted}`;
}
