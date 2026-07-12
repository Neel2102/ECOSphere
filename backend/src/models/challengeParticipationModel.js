// EcoSphere - Challenge Participation data access
// Owner: yagna
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'challenge_participations',
  writable: [
    'challenge_id', 'employee_id', 'progress', 'proof_path',
    'approval_status', 'xp_awarded', 'completed_at',
  ],
  order: 'id DESC',
});

async function findByChallengeAndEmployee(challengeId, employeeId) {
  const { rows } = await query(
    'SELECT * FROM challenge_participations WHERE challenge_id = $1 AND employee_id = $2',
    [challengeId, employeeId]
  );
  return rows[0] || null;
}

async function listDetailed({ approval_status, employee_id, challenge_id } = {}) {
  const params = [];
  const clauses = [];
  if (approval_status) { params.push(approval_status); clauses.push(`p.approval_status = $${params.length}`); }
  if (employee_id) { params.push(employee_id); clauses.push(`p.employee_id = $${params.length}`); }
  if (challenge_id) { params.push(challenge_id); clauses.push(`p.challenge_id = $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT p.*, u.full_name AS employee_name, u.department_id,
            ch.title AS challenge_title, ch.xp AS challenge_xp, ch.evidence_required
     FROM challenge_participations p
     JOIN users u ON u.id = p.employee_id
     JOIN challenges ch ON ch.id = p.challenge_id
     ${where}
     ORDER BY p.id DESC`,
    params
  );
  return rows;
}

// Total XP + completed challenges per employee (badges, leaderboard, redemption).
async function xpSummaryFor(employeeId) {
  const { rows } = await query(
    `SELECT
       COALESCE((SELECT SUM(xp_awarded) FROM challenge_participations
                 WHERE employee_id = $1 AND approval_status = 'approved'), 0)::int
       + COALESCE((SELECT SUM(points_earned) FROM employee_participations
                   WHERE employee_id = $1 AND approval_status = 'approved'), 0)::int AS earned,
       COALESCE((SELECT SUM(points_spent) FROM reward_redemptions
                 WHERE employee_id = $1 AND status = 'fulfilled'), 0)::int AS spent,
       (SELECT COUNT(*) FROM challenge_participations
        WHERE employee_id = $1 AND approval_status = 'approved')::int AS challenges_completed`,
    [employeeId]
  );
  const summary = rows[0];
  summary.balance = summary.earned - summary.spent;
  return summary;
}

module.exports = { ...base, findByChallengeAndEmployee, listDetailed, xpSummaryFor };
