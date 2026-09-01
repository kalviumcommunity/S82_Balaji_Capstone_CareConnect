# Test Case Directory

## Quick Reference: All 78 Tests

---

## auth.test.js (20 Tests)

### POST /api/auth/signup - Patient Signup
| # | Test | Expected |
|---|------|----------|
| 1 | Should successfully sign up a patient with valid data | 201, verificationRequired=true |
| 2 | Should return 409 when signing up with duplicate email | 409, "already registered" |
| 3 | Should return 400 when email is missing | 400 |
| 4 | Should return 400 when password is missing | 400 |
| 5 | Should return 400 when role is missing | 400 |
| 6 | Should return 400 for invalid role | 400 |

### POST /api/auth/signup - Doctor Signup
| # | Test | Expected |
|---|------|----------|
| 7 | Should successfully sign up a doctor with valid data | 201, isVerified=false |

### POST /api/auth/user/send-otp
| # | Test | Expected |
|---|------|----------|
| 8 | Should successfully send OTP for signup | 200, "OTP sent" |
| 9 | Should return 400 when email is missing | 400 |

### POST /api/auth/user/verify - OTP Verification
| # | Test | Expected |
|---|------|----------|
| 10 | Should return 400 when email is missing | 400 |
| 11 | Should return 400 when OTP is missing | 400 |
| 12 | Should return 410 for expired OTP | 410, "OTP expired or not requested" |

### POST /api/auth/login
| # | Test | Expected |
|---|------|----------|
| 13 | Should return 400 when email is missing | 400 |
| 14 | Should return 400 when password is missing | 400 |
| 15 | Should return 404 when user does not exist | 404, "User not found" |
| 16 | Should return 401 for wrong password | 401, "Invalid credentials" |
| 17 | Should return JWT token on successful login for activated patient | 200, token, user |
| 18 | Should trigger MFA for doctor login | 200, mfaRequired=true |
| 19 | Should return OTP required for unactivated patient | 200, mfaRequired=true |

### Email Normalization
| # | Test | Expected |
|---|------|----------|
| 20 | Should treat email with uppercase as lowercase | 200, login succeeds |

---

## appointment.test.js (23 Tests)

### POST /api/appointments - Book Appointment
| # | Test | Expected |
|---|------|----------|
| 1 | Should successfully book an appointment with valid data | 201, meetingLink generated |
| 2 | Should return 400 when doctorId is missing | 400 |
| 3 | Should return 400 when date is missing | 400 |
| 4 | Should return 400 when time is missing | 400 |
| 5 | Should return 404 when doctor does not exist | 404, "Doctor not found" |
| 6 | Should return 403 when doctor is not verified | 403, "not yet verified by admin" |
| 7 | Should reject double-booking (same doctor, date, time) | 409, "already booked" |
| 8 | Should allow bookings at different times for same doctor | 201 (both succeed) |

### GET /api/appointments/patient - Get Patient Appointments
| # | Test | Expected |
|---|------|----------|
| 9 | Should return empty array for patient with no appointments | 200, data=[] |
| 10 | Should return only current patient appointments | 200, data=[1 appointment], filters by patient |

### GET /api/appointments/doctor - Get Doctor Appointments
| # | Test | Expected |
|---|------|----------|
| 11 | Should return empty array for doctor with no appointments | 200, data=[] |
| 12 | Should return all appointments for this doctor | 200, data=[2 appointments] |

### PATCH /api/appointments/cancel/:id - Cancel Appointment
| # | Test | Expected |
|---|------|----------|
| 13 | Should allow patient to cancel their own appointment | 200, status='cancelled' |
| 14 | Should reject when different patient tries to cancel | 404, "unauthorized" |
| 15 | Should reject when no token is provided | 401 |
| 16 | Should return 404 for non-existent appointment | 404 |

### PATCH /api/appointments/status/:id - Update Appointment Status
| # | Test | Expected |
|---|------|----------|
| 17 | Should allow doctor to update status to completed | 200, status='completed' |
| 18 | Should allow doctor to update status to cancelled | 200, status='cancelled' |
| 19 | Should return 400 for invalid status | 400, "Invalid status" |
| 20 | Should reject patient trying to update status | 403, "Forbidden" |
| 21 | Should reject when different doctor tries to update | 404, "unauthorized" |
| 22 | Should return 404 for non-existent appointment | 404 |
| 23 | Should use patientId from JWT, not body (IDOR prevention) | 201, correct patientId |

---

## middleware.test.js (22 Tests)

### Protected Routes - No Token
| # | Test | Expected |
|---|------|----------|
| 1 | Should return 401 when accessing /api/appointments/patient without token | 401 |
| 2 | Should return 401 when accessing /api/appointments/doctor without token | 401 |
| 3 | Should return 401 when posting appointment without token | 401 |

### Protected Routes - Invalid Token
| # | Test | Expected |
|---|------|----------|
| 4 | Should return 401 with invalid token signature | 401/403 |
| 5 | Should return 401 with expired token | 401, "Session expired" |
| 6 | Should return 401 with malformed Authorization header | 401 |
| 7 | Should return 401 with empty Authorization header | 401 |

### Role-Based Authorization (RBAC)
| # | Test | Expected |
|---|------|----------|
| 8 | Should allow patient to access /api/appointments/patient | 200 |
| 9 | Should allow doctor to access /api/appointments/doctor | 200 |
| 10 | Should reject patient trying to access /api/appointments/doctor | 403 |
| 11 | Should reject doctor trying to access /api/appointments/patient | 403 |
| 12 | Should reject patient trying to update appointment status (doctor-only) | 403 |
| 13 | Should reject doctor trying to create appointment (patient-only) | 403 |

### Token Extraction from Headers
| # | Test | Expected |
|---|------|----------|
| 14 | Should accept Bearer token format | 200 |
| 15 | Should accept lowercase bearer token format | 200 |
| 16 | Should reject malformed Bearer token | 401 |

### Protected Profile Route
| # | Test | Expected |
|---|------|----------|
| 17 | Should return 401 when accessing profile without token | 401 |
| 18 | Should return patient profile with valid patient token | 200, user.email matches |
| 19 | Should return doctor profile with valid doctor token | 200, user.email matches |

### IDOR Prevention in Appointment Operations
| # | Test | Expected |
|---|------|----------|
| 20 | Patient should not access other patient appointments | 200, filtered results (empty) |
| 21 | Doctor should not update another doctor appointment status | 404, "unauthorized" |
| 22 | Token ownership verified via JWT claims | All operations respect req.user.id |

---

## rateLimit.test.js (8 Tests)

### AI Endpoint Rate Limiting (20 req/15min)
| # | Test | Expected |
|---|------|----------|
| 1 | Should allow requests up to the limit | 20 requests → 200/500/error (not 429) |
| 2 | Should reject requests exceeding the limit with 429 | Request 21+ → 429 |
| 3 | 21st request rate limited | 429 |
| 4 | 22nd request rate limited | 429 |
| 5 | Rate limit response contains headers | ratelimit-limit, ratelimit-remaining, ratelimit-reset |

### Auth Endpoint Rate Limiting (30 req/10min)
| # | Test | Expected |
|---|------|----------|
| 6 | Should allow requests up to the limit | 30 requests → 200/400/404 (not 429) |
| 7 | Should reject requests exceeding the limit with 429 | Request 31+ → 429 |

### Rate Limit State
| # | Test | Expected |
|---|------|----------|
| 8 | AI and Auth endpoints have independent rate limits | Different limit states |

---

## doctor.test.js (5 Tests - Original, Unchanged)

| # | Test | Expected |
|---|------|----------|
| 1 | POST /api/doctors/add - should create a doctor | 201, doctor created |
| 2 | POST /api/doctors/add - should fail if email is missing | 400 |
| 3 | GET /api/doctors/get - should return all doctors | 200, array of doctors |
| 4 | PUT /api/doctors/edit/:id - should update experience | 200, experience updated |
| 5 | POST /api/doctors/add - should not allow duplicate email | 400/409 |

---

## Coverage by Feature

### Authentication (20 tests)
- Signup flows (patient, doctor)
- OTP generation and verification
- Login with various scenarios
- Token generation
- MFA support
- Duplicate prevention
- Input validation

### Appointments (23 tests)
- Booking workflows
- Double-booking prevention
- Retrieval by patient and doctor
- Cancellation with ownership checks
- Status updates with role enforcement
- Error handling for all scenarios

### Security (22 tests)
- Token validation (expired, invalid, missing)
- Role-based access control (patient vs doctor)
- Insecure Direct Object Reference (IDOR) prevention
- Authorization enforcement
- Protected route access

### Rate Limiting (8 tests)
- AI endpoint (20 req/15 min)
- Auth endpoint (30 req/10 min)
- 429 response codes
- Rate limit headers
- Per-IP tracking

### Core CRUD (5 tests)
- Doctor creation
- Doctor retrieval
- Doctor updates
- Duplicate prevention
- Error handling

---

## Test Execution Matrix

### Run Single Test File
```bash
npm test -- test/auth.test.js        # 20 tests
npm test -- test/appointment.test.js # 23 tests
npm test -- test/middleware.test.js  # 22 tests
npm test -- test/rateLimit.test.js   # 8 tests
npm test -- test/doctor.test.js      # 5 tests
```

### Run All Tests
```bash
npm test                              # 78 tests total
```

### Run with Coverage
```bash
npm test -- --coverage               # Coverage report
```

---

**Total Tests: 78**
**Total Coverage: 4 major features + 1 CRUD**
**Security Tests: 22 (auth, RBAC, IDOR)**
**Status: ✅ READY FOR PRODUCTION**
