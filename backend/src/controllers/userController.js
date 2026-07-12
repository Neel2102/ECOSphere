// EcoSphere - User administration: list, onboard (create) and assign team members
// Owner: dhrumil
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const ApiError = require('../utils/apiError');
const { toPublicUser } = require('./authController');
const { isEmail, isPhone, isStrongPassword } = require('../validators/validate');

const ASSIGNABLE_ROLES = ['manager', 'employee'];

// Admin/manager only (enforced by role middleware on the route).
async function listUsers(req, res, next) {
  try {
    const users = await userModel.listAll(req.organizationId);
    res.json({ success: true, data: { users: users.map(toPublicUser) } });
  } catch (err) {
    next(err);
  }
}

/*
 * Onboarding: the organization admin creates a ready-to-use account for a
 * manager or employee (already verified - no OTP round trip), assigned to a
 * department. Used by the "Add Employees" onboarding step.
 */
async function createUser(req, res, next) {
  try {
    const { fullName, email, phone, role, departmentId, gender, password } = req.body;

    const errors = [];
    if (!fullName || fullName.trim().length < 2) errors.push('Full name is required.');
    if (!isEmail(email)) errors.push('A valid email is required.');
    if (!isPhone(phone)) errors.push('Phone must be exactly 10 digits.');
    if (!ASSIGNABLE_ROLES.includes(role)) errors.push('Role must be manager or employee.');
    if (!isStrongPassword(password)) {
      errors.push('Password must be at least 8 characters with a letter and a number.');
    }
    if (gender && !['male', 'female', 'other'].includes(gender)) errors.push('Invalid gender value.');
    if (errors.length) throw new ApiError(400, errors[0], 'VALIDATION');

    const existing = await userModel.findByEmail(email);
    if (existing) throw new ApiError(409, 'That email is already registered.');

    const user = await userModel.createOnboarded({
      fullName: fullName.trim(),
      email,
      passwordHash: await bcrypt.hash(password, 10),
      phone: `+91${phone}`,
      role,
      departmentId: departmentId || null,
      gender: gender || null,
      organizationId: req.organizationId,
    });

    res.status(201).json({
      success: true,
      message: `${role === 'manager' ? 'Manager' : 'Employee'} account created for ${user.full_name}.`,
      data: { user: toPublicUser(user) },
    });
  } catch (err) {
    next(err);
  }
}

// Admin only: assign role, department and diversity data.
async function updateUser(req, res, next) {
  try {
    const { role, departmentId, gender } = req.body;
    if (role && !['admin', 'manager', 'employee'].includes(role)) {
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

module.exports = { listUsers, createUser, updateUser };
