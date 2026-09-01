const request = require('supertest')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = require('../app')
const mongoose = require('mongoose')
const Doctor = require('../models/doctor')

const SECRET = process.env.SECRET_KEY || 'test-secret-key';

// FIX: POST /api/doctors/add and PUT /api/doctors/edit/:id now require a
// valid admin token (see server-side fix to doctorroute.js / doctorcontrol.js
// that closed the mass-assignment / no-auth security gap). Every request that
// used to hit these routes with no token at all now needs one.
const adminToken = jwt.sign({ id: 'admin', role: 'admin' }, SECRET, { expiresIn: '1h' });

beforeAll(async()=>{
    await mongoose.connect(process.env.TEST_MONGO_URL || 'mongodb://127.0.0.1:27017/doctor_test');
});

beforeEach(async()=>{
    await Doctor.deleteMany({});
})

afterAll(async()=>{
    await mongoose.connection.close();
})

test('POST /api/doctors/add - should create a doctor',async()=>{
    const res = await request(app)
        .post('/api/doctors/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            fullName: 'Dr. Arjun',
            email: 'arjun@example.com',
            password: 'strongpass123',
            specialization: 'Cardiologist',
            experience: 8,
            location: 'Chennai',
            certificateUrl: 'http://example.com/cert.png',
        });

    expect(res.statusCode).toBe(201);
    expect(res.body.fullName).toBe('Dr. Arjun');
    expect(res.body.email).toBe('arjun@example.com')
    // Password must never be returned in the response body.
    expect(res.body.password).toBeUndefined();
})

test('POST /api/doctors/add - should fail if email is missing',async()=>{
    const res = await request(app)
        .post('/api/doctors/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            fullName: 'Dr. Arjun',

            password: 'strongpass123',
            specialization: 'Cardiologist',
            experience: 8,
            location: 'Chennai',
            certificateUrl: 'http://example.com/cert.png',
        });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
})

test('POST /api/doctors/add - should reject request with no auth token',async()=>{
    // New test: confirms the security fix actually blocks unauthenticated creation.
    const res = await request(app)
        .post('/api/doctors/add')
        .send({
            fullName: 'Dr. NoAuth',
            email: 'noauth@example.com',
            password: 'strongpass123',
            specialization: 'Cardiologist',
            experience: 8,
            location: 'Chennai',
        });

    expect(res.statusCode).toBe(401);
})

test('GET /api/doctors/get - should return all doctors',async()=>{
        await Doctor.create({
        fullName: 'Dr. Meena',
        email: 'meena@example.com',
        password: 'meena123',
        specialization: 'ENT',
        experience: 7,
        location: 'Madurai',
        certificateUrl: 'http://certs.com/cert3.png',
    });
    const res = await request(app).get('/api/doctors/get');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.doctors)).toBe(true);
    expect(res.body.doctors.length).toBe(1);
    expect(res.body.doctors[0].fullName).toBe('Dr. Meena');
})

test('PUT /api/doctors/edit/:id - should update experience',async()=>{
        const doctor = await Doctor.create({
        fullName: 'Dr. Raj',
        email: 'raj@example.com',
        password: 'rajpass',
        specialization: 'Neurology',
        experience: 3,
        location: 'Trichy',
        certificateUrl: 'http://certs.com/cert4.png',
    });
    const res = await request(app)
        .put(`/api/doctors/edit/${doctor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            experience:6,
        });

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedDoctor.experience).toBe(6);
})

test('PUT /api/doctors/edit/:id - should reject request with no auth token',async()=>{
    // New test: confirms the security fix actually blocks unauthenticated edits.
    const doctor = await Doctor.create({
        fullName: 'Dr. NoAuthEdit',
        email: 'noauthedit@example.com',
        password: 'pass123',
        specialization: 'Neurology',
        experience: 3,
        location: 'Trichy',
    });

    const res = await request(app)
        .put(`/api/doctors/edit/${doctor._id}`)
        .send({ experience: 9 });

    expect(res.statusCode).toBe(401);
})

test('PUT /api/doctors/edit/:id - should reject a different doctor editing this profile',async()=>{
    // New test: confirms the ownership check actually enforces self-or-admin.
    const doctor = await Doctor.create({
        fullName: 'Dr. Owner',
        email: 'owner@example.com',
        password: 'pass123',
        specialization: 'Neurology',
        experience: 3,
        location: 'Trichy',
    });

    const otherDoctorToken = jwt.sign(
        { id: new mongoose.Types.ObjectId().toString(), role: 'doctor' },
        SECRET,
        { expiresIn: '1h' }
    );

    const res = await request(app)
        .put(`/api/doctors/edit/${doctor._id}`)
        .set('Authorization', `Bearer ${otherDoctorToken}`)
        .send({ experience: 9 });

    expect(res.statusCode).toBe(403);
})

test('POST /api/doctors/add - should not allow duplicate email',async()=>{
        await Doctor.create({
        fullName: 'Dr. Duplicate',
        email: 'duplicate@example.com',
        password: 'pass123',
        specialization: 'Ortho',
        experience: 4,
        location: 'Salem',
        certificateUrl: 'http://certs.com/cert5.png',
    });
    const res = await request(app)
        .post('/api/doctors/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
             fullName: 'Another Doc',
             email: 'duplicate@example.com',
             password: 'pass456',
             specialization: 'Ortho',
             experience: 5,
             location: 'Erode',
             certificateUrl: 'http://certs.com/cert6.png',
        });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
})