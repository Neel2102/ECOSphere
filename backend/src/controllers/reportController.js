// EcoSphere - Env/Social/Gov/Summary reports + custom builder + export
// Owner: yagna
const { buildReport, toCsv, toXlsx, toPdf } = require('../utils/reportBuilder');

const pickFilters = (req) => ({
  department_id: req.query.department_id,
  employee_id: req.query.employee_id,
  challenge_id: req.query.challenge_id,
  category_id: req.query.category_id,
  from: req.query.from,
  to: req.query.to,
  module: req.query.module,
  organizationId: req.organizationId,
});

const fileName = (title, ext) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;

/*
 * GET /api/reports/:type?format=json|csv|xlsx|pdf
 * type: environmental | social | governance | summary | custom (+ &module=)
 */
async function getReport(req, res, next) {
  try {
    const report = await buildReport(req.params.type, pickFilters(req));
    const format = (req.query.format || 'json').toLowerCase();

    if (format === 'json') {
      return res.json({ success: true, data: { report } });
    }
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName(report.title, 'csv')}"`);
      return res.send(toCsv(report));
    }
    if (format === 'xlsx') {
      const buffer = await toXlsx(report);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName(report.title, 'xlsx')}"`);
      return res.send(Buffer.from(buffer));
    }
    if (format === 'pdf') {
      const buffer = await toPdf(report);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName(report.title, 'pdf')}"`);
      return res.send(buffer);
    }
    res.status(400).json({ success: false, message: 'format must be json, csv, xlsx or pdf.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReport };
