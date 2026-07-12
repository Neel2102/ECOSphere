// EcoSphere - Creates in-app notifications + email fan-out per settings
// Owner: dhrumil
const notificationModel = require('../models/notificationModel');
const esgSettingsModel = require('../models/esgSettingsModel');
const userModel = require('../models/userModel');
const sendEmail = require('./sendEmail');
const { notificationEmail } = require('./emailTemplates');

// Maps a notification type to the settings toggle that controls it.
const TYPE_TOGGLES = {
  compliance: 'notify_compliance',
  approval: 'notify_approvals',
  policy_reminder: 'notify_policy_reminders',
  badge: 'notify_badge_unlocks',
};

/*
 * notify(userId, { type, title, message, link })
 * Respects the ESG settings: per-type toggle + in-app/email channels.
 * Never throws - a failed notification must not break the main request.
 */
async function notify(userId, { type = 'general', title, message, link }) {
  try {
    const settings = await esgSettingsModel.get();
    const toggle = TYPE_TOGGLES[type];
    if (toggle && !settings[toggle]) return;

    if (settings.notify_in_app) {
      await notificationModel.create({ userId, type, title, message, link });
    }

    if (settings.notify_email) {
      const user = await userModel.findById(userId);
      if (user) {
        await sendEmail(user.email, notificationEmail(user.full_name, title, message));
      }
    }
  } catch (err) {
    console.error('[notify] Failed to deliver notification:', err.message);
  }
}

async function notifyMany(userIds, payload) {
  await Promise.all([...new Set(userIds)].map((userId) => notify(userId, payload)));
}

module.exports = { notify, notifyMany };
