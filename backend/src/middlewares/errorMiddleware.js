const multer = require('multer');
const ApiError = require('../utils/apiError');
const env = require('../config/env');

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }),
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON.' });
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Image is too large. Maximum size is ${env.upload.maxFileSizeMb} MB.`
        : err.message;
    return res.status(400).json({ success: false, message });
  }

  // Unique violation safety net in case a race slips past the pre-check.
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'That email is already registered.' });
  }

  console.error('[error]', err);
  return res.status(500).json({
    success: false,
    message: env.nodeEnv === 'development' ? err.message : 'Something went wrong. Please try again.',
  });
}

module.exports = { notFound, errorHandler };
