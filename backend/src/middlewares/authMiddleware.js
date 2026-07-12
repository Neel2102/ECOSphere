const { verifyJwt } = require('../utils/tokenGenerator');
const userModel = require('../models/userModel');
const ApiError = require('../utils/apiError');

// Validates the Bearer token and loads a fresh copy of the user so role or
// verification changes take effect immediately, not at token expiry.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    // File downloads (report exports) can't set headers, so a ?token= query
    // parameter is accepted as a fallback carrier for the same JWT.
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
    if (!token) {
      throw new ApiError(401, 'Authentication required.');
    }

    let payload;
    try {
      payload = verifyJwt(token);
    } catch {
      throw new ApiError(401, 'Session expired or invalid. Please log in again.');
    }

    const user = await userModel.findById(payload.id);
    if (!user) throw new ApiError(401, 'Account no longer exists.');
    if (!user.is_verified) throw new ApiError(403, 'Account is not verified.', 'NOT_VERIFIED');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAuth;
