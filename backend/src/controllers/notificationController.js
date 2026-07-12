// EcoSphere - List/mark-read notifications
// Owner: dhrumil
const notificationModel = require('../models/notificationModel');
const ApiError = require('../utils/apiError');

async function listMine(req, res, next) {
  try {
    const [items, unread] = await Promise.all([
      notificationModel.listForUser(req.user.id, { unreadOnly: req.query.unread === 'true' }),
      notificationModel.unreadCount(req.user.id),
    ]);
    res.json({ success: true, data: { items, unread } });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const ok = await notificationModel.markRead(req.params.id, req.user.id);
    if (!ok) throw new ApiError(404, 'Notification not found.');
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationModel.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMine, markRead, markAllRead };
