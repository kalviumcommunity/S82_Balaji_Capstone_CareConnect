const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET_KEY;

// Middleware to verify token and extract user info
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Middleware to check if user has a specific role
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Not authorized.' });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  authorizeRoles
};
