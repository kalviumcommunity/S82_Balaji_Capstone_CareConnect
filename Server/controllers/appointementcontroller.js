const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

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

    console.log(`📧 Attempting to send email to ${toEmail}...`);
    
    const info = await transporter.sendMail({
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
    console.log(`✅ Email sent successfully to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Email send failed to ${toEmail}:`, err.message);
  }
}

// ─── POST: Create Appointment ─────────────────────────────────────────────────
exports.createAppointment = async (req, res) => {
  const { doctorId, patientId, date, time } = req.body;
  if (!doctorId || !patientId || !date || !time) {
    return res.status(400).json({ message: 'doctorId, patientId, date and time are all required.' });
  }
  try {
    // Prevent double-booking (same doctor, date, time)
    const existing = await Appointment.findOne({ doctor: doctorId, date: new Date(date), time });
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    const meetingLink = generateMeetingLink();

    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: patientId,
      date: new Date(date),
      time,
      meetingLink,
    });
    await newAppointment.save();

    // Send confirmation email (non-blocking)
    const patient = await Patient.findById(patientId).select('email fullName');
    const doctor = await Doctor.findById(doctorId).select('email fullName');
    if (patient?.email) {
      sendBookingConfirmation(patient.email, patient.fullName, patient.fullName, doctor?.fullName, date, time, meetingLink);
    }
    if (doctor?.email) {
      sendBookingConfirmation(doctor.email, `Dr. ${doctor.fullName}`, patient?.fullName, doctor?.fullName, date, time, meetingLink);
    }

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment,
      meetingLink,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET: Appointments by Patient ID ─────────────────────────────────────────
exports.getAppointmentsByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'fullName specialization photo consultationFee')
      .sort({ date: -1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── GET: Appointments for logged-in Doctor (from JWT) ───────────────────────
exports.getAppointmentsByDoctor = async (req, res) => {
  const doctorId = req.user.id;
  try {
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'fullName email phone')
      .sort({ date: 1 }); // upcoming first
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── PATCH: Cancel Appointment ────────────────────────────────────────────────
exports.cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ─── PATCH: Update Appointment Status (Doctor Only) ──────────────────────────
exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const doctorId = req.user.id;

  if (!['completed', 'cancelled', 'booked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctor: doctorId },
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found or unauthorized' });
    res.status(200).json({ message: `Appointment marked as ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
