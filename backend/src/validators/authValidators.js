const { validate, isEmail, isOtp, isPhone, isStrongPassword } = require('./validate');

const SIGNUP_ROLES = ['admin', 'manager', 'employee'];
const LOGIN_ROLES = ['admin', 'manager', 'employee'];

const signup = validate((body) => {
  const errors = [];
  const fullName = (body.fullName || '').trim();
  if (fullName.length < 2 || fullName.length > 100) {
    errors.push('Full name must be between 2 and 100 characters.');
  }
  if (!isEmail(body.email)) errors.push('Please enter a valid email address.');
  if (!isStrongPassword(body.password)) {
    errors.push('Password must be at least 8 characters and contain a letter and a number.');
  }
  if (body.password !== body.confirmPassword) errors.push('Passwords do not match.');
  if (!isPhone(body.phone)) errors.push('Phone number must be exactly 10 digits.');
  if (!SIGNUP_ROLES.includes(body.role)) {
    errors.push('Role must be manager or employee.');
  }
  return errors;
});

const login = validate((body) => {
  const errors = [];
  if (!isEmail(body.email)) errors.push('Please enter a valid email address.');
  if (!body.password) errors.push('Password is required.');
  if (!LOGIN_ROLES.includes(body.role)) errors.push('Please select a valid role.');
  return errors;
});

const emailOnly = validate((body) => (isEmail(body.email) ? [] : ['Please enter a valid email address.']));

const verifyOtp = validate((body) => {
  const errors = [];
  if (!isEmail(body.email)) errors.push('Please enter a valid email address.');
  if (!isOtp(body.otp)) errors.push('OTP must be a 6-digit code.');
  return errors;
});

const resetPassword = validate((body) => {
  const errors = [];
  if (!isEmail(body.email)) errors.push('Please enter a valid email address.');
  if (!body.resetToken) errors.push('Reset token is missing. Verify the OTP first.');
  if (!isStrongPassword(body.password)) {
    errors.push('Password must be at least 8 characters and contain a letter and a number.');
  }
  if (body.password !== body.confirmPassword) errors.push('Passwords do not match.');
  return errors;
});

module.exports = { signup, login, emailOnly, verifyOtp, resetPassword };
