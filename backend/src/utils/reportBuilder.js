// EcoSphere - Report data assembly + PDF / Excel / CSV export
// Owner: yagna
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { query } = require('../config/db');
const { computeScores } = require('./scoreCalculator');
const ApiError = require('./apiError');

/*
 * Shared filter model (all optional):
 *   department_id, employee_id, challenge_id, category_id, from, to
 * Custom reports additionally pass `module` to pick the dataset.
 */
function pushFilter(params, clauses, sql, value) {
  if (value === undefined || value === null || value === '') return;
  params.push(value);
  clauses.push(sql.replace('?', `$${params.length}`));
}

async function environmentalReport(filters) {
  const params = [];
  const clauses = [];
  pushFilter(params, clauses, 't.department_id = ?', filters.department_id);
  pushFilter(params, clauses, 't.transaction_date >= ?', filters.from);
  pushFilter(params, clauses, 't.transaction_date <= ?', filters.to);
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT t.transaction_date AS date, t.reference, t.source_type,
            f.name AS emission_factor, d.name AS department,
            t.quantity, t.unit, t.co2_amount
     FROM carbon_transactions t
     LEFT JOIN emission_factors f ON f.id = t.emission_factor_id
     LEFT JOIN departments d ON d.id = t.department_id
     ${where} ORDER BY t.transaction_date DESC`,
    params
  );
  const total = rows.reduce((sum, row) => sum + Number(row.co2_amount), 0);
  return {
    title: 'Environmental Report',
    columns: [
      { key: 'date', label: 'Date' }, { key: 'reference', label: 'Reference' },
      { key: 'source_type', label: 'Source' }, { key: 'emission_factor', label: 'Emission Factor' },
      { key: 'department', label: 'Department' }, { key: 'quantity', label: 'Quantity' },
      { key: 'unit', label: 'Unit' }, { key: 'co2_amount', label: 'CO2 (kg)' },
    ],
    rows,
    summary: [
      { label: 'Transactions', value: rows.length },
      { label: 'Total CO2 (kg)', value: Math.round(total * 100) / 100 },
    ],
  };
}

async function socialReport(filters) {
  const params = [];
  const clauses = [];
  pushFilter(params, clauses, 'u.department_id = ?', filters.department_id);
  pushFilter(params, clauses, 'p.employee_id = ?', filters.employee_id);
  pushFilter(params, clauses, 'a.category_id = ?', filters.category_id);
  pushFilter(params, clauses, 'p.created_at::date >= ?', filters.from);
  pushFilter(params, clauses, 'p.created_at::date <= ?', filters.to);
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT u.full_name AS employee, d.name AS department, a.title AS activity,
            c.name AS category, p.approval_status, p.points_earned, p.completion_date
     FROM employee_participations p
     JOIN users u ON u.id = p.employee_id
     LEFT JOIN departments d ON d.id = u.department_id
     JOIN csr_activities a ON a.id = p.activity_id
     LEFT JOIN categories c ON c.id = a.category_id
     ${where} ORDER BY p.id DESC`,
    params
  );
  return {
    title: 'Social Report',
    columns: [
      { key: 'employee', label: 'Employee' }, { key: 'department', label: 'Department' },
      { key: 'activity', label: 'CSR Activity' }, { key: 'category', label: 'Category' },
      { key: 'approval_status', label: 'Status' }, { key: 'points_earned', label: 'Points' },
      { key: 'completion_date', label: 'Completed' },
    ],
    rows,
    summary: [
      { label: 'Participations', value: rows.length },
      { label: 'Approved', value: rows.filter((row) => row.approval_status === 'approved').length },
      { label: 'Points awarded', value: rows.reduce((sum, row) => sum + row.points_earned, 0) },
    ],
  };
}

async function governanceReport(filters) {
  const params = [];
  const clauses = [];
  pushFilter(params, clauses, 'i.department_id = ?', filters.department_id);
  pushFilter(params, clauses, 'i.owner_id = ?', filters.employee_id);
  pushFilter(params, clauses, 'i.created_at::date >= ?', filters.from);
  pushFilter(params, clauses, 'i.created_at::date <= ?', filters.to);
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT i.title AS issue, i.severity, d.name AS department, u.full_name AS owner,
            a.title AS audit, i.due_date, i.status,
            (i.status != 'resolved' AND i.due_date < CURRENT_DATE) AS overdue
     FROM compliance_issues i
     LEFT JOIN departments d ON d.id = i.department_id
     LEFT JOIN users u ON u.id = i.owner_id
     LEFT JOIN audits a ON a.id = i.audit_id
     ${where} ORDER BY i.due_date ASC`,
    params
  );
  return {
    title: 'Governance Report',
    columns: [
      { key: 'issue', label: 'Compliance Issue' }, { key: 'severity', label: 'Severity' },
      { key: 'department', label: 'Department' }, { key: 'owner', label: 'Owner' },
      { key: 'audit', label: 'Audit' }, { key: 'due_date', label: 'Due Date' },
      { key: 'status', label: 'Status' }, { key: 'overdue', label: 'Overdue' },
    ],
    rows,
    summary: [
      { label: 'Issues', value: rows.length },
      { label: 'Open', value: rows.filter((row) => row.status !== 'resolved').length },
      { label: 'Overdue', value: rows.filter((row) => row.overdue).length },
    ],
  };
}

async function gamificationReport(filters) {
  const params = [];
  const clauses = [];
  pushFilter(params, clauses, 'u.department_id = ?', filters.department_id);
  pushFilter(params, clauses, 'p.employee_id = ?', filters.employee_id);
  pushFilter(params, clauses, 'p.challenge_id = ?', filters.challenge_id);
  pushFilter(params, clauses, 'ch.category_id = ?', filters.category_id);
  pushFilter(params, clauses, 'p.created_at::date >= ?', filters.from);
  pushFilter(params, clauses, 'p.created_at::date <= ?', filters.to);
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT u.full_name AS employee, d.name AS department, ch.title AS challenge,
            ch.difficulty, p.progress, p.approval_status, p.xp_awarded
     FROM challenge_participations p
     JOIN users u ON u.id = p.employee_id
     LEFT JOIN departments d ON d.id = u.department_id
     JOIN challenges ch ON ch.id = p.challenge_id
     ${where} ORDER BY p.id DESC`,
    params
  );
  return {
    title: 'Gamification Report',
    columns: [
      { key: 'employee', label: 'Employee' }, { key: 'department', label: 'Department' },
      { key: 'challenge', label: 'Challenge' }, { key: 'difficulty', label: 'Difficulty' },
      { key: 'progress', label: 'Progress %' }, { key: 'approval_status', label: 'Status' },
      { key: 'xp_awarded', label: 'XP Awarded' },
    ],
    rows,
    summary: [
      { label: 'Participations', value: rows.length },
      { label: 'XP awarded', value: rows.reduce((sum, row) => sum + row.xp_awarded, 0) },
    ],
  };
}

async function summaryReport() {
  const scores = await computeScores();
  const rows = scores.departments.map((dept) => ({
    department: dept.department_name,
    environmental: dept.environmental_score,
    social: dept.social_score,
    governance: dept.governance_score,
    total: dept.total_score,
  }));
  return {
    title: `ESG Summary Report (${scores.period})`,
    columns: [
      { key: 'department', label: 'Department' },
      { key: 'environmental', label: 'Environmental' }, { key: 'social', label: 'Social' },
      { key: 'governance', label: 'Governance' }, { key: 'total', label: 'Total Score' },
    ],
    rows,
    summary: [
      { label: 'Overall ESG Score', value: scores.overall.total },
      { label: 'Environmental', value: scores.overall.environmental },
      { label: 'Social', value: scores.overall.social },
      { label: 'Governance', value: scores.overall.governance },
    ],
  };
}

const BUILDERS = {
  environmental: environmentalReport,
  social: socialReport,
  governance: governanceReport,
  gamification: gamificationReport,
  summary: summaryReport,
};

async function buildReport(type, filters = {}) {
  // The custom builder passes `module` to choose the dataset.
  const key = type === 'custom' ? filters.module : type;
  const builder = BUILDERS[key];
  if (!builder) {
    throw new ApiError(400, `Unknown report type "${key}". Use: ${Object.keys(BUILDERS).join(', ')}.`);
  }
  const report = await builder(filters);
  if (type === 'custom') report.title = `Custom Report - ${report.title}`;
  return report;
}

// ----------------------------- exports -----------------------------

const csvEscape = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

function toCsv(report) {
  const lines = [report.columns.map((col) => csvEscape(col.label)).join(',')];
  for (const row of report.rows) {
    lines.push(report.columns.map((col) => csvEscape(row[col.key])).join(','));
  }
  lines.push('');
  for (const item of report.summary) lines.push(`${csvEscape(item.label)},${csvEscape(item.value)}`);
  return lines.join('\r\n');
}

async function toXlsx(report) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(report.title.slice(0, 31));
  sheet.columns = report.columns.map((col) => ({ header: col.label, key: col.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(report.rows);
  sheet.addRow([]);
  for (const item of report.summary) {
    const row = sheet.addRow([item.label, item.value]);
    row.font = { bold: true };
  }
  return workbook.xlsx.writeBuffer();
}

function toPdf(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(report.title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#555')
      .text(`Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`, { align: 'center' });
    doc.moveDown();

    const colWidth = (doc.page.width - 72) / report.columns.length;
    const drawRow = (values, bold) => {
      const y = doc.y;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#222');
      values.forEach((value, index) => {
        doc.text(String(value ?? ''), 36 + index * colWidth, y, { width: colWidth - 6 });
      });
      doc.moveDown(0.4);
      if (doc.y > doc.page.height - 50) doc.addPage();
    };

    drawRow(report.columns.map((col) => col.label), true);
    for (const row of report.rows) drawRow(report.columns.map((col) => row[col.key]), false);
    doc.moveDown();
    for (const item of report.summary) drawRow([`${item.label}: ${item.value}`], true);

    doc.end();
  });
}

module.exports = { buildReport, toCsv, toXlsx, toPdf };
