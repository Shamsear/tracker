import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAllProjects, getProjectLedger, getGlobalDashboardStats } from '@/lib/ledger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const wb = XLSX.utils.book_new();

    if (projectId) {
      // Export single project sheet
      const { summary, ledger } = getProjectLedger(projectId);
      const rows = ledger.map((row) => ({
        DATE: row.date,
        Purpose: row.purpose,
        Amount: row.amount || '',
        Vat: row.vat_amount || '',
        'Total Amount + Vat': row.total_amount || '',
        'Bill Status': row.bill_status || (row.type === 'fund' ? 'Credited' : ''),
        'AVAILABLE CREDIT': row.available_credit.toFixed(2),
        BALANCE: row.balance.toFixed(2),
        Received: row.received || '',
        'Date Amount Received': row.date_received || '',
        Remarks: row.remarks || '',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, summary.project.name.substring(0, 31));
    } else {
      // Export Master Balance Sheet + All Projects
      const stats = getGlobalDashboardStats();

      // Master Summary Sheet
      const masterRows = stats.projectSummaries.map((s) => ({
        'Project Name': s.project.name,
        Category: s.project.category,
        'Total Received (AED)': s.totalReceived.toFixed(2),
        'Total Spent Base (AED)': s.totalSpentBase.toFixed(2),
        'Total VAT Paid (AED)': s.totalVat.toFixed(2),
        'Total Spent Inc. VAT (AED)': s.totalSpentWithVat.toFixed(2),
        'Current Balance (AED)': s.currentBalance.toFixed(2),
        'Pending Bills Count': s.pendingBillsCount,
        'Pending Bills Amount (AED)': s.pendingBillsAmount.toFixed(2),
      }));

      const masterWs = XLSX.utils.json_to_sheet(masterRows);
      XLSX.utils.book_append_sheet(wb, masterWs, 'MASTER_SUMMARY');

      // Individual Sheets
      const projects = getAllProjects();
      for (const p of projects) {
        const { ledger } = getProjectLedger(p.id);
        const pRows = ledger.map((row) => ({
          DATE: row.date,
          Purpose: row.purpose,
          Amount: row.amount || '',
          Vat: row.vat_amount || '',
          'Total Amount + Vat': row.total_amount || '',
          'Bill Status': row.bill_status || '',
          'AVAILABLE CREDIT': row.available_credit.toFixed(2),
          BALANCE: row.balance.toFixed(2),
          Received: row.received || '',
          'Date Amount Received': row.date_received || '',
          Remarks: row.remarks || '',
        }));

        const pWs = XLSX.utils.json_to_sheet(pRows);
        const safeName = p.name.replace(/[\/\\\?\*\]\[:]/g, '_').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, pWs, safeName);
      }
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Expense_Tracker_Export_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
