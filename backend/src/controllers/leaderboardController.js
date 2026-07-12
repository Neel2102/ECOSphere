// EcoSphere - Employee/department XP leaderboards
// Owner: yagna
const { query } = require('../config/db');

// Employees ranked by earned XP + CSR points; departments by their sum.
async function leaderboard(req, res, next) {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);

    const { rows: employees } = await query(
      `SELECT u.id, u.full_name, d.name AS department_name,
              COALESCE(cx.xp, 0) + COALESCE(cs.points, 0) AS xp,
              (SELECT COUNT(*) FROM employee_badges eb WHERE eb.employee_id = u.id)::int AS badges
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN (SELECT employee_id, SUM(xp_awarded)::int AS xp
                  FROM challenge_participations WHERE approval_status = 'approved'
                  GROUP BY employee_id) cx ON cx.employee_id = u.id
       LEFT JOIN (SELECT employee_id, SUM(points_earned)::int AS points
                  FROM employee_participations WHERE approval_status = 'approved'
                  GROUP BY employee_id) cs ON cs.employee_id = u.id
       WHERE u.is_verified AND u.role IN ('employee', 'manager')
       ORDER BY xp DESC, u.full_name ASC
       LIMIT $1`,
      [limit]
    );

    const { rows: departments } = await query(
      `SELECT d.id, d.name,
              COALESCE(SUM(x.xp), 0)::int AS xp
       FROM departments d
       LEFT JOIN users u ON u.department_id = d.id
       LEFT JOIN (SELECT employee_id,
                         COALESCE(SUM(xp_awarded), 0) AS xp
                  FROM challenge_participations WHERE approval_status = 'approved'
                  GROUP BY employee_id) x ON x.employee_id = u.id
       WHERE d.status = 'active'
       GROUP BY d.id, d.name
       ORDER BY xp DESC, d.name ASC`
    );

    res.json({
      success: true,
      data: {
        employees: employees.map((row, index) => ({ rank: index + 1, ...row, xp: Number(row.xp) })),
        departments: departments.map((row, index) => ({ rank: index + 1, ...row })),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { leaderboard };
