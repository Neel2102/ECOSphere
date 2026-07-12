// Operational error with an HTTP status; the error middleware turns it into a
// JSON response. Anything else is treated as an unexpected 500.
class ApiError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = ApiError;
