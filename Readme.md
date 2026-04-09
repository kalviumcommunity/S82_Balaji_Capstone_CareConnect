# 🏥 CareConnect — Doctor Recommendation & Appointment Booking Platform

## Overview

CareConnect is a full-stack healthcare web application that connects patients with verified specialist doctors. It features specialty browsing, AI-powered health chat, real-time appointment booking with video meeting links, role-based dashboards, and an admin verification system.

## Live Deployment

- 🌐 **Frontend:** https://capstone-careconnect4.netlify.app
- ⚙️ **Backend:** https://s82-balaji-capstone-careconnect-3.onrender.com

## Features

- **Doctor & Patient Roles** — Separate dashboards and flows for each role
- **Browse by Specialty** — Find doctors (Cardiology, Neurology, Dermatology, etc.)
- **Smart Search** — Filter doctors by specialty with real-time results
- **Appointment Booking** — Pick date/time slot; instant double-booking prevention
- **Video Meetings** — Auto-generated Jitsi meeting link on every booking
- **Email Confirmation** — Booking confirmation email sent to patients
- **JWT Authentication** — Secure login with 7-day tokens
- **Google OAuth** — One-click Google sign-in for patients
- **OTP Verification** — Email OTP for patient registration
- **AI Chatbot (Nora)** — Powered by Mistral-7B via OpenRouter
- **Admin Panel** — Secret URL admin panel to verify/reject doctor certificates
- **Doctor Dashboard** — Real-time pending appointments with Join Meeting links
- **Patient Profile** — Recent bookings with meeting links and status badges
- **Rate Limiting** — AI endpoint (20 req/15min) and Auth (30 req/10min)
- **Responsive Design** — Mobile navbar with hamburger menu
- **404 Page** — Proper not-found handling

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS v4 |
| Backend | Node.js + Express v5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT + Bcrypt + Google OAuth (Passport.js) |
| AI | OpenRouter API (Mistral-7B-Instruct) |
| Meetings | Jitsi Meet (meet.jit.si) |
| Animations | Framer Motion + AOS |
| Email | Nodemailer |
| Rate Limiting | express-rate-limit |
| Deployment | Netlify + Render |

## User Roles

| Role | Access |
|------|--------|
| **Patient** | Book appointments, view bookings + meeting links, AI chatbot |
| **Doctor** | See pending appointments + meeting links, view patient info |
| **Admin** | Verify/reject doctors via secret admin panel |

## Installation

```bash
# Clone
git clone https://github.com/kalviumcommunity/S82_Balaji_Capstone_CareConnect

# Backend
cd Server
npm install
npm start  # nodemon server.js

# Frontend
cd client
npm install
npm run dev
```

## Environment Variables

### Server (`Server/.env`)
```
SECRET_KEY=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=https://capstone-careconnect4.netlify.app
ADMIN_EMAIL=admin@careconnect.com
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=your_gmail_address
OPENAI_API_KEY=your_openrouter_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Client (`client/.env`)
```
VITE_API_URL=https://s82-balaji-capstone-careconnect-3.onrender.com
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | No | Login (doctor/patient/admin) |
| POST | `/api/auth/signup` | No | Register doctor or patient |
| GET | `/api/doctors/top` | No | Get top verified doctors |
| GET | `/api/doctors/specialty/:spec` | No | Doctors by specialty |
| POST | `/api/appointments` | No | Book appointment (generates meet link) |
| GET | `/api/appointments/patient/:id` | No | Patient's bookings |
| GET | `/api/appointments/doctor` | JWT (doctor) | Doctor's appointments |
| PATCH | `/api/appointments/cancel/:id` | No | Cancel appointment |
| GET | `/api/cc-admin-9x7z/doctors` | JWT (admin) | List all doctors |
| PATCH | `/api/cc-admin-9x7z/verify/:id` | JWT (admin) | Verify a doctor |
| PATCH | `/api/cc-admin-9x7z/reject/:id` | JWT (admin) | Reject a doctor |
| GET | `/api/profile` | JWT | Get user profile |
| POST | `/api/ai` | No (rate limited) | AI chatbot |

## Admin Access

The admin panel is at a secret path to prevent unauthorized discovery:
- **Frontend:** `/cc-admin-panel`
- **Backend:** `/api/cc-admin-9x7z/...`
- Admin logs in at `/login` using `role: admin` with credentials from `.env`

## Contributing

- Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

## Conclusion

The Doctor Recommendation Website is a useful tool for users to find healthcare professionals efficiently.The project 
follows a structured development plan to ensure smooth implementation and a high-quality user experience. Future improvements could 
include adding reviews, real-time availability tracking, and appointment booking features.

