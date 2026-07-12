const ApiError = require('../utils/apiError');

// Wraps a rules function (body -> array of error strings) into middleware.
function validate(rulesFn) {
  return (req, res, next) => {
    const errors = rulesFn(req.body || {});
    if (errors.length > 0) {
      return next(new ApiError(400, errors[0], 'VALIDATION'));
    }
    next();
  };
}

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value || '');
const isOtp = (value) => /^[0-9]{6}$/.test(value || '');
const isPhone = (value) => /^[0-9]{10}$/.test(value || '');
const isStrongPassword = (value) =>
  typeof value === 'string' && value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);

module.exports = { validate, isEmail, isOtp, isPhone, isStrongPassword };
