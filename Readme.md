# CareConnect

## Overview

CareConnect is a healthcare discovery and appointment platform for connecting patients with verified doctors. The current codebase includes:

- patient and doctor account flows
- email OTP verification and MFA support
- specialty-based doctor listing
- appointment booking with Jitsi meeting links
- patient and doctor appointment views
- admin verification/rejection of doctors
- Google OAuth login
- AI chat integration via OpenRouter
- rate limiting on public auth and AI endpoints

This project is built as a React + Vite frontend and an Express + MongoDB backend.

## Current Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Framer Motion / AOS
- Lucide icons

### Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Passport Google OAuth
- Nodemailer
- Multer for uploads
- Helmet + CORS + rate limiting
- Zod validation

## Main Features

- Doctor browsing by specialty
- Patient signup and login
- Doctor signup with admin verification
- Admin approval/rejection flow for doctors
- OTP-based email verification and MFA login
- Appointment booking with meeting-link generation
- Appointment cancellation and status updates
- Patient and doctor dashboards
- AI chatbot access
- Profile retrieval and profile image uploads
- Protected routes by JWT and role

## Project Structure

```bash
Capstone-Care-connect/
├── client/                  # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── Server/                  # Express backend
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validators/
│   ├── test/
│   ├── uploads/
│   └── package.json
├── Readme.md
├── SECURITY.md
├── LICENSE
├── HANDOVER.md
└── ...
```

## Installation

### 1) Backend

```bash
cd Server
npm install
npm start
```

The server starts with `nodemon server.js` via the `start` script.

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

## Required Environment Variables

Create a `.env` in `Server/` with the variables the code actually reads:

```env
SECRET_KEY=your_jwt_secret
MONGO_URL=your_mongodb_connection_string
TEST_MONGO_URL=your_mongodb_connection_string_for_a_separate_test_database
PORT=3000
FRONTEND_URL=https://capstone-careconnect4.netlify.app
BACKEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_gmail_app_password
ADMIN_NAME=your_gmail_address
ADMIN_PASSWORD_HASH=optional_bcrypt_hash_for_admin
ADMIN_PORTAL_PASSWORD=optional_plain_admin_password_fallback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
OPENROUTER_API_KEY=your_openrouter_key
NODE_ENV=development
```

Notes:
- The server reads `MONGO_URL`, not `MONGO_URI`.
- `TEST_MONGO_URL` should point to a **separate database** from `MONGO_URL` (e.g. a different database name on the same Atlas cluster) so the test suite never reads, writes, or deletes real production data.
- `ADMIN_PASSWORD` must be a Gmail **App Password**, not the account's regular login password — Gmail rejects regular passwords for SMTP (`535-5.7.8` auth errors). Generate one at https://myaccount.google.com/apppasswords (requires 2-Step Verification enabled on that account).
- `FRONTEND_URL` is also used in OAuth redirects and email-related flows.
- `BACKEND_URL` is used for image URLs and CSP configuration.

## Backend Routes

### Public routes

```text
GET    /
POST   /api/auth/login
POST   /api/auth/verify-mfa
POST   /api/auth/signup
POST   /api/auth/user/send-otp
POST   /api/auth/user/verify
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/google
GET    /api/auth/google/callback
POST   /api/ai
GET    /api/doctors/top
GET    /api/doctors/get
GET    /api/doctors/specialty/:specialization
GET    /api/doctors/:doctorId/appointments
```

### Protected routes (valid JWT required)

```text
GET    /api/auth/profile
GET    /api/profile/get-profile
POST   /api/profile/upload-profile-photo
POST   /api/profile/toggle-mfa
POST   /api/appointments
GET    /api/appointments/patient
GET    /api/appointments/doctor
PATCH  /api/appointments/cancel/:id
PATCH  /api/appointments/status/:id
GET    /api/patients/get
GET    /api/patients/profile
POST   /api/patients/add
PUT    /api/patients/edit/:id
POST   /api/patients/:id/assign-doctor
PUT    /api/doctors/edit/:id       — self (owning doctor) or admin only
DELETE /api/doctors/:id            — self (owning doctor) or admin only
```

### Admin-only routes (valid JWT + admin role required)

```text
POST   /api/doctors/add
GET    /api/admin/doctors
PATCH  /api/admin/verify/:doctorId
PATCH  /api/admin/reject/:doctorId
```

> **Security note:** `POST /api/doctors/add` and `PUT /api/doctors/edit/:id` were previously unauthenticated — anyone could create a doctor account with `isVerified: true` pre-set, or edit any doctor's profile with no login at all. This has been fixed: `/add` is now admin-only and hashes passwords server-side; `/edit/:id` requires the requester to either be the owning doctor or an admin, and non-admins cannot modify `isVerified` or other sensitive fields through this route.

## Role Behavior

### Patient
- login/signup
- checkout doctor specialties
- book a verified doctor
- view own appointment history
- cancel own appointments
- use AI chat

### Doctor
- signup and wait for admin verification
- view their appointments
- update appointment status
- see patient details for their own bookings
- manage own profile information (cannot self-verify)

### Admin
- login with admin credentials
- list doctors
- verify or reject doctors
- create doctor accounts directly
- edit or delete any doctor profile

## App / Client Routes

The frontend route setup includes:

```text
/                -> home
/login           -> login
/signup          -> registration
/google-success  -> OAuth success redirect
/speciality     -> specialties page
/no-doctor      -> empty state
/doctors/:specialty -> doctor list for a specialty
/profile        -> protected profile page
/book/:doctorId -> patient-only booking page
/doctor/dashboard -> doctor dashboard
/doctor/appointments -> doctor appointments
/ai-chat        -> AI chat
/admin          -> admin panel
```

## Rate Limiting

The backend applies two limiters in `Server/server.js`:

- AI endpoint: 20 requests / 15 minutes
- Auth endpoints: 30 requests / 10 minutes

These are applied to:

- `/api/ai`
- `/api/auth`

> Previously, the auth limiter was mistakenly applied twice on the same `/api/auth` path (mounted alongside both the Google OAuth router and the main auth router), silently counting every request twice and rate-limiting real users at half the intended threshold. This has been fixed — the limiter now applies exactly once per request.

## Email Sending

Emails are sent from backend controller files:

- `Server/controllers/authcontrol.js`
- `Server/controllers/appointementcontroller.js`

Both use `nodemailer.createTransport(...)` and call `sendMail(...)`. Requires a valid Gmail App Password in `ADMIN_PASSWORD` (see Environment Variables above) — a regular Gmail password will fail with a `535-5.7.8` authentication error.

## Testing

The project includes Jest/Supertest tests under `Server/test/`:

- `auth.test.js`
- `appointment.test.js`
- `middleware.test.js`
- `rateLimit.test.js`
- `doctor.test.js`

Tests connect to `TEST_MONGO_URL` (falls back to `mongodb://127.0.0.1:27017/...` if unset) and mock `nodemailer` (see `Server/__mocks__/nodemailer.js`) so no real emails are sent during test runs.

As of the latest full run, all tests pass, including new tests added to verify the doctor-route authorization fix (unauthenticated requests to `/add` and `/edit/:id` are correctly rejected, and cross-doctor editing is correctly blocked).

## Notes

- The backend also includes a GraphQL folder (`Server/graphql`), but it is not mounted in the current Express app setup. Pending decision: remove if unused, or wire it in.
- Some client pages still use local backend URLs or environment assumptions; production deployment should standardize these values via environment variables before going live.

## Contributing

Contributions are welcome. Please keep changes focused and validate the backend and frontend before submitting a PR.