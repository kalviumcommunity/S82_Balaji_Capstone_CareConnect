const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET; // or SECRET_KEY as per your env

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {  
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // will have id and role (if present in token)
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
