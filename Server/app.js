// app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
const aiRoute = require('./routes/ai'); // Import AI route

const app = express();
app.enable('trust proxy');

app.use(express.json());

// ✅ Allow CORS
app.use(cors({
  origin: [
    'https://capstone-careconnect1.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

// ✅ Sessions & Passport
app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ✅ AI Route WITHOUT authentication (mounted first)
app.use('/api/ai', aiRoute);

// ✅ Auth Routes
app.use('/api/auth', googleAuthRoutes);
app.use('/api/profile', profileRoutes);

// ✅ Other Routes (with possible auth middleware inside)
app.use('/api', mainRouter);

// ✅ Public uploads
app.use('/uploads', express.static('uploads'));

// ✅ Health Check
app.get('/', (req, res) => res.status(200).send('✅ Hello From Backend!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
