const { validate, isPhone } = require('./validate');

const updateProfile = validate((body) => {
  const errors = [];
  if ('email' in body) {
    errors.push('Email cannot be changed after account creation.');
  }
  if (body.fullName !== undefined) {
    const fullName = String(body.fullName).trim();
    if (fullName.length < 2 || fullName.length > 100) {
      errors.push('Full name must be between 2 and 100 characters.');
    }
  }
  if (body.phone !== undefined && !isPhone(body.phone)) {
    errors.push('Phone number must be exactly 10 digits.');
  }
  return errors;
});

module.exports = { updateProfile };
