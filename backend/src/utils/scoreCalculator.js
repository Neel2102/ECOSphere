// EcoSphere - Department E/S/G scores + weighted overall ESG score
// Owner: yagna
//
// Formulas (documented so the demo is explainable):
//  - Environmental = average progress of the department's environmental goals
//    (progress = min(100, target/current x 100); 50 when no goals exist yet).
//  - Social        = participation rate: distinct employees with an approved
//    CSR participation / department members x 100.
//  - Governance    = policy acknowledgement rate x 100 minus a penalty per
//    open compliance issue (critical 20, high 15, medium 10, low 5), min 0.
//  - Department total = weighted E/S/G using the configurable weights.
//  - Overall ESG   = average of department totals.
const { query } = require('../config/db');
const esgSettingsModel = require('../models/esgSettingsModel');
const departmentScoreModel = require('../models/departmentScoreModel');
const employeeParticipationModel = require('../models/employeeParticipationModel');
const policyAcknowledgementModel = require('../models/policyAcknowledgementModel');
const complianceIssueModel = require('../models/complianceIssueModel');

const SEVERITY_PENALTY = { critical: 20, high: 15, medium: 10, low: 5 };

const clamp = (value) => Math.max(0, Math.min(100, value));
const round1 = (value) => Math.round(value * 10) / 10;

async function environmentalByDepartment() {
  const { rows } = await query(
    `SELECT department_id,
            AVG(CASE WHEN current_co2 <= 0 THEN 100
                     ELSE LEAST(100, target_co2 / current_co2 * 100) END) AS score
     FROM environmental_goals
     WHERE department_id IS NOT NULL
     GROUP BY department_id`
  );
  return new Map(rows.map((row) => [row.department_id, Number(row.score)]));
}

async function memberCounts() {
  const { rows } = await query(
    `SELECT department_id, COUNT(*)::int AS members
     FROM users
     WHERE department_id IS NOT NULL AND is_verified AND role IN ('employee', 'manager')
     GROUP BY department_id`
  );
  return new Map(rows.map((row) => [row.department_id, row.members]));
}

/*
 * Recomputes every active department's scores for the given period
 * (default: current month), stores them, and returns them with the overall.
 */
async function computeScores(period) {
  const targetPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM
  const settings = await esgSettingsModel.get();

  const { rows: departments } = await query(
    "SELECT id, name, code FROM departments WHERE status = 'active' ORDER BY name"
  );

  const [envMap, members, participation, ackRates, openIssues] = await Promise.all([
    environmentalByDepartment(),
    memberCounts(),
    employeeParticipationModel.participationByDepartment(),
    policyAcknowledgementModel.rateByDepartment(),
    complianceIssueModel.openBySeverityPerDepartment(),
  ]);

  const participationMap = new Map(participation.map((row) => [row.department_id, row.participants]));
  const ackMap = new Map(ackRates.map((row) => [row.department_id, row]));
  const penaltyMap = new Map();
  for (const row of openIssues) {
    penaltyMap.set(
      row.department_id,
      (penaltyMap.get(row.department_id) || 0) + (SEVERITY_PENALTY[row.severity] || 5) * row.count
    );
  }

  const weightTotal =
    settings.weight_environmental + settings.weight_social + settings.weight_governance || 100;

  const results = [];
  for (const department of departments) {
    const memberCount = members.get(department.id) || 0;

    const environmental = clamp(envMap.has(department.id) ? envMap.get(department.id) : 50);

    const social = memberCount
      ? clamp(((participationMap.get(department.id) || 0) / memberCount) * 100)
      : 50;

    const ack = ackMap.get(department.id);
    const ackRate = ack && ack.expected > 0 ? (ack.acknowledged / ack.expected) * 100 : 50;
    const governance = clamp(ackRate - (penaltyMap.get(department.id) || 0));

    const total = clamp(
      (environmental * settings.weight_environmental +
        social * settings.weight_social +
        governance * settings.weight_governance) /
        weightTotal
    );

    const stored = await departmentScoreModel.upsert({
      departmentId: department.id,
      period: targetPeriod,
      environmental: round1(environmental),
      social: round1(social),
      governance: round1(governance),
      total: round1(total),
    });
    results.push({ ...stored, department_name: department.name, department_code: department.code });
  }

  const overall =
    results.length > 0
      ? {
          environmental: round1(results.reduce((sum, r) => sum + Number(r.environmental_score), 0) / results.length),
          social: round1(results.reduce((sum, r) => sum + Number(r.social_score), 0) / results.length),
          governance: round1(results.reduce((sum, r) => sum + Number(r.governance_score), 0) / results.length),
          total: round1(results.reduce((sum, r) => sum + Number(r.total_score), 0) / results.length),
        }
      : { environmental: 0, social: 0, governance: 0, total: 0 };

  return { period: targetPeriod, weights: {
    environmental: settings.weight_environmental,
    social: settings.weight_social,
    governance: settings.weight_governance,
  }, departments: results, overall };
}

module.exports = { computeScores };
