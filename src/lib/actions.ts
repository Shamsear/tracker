'use server';

import { prisma, seedFromInitialData } from './db';
import { revalidatePath } from 'next/cache';
import { authenticateUser, createSessionToken, setSessionCookie, clearSessionCookie, getSession } from './auth';

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const { user, error } = await authenticateUser(email, password);
    if (!user || error) {
      return { success: false, error: error || 'Invalid email or password' };
    }

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return { success: true, user: { email: user.email, name: user.name, role: user.role } };
  } catch (err: unknown) {
    console.error('Login action error:', err instanceof Error ? err.message : String(err));
    return { success: false, error: 'An error occurred during authentication' };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath('/');
  return { success: true };
}

export async function getCurrentUserAction() {
  return await getSession();
}


export async function recordFundReceipt(data: {
  projectId: string;
  amount: number;
  receivedDate: string;
  receivedFrom?: string;
  notes?: string;
}) {
  const id = `fund-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const created = await prisma.fundReceipt.create({
    data: {
      id,
      projectId: data.projectId,
      amount: Number(data.amount),
      receivedDate: data.receivedDate || new Date().toISOString().split('T')[0],
      receivedFrom: data.receivedFrom || null,
      notes: data.notes || null,
    },
  });

  revalidatePath('/');
  revalidatePath(`/projects/${data.projectId}`);
  return { success: true, id: created.id };
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
  const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const baseAmt = Number(data.amount);
  const vatRate = Number(data.vatRate);
  const vatAmount = Number((baseAmt * vatRate).toFixed(2));
  const totalAmount = Number((baseAmt + vatAmount).toFixed(2));

  const created = await prisma.expense.create({
    data: {
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
    },
  });

  revalidatePath('/');
  revalidatePath(`/projects/${data.projectId}`);
  revalidatePath('/supervisors');
  return { success: true, id: created.id };
}

export async function updateExpenseStatus(id: string, newStatus: string, projectId: string) {
  await prisma.expense.update({
    where: { id },
    data: { billStatus: newStatus },
  });

  revalidatePath('/');
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteTransaction(id: string, type: 'fund' | 'expense', projectId: string) {
  if (type === 'fund') {
    await prisma.fundReceipt.delete({ where: { id } });
  } else {
    await prisma.expense.delete({ where: { id } });
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
  initialFund?: number;
}) {
  let id = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!id) id = `proj-${Date.now()}`;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (existing) {
    id = `${id}-${Date.now().toString().slice(-4)}`;
  }

  const project = await prisma.project.create({
    data: {
      id,
      name: data.name.trim(),
      code: id.toUpperCase().replace(/-/g, '_'),
      category: data.category || 'Project',
      sheetName: data.name.trim(),
      color: data.color || '#2563eb',
      description: data.description || null,
    },
  });

  if (data.initialFund && data.initialFund > 0) {
    const fundId = `fund-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await prisma.fundReceipt.create({
      data: {
        id: fundId,
        projectId: project.id,
        amount: Number(data.initialFund),
        receivedDate: new Date().toISOString().split('T')[0],
        receivedFrom: 'Opening Balance Deposit',
        notes: 'Initial Project Float',
      },
    });
  }

  revalidatePath('/');
  return { success: true, id: project.id };
}

export async function createSupervisor(data: {
  name: string;
  phone?: string;
  role?: string;
  notes?: string;
}) {
  const id = `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const supervisor = await prisma.supervisor.create({
    data: {
      id,
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      role: data.role?.trim() || 'Field Supervisor',
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath('/supervisors');
  return { success: true, id: supervisor.id };
}

export async function resetAndReseedDatabase() {
  await prisma.expense.deleteMany();
  await prisma.fundReceipt.deleteMany();
  await prisma.project.deleteMany();
  await seedFromInitialData();
  revalidatePath('/');
  return { success: true };
}
