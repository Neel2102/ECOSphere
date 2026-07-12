const userModel = require('../models/userModel');
const { toPublicUser } = require('./authController');

// Admin/manager only (enforced by role middleware on the route).
async function listUsers(req, res, next) {
  try {
    const users = await userModel.listAll();
    res.json({ success: true, data: { users: users.map(toPublicUser) } });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers };
