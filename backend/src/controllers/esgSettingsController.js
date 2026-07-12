// EcoSphere - ESG configuration + notification settings endpoints
// Owner: dhrumil
const esgSettingsModel = require('../models/esgSettingsModel');

async function getSettings(req, res, next) {
  try {
    const settings = await esgSettingsModel.get();
    res.json({ success: true, data: { settings } });
  } catch (err) {
    next(err);
  }
}

// Handles both ESG configuration (weights + toggles) and notification
// preferences - they live on the same single settings row.
async function updateSettings(req, res, next) {
  try {
    const settings = await esgSettingsModel.update(req.body);
    res.json({ success: true, message: 'Settings updated.', data: { settings } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
