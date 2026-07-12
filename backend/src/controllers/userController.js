// EcoSphere - User administration (list + assign role/department/gender)
// Owner: dhrumil
const userModel = require('../models/userModel');
const ApiError = require('../utils/apiError');
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

// Admin only: assign role, department and diversity data.
async function updateUser(req, res, next) {
  try {
    const { role, departmentId, gender } = req.body;
    if (role && !['admin', 'manager', 'employee', 'client'].includes(role)) {
      throw new ApiError(400, 'Invalid role.');
    }
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      throw new ApiError(400, 'Invalid gender value.');
    }
    const updated = await userModel.adminUpdate(req.params.id, { role, departmentId, gender });
    if (!updated) throw new ApiError(404, 'User not found.');
    res.json({ success: true, message: 'User updated.', data: { user: toPublicUser(updated) } });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, updateUser };
