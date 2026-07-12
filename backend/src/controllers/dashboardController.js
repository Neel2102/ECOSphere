// EcoSphere - Executive dashboard KPIs, trends, recent activity
// Owner: yagna
const { query } = require('../config/db');
const { computeScores } = require('../utils/scoreCalculator');
const carbonTransactionModel = require('../models/carbonTransactionModel');

// Latest events across modules, merged into one feed.
async function recentActivity(limit = 8, organizationId) {
  const { rows } = await query(
    `(SELECT 'participation' AS kind, u.full_name || ' joined ''' || a.title || '''' AS text, p.created_at
      FROM employee_participations p
      JOIN users u ON u.id = p.employee_id JOIN csr_activities a ON a.id = p.activity_id
      WHERE u.organization_id = $1)
     UNION ALL
     (SELECT 'challenge', u.full_name || ' completed ''' || ch.title || '''', p.completed_at
      FROM challenge_participations p
      JOIN users u ON u.id = p.employee_id JOIN challenges ch ON ch.id = p.challenge_id
      WHERE p.approval_status = 'approved' AND p.completed_at IS NOT NULL AND u.organization_id = $1)
     UNION ALL
     (SELECT 'compliance', 'New compliance issue: ' || i.title, i.created_at 
      FROM compliance_issues i 
      WHERE i.organization_id = $1)
     UNION ALL
     (SELECT 'carbon', t.source_type || ' emission logged (' || ROUND(t.co2_amount::numeric, 1) || ' kg CO2)', t.created_at
      FROM carbon_transactions t 
      WHERE t.organization_id = $1)
     UNION ALL
     (SELECT 'policy', u.full_name || ' acknowledged ''' || p.title || '''', pa.acknowledged_at
      FROM policy_acknowledgements pa
      JOIN users u ON u.id = pa.employee_id JOIN esg_policies p ON p.id = pa.policy_id
      WHERE u.organization_id = $1)
     ORDER BY 3 DESC NULLS LAST
     LIMIT $2`,
    [organizationId, limit]
  );
  return rows;
}

async function quickCounts(organizationId) {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM carbon_transactions WHERE organization_id = $1)::int AS carbon_transactions,
       (SELECT COUNT(*) FROM challenges WHERE status = 'active' AND organization_id = $1)::int AS active_challenges,
       (SELECT COUNT(*) FROM compliance_issues WHERE status != 'resolved' AND organization_id = $1)::int AS open_issues,
       (SELECT COUNT(*) FROM employee_participations ep JOIN users u ON u.id = ep.employee_id WHERE ep.approval_status = 'pending' AND u.organization_id = $1)::int AS pending_approvals`,
     [organizationId]
  );
  return rows[0];
}

// One call powers the whole executive overview screen.
async function overview(req, res, next) {
  try {
    const orgId = req.organizationId;
    const [scores, trend, activity, counts] = await Promise.all([
      computeScores(undefined, orgId),
      carbonTransactionModel.monthlyTotals(12, orgId),
      recentActivity(8, orgId),
      quickCounts(orgId),
    ]);
    res.json({
      success: true,
      data: {
        scores: scores.overall,
        period: scores.period,
        departmentRanking: scores.departments
          .slice()
          .sort((a, b) => Number(b.total_score) - Number(a.total_score)),
        emissionsTrend: trend,
        recentActivity: activity,
        counts,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { overview };
