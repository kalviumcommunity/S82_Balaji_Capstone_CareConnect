// ─── Centralized Error Handler ────────────────────────────────────────────────
// Always attach this LAST in app.js: app.use(errorHandler)
// Catches any error passed via next(err)

const errorHandler = (err, req, res, next) => {
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation error',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session expired' });
  }

  // Default 500 — NEVER expose err.message to client in production
  return res.status(err.status || 500).json({
    success: false,
    message: err.status ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
