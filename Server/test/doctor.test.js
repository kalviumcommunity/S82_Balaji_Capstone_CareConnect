const request = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const Doctor = require('../models/doctor')

beforeAll(async()=>{
    await mongoose.connect('mongodb://127.0.0.1:27017/doctor_test');
});

beforeEach(async()=>{
    await Doctor.deleteMany({});
})

afterAll(async()=>{
    await mongoose.connection.close();
})

test('POST /api/doctors/add - should create a doctor',async()=>{
    const res = await request(app).post('/api/doctors/add').send({
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
})

test('POST /api/doctors/add - should fail if email is missing',async()=>{
    const res = await request(app).post('/api/doctors/add').send({
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
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].fullName).toBe('Dr. Meena');
})

test('PUT /api/doctors/edit/:id - should update experience',async()=>{
        const doctor = await Doctor.create({
        fullName: 'Dr. Raj',
        email: 'raj@example.com',
        password: 'rajpass',
        specialization: 'Neurologist',
        experience: 3,
        location: 'Trichy',
        certificateUrl: 'http://certs.com/cert4.png',
    });
    const res = await request(app).put(`/api/doctors/edit/${doctor._id}`).send({
        experience:6,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedDoctor.experience).toBe(6);
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
    const res = await request(app).post('/api/doctors/add').send({
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