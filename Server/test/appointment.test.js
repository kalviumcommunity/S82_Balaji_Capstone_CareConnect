const request = require('supertest');
jest.mock('nodemailer');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const { setupTestDB, teardownTestDB, clearCollection } = require('./testSetup');

const SECRET = process.env.SECRET_KEY || 'test-secret-key';

describe('Appointment Routes', () => {
  let doctorId, patientId1, patientId2;
  let doctorToken, patientToken1, patientToken2;

  beforeAll(async () => {
    await setupTestDB();
  });

  beforeEach(async () => {
    await clearCollection('doctors');
    await clearCollection('patients');
    await clearCollection('appointments');

    // Create test doctor
    const doctor = await Doctor.create({
      fullName: 'Dr. Test',
      email: 'testdoctor@example.com',
      password: 'hashedpass',
      specialization: 'Cardiology',
      experience: 5,
      location: 'New York',
      isVerified: true,
    });
    doctorId = doctor._id;
    doctorToken = jwt.sign({ id: doctorId, role: 'doctor' }, SECRET, { expiresIn: '7d' });

    // Create test patient 1
    const patient1 = await Patient.create({
      fullName: 'Patient One',
      email: 'patient1@example.com',
      password: 'hashedpass',
      isActivated: true,
    });
    patientId1 = patient1._id;
    patientToken1 = jwt.sign({ id: patientId1, role: 'patient' }, SECRET, { expiresIn: '7d' });

    // Create test patient 2 (for ownership tests)
    const patient2 = await Patient.create({
      fullName: 'Patient Two',
      email: 'patient2@example.com',
      password: 'hashedpass',
      isActivated: true,
    });
    patientId2 = patient2._id;
    patientToken2 = jwt.sign({ id: patientId2, role: 'patient' }, SECRET, { expiresIn: '7d' });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // ────────────────────────────────────────────────────────────────────────
  // Create Appointment Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('POST /api/appointments - Book Appointment', () => {
    test('should successfully book an appointment with valid data', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: '10:00 AM',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appointment).toBeDefined();
      expect(res.body.data.meetingLink).toBeDefined();
      expect(res.body.data.appointment.patient).toEqual(patientId1.toString());
      expect(res.body.data.appointment.doctor).toEqual(doctorId.toString());
    });

    test('should return 400 when doctorId is missing', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          date: futureDate.toISOString(),
          time: '10:00 AM',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should return 400 when date is missing', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          time: '10:00 AM',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should return 400 when time is missing', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should return 404 when doctor does not exist', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const fakeId = new (require('mongoose')).Types.ObjectId();

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: fakeId.toString(),
          date: futureDate.toISOString(),
          time: '10:00 AM',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should return 403 when doctor is not verified', async () => {
      // Create unverified doctor
      const unverifiedDoctor = await Doctor.create({
        fullName: 'Dr. Unverified',
        email: 'unverified@example.com',
        password: 'hashedpass',
        specialization: 'Neurology',
        experience: 3,
        location: 'Boston',
        isVerified: false, // Not verified
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: unverifiedDoctor._id.toString(),
          date: futureDate.toISOString(),
          time: '10:00 AM',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('should reject double-booking (same doctor, date, time)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const testTime = '02:00 PM';

      // First booking
      const res1 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: testTime,
        });

      expect(res1.statusCode).toBe(201);

      // Try second booking at same time
      const res2 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken2}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: testTime,
        });

      expect(res2.statusCode).toBe(409);
      expect(res2.body.success).toBe(false);
      expect(res2.body.message).toContain('already booked');
    });

    test('should reject Sunday bookings when the doctor is not available on Sunday', async () => {
      const sundayDate = new Date();
      const day = sundayDate.getDay();
      const offset = day === 0 ? 1 : 7 - day;
      sundayDate.setDate(sundayDate.getDate() + offset);
      if (sundayDate.getDay() !== 0) {
        sundayDate.setDate(sundayDate.getDate() + (7 - sundayDate.getDay()));
      }

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          date: sundayDate.toISOString(),
          time: '09:00 AM - 10:00 AM',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/available|Sunday|schedule/i);
    });

    test('should reject booking when the doctor has not marked that weekday or slot as available', async () => {
      const futureDate = new Date();
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let offset = 1;
      while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
        futureDate.setDate(futureDate.getDate() + 1);
      }
      const selectedDay = weekdayNames[futureDate.getDay()];

      await Doctor.findByIdAndUpdate(doctorId, {
        availability: [{ day: selectedDay, slots: ['10:00 AM - 11:00 AM'] }],
      });

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: '09:00 AM - 10:00 AM',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/available|availability|slot/i);
    });

    test('should reject booking slots outside the allowed 9 AM to 6 PM window', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
        futureDate.setDate(futureDate.getDate() + 1);
      }

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: '08:00 AM - 09:00 AM',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/9:00 AM|6:00 PM|slot/i);
    });

    test('should allow bookings at different times for same doctor', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      // First booking
      const res1 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: '10:00 AM',
        });

      expect(res1.statusCode).toBe(201);

      // Second booking at different time
      const res2 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken2}`)
        .send({
          doctorId: doctorId.toString(),
          date: futureDate.toISOString(),
          time: '11:00 AM',
        });

      expect(res2.statusCode).toBe(201);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Get Appointments Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('GET /api/appointments/patient - Get Patient Appointments', () => {
    test('should return empty array for patient with no appointments', async () => {
      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${patientToken1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    test('should return only current patient appointments', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      // Create appointment for patient 1
      await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test1',
      });

      // Create appointment for patient 2
      await Appointment.create({
        doctor: doctorId,
        patient: patientId2,
        date: futureDate,
        time: '11:00 AM',
        meetingLink: 'https://meet.jit.si/test2',
      });

      const res = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${patientToken1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].patient).toEqual(patientId1.toString());
    });
  });

  describe('GET /api/appointments/doctor - Get Doctor Appointments', () => {
    test('should return empty array for doctor with no appointments', async () => {
      const res = await request(app)
        .get('/api/appointments/doctor')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    test('should return all appointments for this doctor', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      // Create appointments for this doctor
      await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test1',
      });

      await Appointment.create({
        doctor: doctorId,
        patient: patientId2,
        date: futureDate,
        time: '11:00 AM',
        meetingLink: 'https://meet.jit.si/test2',
      });

      const res = await request(app)
        .get('/api/appointments/doctor')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Cancel Appointment Tests (IDOR Prevention)
  // ────────────────────────────────────────────────────────────────────────
  describe('PATCH /api/appointments/cancel/:id - Cancel Appointment', () => {
    test('should allow patient to cancel their own appointment', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/cancel/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    test('should reject when different patient tries to cancel', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/cancel/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken2}`); // Different patient

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should reject when no token is provided', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app).patch(`/api/appointments/cancel/${appointment._id}`);

      expect(res.statusCode).toBe(401);
    });

    test('should return 404 for non-existent appointment', async () => {
      const fakeId = new (require('mongoose')).Types.ObjectId();

      const res = await request(app)
        .patch(`/api/appointments/cancel/${fakeId}`)
        .set('Authorization', `Bearer ${patientToken1}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Update Appointment Status Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('PATCH /api/appointments/status/:id - Update Appointment Status', () => {
    test('should allow doctor to update appointment status to completed', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        status: 'booked',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/status/${appointment._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          status: 'completed',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
    });

    test('should allow doctor to update appointment status to cancelled', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        status: 'booked',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/status/${appointment._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          status: 'cancelled',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    test('should return 400 for invalid status', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/status/${appointment._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          status: 'invalid_status',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject patient trying to update status', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
        time: '10:00 AM',
        meetingLink: 'https://meet.jit.si/test',
      });

      const res = await request(app)
        .patch(`/api/appointments/status/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken1}`)
        .send({
          status: 'completed',
        });

      expect(res.statusCode).toBe(403);
    });

    test('should reject when different doctor tries to update', async () => {
      // Create another doctor
      const doctor2 = await Doctor.create({
        fullName: 'Dr. Other',
        email: 'other@example.com',
        password: 'hashedpass',
        specialization: 'Neurology',
        experience: 5,
        location: 'Boston',
        isVerified: true,
      });
      const doctor2Token = jwt.sign({ id: doctor2._id, role: 'doctor' }, SECRET, { expiresIn: '7d' });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const appointment = await Appointment.create({
        doctor: doctorId,
        patient: patientId1,
        date: futureDate,
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

    test('should return 404 for non-existent appointment', async () => {
      const fakeId = new (require('mongoose')).Types.ObjectId();

      const res = await request(app)
        .patch(`/api/appointments/status/${fakeId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          status: 'completed',
        });

      expect(res.statusCode).toBe(404);
    });
  });
});
