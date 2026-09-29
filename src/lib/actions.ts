'use server';

import { getDb, seedFromInitialData } from './db';
import { revalidatePath } from 'next/cache';

export async function recordFundReceipt(data: {
  projectId: string;
  amount: number;
  receivedDate: string;
  receivedFrom?: string;
  notes?: string;
}) {
  const db = getDb();
  const id = `fund-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  db.prepare(`
    INSERT INTO fund_receipts (id, project_id, amount, received_date, received_from, notes)
    VALUES (@id, @projectId, @amount, @receivedDate, @receivedFrom, @notes)
  `).run({
    id,
    projectId: data.projectId,
    amount: Number(data.amount),
    receivedDate: data.receivedDate || new Date().toISOString().split('T')[0],
    receivedFrom: data.receivedFrom || null,
    notes: data.notes || null,
  });

  revalidatePath('/');
  revalidatePath(`/projects/${data.projectId}`);
  return { success: true, id };
}

export async function recordExpense(data: {
  projectId: string;
  expenseDate: string;
  purpose: string;
  amount: number;
  vatRate: number; // 0.05 or 0.00
  billStatus: string;
  supervisorName?: string;
  remarks?: string;
}) {
  const db = getDb();
  const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const baseAmt = Number(data.amount);
  const vatRate = Number(data.vatRate);
  const vatAmount = Number((baseAmt * vatRate).toFixed(2));
  const totalAmount = Number((baseAmt + vatAmount).toFixed(2));

  db.prepare(`
    INSERT INTO expenses (id, project_id, expense_date, purpose, amount, vat_rate, vat_amount, total_amount, bill_status, supervisor_name, remarks)
    VALUES (@id, @projectId, @expenseDate, @purpose, @amount, @vatRate, @vatAmount, @totalAmount, @billStatus, @supervisorName, @remarks)
  `).run({
    id,
    projectId: data.projectId,
    expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
    purpose: data.purpose,
    amount: baseAmt,
    vatRate,
    vatAmount,
    totalAmount,
    billStatus: data.billStatus || 'Pending To Submit',
    supervisorName: data.supervisorName || null,
    remarks: data.remarks || null,
  });

  revalidatePath('/');
  revalidatePath(`/projects/${data.projectId}`);
  revalidatePath('/supervisors');
  return { success: true, id };
}

export async function updateExpenseStatus(id: string, newStatus: string, projectId: string) {
  const db = getDb();
  db.prepare(`
    UPDATE expenses SET bill_status = ? WHERE id = ?
  `).run(newStatus, id);

  revalidatePath('/');
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteTransaction(id: string, type: 'fund' | 'expense', projectId: string) {
  const db = getDb();
  if (type === 'fund') {
    db.prepare('DELETE FROM fund_receipts WHERE id = ?').run(id);
  } else {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  }

  revalidatePath('/');
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function createNewProject(data: {
  name: string;
  category: string;
  color?: string;
  description?: string;
}) {
  const db = getDb();
  const id = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  db.prepare(`
    INSERT INTO projects (id, name, code, category, color, description)
    VALUES (@id, @name, @code, @category, @color, @description)
  `).run({
    id,
    name: data.name,
    code: id.toUpperCase().replace(/-/g, '_'),
    category: data.category || 'Project',
    color: data.color || '#2563eb',
    description: data.description || null,
  });

  revalidatePath('/');
  return { success: true, id };
}

export async function resetAndReseedDatabase() {
  const db = getDb();
  db.exec(`
    DELETE FROM expenses;
    DELETE FROM fund_receipts;
    DELETE FROM projects;
  `);
  seedFromInitialData(db);
  revalidatePath('/');
  return { success: true };
}
