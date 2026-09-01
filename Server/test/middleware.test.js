const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const { setupTestDB, teardownTestDB, clearCollection } = require('./testSetup');

const SECRET = process.env.SECRET_KEY || 'test-secret-key';

describe('Authentication & Authorization Middleware', () => {
  let doctorId, patientId;
  let validDoctorToken, validPatientToken;
  let expiredToken, invalidToken;

  beforeAll(async () => {
    await setupTestDB();

    const doctor = await Doctor.create({
      fullName: 'Dr. Middleware Test',
      email: 'middleware_doc@example.com',
      password: 'hashedpass',
      specialization: 'Cardiology',
      experience: 5,
      location: 'New York',
      isVerified: true,
    });
    doctorId = doctor._id;

    const patient = await Patient.create({
      fullName: 'Patient Middleware',
      email: 'middleware_patient@example.com',
      password: 'hashedpass',
      isActivated: true,
    });
    patientId = patient._id;

    validDoctorToken = jwt.sign({ id: doctorId, role: 'doctor' }, SECRET, { expiresIn: '7d' });
    validPatientToken = jwt.sign({ id: patientId, role: 'patient' }, SECRET, { expiresIn: '7d' });

    expiredToken = jwt.sign({ id: doctorId, role: 'doctor' }, SECRET, { expiresIn: '0s' });

    invalidToken = jwt.sign({ id: doctorId, role: 'doctor' }, 'wrong-secret', { expiresIn: '7d' });
  });

  beforeEach(async () => {
    await clearCollection('appointments');
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // ────────────────────────────────────────────────────────────────────────
  // No Token / Missing Authorization Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('Protected Routes - No Token', () => {
    test('should return 401 when accessing /api/appointments/patient without token', async () => {
      const res = await request(app).get('/api/appointments/patient');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Access denied');
    });

    test('should return 401 when accessing /api/appointments/doctor without token', async () => {
      const res = await request(app).get('/api/appointments/doctor');

      expect(res.statusCode).toBe(401);
    });

    test('should return 401 when posting appointment without token', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/appointments')
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: '10:00 AM',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Invalid/Expired Token Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('Protected Routes - Invalid Token', () => {
    test('should return 401 with invalid token signature', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${invalidToken}`);

      // FIX: `toBe(401 || 403)` always evaluates to `toBe(401)` in JavaScript,
      // since `||` short-circuits on the first truthy value. The original intent
      // ("either 401 or 403 is acceptable") needs an actual array-membership check.
      expect([401, 403]).toContain(res.statusCode);
    });

    test('should return 401 with expired token', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('expired');
    });

    test('should return 401 with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', 'InvalidFormat sometoken');

      expect(res.statusCode).toBe(401);
    });

    test('should return 401 with empty Authorization header', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', '');

      expect(res.statusCode).toBe(401);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Role-Based Access Control Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('Role-Based Authorization', () => {
    test('should allow patient to access /api/appointments/patient', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${validPatientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should allow doctor to access /api/appointments/doctor', async () => {
      const res = await request(app)
        .get('/api/appointments/doctor')
        .set('Authorization', `Bearer ${validDoctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should reject patient trying to access doctor-only route /api/appointments/doctor', async () => {
      const res = await request(app)
        .get('/api/appointments/doctor')
        .set('Authorization', `Bearer ${validPatientToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    test('should reject doctor trying to access patient-only route /api/appointments/patient', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${validDoctorToken}`);

      expect(res.statusCode).toBe(403);
    });

    test('should reject patient trying to update appointment status (doctor-only)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId,
        date: futureDate,
        time: '10:00 AM',
        status: 'booked',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/status/${appointment._id}`)
        .set('Authorization', `Bearer ${validPatientToken}`)
        .send({
          status: 'completed',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });

    test('should reject doctor trying to create appointment (patient-only)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validDoctorToken}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: '10:00 AM',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Token Extraction Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('Token Extraction from Headers', () => {
    test('should accept Bearer token format', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${validPatientToken}`);

      expect(res.statusCode).toBe(200);
    });

    test('should accept lowercase bearer token format', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `bearer ${validPatientToken}`);

      expect(res.statusCode).toBe(200);
    });

    test('should reject malformed Bearer token', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer`);

      expect(res.statusCode).toBe(401);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Protected Profile Route Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('Protected Profile Route', () => {
    test('should return 401 when accessing profile without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
    });

    test('should return patient profile with valid patient token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validPatientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('middleware_patient@example.com');
    });

    test('should return doctor profile with valid doctor token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validDoctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('middleware_doc@example.com');
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // IDOR (Insecure Direct Object Reference) Prevention Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('IDOR Prevention in Appointment Operations', () => {
    test('patient should not access other patient appointments', async () => {
      const patient2 = await Patient.create({
        fullName: 'Patient Two',
        email: 'patient2_middleware@example.com',
        password: 'hashedpass',
        isActivated: true,
      });

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patient2._id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${validPatientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.some((apt) => apt._id === appointment._id.toString())).toBe(false);
    });

    test('doctor should not update another doctor appointment status', async () => {
      const doctor2 = await Doctor.create({
        fullName: 'Dr. Other',
        email: 'other_middleware@example.com',
        password: 'hashedpass',
        specialization: 'Neurology',
        experience: 5,
        location: 'Boston',
        isVerified: true,
      });
      const doctor2Token = jwt.sign({ id: doctor2._id, role: 'doctor' }, SECRET, { expiresIn: '7d' });

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/status/${appointment._id}`)
        .set('Authorization', `Bearer ${doctor2Token}`)
        .send({
          status: 'completed',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});