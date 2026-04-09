const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const upload = require('../middleware/multer.js');
require('dotenv').config();

const SECRET = process.env.SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://capstone-careconnect4.netlify.app';

// ─── In-memory OTP store (per-session; acceptable for capstone) ───────────────
const otpStore = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// 📖 Get Profile (Doctor or Patient)
// ─────────────────────────────────────────────────────────────────────────────
exports.getprofile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    if (role === 'doctor') {
      const doctor = await Doctor.findById(userId).populate('addresses');
      return res.json({ user: { doctor, role } });
    } else {
      const patient = await Patient.findById(userId)
        .populate('address')
        .populate({ path: 'doctors', populate: { path: 'address' } });
      return res.json({ user: { patient, role } });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 Unified Login (Doctor, Patient, Admin)
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    // ── Admin login via environment variables ──────────────────────────────
    if (role === 'admin') {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PORTAL_PASSWORD;
      if (!adminEmail || !adminPassword) {
        return res.status(500).json({ error: 'Admin not configured on this server' });
      }
      if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }
      const token = jwt.sign({ id: 'admin', role: 'admin' }, SECRET, { expiresIn: '7d' });
      return res.status(200).json({ token, user: { email: adminEmail, role: 'admin' } });
    }

    // ── Doctor / Patient login ─────────────────────────────────────────────
    let user;
    if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else if (role === 'patient') {
      user = await Patient.findOne({ email });
    } else {
      return res.status(400).json({ error: 'Invalid role. Use doctor, patient, or admin.' });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[SECURITY] Failed login attempt for ${email} (IP: ${req.ip}, Role: ${role})`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ── MFA Check (Role-based: Mandatory for Doctor, Optional for Patient) ───
    if (user.mfaEnabled || role === 'doctor') {
      const otp = crypto.randomInt(100000, 999999).toString();
      const normalizedEmail = email.toLowerCase();
      otpStore.set(normalizedEmail, { 
        otp, 
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
        userId: user._id,
        role,
        attempts: 0 
      });
      
      await sendOTP(email, otp);
      console.log(`[AUTH] MFA OTP sent to ${email} (Role: ${role})`);
      return res.status(200).json({ mfaRequired: true, email: normalizedEmail, message: 'OTP sent for MFA verification' });
    }

    console.info(`[AUTH] Successful login for ${email} (Role: ${role})`);
    const token = jwt.sign({ id: user._id, role }, SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user });
  } catch (err) {
    console.error('Login error details:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📝 Signup (Doctor or Patient) — registers as pending OTP verification
// ─────────────────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  const { fullName, email, password, role, specialization } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;

    if (role === 'doctor') {
      // Check if doctor already exists
      const exists = await Doctor.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Email already registered' });

      const certificateUrl = req.file ? req.file.path : null;
      user = new Doctor({
        fullName,
        email,
        password: hashedPassword,
        specialization: specialization?.toLowerCase(),
        experience: req.body.experience,
        location: req.body.location,
        certificateUrl,
        addresses: [],
        isVerified: false, // Must be approved by admin
      });
    } else if (role === 'patient') {
      const exists = await Patient.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Email already registered' });
      user = new Patient({ fullName, email, password: hashedPassword, isActivated: false });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await user.save();
    
    // Automatically send OTP for patient signup
    if (role === 'patient') {
      const otp = crypto.randomInt(100000, 999999).toString();
      const normalizedEmail = email.toLowerCase();
      otpStore.set(normalizedEmail, { 
        otp, 
        expiresAt: Date.now() + 5 * 60 * 1000,
        userId: user._id,
        role: 'patient'
      });
      await sendOTP(email, otp);
      console.log(`[AUTH] Signup OTP sent to ${email}`);
      return res.status(201).json({ 
        message: 'Registration successful. Please verify your email with the OTP sent.',
        verificationRequired: true,
        email: normalizedEmail
      });
    }

    res.status(201).json({ message: 'User registered successfully. Admin approval pending for doctors.' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📤 Send OTP
// ─────────────────────────────────────────────────────────────────────────────
async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.ADMIN_NAME,
      pass: process.env.ADMIN_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: `CareConnect <${process.env.ADMIN_NAME}>`,
    to: email,
    subject: 'Your OTP for CareConnect Signup',
    text: `Your OTP is: ${otp}. It is valid for 3 minutes.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 📧 Send OTP endpoint
// ─────────────────────────────────────────────────────────────────────────────
exports.sendOtpForSignup = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const normalizedEmail = email.toLowerCase();
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(normalizedEmail, { otp, expiresAt: Date.now() + 3 * 60 * 1000 });

  try {
    await sendOTP(normalizedEmail, otp);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Verify OTP
// ─────────────────────────────────────────────────────────────────────────────
exports.otpverify = async (req, res) => {
  let { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const normalizedEmail = email.toLowerCase();
  const trimmedOtp = otp.toString().trim();

  const stored = otpStore.get(normalizedEmail);
  if (!stored || Date.now() > stored.expiresAt) {
    return res.status(410).json({ message: 'OTP expired or not requested' });
  }
  if (stored.otp !== trimmedOtp) {
    console.warn(`[AUTH] Invalid OTP attempt for ${normalizedEmail}. Expected ${stored.otp}, got ${trimmedOtp}`);
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  const user = await Patient.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActivated = true;
  await user.save();
  otpStore.delete(email);

  res.status(200).json({ message: 'Account verified successfully' });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 Verify MFA Login
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyMfaLogin = async (req, res) => {
  let { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const normalizedEmail = email.toLowerCase();
  const trimmedOtp = otp.toString().trim();

  const stored = otpStore.get(normalizedEmail);
  if (!stored || Date.now() > stored.expiresAt) {
    console.warn(`[SECURITY] MFA expired for ${normalizedEmail}`);
    return res.status(410).json({ error: 'MFA expired or not requested' });
  }

  if (stored.otp !== trimmedOtp) {
    stored.attempts += 1;
    console.warn(`[SECURITY] Invalid MFA attempt (${stored.attempts}/3) for ${email}`);
    
    if (stored.attempts >= 3) {
      otpStore.delete(email);
      console.error(`[SECURITY] MFA blocked after 3 failed attempts for ${email}`);
      return res.status(403).json({ error: 'Too many failed attempts. Please login again.' });
    }
    
    return res.status(400).json({ error: `Invalid OTP. ${3 - stored.attempts} attempts remaining.` });
  }

  const { userId, role } = stored;
  let user;
  if (role === 'doctor') user = await Doctor.findById(userId);
  else user = await Patient.findById(userId);

  if (!user) return res.status(404).json({ error: 'User not found' });

  console.info(`[AUTH] MFA verified for ${email}`);
  const token = jwt.sign({ id: user._id, role }, SECRET, { expiresIn: '7d' });
  otpStore.delete(email);

  res.status(200).json({ token, user });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🌐 Google Auth Callback
// ─────────────────────────────────────────────────────────────────────────────
exports.googleAuthCallback = async (req, res) => {
  try {
    const { displayName, emails } = req.user;
    if (!emails || emails.length === 0) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const email = emails[0].value;
    let user = await Patient.findOne({ email });

    if (!user) {
      user = new Patient({
        fullName: displayName || 'Google User',
        email,
        isActivated: true, // Google-authenticated users are pre-verified
      });
      await user.save({ validateBeforeSave: false });
    }

    const token = jwt.sign({ id: user._id, role: 'patient' }, SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    return res.redirect(`${FRONTEND_URL}/google-success?token=${token}`);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect(`${FRONTEND_URL}/google-failed`);
  }
};
