// EcoSphere - Overdue Compliance Issues Scheduler
const complianceIssueModel = require('../models/complianceIssueModel');
const { notify } = require('./notificationService');

async function runOverdueFlagging() {
  try {
    console.log('[scheduler] Checking for newly overdue compliance issues...');
    const overdue = await complianceIssueModel.findNewlyOverdue();
    if (overdue.length > 0) {
      console.log(`[scheduler] Found ${overdue.length} newly overdue issues. Flagging and notifying owners...`);
      for (const issue of overdue) {
        await notify(issue.owner_id, {
          type: 'compliance',
          title: 'Compliance issue overdue (auto-flagged)',
          message: `"${issue.title}" passed its due date and is still ${issue.status}.`,
          link: '/dashboard/governance/issues',
        });
      }
      await complianceIssueModel.markOverdueNotified(overdue.map((issue) => issue.id));
    } else {
      console.log('[scheduler] No new overdue compliance issues found.');
    }
  } catch (err) {
    console.error('[scheduler] Error in overdue compliance issues flagging job:', err.message);
  }
}

function startScheduler() {
  // Run on startup after a small delay (5 seconds) to let connections warm up
  setTimeout(runOverdueFlagging, 5000);

  // Run daily (every 24 hours)
  const DAILY_INTERVAL = 24 * 60 * 60 * 1000;
  setInterval(runOverdueFlagging, DAILY_INTERVAL);
}

module.exports = { startScheduler, runOverdueFlagging };
