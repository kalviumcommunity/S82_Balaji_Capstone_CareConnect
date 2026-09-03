const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// ── Routers ──────────────────────────────────────────────────────────────────
const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
const aiRoute = require('./routes/ai');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctorroute');
const ratingRoutes = require('./routes/ratingroutes');
const adminRoutes = require('./routes/adminroutes');
const { verifyToken, authorizeRoles } = require('./middleware/authmiddleware');

const app = express();
app.set('trust proxy', 1);

// ── Security & Logging ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://meet.jit.si"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.BACKEND_URL, "https://accounts.google.com"].filter(Boolean),
      frameSrc: ["'self'", "https://meet.jit.si"],
      objectSrc: ["'none'"],
    },
  },
}));

// HTTPS Redirection (Production only)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://capstone-careconnect4.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
  ],
  credentials: true
}));
app.use(passport.initialize());

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many AI requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

// ── Public Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, googleAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiLimiter, aiRoute);
app.use('/api/doctors', doctorRoutes);              // Doctor listing (public)
app.use('/api/ratings', ratingRoutes);

// ── Protected Routes ──────────────────────────────────────────────────────────
app.use('/api/profile', verifyToken, profileRoutes);
app.use('/api', verifyToken, mainRouter);

// ── Admin Routes (JWT + admin role) ───────────────────────────────────────────
app.use('/api/admin', verifyToken, authorizeRoles('admin'), adminRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.status(200).json({ success: true, message: '✅ CareConnect Backend is running!' }));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Centralized Error Handler (MUST be LAST) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
