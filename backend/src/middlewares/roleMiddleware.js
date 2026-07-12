const ApiError = require('../utils/apiError');

// Usage: router.get('/', requireAuth, allowRoles('admin', 'manager'), handler)
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource.'));
    }
    next();
  };
}

module.exports = allowRoles;
