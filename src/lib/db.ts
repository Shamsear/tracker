import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function ensureDbSeeded() {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('ep-your-database')) {
      console.warn('DATABASE_URL is not set or using placeholder.');
      return;
    }
    const count = await prisma.project.count();
    if (count === 0) {
      await seedFromInitialData();
    }
  } catch (err: any) {
    console.warn('Database seeding check skipped (DB may be offline during build):', err.message);
  }
}

export async function seedFromInitialData() {
  const seedPath = path.join(process.cwd(), 'src', 'data', 'seed_data.json');
  if (!fs.existsSync(seedPath)) {
    return;
  }

  const rawData = fs.readFileSync(seedPath, 'utf-8');
  const seedData: Record<string, any[]> = JSON.parse(rawData);

  const projectMap: Record<string, { id: string; name: string; category: string; color: string }> = {
    'Sadia Project Expense Balance': { id: 'sadia', name: 'Sadia', category: 'Project', color: '#dc2626' },
    'Lesieur Project Expense Balan': { id: 'lesieur', name: 'Lesieur', category: 'Project', color: '#ea580c' },
    'Listerine Project Expense Balan': { id: 'listerine', name: 'Listerine', category: 'Project', color: '#0284c7' },
    'reMARKABL Project Expense Balan': { id: 'remarkable', name: 'reMARKABLE', category: 'Project', color: '#4f46e5' },
    'India Gat Project Expense Balan': { id: 'india-gate', name: 'India Gate', category: 'Project', color: '#16a34a' },
    'LA LUSHE': { id: 'la-lushe', name: 'LA LUSHE', category: 'Project', color: '#db2777' },
    'Jbaby Project Expense Balance': { id: 'jbaby', name: 'Jbaby', category: 'Project', color: '#0891b2' },
    'Energizer': { id: 'energizer', name: 'Energizer', category: 'Project', color: '#eab308' },
    'French Apple': { id: 'french-apple', name: 'French Apple', category: 'Project', color: '#84cc16' },
    'Colgate': { id: 'colgate', name: 'Colgate', category: 'Project', color: '#e11d48' },
    'Aveeno': { id: 'aveeno', name: 'Aveeno', category: 'Project', color: '#65a30d' },
    'Frnech Cheese': { id: 'french-cheese', name: 'French Cheese', category: 'Project', color: '#f59e0b' },
    'Kenvue': { id: 'kenvue', name: 'Kenvue / NTG', category: 'Project', color: '#059669' },
    'USA CHEESE': { id: 'usa-cheese', name: 'USA Cheese', category: 'Project', color: '#d97706' },
    'Taste Of Dubai': { id: 'taste-of-dubai', name: 'Taste Of Dubai', category: 'Event', color: '#9333ea' },
    'Pinar': { id: 'pinar', name: 'Pinar', category: 'Project', color: '#2563eb' },
    'Stayfree': { id: 'stayfree', name: 'Stayfree', category: 'Project', color: '#c026d3' },
    'OGX': { id: 'ogx', name: 'OGX', category: 'Project', color: '#475569' },
    'Van Expenses': { id: 'van-expenses', name: 'Van Expenses', category: 'Logistics', color: '#0284c7' },
    'Van Renewal Expenses': { id: 'van-renewal', name: 'Van Renewal Expenses', category: 'Logistics', color: '#0d9488' },
    'Warehouse Petty cash': { id: 'warehouse-petty-cash', name: 'Warehouse Petty Cash', category: 'Petty Cash', color: '#7c3aed' },
  };

  // 1. Insert projects
  for (const [sheetName, proj] of Object.entries(projectMap)) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: {},
      create: {
        id: proj.id,
        name: proj.name,
        code: proj.id.toUpperCase().replace(/-/g, '_'),
        category: proj.category,
        sheetName: sheetName,
        color: proj.color,
        description: `Ledger for ${proj.name} synced from Excel master`,
      },
    });
  }

  // 2. Insert records
  let fundCount = 0;
  let expCount = 0;

  const fundDataToInsert: any[] = [];
  const expDataToInsert: any[] = [];

  for (const [sheetName, records] of Object.entries(seedData)) {
    const proj = projectMap[sheetName];
    if (!proj) continue;

    for (let i = 0; i < records.length; i++) {
      const item = records[i];

      if (item.received && item.received > 0) {
        fundCount++;
        const recDate = item.date_received || item.expense_date || '2025-05-01';
        fundDataToInsert.push({
          id: `fund-${proj.id}-${fundCount}`,
          projectId: proj.id,
          amount: Number(item.received),
          receivedDate: recDate,
          receivedFrom: item.remarks && item.remarks.includes('Received') ? item.remarks : 'Head Office / Accounts',
          notes: item.remarks || 'Initial Excel Inflow',
        });
      }

      if (item.amount > 0 || (item.purpose && item.purpose !== 'Fund Received' && item.total > 0)) {
        expCount++;
        const expDate = item.expense_date || '2025-05-01';
        const amt = Number(item.amount) || Number(item.total) || 0;
        const vat = Number(item.vat) || 0;
        const total = Number(item.total) || (amt + vat);
        const vatRate = amt > 0 ? Number((vat / amt).toFixed(2)) : 0.05;

        expDataToInsert.push({
          id: `exp-${proj.id}-${expCount}`,
          projectId: proj.id,
          expenseDate: expDate,
          purpose: item.purpose || 'Project Expense',
          amount: amt,
          vatRate: vatRate > 0 ? 0.05 : 0.0,
          vatAmount: vat,
          totalAmount: total,
          billStatus: item.bill_status || 'Closed',
          supervisorName: null,
          remarks: item.remarks || null,
        });
      }
    }
  }

  if (fundDataToInsert.length > 0) {
    await prisma.fundReceipt.createMany({
      data: fundDataToInsert,
      skipDuplicates: true,
    });
  }

  if (expDataToInsert.length > 0) {
    await prisma.expense.createMany({
      data: expDataToInsert,
      skipDuplicates: true,
    });
  }

  // Supervisors
  const defaultSupervisors = [
    { id: 'sup-1', name: 'Rizwan Saleem', phone: '+971501234567', role: 'Operations Manager' },
    { id: 'sup-2', name: 'Jeromy', phone: '+971502345678', role: 'Field Supervisor' },
    { id: 'sup-3', name: 'Rona', phone: '+971503456789', role: 'Field Supervisor' },
    { id: 'sup-4', name: 'Aisha', phone: '+971504567890', role: 'Field Supervisor' },
    { id: 'sup-5', name: 'Rahla', phone: '+971505678901', role: 'Field Supervisor' },
  ];

  for (const sup of defaultSupervisors) {
    await prisma.supervisor.upsert({
      where: { id: sup.id },
      update: {},
      create: sup,
    });
  }

  console.log(`Successfully seeded Neon PostgreSQL with ${fundCount} receipts and ${expCount} expenses!`);
}
