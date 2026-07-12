const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signJwt(user) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

function verifyJwt(token) {
  return jwt.verify(token, env.jwt.secret);
}

// Opaque single-use token handed out after the reset OTP is verified.
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function resetTokenExpiry() {
  return new Date(Date.now() + 15 * 60 * 1000);
}

module.exports = { signJwt, verifyJwt, generateResetToken, resetTokenExpiry };
