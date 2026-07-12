const crypto = require('crypto');
const env = require('../config/env');

// crypto.randomInt avoids modulo bias and is unpredictable, unlike Math.random.
function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function otpExpiry() {
  return new Date(Date.now() + env.otp.expiryMinutes * 60 * 1000);
}

module.exports = { generateOtp, otpExpiry };
