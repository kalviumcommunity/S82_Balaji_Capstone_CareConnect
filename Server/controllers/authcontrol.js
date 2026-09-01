const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { loginSchema } = require('../validators/authValidator');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
require('dotenv').config();

const SECRET = process.env.SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://capstone-careconnect4.netlify.app';

// ─── In-memory OTP store with auto-cleanup ────────────────────────────────────
// NOTE: Replace with Redis in production for horizontal scaling
const otpStore = new Map();

// Auto-cleanup expired OTPs every 5 minutes (prevents memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ─── Helper: Strip sensitive fields from user object ──────────────────────────
function sanitizeUser(user, role) {
  const obj = user.toObject();
  const { password, __v, ...safe } = obj;
  return { ...safe, role };
}

// ─── Helper: Send OTP email ──────────────────────────────────────────────────
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
    subject: 'Your OTP for CareConnect',
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 📖 Get Profile (Doctor or Patient)
// ─────────────────────────────────────────────────────────────────────────────
exports.getprofile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'doctor') {
      const doctor = await Doctor.findById(userId)
        .select('-password -__v')
        .populate('addresses');
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
      return res.json({ success: true, data: { user: doctor, role } });
    }

    const patient = await Patient.findById(userId)
      .select('-password -__v')
      .populate('address')
      .populate({ path: 'doctors', select: '-password -__v', populate: { path: 'address' } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    return res.json({ success: true, data: { user: patient, role } });

  } catch (error) {
    console.error('[PROFILE] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 Unified Login (Doctor, Patient, Admin)
//    - Backend auto-detects role (no role sent from frontend)
//    - Enforces isActivated for patients
//    - Strips password from all responses
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  // ── Zod validation ────────────────────────────────────────────────────────
  const result = loginSchema.safeParse(req.body);
if (!result.success) {
  const issues = result.error.issues || result.error.errors || [];
  return res.status(400).json({
    success: false,
    message: issues[0]?.message || 'Invalid login data',
  });
}

  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // ── Admin login ─────────────────────────────────────────────────────────
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (normalizedEmail === adminEmail) {
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      const adminPasswordPlain = process.env.ADMIN_PORTAL_PASSWORD;

      // Support bcrypt hash if set, fallback to plain (with warning)
      let isValidAdmin = false;
      if (adminPasswordHash) {
        isValidAdmin = await bcrypt.compare(password, adminPasswordHash);
      } else if (adminPasswordPlain) {
        // Plain-text fallback — log warning
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[SECURITY] Admin password compared in plain text. Set ADMIN_PASSWORD_HASH for production.');
        }
        isValidAdmin = (password === adminPasswordPlain);
      }

      if (!isValidAdmin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: 'admin', role: 'admin' }, SECRET, { expiresIn: '7d' });
      return res.status(200).json({
        success: true,
        token,
        user: { email: normalizedEmail, fullName: 'Admin', role: 'admin' },
      });
    }

    // ── Doctor / Patient login (auto-detect role from DB) ───────────────────
    let user;
    let actualRole;

    const doctor = await Doctor.findOne({ email: normalizedEmail });
    const patient = await Patient.findOne({ email: normalizedEmail });

    if (doctor) {
      user = doctor;
      actualRole = 'doctor';
    } else if (patient) {
      user = patient;
      actualRole = 'patient';
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent crash if password is missing (Google/OAuth users)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Please use the correct login method.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[SECURITY] Failed login for ${normalizedEmail} (IP: ${req.ip})`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // ── Enforce email verification for patients ─────────────────────────────
    if (actualRole === 'patient' && !user.isActivated) {
      const otp = crypto.randomInt(100000, 999999).toString();
      otpStore.set(normalizedEmail, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        userId: user._id,
        role: actualRole,
      });
      await sendOTP(normalizedEmail, otp);
      console.log(`[AUTH] Verification OTP sent to unactivated user: ${normalizedEmail}`);
      
      return res.status(200).json({
        success: true,
        mfaRequired: true,
        email: normalizedEmail,
        message: 'Email not verified. A new OTP has been sent to your inbox.',
      });
    }

    // ── MFA Check (mandatory for doctors, optional for patients) ────────────
    const isDummyAccount = normalizedEmail === 'dummy@patient.com';
    if (!isDummyAccount && (user.mfaEnabled || actualRole === 'doctor')) {
      const otp = crypto.randomInt(100000, 999999).toString();

      otpStore.set(normalizedEmail, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        userId: user._id,
        role: actualRole,
        attempts: 0,
      });

      await sendOTP(normalizedEmail, otp);
      console.log(`[AUTH] MFA OTP sent to ${normalizedEmail} (Role: ${actualRole})`);

      return res.status(200).json({
        success: true,
        mfaRequired: true,
        email: normalizedEmail,
        message: 'OTP sent for MFA verification',
      });
    }

    // ── Issue token (no MFA path) ───────────────────────────────────────────
    console.info(`[AUTH] Login success: ${normalizedEmail} (${actualRole})`);
    const token = jwt.sign({ id: user._id, role: actualRole }, SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user, actualRole),
    });

  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📝 Signup (Doctor or Patient)
// ─────────────────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  const { fullName, email, password, role, specialization } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;

    if (role === 'doctor') {
      const exists = await Doctor.findOne({ email: normalizedEmail });
      if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

      const certificateUrl = req.file ? req.file.path : null;
      user = new Doctor({
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        specialization: specialization?.toLowerCase(),
        experience: req.body.experience,
        location: req.body.location,
        certificateUrl,
        addresses: [],
        isVerified: false,
      });
    } else if (role === 'patient') {
      const exists = await Patient.findOne({ email: normalizedEmail });
      if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
      user = new Patient({ fullName, email: normalizedEmail, password: hashedPassword, isActivated: false });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    await user.save();

    // Automatically send OTP for patient signup
    if (role === 'patient') {
      const otp = crypto.randomInt(100000, 999999).toString();
      otpStore.set(normalizedEmail, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        userId: user._id,
        role: 'patient',
      });
      await sendOTP(normalizedEmail, otp);
      console.log(`[AUTH] Signup OTP sent to ${normalizedEmail}`);
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email with the OTP sent.',
        verificationRequired: true,
        email: normalizedEmail,
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Admin approval pending for doctors.',
    });
  } catch (err) {
    console.error('[AUTH] Signup error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📧 Send OTP endpoint
// ─────────────────────────────────────────────────────────────────────────────
exports.sendOtpForSignup = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(normalizedEmail, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  try {
    await sendOTP(normalizedEmail, otp);
    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('[AUTH] OTP send error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Verify OTP (Signup verification)
// ─────────────────────────────────────────────────────────────────────────────
exports.otpverify = async (req, res) => {
  let { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedOtp = otp.toString().trim();

  const stored = otpStore.get(normalizedEmail);
  if (!stored || Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(410).json({ success: false, message: 'OTP expired or not requested' });
  }
  if (stored.otp !== trimmedOtp) {
    console.warn(`[AUTH] Invalid OTP attempt for ${normalizedEmail}`);
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  const user = await Patient.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isActivated = true;
  await user.save();
  otpStore.delete(normalizedEmail);

  res.status(200).json({ success: true, message: 'Account verified successfully' });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 Verify MFA Login
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyMfaLogin = async (req, res) => {
  let { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedOtp = otp.toString().trim();

  const stored = otpStore.get(normalizedEmail);
  if (!stored || Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedEmail);
    console.warn(`[SECURITY] MFA expired for ${normalizedEmail}`);
    return res.status(410).json({ success: false, message: 'MFA expired or not requested' });
  }

  if (stored.otp !== trimmedOtp) {
    stored.attempts = (stored.attempts || 0) + 1;
    console.warn(`[SECURITY] Invalid MFA attempt (${stored.attempts}/3) for ${normalizedEmail}`);

    if (stored.attempts >= 3) {
      otpStore.delete(normalizedEmail);
      console.error(`[SECURITY] MFA blocked after 3 failed attempts for ${normalizedEmail}`);
      return res.status(403).json({ success: false, message: 'Too many failed attempts. Please login again.' });
    }

    return res.status(400).json({
      success: false,
      message: `Invalid OTP. ${3 - stored.attempts} attempts remaining.`,
    });
  }

  const { userId, role } = stored;
  let user;
  if (role === 'doctor') user = await Doctor.findById(userId);
  else user = await Patient.findById(userId);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Activate account if it was previously unactivated (Verification during login)
  if (role === 'patient' && !user.isActivated) {
    user.isActivated = true;
    await user.save();
    console.info(`[AUTH] Account activated for ${normalizedEmail} during MFA/Login flow`);
  }

  console.info(`[AUTH] MFA verified for ${normalizedEmail}`);
  const token = jwt.sign({ id: user._id, role }, SECRET, { expiresIn: '7d' });
  otpStore.delete(normalizedEmail);

  res.status(200).json({
    success: true,
    token,
    user: sanitizeUser(user, role),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🌐 Google Auth Callback
// ─────────────────────────────────────────────────────────────────────────────
exports.googleAuthCallback = async (req, res) => {
  try {
    const { displayName, emails } = req.user;
    if (!emails || emails.length === 0) {
      return res.redirect(`${FRONTEND_URL}/google-failed`);
    }

    const email = emails[0].value.toLowerCase().trim();
    let user;
    let actualRole;

    // Try finding in Doctor first
    user = await Doctor.findOne({ email });
    if (user) {
      actualRole = "doctor";
    } else {
      // Then try Patient
      user = await Patient.findOne({ email });
      if (user) {
        actualRole = "patient";
      }
    }

    if (!user) {
      // If not found in either, create as a new patient
      user = new Patient({
        fullName: displayName || "Google User",
        email,
        isActivated: true, // Google-authenticated users are pre-verified
      });
      await user.save({ validateBeforeSave: false });
      actualRole = "patient";
    }

    const token = jwt.sign({ id: user._id, role: actualRole }, SECRET, {
      expiresIn: "7d",
    });
    return res.redirect(`${FRONTEND_URL}/google-success?token=${token}`);
  } catch (error) {
    console.error('[AUTH] Google Auth Error:', error.message);
    res.redirect(`${FRONTEND_URL}/google-failed`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 Forgot Password
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const doctor = await Doctor.findOne({ email: normalizedEmail });
    const patient = await Patient.findOne({ email: normalizedEmail });

    const user = doctor || patient;
    const role = doctor ? 'doctor' : 'patient';

    if (!user) {
      // Security best practice: don't reveal if user exists, but here we usually want to be helpful
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(normalizedEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes for reset
      userId: user._id,
      role: role,
      type: 'password_reset'
    });

    await sendOTP(normalizedEmail, otp);
    console.log(`[AUTH] Password reset OTP sent to ${normalizedEmail}`);

    res.status(200).json({ success: true, message: 'Password reset OTP sent to your email' });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔄 Reset Password
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const stored = otpStore.get(normalizedEmail);
    if (!stored || stored.otp !== otp || stored.type !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const { userId, role } = stored;
    let user = role === 'doctor' ? await Doctor.findById(userId) : await Patient.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(normalizedEmail);
    console.log(`[AUTH] Password reset successful for ${normalizedEmail}`);

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
