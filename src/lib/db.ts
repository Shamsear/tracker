import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'tracker.db');

// Global singleton for better-sqlite3 in Next.js development & production
const globalForDb = globalThis as unknown as {
  dbInstance: Database.Database | undefined;
};

export function getDb(): Database.Database {
  if (!globalForDb.dbInstance) {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables(db);
    globalForDb.dbInstance = db;
  }
  return globalForDb.dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Project',
      sheet_name TEXT,
      color TEXT DEFAULT '#2563eb',
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fund_receipts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      amount REAL NOT NULL,
      received_date TEXT NOT NULL,
      received_from TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      expense_date TEXT NOT NULL,
      purpose TEXT NOT NULL,
      amount REAL NOT NULL,
      vat_rate REAL DEFAULT 0.05,
      vat_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      bill_status TEXT DEFAULT 'Pending To Submit',
      supervisor_name TEXT,
      remarks TEXT,
      receipt_image TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS supervisors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      phone TEXT,
      role TEXT DEFAULT 'Supervisor',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Check if seeded
  const count = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (count.count === 0) {
    seedFromInitialData(db);
  }
}

export function seedFromInitialData(db: Database.Database) {
  const seedPath = path.join(process.cwd(), 'src', 'data', 'seed_data.json');
  if (!fs.existsSync(seedPath)) {
    return;
  }

  const rawData = fs.readFileSync(seedPath, 'utf-8');
  const seedData: Record<string, any[]> = JSON.parse(rawData);

  const insertProject = db.prepare(`
    INSERT OR REPLACE INTO projects (id, name, code, category, sheet_name, color, description)
    VALUES (@id, @name, @code, @category, @sheet_name, @color, @description)
  `);

  const insertFund = db.prepare(`
    INSERT INTO fund_receipts (id, project_id, amount, received_date, received_from, notes)
    VALUES (@id, @project_id, @amount, @received_date, @received_from, @notes)
  `);

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, project_id, expense_date, purpose, amount, vat_rate, vat_amount, total_amount, bill_status, supervisor_name, remarks)
    VALUES (@id, @project_id, @expense_date, @purpose, @amount, @vat_rate, @vat_amount, @total_amount, @bill_status, @supervisor_name, @remarks)
  `);

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

  const seedTx = db.transaction(() => {
    // 1. Insert all projects
    for (const [sheetName, proj] of Object.entries(projectMap)) {
      insertProject.run({
        id: proj.id,
        name: proj.name,
        code: proj.id.toUpperCase().replace(/-/g, '_'),
        category: proj.category,
        sheet_name: sheetName,
        color: proj.color,
        description: `Ledger for ${proj.name} synced from Excel master`,
      });
    }

    // 2. Insert records from seed data
    let fundCount = 0;
    let expCount = 0;

    for (const [sheetName, records] of Object.entries(seedData)) {
      const proj = projectMap[sheetName];
      if (!proj) continue;

      for (let i = 0; i < records.length; i++) {
        const item = records[i];

        // If it has received funds
        if (item.received && item.received > 0) {
          fundCount++;
          const recDate = item.date_received || item.expense_date || '2025-05-01';
          insertFund.run({
            id: `fund-${proj.id}-${fundCount}`,
            project_id: proj.id,
            amount: Number(item.received),
            received_date: recDate,
            received_from: item.remarks && item.remarks.includes('Received') ? item.remarks : 'Head Office / Accounts',
            notes: item.remarks || 'Initial Excel Inflow',
          });
        }

        // If it has expense amount or purpose
        if (item.amount > 0 || (item.purpose && item.purpose !== 'Fund Received' && item.total > 0)) {
          expCount++;
          const expDate = item.expense_date || '2025-05-01';
          const amt = Number(item.amount) || Number(item.total) || 0;
          const vat = Number(item.vat) || 0;
          const total = Number(item.total) || (amt + vat);
          const vatRate = amt > 0 ? Number((vat / amt).toFixed(2)) : 0.05;

          insertExpense.run({
            id: `exp-${proj.id}-${expCount}`,
            project_id: proj.id,
            expense_date: expDate,
            purpose: item.purpose || 'Project Expense',
            amount: amt,
            vat_rate: vatRate > 0 ? 0.05 : 0.0,
            vat_amount: vat,
            total_amount: total,
            bill_status: item.bill_status || 'Closed',
            supervisor_name: null,
            remarks: item.remarks || null,
          });
        }
      }
    }

    // Default Supervisors
    const insertSup = db.prepare(`
      INSERT OR IGNORE INTO supervisors (id, name, phone, role)
      VALUES (@id, @name, @phone, @role)
    `);

    insertSup.run({ id: 'sup-1', name: 'Rizwan Saleem', phone: '+971501234567', role: 'Operations Manager' });
    insertSup.run({ id: 'sup-2', name: 'Jeromy', phone: '+971502345678', role: 'Field Supervisor' });
    insertSup.run({ id: 'sup-3', name: 'Rona', phone: '+971503456789', role: 'Field Supervisor' });
    insertSup.run({ id: 'sup-4', name: 'Aisha', phone: '+971504567890', role: 'Field Supervisor' });
    insertSup.run({ id: 'sup-5', name: 'Rahla', phone: '+971505678901', role: 'Field Supervisor' });

    console.log(`Seeded DB with ${fundCount} receipts and ${expCount} expenses!`);
  });

  seedTx();
}
