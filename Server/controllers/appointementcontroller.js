const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const ALLOWED_TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];
const DEFAULT_AVAILABILITY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_AVAILABILITY_SLOTS = ALLOWED_TIME_SLOTS;

function formatSlotLabel(startMinutes, endMinutes) {
  const to12Hour = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
  };

  return `${to12Hour(startMinutes)} - ${to12Hour(endMinutes)}`;
}

function normalizeTimeSlot(rawTime) {
  if (typeof rawTime !== 'string') {
    return null;
  }

  const trimmed = rawTime.trim();
  if (!trimmed) {
    return null;
  }

  const exactMatch = ALLOWED_TIME_SLOTS.find((slot) => slot.toLowerCase() === trimmed.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }

  const rangeMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (rangeMatch) {
    const [, startHourText, startMinuteText, startPeriod, endHourText, endMinuteText, endPeriod] = rangeMatch;
    const startMinutes = parseTimeToMinutes(startHourText, startMinuteText, startPeriod);
    const endMinutes = parseTimeToMinutes(endHourText, endMinuteText, endPeriod);

    if (startMinutes === null || endMinutes === null) {
      return null;
    }

    if (startMinutes % 60 !== 0 || endMinutes - startMinutes !== 60) {
      return null;
    }

    if (startMinutes < 9 * 60 || endMinutes > 18 * 60) {
      return null;
    }

    const normalizedTime = formatSlotLabel(startMinutes, endMinutes);
    return ALLOWED_TIME_SLOTS.includes(normalizedTime) ? normalizedTime : null;
  }

  const legacyMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!legacyMatch) {
    return null;
  }

  const [, hourText, minuteText, periodText] = legacyMatch;
  const startMinutes = parseTimeToMinutes(hourText, minuteText, periodText);
  if (startMinutes === null || startMinutes % 60 !== 0) {
    return null;
  }

  const endMinutes = startMinutes + 60;
  if (startMinutes < 9 * 60 || endMinutes > 18 * 60) {
    return null;
  }

  const normalizedTime = formatSlotLabel(startMinutes, endMinutes);
  return ALLOWED_TIME_SLOTS.includes(normalizedTime) ? normalizedTime : null;
}

function parseTimeToMinutes(hourText, minuteText, periodText) {
  const hour = Number(hourText);
  const minutes = Number(minuteText);
  const period = periodText.toUpperCase();

  if (Number.isNaN(hour) || Number.isNaN(minutes) || minutes < 0 || minutes >= 60) {
    return null;
  }

  let normalizedHour = hour;
  if (period === 'AM' && normalizedHour === 12) {
    normalizedHour = 0;
  } else if (period === 'PM' && normalizedHour < 12) {
    normalizedHour += 12;
  }

  return normalizedHour * 60 + minutes;
}

function getDayName(dateString) {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[parsedDate.getDay()];
}

function isWeekdayDate(dateString) {
  const dayName = getDayName(dateString);
  if (!dayName) {
    return false;
  }

  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(dayName);
}

async function validateDoctorAvailability(doctorId, date, time) {
  const doctor = await Doctor.findById(doctorId).select('availability');
  if (!doctor) {
    return { valid: false, message: 'Doctor not found.' };
  }

  const dayName = getDayName(date);
  if (!dayName) {
    return { valid: false, message: 'Invalid appointment date.' };
  }

  const availabilityEntries = doctor.availability && doctor.availability.length > 0
    ? doctor.availability
    : DEFAULT_AVAILABILITY_DAYS.map((day) => ({ day, slots: DEFAULT_AVAILABILITY_SLOTS }));

  const availabilityForDay = availabilityEntries.find((entry) => entry.day === dayName);
  if (!availabilityForDay) {
    return {
      valid: false,
      message: 'This doctor is not available on the selected day. Please choose a day from the doctor availability schedule.',
    };
  }

  const allowedSlots = Array.isArray(availabilityForDay.slots) ? availabilityForDay.slots : [];
  if (!allowedSlots.includes(time)) {
    return {
      valid: false,
      message: 'This time slot is not available for the selected day. Please choose a slot from the doctor schedule.',
    };
  }

  return { valid: true };
}

// ─── Generate Jitsi Meet link ─────────────────────────────────────────────────
function generateMeetingLink() {
  const roomId = `careconnect-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  return `https://meet.jit.si/${roomId}`;
}

// ─── Send booking confirmation email ─────────────────────────────────────────
async function sendBookingConfirmation(toEmail, recipientName, patientName, doctorName, date, time, meetingLink) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.ADMIN_NAME, pass: process.env.ADMIN_PASSWORD },
    });

    await transporter.sendMail({
      from: `CareConnect <${process.env.ADMIN_NAME}>`,
      to: toEmail,
      subject: '✅ Appointment Confirmed — CareConnect',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#2563eb;">Your Appointment is Confirmed!</h2>
          <p>Hi <strong>${recipientName}</strong>,</p>
          <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been booked.</p>
          <table style="width:100%;margin:16px 0;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#64748b;">Date</td><td><strong>${new Date(date).toDateString()}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Time</td><td><strong>${time}</strong></td></tr>
          </table>
          <a href="${meetingLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            🎥 Join Meeting
          </a>
          <p style="margin-top:20px;color:#94a3b8;font-size:12px;">CareConnect — Your Health, Our Priority</p>
        </div>
      `,
    });
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Email failed to ${toEmail}:`, err.message);
  }
}

// ─── POST: Create Appointment ─────────────────────────────────────────────────
// IDOR FIX: patientId comes from JWT, not from request body
exports.createAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;
  const patientId = req.user.id; // ← from JWT, not body

  if (!doctorId || !date || !time) {
    return res.status(400).json({ success: false, message: 'doctorId, date, and time are required.' });
  }

  const normalizedTime = normalizeTimeSlot(time);
  if (!normalizedTime) {
    return res.status(400).json({
      success: false,
      message: 'Please choose a valid appointment slot from Monday to Friday between 9:00 AM and 6:00 PM.',
    });
  }

  if (!isWeekdayDate(date)) {
    return res.status(400).json({
      success: false,
      message: 'Appointments are available only from Monday to Friday.',
    });
  }

  try {
    // ── Verify doctor exists AND is admin-verified ──────────────────────────
    const doctor = await Doctor.findById(doctorId).select('fullName email isVerified availability');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    if (!doctor.isVerified) {
      return res.status(403).json({ success: false, message: 'This doctor is not yet verified by admin.' });
    }

    const availabilityCheck = await validateDoctorAvailability(doctorId, date, normalizedTime);
    if (!availabilityCheck.valid) {
      return res.status(400).json({ success: false, message: availabilityCheck.message });
    }

    const duplicateTimes = Array.from(new Set([normalizedTime, time]))
      .filter(Boolean)
      .map((value) => value.trim());

    // Prevent double-booking (compound index also enforces this at DB level)
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time: { $in: duplicateTimes },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked.' });
    }

    const meetingLink = generateMeetingLink();

    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: patientId,
      date: new Date(date),
      time: normalizedTime,
      meetingLink,
    });
    await newAppointment.save();

    // Send confirmation emails (non-blocking)
    const patient = await Patient.findById(patientId).select('email fullName');
    if (patient?.email) {
      sendBookingConfirmation(patient.email, patient.fullName, patient.fullName, doctor.fullName, date, time, meetingLink);
    }
    if (doctor?.email) {
      sendBookingConfirmation(doctor.email, `Dr. ${doctor.fullName}`, patient?.fullName, doctor.fullName, date, time, meetingLink);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment: newAppointment, meetingLink },
    });
  } catch (err) {
    console.error('[APPOINTMENT] Create error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET: Appointments by Patient (IDOR-safe: uses JWT) ──────────────────────
exports.getAppointmentsByPatient = async (req, res) => {
  const patientId = req.user.id; // ← from JWT, not URL param

  try {
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'fullName specialization photo consultationFee')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    console.error('[APPOINTMENT] Patient fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET: Appointments for logged-in Doctor (JWT-based) ──────────────────────
exports.getAppointmentsByDoctor = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'fullName email phone')
      .sort({ date: 1 });
    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    console.error('[APPOINTMENT] Doctor fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── PATCH: Cancel Appointment (only the owning patient can cancel) ──────────
exports.cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Build ownership query based on role
    const query = { _id: id };
    if (userRole === 'patient') query.patient = userId;
    else if (userRole === 'doctor') query.doctor = userId;

    const appointment = await Appointment.findOneAndUpdate(
      query,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (err) {
    console.error('[APPOINTMENT] Cancel error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── PATCH: Update Appointment Status (Doctor Only — IDOR-safe) ──────────────
exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const doctorId = req.user.id;

  if (!['completed', 'cancelled', 'booked'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    // Only allow update if this appointment belongs to this doctor
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctor: doctorId },
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: appointment,
    });
  } catch (err) {
    console.error('[APPOINTMENT] Status update error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
