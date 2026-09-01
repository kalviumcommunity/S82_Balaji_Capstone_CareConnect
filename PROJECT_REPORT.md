# CareConnect Project Report

## 1. Executive Summary

CareConnect is a full-stack healthcare discovery and appointment platform. Its intended workflow is:

1. A patient discovers doctors by specialty.
2. The patient registers, verifies email ownership, and signs in.
3. The patient books an available slot with an administrator-verified doctor.
4. The backend creates a Jitsi meeting URL and stores the appointment in MongoDB.
5. Patients and doctors see role-specific appointment views.
6. An administrator approves or rejects doctor registrations and certificates.
7. An AI chat page proxies health questions to OpenRouter.

The repository contains a React/Vite frontend and an Express/Mongoose backend. It also contains Bruno API collections, generated coverage output, and several handover/testing documents. The implementation has meaningful security controls, but the current project state is not yet demonstrably production-ready: the backend test suite cannot run without MongoDB, the client lint command reports errors, and several public routes expose more capability than the README implies.

This report describes the code as inspected on 2026-08-24. It distinguishes verified implementation facts from intended product claims and identifies the highest-priority risks.

## 2. Repository Layout

### Root

- `Readme.md`: product overview, deployment links, setup, environment variables, and a simplified API table.
- `SECURITY.md`: operational security guidance for WAF, dependency scanning, backups, headers, uploads, and logging.
- `HANDOVER.md`: test-expansion handover document already present in the worktree.
- `capstone/`, `Care-connect/`, `new/`, `testing cap/`: Bruno request collections and exploratory API requests.
- `client/`: React frontend.
- `Server/`: Express backend, models, controllers, routes, tests, uploads, and coverage output.
- `LICENSE`: repository license file.
- `.git/`: repository metadata.

### Backend

The backend is organized into:

- `app.js`: Express application composition and middleware order.
- `server.js`: MongoDB connection and HTTP server startup.
- `routes/`: authentication, doctor, patient, appointment, profile, admin, AI, Google OAuth, and aggregate routing.
- `controllers/`: request handlers for authentication, doctors, patients, appointments, and profiles.
- `models/`: Mongoose schemas for doctors, patients, appointments, addresses, and images.
- `middleware/`: JWT authentication, role authorization, upload handling, profile uploads, ownership helper, and error handling.
- `validators/`: Zod authentication validation.
- `config/passport.js`: Google OAuth strategy configuration.
- `graphql/`: doctor GraphQL type definitions and resolvers, currently not mounted by `app.js`.
- `test/`: Jest/Supertest suites and shared test setup.
- `coverage/`: generated coverage artifacts currently present; these should normally be ignored or regenerated in CI.

### Frontend

The frontend is a Vite React application with:

- `src/App.jsx`: client route table.
- `src/pages/`: public pages, authentication, patient booking/profile, doctor dashboards, admin panel, AI chat, and fallback pages.
- `src/components/`: navigation, doctor cards, skeleton loading, and 404 UI.
- `src/pages/authentication/authcontext.jsx`: localStorage-backed authentication state.
- `src/pages/ProtectedRoute.jsx`: client-side authentication and role gating.
- `src/utils/api.js`: Axios instance and token/401 handling.
- `src/assets/`: application imagery, including doctor and chatbot assets.
- `vite.config.js`: Vite, React, Tailwind, and local `/api` proxy configuration.

## 3. Technology Stack

### Frontend

- React 18.3 with React Router 7.
- Vite 6 for development and production bundling.
- Tailwind CSS 4 through the Vite plugin.
- Axios for HTTP requests.
- Framer Motion and AOS for animation.
- Lucide, React Icons, and React Loading Icons for UI icons and loading states.
- `jwt-decode` for client-side expiry checks.

### Backend

- Node.js with Express 5.1.
- MongoDB accessed through Mongoose 8.14.
- JSON Web Tokens for authentication.
- `bcrypt` for password hashing and password comparison.
- Passport and `passport-google-oauth20` for Google login.
- Nodemailer with Gmail service for OTP and appointment emails.
- Multer for certificate and profile uploads.
- Helmet, CORS, Morgan, and express-rate-limit for platform middleware.
- Zod for login request validation.
- Jest 29 and Supertest 7 for backend tests.

### External services

- MongoDB or MongoDB Atlas for persistence.
- Google OAuth for federated login.
- Gmail SMTP through Nodemailer for email delivery.
- OpenRouter, configured to proxy an AI model for Nora chatbot requests.
- Jitsi Meet for generated consultation rooms.
- Netlify and Render are documented deployment targets.

## 4. Application Architecture

### Startup flow

`Server/server.js` imports the Express app, loads environment variables, calls `mongoose.connect(process.env.MONGO_URL)`, and starts the HTTP listener on `PORT` or 3000. Database connection failure is logged, but the process is not explicitly terminated; the server may therefore remain listening while database-backed requests fail.

`Server/app.js` constructs the application and exports it for tests. The middleware order is:

1. Morgan request logging.
2. Helmet with a custom Content Security Policy.
3. Production HTTPS redirect based on `x-forwarded-proto`.
4. JSON body parsing with a 10 MB limit.
5. CORS with configured frontend origins and credentials enabled.
6. Passport initialization.
7. Authentication and AI rate limiters.
8. Public authentication, Google, AI, and doctor routes.
9. JWT-protected profile and aggregate routes.
10. JWT plus admin-role protected admin routes.
11. Root health check.
12. Static upload serving.
13. Central error handler.

### Frontend flow

The client initializes authentication from `localStorage`, decodes the JWT expiry, and exposes `login` and `logout` through `AuthContext`. `ProtectedRoute` provides a user-interface boundary for authenticated and role-specific pages. `src/utils/api.js` attaches the stored token to Axios requests and redirects on a 401 response.

This client protection improves navigation behavior but is not a security boundary. The backend must independently authenticate and authorize every sensitive operation.

## 5. User Roles and Capabilities

### Patient

- Browse doctor listings and specialties.
- Register with email/password and verify via OTP.
- Sign in, optionally using MFA when enabled.
- Book appointments with verified doctors.
- Receive a Jitsi meeting link and confirmation email.
- View appointments belonging to the authenticated patient.
- Cancel owned appointments.
- Manage profile information and profile photo.
- Toggle MFA.
- Use the AI chat interface.

### Doctor

- Register with specialization, experience, location, and optional certificate upload.
- Wait for administrator verification.
- Sign in with mandatory MFA behavior in the backend.
- View appointments belonging to the authenticated doctor.
- Update appointment status.
- Cancel owned doctor appointments.
- View patient information associated with appointments.
- Manage profile information, image, certificate, and MFA.

### Administrator

- Sign in using environment-configured credentials.
- List doctors through the admin route.
- Verify or reject doctors.
- Delete doctors through the doctor controller when authorized.

The admin UI is `/admin`. The implemented backend mount is `/api/admin`; the README also documents a different secret-looking `/api/cc-admin-9x7z` path, which does not match the inspected implementation.

## 6. Frontend Feature Inventory

### Public pages

- Home page: hero content, specialty discovery, top verified doctors, testimonials/statistics, contact/footer content, and navigation.
- Specialty page: searchable specialty selection.
- Specialty doctors page: doctor listing by route parameter.
- No-doctor page: empty-result state.
- Login and signup pages.
- Google OAuth success page.
- Catch-all 404 page.

### Patient pages

- Profile page: profile retrieval, profile image upload, appointment display, meeting links, status badges, and user details.
- Booking page: doctor lookup, date/time selection, booking submission, response message, and meeting-link success state.
- AI chat page: conversation state, message submission, loading behavior, and chatbot presentation.

### Doctor pages

- Doctor dashboard: appointment summary, loading/error states, status actions, and meeting links.
- Doctor appointments page: detailed appointment listing and patient information.

### Admin page

- Admin panel: doctor list loading, filtering, verify/reject actions, action loading, and toast feedback.

### Client concerns

- Some pages use the shared Axios instance while others contain hard-coded `http://localhost:3000` URLs. This can break deployed behavior.
- Client field names vary across profile and doctor views, including `image`, `photo`, and `profilePhoto`.
- Client-side JWTs are stored in localStorage, so an XSS vulnerability could expose active tokens.
- The client build succeeds according to the prior validation record, but `npm run lint` reports 16 errors and 4 warnings, primarily unused values and hook dependency issues.

## 7. Backend API Reference

### Health

| Method | Path | Protection | Purpose |
|---|---|---|---|
| GET | `/` | Public | Returns backend running status. |

### Authentication

Mounted at `/api/auth` and rate limited by the auth limiter.

| Method | Path | Protection | Purpose |
|---|---|---|---|
| POST | `/login` | Public | Unified patient, doctor, and admin login. |
| POST | `/verify-mfa` | Public | Verify login OTP/MFA and issue JWT. |
| POST | `/signup` | Public | Register patient or doctor; accepts optional certificate upload. |
| POST | `/user/send-otp` | Public | Send signup OTP. |
| POST | `/user/verify` | Public | Verify signup OTP and activate patient. |
| POST | `/forgot-password` | Public | Send password-reset OTP. |
| POST | `/reset-password` | Public | Reset password using OTP. |
| GET | `/google` | Public | Start Google OAuth. |
| GET | `/google/callback` | OAuth callback | Create/find user and redirect with JWT. |

### Doctors

Mounted publicly at `/api/doctors`.

| Method | Path | Protection | Purpose |
|---|---|---|---|
| GET | `/top` | Public | List top verified doctors. |
| GET | `/get` | Public | List doctors, with controller pagination behavior. |
| GET | `/specialty/:specialization` | Public | Find doctors by specialization. |
| GET | `/:doctorId/appointments` | Public | Get appointments for a doctor ID. |
| POST | `/add` | Public in current mount | Create a doctor. |
| PUT | `/edit/:id` | Public in current mount | Edit a doctor. |
| DELETE | `/:id` | JWT in router | Delete if the token user owns the doctor or is admin. |

The same doctor router is also mounted under the protected aggregate router. Since the public mount is registered first, matching requests normally reach the public mount first. This creates confusing duplicate routing and means create/edit/list behavior is not protected by the aggregate mount.

### Appointments

The main appointment route is mounted through `/api` with JWT protection, and the appointment router also calls `router.use(verifyToken)`.

| Method | Path | Protection | Purpose |
|---|---|---|---|
| POST | `/api/appointments` | Patient role | Book a verified doctor and create Jitsi link. |
| GET | `/api/appointments/patient` | Patient role | List appointments for JWT patient ID. |
| GET | `/api/appointments/doctor` | Doctor role | List appointments for JWT doctor ID. |
| PATCH | `/api/appointments/cancel/:id` | Authenticated patient/doctor | Cancel only when the appointment belongs to the caller. |
| PATCH | `/api/appointments/status/:id` | Doctor role | Update owned appointment status to booked/completed/cancelled. |

The controller derives patient and doctor ownership from JWT claims rather than trusting request-body IDs. It checks doctor verification, checks an existing doctor/date/time appointment, and has a database compound unique index as a second defense against duplicate slots.

### Profiles

Mounted at `/api/profile` with JWT protection.

| Method | Path | Protection | Purpose |
|---|---|---|---|
| GET | `/api/profile/get-profile` | JWT | Return the caller's doctor or patient profile. |
| POST | `/api/profile/upload-profile-photo` | JWT | Upload a profile image. |
| POST | `/api/profile/toggle-mfa` | JWT | Enable or disable MFA. |

### Patients

Mounted through the protected aggregate route and also at `/api/patientprofile`.

| Method | Path | Protection observed | Purpose |
|---|---|---|---|
| GET | `/api/patients/get` | Admin role | List patients. |
| POST | `/api/patients/add` | No route-level role check observed | Create patient. |
| PUT | `/api/patients/edit/:id` | No route-level role check observed | Edit patient. |
| POST | `/api/patients/:id/assign-doctor` | No route-level role check observed | Assign doctor to patient. |
| GET | `/api/patients/profile` | JWT | Return profile helper result. |

The mutation routes require a security review because route-level authentication/authorization is not consistently visible.

### Administration

Mounted at `/api/admin` with `verifyToken` and `authorizeRoles('admin')`.

| Method | Path | Protection | Purpose |
|---|---|---|---|
| GET | `/api/admin/doctors` | Admin role | List doctors, with pagination behavior. |
| PATCH | `/api/admin/verify/:doctorId` | Admin role | Mark doctor verified. |
| PATCH | `/api/admin/reject/:doctorId` | Admin role | Reject doctor and store rejection reason behavior. |

### AI

| Method | Path | Protection | Purpose |
|---|---|---|---|
| POST | `/api/ai` | Public route, rate limited | Forward a messages payload to OpenRouter and return the model response. |

The frontend page is protected, but the backend endpoint itself is public. The controller should validate the message structure, constrain payload size, and avoid leaking provider errors.

### GraphQL

Doctor GraphQL types and resolvers define:

- `getAllDoctors` query.
- `getDoctorById` query.
- `createDoctor`, `updateDoctor`, and `deleteDoctor` mutations.

No GraphQL endpoint is mounted in the inspected `app.js`. If these resolvers are later exposed, authentication, role authorization, input validation, and field-level output controls must be added first.

## 8. Data Model Report

### Doctor

Fields include:

- `fullName`, `email`, optional `password`.
- Required `specialization`, `experience`, and `location`.
- Optional `certificateUrl`, `bio`, `consultationFee`, and `photo`.
- `isVerified`, default false, plus `rejectionReason`.
- `rating` constrained between 0 and 5, and `reviewCount`.
- Referenced `addresses`.
- `mfaEnabled`.
- Role enum fixed to `doctor`.
- Automatic `createdAt` and `updatedAt` timestamps.

### Patient

Fields include:

- `fullName`, unique `email`, optional `password`.
- `isActivated`, default false.
- `phone`, `gender`, `bloodGroup`, `dateOfBirth`, and `profilePhoto`.
- Referenced assigned `doctors` and one `address`.
- `mfaEnabled`.
- Role enum fixed to `patient`.
- Automatic timestamps.

### Appointment

Fields include:

- Required references to one `Doctor` and one `Patient`.
- Required `date` and `time`.
- `status` enum: `booked`, `completed`, or `cancelled`.
- Optional `meetingLink`.
- Automatic timestamps.
- Unique compound index on `{ doctor, date, time }`.

The compound index is the database-level invariant for one doctor/date/time slot. The controller's pre-check improves user feedback but does not replace the index under concurrent requests.

### Address and Image

`Address` is a referenced address document used by doctor/patient profiles. `Image` exists as a separate model for image-oriented storage, but no active controller use was identified in the inspected code. This suggests either legacy or incomplete functionality.

## 9. Authentication and Authorization

### Password authentication

- Login validates input with Zod.
- Emails are lowercased and trimmed.
- Passwords are hashed with bcrypt cost 10 during signup and reset.
- User role is detected from the doctor and patient collections rather than trusted from the login request.
- Password fields are removed from most serialized responses.
- JWTs contain `id` and `role` and expire after seven days.

### Patient activation and OTP

Patient signup creates an inactive account and sends a six-digit OTP. Verification activates the patient. An unactivated patient attempting login receives a new OTP and cannot receive a normal session token until the OTP flow is completed.

### Doctor MFA

Doctor login requires an OTP after password verification. Patients can also use MFA when enabled. Invalid MFA attempts are counted, and the in-memory record is deleted after three failures.

### OTP implementation limitation

OTP records are stored in a process-local JavaScript `Map` and cleaned by a five-minute interval. This means:

- Restarting the process invalidates outstanding OTPs.
- Multiple backend instances do not share OTP state.
- The state is not durable or centrally rate limited.
- The interval can contribute to open-handle behavior in tests if the module remains loaded.

Redis or another shared expiring store is the appropriate production design.

### JWT middleware

`verifyToken` accepts a `Bearer` authorization token or a cookie token, verifies it with `SECRET_KEY`, and stores decoded claims on `req.user`. Missing tokens return 401, expired tokens return 401 with a session-expired message, and other verification failures return 403. `authorizeRoles` returns 401 without a user and 403 for role mismatch.

### Client authorization boundary

`ProtectedRoute` hides pages for unauthenticated or wrong-role users, but all backend route protections remain mandatory because callers can bypass the React application.

## 10. Security Controls

### Controls present

- Helmet security headers and CSP.
- Production HTTPS redirect.
- CORS allowlist with credentials.
- JWT verification and role authorization.
- Bcrypt password hashing.
- OTP expiration and MFA attempt limit.
- Doctor verification before appointment booking.
- JWT-derived ownership for appointment queries and updates.
- Compound unique index for double-booking prevention.
- AI and authentication rate limiters.
- Certificate upload MIME filtering and 2 MB limit through Multer.
- Centralized error handling for common MongoDB/JWT failures.
- Password omission from most user responses.

### High-priority risks

1. **Public doctor mutations:** `/api/doctors/add` and `/api/doctors/edit/:id` are reachable through the public doctor mount. An attacker may create or alter doctor records unless controller-level checks prevent it.
2. **Public appointment data route:** `GET /api/doctors/:doctorId/appointments` is public and may expose appointment or patient information.
3. **Patient mutation authorization:** patient create/edit/assign routes do not show consistent role or ownership checks at the route boundary.
4. **Public AI endpoint:** the frontend requires login, but direct API callers do not; rate limiting alone may not be sufficient for a health-related service.
5. **Google token in query string:** the OAuth callback redirects with `?token=...`, which can leak through browser history, referrers, logs, or analytics. A short-lived one-time code or secure cookie is safer.
6. **LocalStorage JWT:** XSS can expose bearer tokens. HttpOnly secure cookies with CSRF protection reduce this exposure.
7. **Profile upload limits:** profile upload handling appears to rely on MIME checks without the explicit 2 MB limit used for certificates. MIME values can be spoofed; content inspection and size limits are recommended.
8. **HTML email interpolation:** names and other values are inserted into HTML without escaping. Escape user-controlled values before rendering email HTML.
9. **Admin plain-password fallback:** supporting a plaintext environment password is convenient but should be disabled in production; only a strong hash should be accepted.
10. **Insufficient AI validation:** the AI route should validate message types, role/content lengths, allowed fields, and total request size.

### Medium-priority risks and maintainability issues

- Password-reset responses reveal whether an account exists, enabling account enumeration.
- OTP state is not shared across horizontally scaled instances.
- The server logs database errors but does not fail fast when startup connection fails.
- Duplicate route mounts make effective protection difficult to reason about.
- The README documents `MONGO_URI`, while `server.js` reads `MONGO_URL`.
- The README documents `/api/cc-admin-9x7z`, while the implementation mounts `/api/admin`.
- Several frontend modules hard-code localhost backend URLs.
- GraphQL resolvers have no visible auth boundary if they are later mounted.

## 11. Testing and Quality Report

### Existing framework

The backend uses Jest 29.7 and Supertest 7.1. The configured test environment is Node. Tests are discovered under `Server/test/**/*.test.js` and configured to run serially with a five-minute Jest timeout.

### Test suites present

- `doctor.test.js`: five original doctor CRUD tests.
- `auth.test.js`: signup, login, OTP, MFA, validation, duplicate, and email-normalization cases.
- `appointment.test.js`: booking, doctor verification, duplicate slots, retrieval, cancellation, status updates, RBAC, and IDOR cases.
- `middleware.test.js`: missing/invalid/expired token handling, Bearer parsing, role checks, protected routes, and ownership cases.
- `rateLimit.test.js`: AI and auth limits, 429 behavior, headers, and independent limiter state.
- `testSetup.js`: local test database connection, teardown, and collection clearing.

The documented total is 78 tests: 20 authentication, 23 appointment, 22 middleware, 8 rate-limit, and 5 original doctor tests.

### Verified execution status

The terminal output supplied with this review shows that the test suite is **not passing or complete** in the current environment:

- Jest attempted to download MongoDB Memory Server version 6.0.14, a 509.3 MB binary.
- The appointment suite timed out during `beforeAll` at 120 seconds while the download/connection setup was unresolved.
- The doctor suite failed with `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`.
- Jest reported that it did not exit cleanly after the failed run, consistent with unresolved async resources or module timers.

Therefore, claims in existing handover documents that all 78 tests pass and that the project is production-ready are not supported by the supplied execution evidence. The correct current status is: **test code exists, but backend execution is blocked by database/test-environment setup and has not been validated successfully.**

### Coverage gaps

No automated client tests were identified. Backend gaps include:

- Admin route tests.
- Profile upload and MFA toggle tests.
- Google OAuth callback tests.
- AI request validation and provider-failure tests.
- Upload security tests.
- Patient mutation authorization tests.
- Public doctor appointment exposure tests.
- GraphQL tests.
- Startup/database failure tests.

## 12. Build, Run, and Validation Commands

### Backend

```powershell
cd Server
npm install
npm start
npm test
npm test -- --coverage
npm run security-check
```

The backend test commands require a MongoDB instance at the URI used by the tests, normally `mongodb://127.0.0.1:27017`. The application startup uses `MONGO_URL`; configure that variable consistently.

### Frontend

```powershell
cd client
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

The previous validation record reports that the client production build succeeds. Lint currently fails and should be treated as a quality gate failure until corrected.

## 13. Environment Configuration

The README documents variables such as:

- `SECRET_KEY`
- `MONGO_URI`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `OPENAI_API_KEY`
- Google client credentials
- Client `VITE_API_URL`

The implementation additionally references or expects:

- `MONGO_URL` in `server.js`.
- `BACKEND_URL` for profile image URLs and CSP connect sources.
- `ADMIN_PASSWORD_HASH` and `ADMIN_PORTAL_PASSWORD` for admin login.
- `OPENROUTER_API_KEY` for AI calls.
- `GOOGLE_CALLBACK_URL` for OAuth callback override.
- `PORT` for HTTP binding.

Environment documentation should be reconciled with the code and secrets should never be committed. The existing `.env` files must be reviewed for accidental credential exposure before pushing or sharing the repository.

## 14. Deployment Assessment

The README identifies Netlify for the frontend and Render for the backend. A successful deployment requires:

- A reachable MongoDB deployment with correct network allowlisting.
- Render environment variables matching the names actually read by code.
- A frontend API base URL that is not overridden by localhost fallbacks.
- Correct Google OAuth callback and frontend redirect URLs.
- Gmail SMTP credentials or a production email provider.
- A stable shared OTP store if multiple backend instances are used.
- Persistent or external storage for uploaded certificates/profile images.
- Correct proxy headers for HTTPS redirect and rate-limit client identity.
- CI execution of server tests against an isolated database.

## 15. Prioritized Recommendations

### P0: Before production or public exposure

1. Protect doctor create/edit/delete and patient mutations with explicit backend authentication, role, and ownership checks.
2. Remove or restrict public appointment/patient data access.
3. Reconcile route documentation with actual mounts, especially admin paths.
4. Make MongoDB startup fail fast and standardize `MONGO_URL` versus `MONGO_URI`.
5. Establish a reproducible test database strategy and make the full suite pass in CI.
6. Rotate and verify all secrets; ensure `.env` files are not tracked.

### P1: Security hardening

1. Replace query-string JWT delivery from Google OAuth.
2. Replace localStorage tokens with secure HttpOnly cookies where feasible.
3. Add strict upload size/content validation for every upload path.
4. Escape values inserted into HTML emails.
5. Remove plaintext admin password fallback in production.
6. Add account-enumeration-resistant password reset responses.
7. Add strict AI request schema and input/output limits.

### P2: Quality and maintainability

1. Remove duplicate router mounting or clearly separate public and protected routers.
2. Remove hard-coded localhost URLs from frontend pages.
3. Fix all client lint errors and warnings.
4. Add admin, profile, OAuth, AI, upload, and patient authorization tests.
5. Add client component/page tests and API contract tests.
6. Decide whether GraphQL is active; otherwise document it as experimental or remove stale code.
7. Keep generated coverage output out of normal source changes unless intentionally published.

## 16. Final Assessment

CareConnect has a credible capstone-level feature set and a recognizable full-stack architecture. Its strongest implementation areas are the role-oriented client flows, JWT ownership checks for appointments, doctor verification gate, database-level appointment uniqueness, password hashing, MFA/OTP behavior, and basic HTTP security middleware.

Its current weaknesses are primarily security-boundary consistency, configuration drift, unverified test execution, public route exposure, and frontend environment coupling. The project should be described as **feature-complete in several user-facing areas but requiring security hardening and reproducible validation before production certification**.

The most important immediate action is not adding more features: it is making route authorization explicit, aligning environment/route documentation with code, starting an isolated MongoDB test service, and obtaining a clean test and lint result.