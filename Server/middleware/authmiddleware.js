const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.SECRET_KEY;

if (!SECRET) {
  throw new Error("SECRET_KEY is not defined");
}

function verifyToken(req, res, next) {
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers["authorization"];

  // FIX: "Bearer" scheme matching was case-sensitive (only matched exact
  // "Bearer "), so a lowercase "bearer ..." header silently fell through to
  // req.cookies?.token (undefined) and returned 401. Per RFC 7235, the
  // auth-scheme token is case-insensitive, so we match it that way here.
  const bearerMatch = authHeader?.match(/^Bearer\s+(.+)$/i);

  const token = bearerMatch ? bearerMatch[1] : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired" });
    }
    return res.status(403).json({ message: "Access denied" });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

module.exports = { verifyToken, authorizeRoles };