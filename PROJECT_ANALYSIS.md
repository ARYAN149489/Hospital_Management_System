# MediCare Plus — Hospital Management System
## Complete Project Analysis, Interview Guide & Technical Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Architecture](#3-project-architecture)
4. [Database Design — All Models](#4-database-design--all-models)
5. [API Reference](#5-api-reference)
6. [Authentication & Security Deep Dive](#6-authentication--security-deep-dive)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Feature Walkthrough by Role](#8-feature-walkthrough-by-role)
9. [Problems Solved During Development](#9-problems-solved-during-development)
10. [Current Flaws & Weaknesses](#10-current-flaws--weaknesses)
11. [Interview Questions & Answers — Low to High Level](#11-interview-questions--answers--low-to-high-level)

---

## 1. Project Overview

**MediCare Plus** is a full-stack Hospital Management System web application that digitizes the core operations of a hospital. It serves three types of users — Patients, Doctors, and Admins — each with their own dedicated dashboard and workflow.

### What Problem Does It Solve?

Traditional hospital management involves:
- Paper-based appointment booking (error-prone, slow)
- Manual prescription writing (hard to store/retrieve)
- Phone-based scheduling (inefficient, no record)
- No patient health history visibility
- No administrative oversight of doctor availability

MediCare Plus eliminates all of these with a centralized digital platform.

### Core User Flow

```
Patient Registers
       ↓
Browses Doctors by Specialization / Department
       ↓
Books an Appointment (date + time slot)
       ↓
Doctor Confirms & Conducts Consultation
       ↓
Doctor Writes Digital Prescription
       ↓
Patient Views Prescription & Books Lab Tests
       ↓
Admin Monitors Everything via Dashboard
```

### Application Name
The app is internally called **MediCare Plus** — visible in `server.js` startup logs and the health check endpoint response.

---

## 2. Tech Stack

### Backend

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | ≥ 18.0.0 | JavaScript server runtime |
| Framework | Express.js | ^4.18.2 | HTTP server, routing, middleware |
| Database | MongoDB | ^6.20.0 | NoSQL document database |
| ODM | Mongoose | ^8.0.3 | Schema modeling for MongoDB |
| Authentication | jsonwebtoken | ^9.0.2 | JWT access & refresh tokens |
| Password Hashing | bcryptjs | ^2.4.3 | Secure password storage |
| Input Validation | express-validator | ^7.0.1 | Request body validation |
| File Uploads | multer | ^1.4.5-lts.1 | Multipart file handling |
| Email | nodemailer | ^7.0.10 | Password reset, notifications |
| Security Headers | helmet | ^7.1.0 | HTTP security headers |
| NoSQL Injection | express-mongo-sanitize | ^2.2.0 | Strip `$` and `.` from inputs |
| Rate Limiting | express-rate-limit | ^7.1.5 | IP-based request throttling |
| CORS | cors | ^2.8.5 | Cross-origin resource sharing |
| AI Chatbot | @google/generative-ai | ^0.24.1 | Google Gemini AI integration |
| HTTP Logging | morgan | ^1.10.0 | Request logging |
| Date Utilities | date-fns | ^3.0.0 | Date manipulation |
| Dev Server | nodemon | ^3.1.10 | Auto-restart on file changes |
| Testing | jest + supertest | ^30.2.0 | Unit & integration tests |

### Frontend

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | ^19.2.6 | UI component library |
| Build Tool | Vite | ^8.0.12 | Dev server + bundler |
| Routing | React Router DOM | ^7.15.1 | Client-side routing |
| HTTP Client | Axios | ^1.16.1 | API calls with interceptors |
| Charts | Recharts | ^3.8.1 | Analytics dashboards |
| Icons | Lucide React | ^1.17.0 | SVG icon library |
| Toasts | React Hot Toast | ^2.6.0 | User notifications/alerts |
| Google OAuth | @react-oauth/google | ^0.13.5 | Google Sign-In |
| Date Utilities | date-fns | ^4.3.0 | Date formatting |
| Linting | ESLint | ^10.3.0 | Code quality |

---

## 3. Project Architecture

```
hospital_management/
├── backend/
│   ├── server.js                  ← Express app entry point, middleware setup, route mounting
│   ├── package.json
│   ├── .env                       ← Environment variables (DB URI, JWT secrets, API keys)
│   ├── config/
│   │   └── database.js            ← MongoDB connection with Mongoose
│   ├── controllers/               ← Business logic (14 controllers)
│   │   ├── auth.controller.js
│   │   ├── appointment.controller.js
│   │   ├── doctor.controller.js
│   │   ├── doctorDashboard.controller.js
│   │   ├── patient.controller.js
│   │   ├── prescription.controller.js
│   │   ├── leave.controller.js
│   │   ├── labTest.controller.js
│   │   ├── notification.controller.js
│   │   ├── chatbot.controller.js
│   │   ├── oauth.controller.js
│   │   ├── adminDashboard.controller.js
│   │   ├── adminDepartment.controller.js
│   │   └── adminUserManagement.controller.js
│   ├── models/                    ← 13 Mongoose schemas
│   │   ├── User.model.js
│   │   ├── Patient.model.js
│   │   ├── Doctor.model.js
│   │   ├── Admin.model.js
│   │   ├── Appointment.model.js
│   │   ├── Prescription.model.js
│   │   ├── Department.model.js
│   │   ├── Leave.model.js
│   │   ├── LabTest.model.js
│   │   ├── Notification.model.js
│   │   ├── MedicalRecord.model.js
│   │   ├── BlockedSlot.model.js
│   │   └── ChatMessage.model.js
│   ├── routes/                    ← 14 route files
│   ├── middleware/
│   │   ├── auth.middleware.js      ← JWT verification, profile attachment
│   │   ├── roleCheck.middleware.js ← RBAC enforcement
│   │   ├── upload.middleware.js    ← Multer file upload config
│   │   ├── validate.middleware.js  ← Input validation
│   │   ├── errorHandler.js        ← Simple error handler (used in server.js)
│   │   └── errorHandler.middleware.js ← Rich error handler with Mongoose/JWT mapping
│   ├── services/                  ← Reusable business logic
│   │   ├── auth.service.js
│   │   ├── appointment.service.js
│   │   ├── leave.service.js
│   │   ├── notification.service.js
│   │   ├── prescription.service.js
│   │   └── user.service.js
│   ├── utils/                     ← Helper utilities
│   │   ├── jwt.js                 ← Token generation/verification
│   │   ├── catchAsync.js          ← Async error wrapper
│   │   ├── responseHandler.js     ← Standardized API responses
│   │   ├── appointmentStatus.js   ← Auto-expire stale appointments
│   │   └── (email, validators, etc.)
│   ├── scripts/
│   │   └── seedAdmin.js           ← Creates default admin user
│   └── uploads/                   ← Static file storage
│       ├── profiles/
│       ├── medical-records/
│       ├── prescriptions/
│       └── lab-reports/
└── frontend/
    ├── vite.config.js             ← Dev proxy config (/api → port 5002)
    ├── package.json
    └── src/
        ├── App.jsx                ← Root component, router setup
        ├── context/
        │   └── AuthContext.jsx    ← Global auth state (user, login, logout, refresh)
        ├── services/
        │   └── api.js             ← All API calls, Axios instance, interceptors
        ├── components/
        │   ├── auth/              ← PrivateRoute (role-based guard)
        │   ├── common/            ← Navbar, Footer, Notifications
        │   ├── admin/
        │   ├── doctor/
        │   └── patient/
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Signup.jsx
            ├── NotFound.jsx
            ├── patient/           ← Dashboard, Appointments, BookAppointment, etc.
            ├── doctor/            ← DoctorDashboard, Prescriptions, Schedule, etc.
            └── admin/             ← AdminDashboard, ManageDoctors, ManagePatients, etc.
```

### Architectural Pattern

The backend follows a **layered architecture**:

```
HTTP Request → Route → Middleware (auth + role) → Controller → Service → Model → MongoDB
                                                                    ↓
HTTP Response ←────────────────────────────────────────────────────┘
```

- **Routes** only define endpoints and chain middleware
- **Controllers** handle request/response, call services
- **Services** contain reusable business logic (shared across controllers)
- **Models** define schemas and data access methods

---

## 4. Database Design — All Models

The project uses MongoDB with Mongoose. There are **13 models** organized around a core `User` model with role-specific profile models extending it.

### Relationship Overview

```
User (auth data)
 ├── Patient (1:1) → Appointments, Prescriptions, LabTests, MedicalRecords
 ├── Doctor  (1:1) → Appointments, Prescriptions, Leaves, BlockedSlots
 └── Admin   (1:1)

Department → Doctor (1:Many)
Appointment → Prescription (1:1)
Appointment → LabTest (1:Many)
ChatMessage → User (Many:1)
Notification → User (Many:1)
```

---

### User Model (`User.model.js`)

The base authentication model shared by all three roles.

| Field | Type | Details |
|---|---|---|
| `email` | String | Unique, lowercase, regex validated |
| `password` | String | bcrypt hashed, `select: false` |
| `role` | String | Enum: `patient`, `doctor`, `admin` |
| `firstName`, `lastName` | String | Required |
| `phone` | String | 10-digit regex validated |
| `dateOfBirth` | Date | Required |
| `gender` | String | Enum: `male`, `female`, `other` |
| `address` | Object | street, city, state, pincode, country |
| `profileImage` | String | File path |
| `isActive` | Boolean | Account enabled/disabled |
| `isEmailVerified` | Boolean | Email verification status |
| `refreshToken` | String | Stored for rotation, `select: false` |
| `passwordResetToken` | String | Hashed reset token |
| `lastLogin` | Date | Tracked on each login |
| `lastPasswordChange` | Date | Used to invalidate old JWTs |

**Key methods:**
- `comparePassword(candidate)` — bcrypt comparison
- `changedPasswordAfter(JWTTimestamp)` — invalidates tokens after password reset
- `toJSON()` — strips password, tokens, `__v` from responses

**Virtuals:** `fullName`, `age`

---

### Patient Model (`Patient.model.js`)

Extended profile for patients. Linked to `User` via `user: ObjectId`.

| Field | Type | Details |
|---|---|---|
| `patientId` | String | Auto-generated: `PAT000001` |
| `bloodGroup` | String | Enum: A+, A-, B+, B-, AB+, AB-, O+, O- |
| `height` / `weight` | Object | value + unit (cm/ft, kg/lbs) |
| `allergies` | Array | name, severity (mild/moderate/severe), notes |
| `chronicDiseases` | Array | name, diagnosedDate, status, notes |
| `currentMedications` | Array | name, dosage, frequency, prescribedBy (ref Doctor) |
| `pastSurgeries` | Array | name, date, hospital, doctor, notes |
| `familyHistory` | Array | relation, condition, notes |
| `emergencyContact` | Object | name, relationship, phone, email |
| `insurance` | Object | provider, policyNumber, validUntil, coverageAmount |
| `registrationStatus` | String | `pending` or `completed` |
| `totalAppointments` | Number | Running count |

**Key methods:**
- `calculateBMI()` — handles unit conversion (ft→m, lbs→kg)
- `getBMICategory()` — returns Underweight/Normal/Overweight/Obese

**Virtuals (populated):** `appointments`, `prescriptions`, `medicalRecords`

---

### Doctor Model (`Doctor.model.js`)

The most complex model in the project.

| Field | Type | Details |
|---|---|---|
| `doctorId` | String | Auto-generated: `DOC000001` |
| `specialization` | String | Required |
| `department` | ObjectId | ref: Department |
| `qualifications` | Array | degree, institution, year |
| `medicalLicenseNumber` | String | Unique, required |
| `yearsOfExperience` | Number | Min 0 |
| `consultationFee` | Number | Min 0 |
| `consultationDuration` | Number | Default 30 minutes |
| `availability` | Array | day (enum), slots [{startTime, endTime}], isAvailable |
| `rating` | Object | average (0-5), count |
| `approvalStatus` | String | `pending`, `approved`, `rejected`, `suspended` |
| `isBlocked` | Boolean | Admin can block independently of approval |
| `currentLeaveStatus` | String | `available` or `on_leave` |
| `maxAppointmentsPerDay` | Number | Default 20 |
| `languages` | Array | Enum of 12 Indian languages + other |
| `documents` | Object | degreeCertificate, licenseCertificate, identityProof |
| `achievements` | Array | title, year, description |
| `previousWorkplaces` | Array | hospital, position, from, to |

**Key methods:**
- `isAvailableAt(date, time)` — checks day schedule for a given datetime
- `getAvailableSlotsForDay(dayName)` — returns slot array for a day
- `updateRating(newRating)` — running average calculator

**Virtuals (populated):** `appointments`, `leaves`, `prescriptions`

---

### Appointment Model (`Appointment.model.js`)

Core transactional model connecting patients and doctors.

| Field | Type | Details |
|---|---|---|
| `appointmentId` | String | Auto-generated: `APT202501010001` |
| `patient` | ObjectId | ref: Patient |
| `doctor` | ObjectId | ref: Doctor |
| `appointmentDate` | Date | Required |
| `appointmentTime` | String | Format: `"14:30"` |
| `appointmentType` | String | `in-person` or `emergency` |
| `status` | String | `scheduled`, `confirmed`, `in-progress`, `completed`, `cancelled`, `no-show`, `rescheduled` |
| `reasonForVisit` | String | Required |
| `symptoms` | Array | String list |
| `diagnosis` | String | Filled post-consultation |
| `prescription` | ObjectId | ref: Prescription |
| `rating` | Object | score (1-5), review, ratedAt |
| `cancellationReason` | String | Why cancelled |
| `cancelledBy` | String | `patient`, `doctor`, `admin`, `system` |
| `rescheduledFrom` | Object | original date + time |
| `priority` | String | `normal`, `urgent`, `emergency` |
| `queueNumber` | Number | For in-person visits |
| `checkInTime` / `checkOutTime` | Date | Actual visit tracking |
| `followUpRequired` | Boolean | |
| `internalNotes` | String | Doctor/admin only |

**Key methods:**
- `canBeCancelled()` — false if < 2 hours before appointment
- `canBeRescheduled()` — false if < 4 hours before appointment
- `getActualDuration()` — calculates from checkIn/checkOut

**Static methods:**
- `getTodayAppointmentsForDoctor(doctorId)`
- `getUpcomingAppointmentsForPatient(patientId)`

**Virtuals:** `timeUntilAppointment`, `isToday`, `isUpcoming`

---

### Prescription Model (`Prescription.model.js`)

Detailed digital prescription written by doctors post-consultation.

| Field | Type | Details |
|---|---|---|
| `prescriptionId` | String | Auto-generated: `RX202501010001` |
| `patient`, `doctor`, `appointment` | ObjectId | refs |
| `diagnosis` | String | Required |
| `chiefComplaints` | Array | String list |
| `vitalSigns` | Object | BP (systolic/diastolic), temperature, pulse, SpO2, weight, height |
| `medications` | Array | name, genericName, dosage, frequency, duration, route (oral/topical/injection/etc), timing, instructions |
| `labTests` | Array | testName, reason, urgent flag |
| `generalInstructions` | String | |
| `dietaryAdvice` | String | |
| `lifestyleRecommendations` | Array | |
| `followUp` | Object | required, after (value + unit), reason |
| `status` | String | `active`, `completed`, `discontinued`, `replaced` |
| `validUntil` | Date | Auto-set to 30 days from prescription date |
| `digitalSignature` | Object | signed, signedAt, signatureUrl |
| `pharmacyVerification` | Object | verified, verifiedBy, pharmacyName |
| `attachments` | Array | filename, url |

**Virtuals:** `isValid`, `daysRemaining`, `totalMedications`

---

### Leave Model (`Leave.model.js`)

Doctor leave management with admin approval workflow.

| Field | Type | Details |
|---|---|---|
| `leaveId` | String | Auto-generated |
| `doctor` | ObjectId | ref: Doctor |
| `leaveType` | String | `sick`, `casual`, `vacation`, `emergency`, `maternity`, `paternity`, `other` |
| `startDate`, `endDate` | Date | |
| `totalDays` | Number | Calculated |
| `reason` | String | |
| `status` | String | `pending`, `approved`, `rejected`, `cancelled` |
| `approvedBy` | ObjectId | ref: Admin |
| `affectedAppointments` | Array | Appointments that fall in leave period |

---

### LabTest Model (`LabTest.model.js`)

| Field | Type | Details |
|---|---|---|
| `labTestId` | String | Auto-generated: `LT...` |
| `patient` | ObjectId | ref: Patient |
| `prescribedBy` | ObjectId | ref: Doctor |
| `testName`, `testCategory` | String | |
| `testType` | String | `home`, `lab`, `hospital` |
| `scheduledDate`, `scheduledTime` | Date/String | |
| `status` | String | `booked`, `sample_collected`, `processing`, `completed`, `cancelled` |
| `results` | Array | parameter, value, normalRange, status (normal/high/low/critical) |
| `report` | Object | url, uploadedAt |
| `payment` | Object | amount, status, method |

---

### Other Models (Summary)

| Model | Purpose |
|---|---|
| **Department** | Hospital departments with operating hours, bed capacity, services, head doctor |
| **Admin** | Admin profile with role (`super_admin`/`admin`/`moderator`) and granular permissions |
| **Notification** | In-app notifications with 20+ types, priority levels, read/unread state, expiry |
| **MedicalRecord** | Patient documents and uploaded health records |
| **BlockedSlot** | Specific date/time slots a doctor has manually blocked |
| **ChatMessage** | Persisted chatbot conversation history per user |

---

## 5. API Reference

**Base URL:** `http://localhost:5002/api`

---

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register patient or doctor |
| POST | `/login` | Public | Login, returns access + refresh tokens |
| POST | `/logout` | Private | Clears refresh token in DB |
| GET | `/profile` | Private | Get current user + role profile |
| POST | `/forgot-password` | Public | Sends reset email |
| POST | `/reset-password` | Public | Reset with token from email |
| POST | `/change-password` | Private | Change password (requires current) |
| POST | `/refresh-token` | Public | Exchange refresh token for new access token |
| GET | `/verify-email/:token` | Public | Email verification |
| POST | `/google` | Public | Google OAuth login/register |

---

### Patient Routes — `/api/patients` (Patient only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get patient profile |
| PUT | `/profile` | Update patient profile |
| GET | `/dashboard` | Dashboard stats + recent activity |
| GET | `/medical-records` | All medical records |
| POST | `/medical-records` | Upload new record |
| GET | `/prescriptions` | All prescriptions |
| GET | `/lab-tests` | All lab test bookings |
| POST | `/lab-tests/book` | Book a new lab test |
| POST | `/documents` | Upload documents (multipart) |

---

### Doctor Public Routes — `/api/doctors` (Public)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all approved doctors (with filters) |
| GET | `/search` | Search doctors by name/specialization |
| GET | `/top-rated` | Get top-rated doctors |
| GET | `/specialization/:spec` | Doctors by specialization |
| GET | `/department/:deptId` | Doctors in a department |
| GET | `/:id` | Single doctor profile |
| GET | `/:id/availability` | Doctor's available slots |

---

### Doctor Dashboard Routes — `/api/doctor` (Doctor only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get own doctor profile |
| PUT | `/profile` | Update profile |
| GET | `/schedule` | Get availability schedule |
| PUT | `/schedule` | Update availability slots |
| GET | `/dashboard` | Dashboard stats |
| GET | `/appointments` | All own appointments (filterable) |
| PATCH | `/appointments/:id/status` | Update appointment status |
| POST | `/prescriptions` | Create new prescription |
| GET | `/prescriptions` | All own prescriptions |
| GET | `/patients` | All unique patients seen |
| GET | `/patients/:id/history` | Full history for a patient |

---

### Appointment Routes — `/api/appointments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Patient | Book new appointment |
| GET | `/my-appointments` | Private | Get own appointments (filterable by status, date, type) |
| GET | `/available-slots/:doctorId` | Public | Check available slots for a date |
| GET | `/:id` | Private | Get single appointment |
| PATCH | `/:id/cancel` | Private | Cancel appointment |
| PATCH | `/:id/reschedule` | Private | Reschedule appointment |
| PATCH | `/:id/rate` | Patient | Rate completed appointment |

---

### Admin Routes — `/api/admin` (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Dashboard statistics |
| GET | `/analytics` | Revenue, appointment trends |
| GET | `/appointments` | All appointments system-wide |
| GET | `/users` | All users with filters |
| PUT | `/users/:id` | Edit any user |
| DELETE | `/users/:id` | Delete user |
| PATCH | `/users/:id/status` | Toggle user active/inactive |
| GET | `/doctors` | All doctors (filter by status) |
| POST | `/doctors/create` | Create doctor directly |
| PATCH | `/doctors/:id/approval` | Approve or reject doctor |
| PATCH | `/doctors/:id/suspend` | Suspend a doctor |
| POST | `/doctors/:id/block` | Block a doctor |
| DELETE | `/doctors/:id/unblock` | Unblock a doctor |
| GET | `/patients` | All patients |
| GET | `/patients/:id` | Patient detail with history |
| GET | `/leaves` | All leave applications (filterable) |
| PATCH | `/leaves/:id/approval` | Approve or reject leave |
| GET/POST/PUT/DELETE | `/departments` | Full CRUD on departments |
| GET | `/lab-tests` | All lab tests |
| PATCH | `/lab-tests/:id/result` | Upload lab test result |
| PATCH | `/lab-tests/:id/status` | Update lab test status |

---

### Other Routes

| Prefix | Description |
|---|---|
| `/api/prescriptions` | Get prescription by ID |
| `/api/leaves` | Doctor: apply/view/cancel leaves |
| `/api/departments` | Public: list departments |
| `/api/notifications` | Get, mark read, delete notifications |
| `/api/chatbot` | Send message, get history, clear history |

---

### Standard API Response Format

All responses follow this consistent structure (via `responseHandler.js`):

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Access denied. You do not have permission to perform this action.",
  "requiredRole": "admin"
}
```

---

## 6. Authentication & Security Deep Dive

### JWT Dual-Token Strategy

The project uses **two tokens** for authentication:

```
LOGIN
  ↓
Backend generates:
  • Access Token  — short-lived (e.g., 15 min), used for every API call
  • Refresh Token — long-lived (e.g., 7 days), used ONLY to get new access tokens

Both tokens stored in browser localStorage.
Refresh token also stored in MongoDB User document.
```

**Why two tokens?**  
If only a long-lived access token is used, stolen tokens are valid for days. With short-lived access tokens, a stolen token expires in minutes. The refresh token stays hidden (only sent to `/auth/refresh-token`, never to regular endpoints).

---

### Token Refresh Flow (Axios Interceptor)

```
API Call → 401 Unauthorized
        ↓
Is it a retry? Is it an auth endpoint?
        ↓ No
Call POST /auth/refresh-token with refreshToken
        ↓
New accessToken received → update localStorage
        ↓
Retry original request with new token
        ↓
If refresh also fails → clear tokens → redirect to /login
```

This is implemented in `frontend/src/services/api.js` using Axios response interceptors and happens invisibly to the user.

---

### Password Security Flow

```
User submits password
        ↓
Mongoose pre('save') hook fires
        ↓
bcrypt.genSalt(10) → generates random salt
        ↓
bcrypt.hash(password, salt) → produces hash
        ↓
Only hash stored in DB (never plain text)

On Login:
bcrypt.compare(candidatePassword, storedHash) → true/false
```

**Additional protection:** `changedPasswordAfter(JWTTimestamp)` — if a user resets their password, all previously issued JWTs become invalid because their `iat` (issued-at) timestamp will be older than `lastPasswordChange`.

---

### Middleware Chain on Protected Routes

```
Request → authenticate → attachProfile → roleCheck → controller
```

1. **`authenticate`** — Extracts Bearer token, verifies JWT signature, checks user exists in DB, checks `isActive`, checks `changedPasswordAfter`
2. **`attachProfile`** — Loads Patient/Doctor/Admin profile based on role, attaches to `req.profile`
3. **`roleCheck`** — `patientOnly`, `doctorOnly`, `adminOnly`, `doctorOrAdmin`, etc.
4. **`requireApprovedDoctor`** — For doctor-specific routes, also checks `approvalStatus === 'approved'`
5. **`checkAdminPermission(permission)`** — Granular permission check on Admin model

---

### RBAC Permission Matrix

| Action | Patient | Doctor (approved) | Admin |
|---|---|---|---|
| Book appointment | ✅ | ❌ | ❌ |
| View own appointments | ✅ | ✅ | ✅ |
| Write prescription | ❌ | ✅ | ❌ |
| Apply for leave | ❌ | ✅ | ❌ |
| Approve doctor | ❌ | ❌ | ✅ |
| View all appointments | ❌ | ❌ | ✅ |
| Delete any user | ❌ | ❌ | ✅ (super_admin) |
| View analytics | ❌ | ❌ | ✅ |
| Rate appointment | ✅ (own, completed) | ❌ | ❌ |

---

### Security Middleware Stack (server.js)

| Middleware | What It Does |
|---|---|
| `helmet()` | Sets 14 HTTP headers: CSP, X-Frame-Options, HSTS, etc. Prevents XSS, clickjacking, MIME sniffing |
| `mongoSanitize()` | Strips `$` and `.` from req.body, req.params, req.query. Prevents NoSQL injection like `{ "email": { "$gt": "" } }` |
| `rateLimit(1000/15min)` | Limits each IP to 1000 requests per 15 minutes. Mitigates brute force and DDoS |
| `cors(origin)` | Only allows requests from the configured `FRONTEND_URL`. Rejects other origins |
| `express.json({ limit: '10mb' })` | Prevents oversized payload attacks |
| `select: false` on passwords | Password/token fields never returned in queries unless explicitly selected |

---

### Google OAuth Flow

```
Frontend: User clicks "Sign in with Google"
        ↓
@react-oauth/google returns a credential (JWT from Google)
        ↓
Frontend: POST /api/auth/google { credential }
        ↓
Backend (oauth.controller.js): Verifies credential with Google's API
        ↓
Finds existing User by email or creates new one (role: 'patient' by default)
        ↓
Issues own JWT access + refresh tokens (same as normal login)
        ↓
Frontend stores tokens, sets auth state
```

---

## 7. Frontend Architecture

### Routing Structure

```
/                        → Home (public)
/login                   → Login (public)
/signup                  → Signup (public)

/patient/dashboard       → PatientDashboard  (role: patient only)
/doctor/dashboard        → DoctorDashboard   (role: doctor only)
/admin/dashboard         → AdminDashboard    (role: admin only)

/patient                 → redirects to /patient/dashboard
/doctor                  → redirects to /doctor/dashboard
/admin                   → redirects to /admin/dashboard
*                        → NotFound (404)
```

### PrivateRoute Component

Route protection is handled by a `PrivateRoute` component that:
1. Reads `isAuthenticated` and `user.role` from `AuthContext`
2. If not authenticated → redirects to `/login`
3. If authenticated but wrong role → redirects to their correct dashboard
4. If correct role → renders the child component

```jsx
<PrivateRoute allowedRoles={['admin']}>
  <AdminDashboard />
</PrivateRoute>
```

---

### AuthContext — Global State

`AuthContext.jsx` manages all authentication state globally:

| State | Type | Purpose |
|---|---|---|
| `user` | Object | Full user object + profile data |
| `loading` | Boolean | Initial auth check in progress |
| `isAuthenticated` | Boolean | Quick auth check flag |

| Method | Purpose |
|---|---|
| `login(credentials, role)` | POST /auth/login, stores tokens |
| `signup(userData, role)` | POST /auth/register, auto-login |
| `logout()` | POST /auth/logout, clears tokens + state |
| `googleLogin(credential)` | POST /auth/google |
| `updateUser(userData)` | Update in-memory user (optimistic) |
| `refreshProfile()` | Re-fetch profile from server (post-update) |

On app load, `checkAuth()` reads localStorage for a token and silently validates it against `/auth/profile` to restore the session.

---

### Centralized API Layer (`services/api.js`)

All 50+ API calls are organized into domain groups in one file:

```
authAPI      → register, login, logout, profile, changePassword, googleAuth
patientAPI   → dashboard, profile, medicalRecords, prescriptions, labTests
doctorAPI    → profile, schedule, appointments, prescriptions, patients, leaves
appointmentAPI → create, cancel, reschedule, availableSlots, myAppointments, rate
adminAPI     → stats, users, doctors, patients, leaves, departments, labTests, analytics
notificationAPI → getAll, markRead, markAllRead, delete, unreadCount
chatbotAPI   → sendMessage, getHistory, clearHistory
```

---

### Frontend Pages by Role

**Public Pages**
- `Home` — Landing page with hospital info, featured doctors, CTA buttons
- `Login` — Email/password form + Google Sign-In, role selector
- `Signup` — Registration form with validation
- `NotFound` — 404 page

**Patient Pages**
- `Dashboard` — Upcoming appointments, recent prescriptions, quick stats
- `Appointments` — All appointments with status filter
- `BookAppointment` — Doctor search → select slot → confirm
- `FindDoctors` — Browse/search doctors by specialization
- `Prescriptions` — View all prescriptions with medication details
- `LabTests` — View booked tests + results
- `BookLabTest` — Book a new lab test
- `MedicalRecords` — Upload and view health documents
- `Profile` — Edit personal and medical information
- `Chatbot` — AI health assistant (Gemini-powered)

**Doctor Pages**
- `DoctorDashboard` — Today's appointments, stats, recent patients
- `Appointments` — Manage appointments (confirm, complete, cancel)
- `MySchedule` — Set weekly availability with time slots
- `CreatePrescription` — Write digital prescription for a patient
- `Prescriptions` — All prescriptions written
- `MyPatients` — All unique patients
- `Leave` — Apply for leave, view leave history
- `Profile` — Edit professional profile, qualifications, fees

**Admin Pages**
- `AdminDashboard` — System-wide stats, analytics charts (Recharts)
- `ManageDoctors` — Approve/reject/suspend/block doctors
- `ManagePatients` — View all patients, see their full history
- `ManageAppointments` — All appointments with advanced filters
- `ManageDepartments` — Full CRUD on hospital departments
- `ManageLabTests` — Upload results, update test status
- `ManageLeave` — Approve/reject doctor leave requests

---

### Data Visualization (Recharts)

The Admin Dashboard uses Recharts for:
- Appointment trends over time (LineChart)
- Revenue analytics (BarChart)
- Patient registration stats (AreaChart)
- Department-wise breakdown (PieChart)

---

## 8. Feature Walkthrough by Role

### Patient — Full Journey

```
1. Register with email/password or Google
   → User record created (role: patient)
   → Patient profile created (patientId: PAT000001)
   → Access token + refresh token issued

2. Complete Profile
   → Add blood group, allergies, chronic diseases
   → Add emergency contact, insurance details

3. Find a Doctor
   → Browse by specialization (Cardiology, Dermatology, etc.)
   → Filter by department, rating, fee, language
   → View doctor profile, qualifications, availability

4. Book Appointment
   → Select date → Available slots loaded from doctor's schedule
   → Confirm with reason for visit + symptoms
   → appointmentId generated (APT202501010001)
   → Status: scheduled

5. Post-Consultation
   → Doctor marks appointment as completed
   → Doctor writes prescription
   → Patient sees prescription in their dashboard
   → Patient can rate the doctor (1-5 stars + review)

6. Lab Tests
   → Doctor recommends tests in prescription
   → Patient books test (home/lab/hospital)
   → Admin uploads results
   → Patient views results with normal ranges

7. AI Chatbot
   → Gemini-powered health Q&A
   → Conversation history preserved per session
```

---

### Doctor — Full Journey

```
1. Register
   → Doctor profile created (approvalStatus: pending)
   → Can login but BLOCKED from functional endpoints

2. Admin Approves
   → approvalStatus → approved
   → Doctor now has full access

3. Set Schedule
   → Set availability per day of week
   → Define time slots (e.g., Mon: 09:00-17:00)
   → Set consultation duration and max appointments/day

4. Manage Appointments
   → View today's appointments in time order
   → Confirm → In-Progress → Completed
   → Can cancel with reason

5. Write Prescriptions
   → Select patient (from appointment)
   → Fill diagnosis, vital signs, medications
   → Add lab test recommendations, follow-up date
   → Prescription valid for 30 days by default

6. Apply for Leave
   → Submit leave request (type, dates, reason)
   → Status: pending → Admin approves/rejects
   → On approval: currentLeaveStatus → on_leave
   → Affected appointments tracked

7. View Patient History
   → See all past appointments with a patient
   → View previous prescriptions written for them
```

---

### Admin — Full Journey

```
1. Login (seeded via scripts/seedAdmin.js)

2. Doctor Management
   → View all pending doctor applications
   → Review qualifications, license, documents
   → Approve / Reject with reason
   → Can also suspend or block approved doctors

3. Department Management
   → Create departments (Cardiology, Neurology, etc.)
   → Assign head of department (a Doctor reference)
   → Set operating hours, bed capacity, services

4. Leave Management
   → Review pending leave requests
   → Approve: doctor's currentLeaveStatus → on_leave
   → Reject with reason

5. Lab Test Management
   → View all booked lab tests
   → Update status (booked → sample_collected → processing → completed)
   → Upload result report URL

6. Analytics Dashboard
   → Total patients, doctors, appointments, revenue
   → Trend charts over time periods
   → Department-wise statistics

7. User Management
   → View, edit, deactivate any user
   → Delete accounts
   → Toggle active/inactive status
```

---

## 9. Problems Solved During Development

These are real engineering challenges that arise when building a system like this.

---

**1. Slot Double-Booking**

*Problem:* Two patients could book the same doctor at the same time slot simultaneously.

*Solution:* Before creating an appointment, the `appointment.service.js` queries existing appointments for that doctor, date, and time. If a conflict exists, it returns an error. The Appointment schema also has compound indexes on `{ doctor, appointmentDate }` for fast conflict queries.

*Remaining gap:* Without a MongoDB transaction, two simultaneous requests could still both pass the check before either saves. A production fix would use `session.withTransaction()`.

---

**2. User Session Expiry UX**

*Problem:* Access tokens expire mid-session, causing jarring 401 errors that log users out.

*Solution:* The Axios response interceptor silently catches 401 errors, calls `/auth/refresh-token` with the stored refresh token, updates the access token in localStorage, and retries the original request — all without the user noticing.

---

**3. Doctor Access Before Verification**

*Problem:* A newly registered doctor shouldn't be able to see patient data before their credentials are verified.

*Solution:* The `requireApprovedDoctor` middleware runs on all doctor-functional routes and blocks access with role-specific messages (`pending`, `rejected`, `suspended`). The doctor can still log in and see their own status — they just can't take any action.

---

**4. Cross-Origin Requests in Development**

*Problem:* Frontend runs on port 5173, backend on port 5002. Browsers block cross-origin requests by default, and adding credentials to CORS can be tricky.

*Solution:* Vite's `server.proxy` config forwards all `/api` and `/uploads` requests from the dev server to the backend, making them appear same-origin to the browser. In production, nginx would do the same.

---

**5. Password Security**

*Problem:* Storing plain-text passwords in a database is a critical vulnerability — a single database breach exposes all user credentials.

*Solution:* bcrypt hashing with salt factor 10 in a Mongoose `pre('save')` hook. Even with full database access, reversing bcrypt hashes is computationally infeasible.

---

**6. Role-Based Dashboard Routing**

*Problem:* After login, different users need to land on different pages. The same `/login` page handles three roles.

*Solution:* After login, `AuthContext` stores the `role` from the JWT response. The `PrivateRoute` component reads the allowed roles array and either renders the page, redirects to the correct dashboard, or sends to `/login`. Role-aware redirect logic in the login handler routes users to `/patient/dashboard`, `/doctor/dashboard`, or `/admin/dashboard`.

---

**7. Stale UI State After Profile Updates**

*Problem:* When a user updates their profile, the `AuthContext` still holds the old data, causing the navbar/header to show outdated info.

*Solution:* `AuthContext` exposes a `refreshProfile()` method that re-fetches `/auth/profile` from the backend. Pages call this after a successful profile update to sync context state with the latest server data.

---

**8. Cascading Impact of Doctor Leaves**

*Problem:* When a doctor's leave is approved, existing appointments in that period need to be tracked/handled.

*Solution:* The Leave model has an `affectedAppointments[]` array. When a leave is approved, the service queries all `scheduled`/`confirmed` appointments for that doctor in the leave period and stores their IDs in this field so admins can take action.

---

**9. Mongoose Error Messages Not User-Friendly**

*Problem:* A MongoDB duplicate key error (code 11000) returns a raw error like `E11000 duplicate key error collection: users index: email_1`. This is useless to a frontend user.

*Solution:* `errorHandler.middleware.js` maps Mongoose error types to human-readable messages: `CastError` → "Invalid ID format", `ValidationError` → extracts the first message, error code `11000` → "Email already in use."

---

**10. File Storage and URL Accessibility**

*Problem:* Uploaded files (profile images, medical records, prescriptions) need to be stored server-side AND served back as accessible URLs.

*Solution:* Multer saves files to organized subdirectories under `uploads/`. Express serves `uploads/` as a static directory. Vite proxies `/uploads` to the backend so the frontend can use relative paths like `/uploads/profiles/avatar.jpg` in `<img src>` tags without knowing the backend port.

---

## 10. Current Flaws & Weaknesses

Be honest about these in interviews. Knowing the limitations of your own project shows maturity.

---

### 🔴 Critical (Security)

**1. Tokens in localStorage**
Access and refresh tokens are stored in `localStorage`, which is accessible to any JavaScript on the page. An XSS attack can steal these tokens. The industry best practice is `httpOnly` cookies — these cannot be read by JavaScript at all.

**2. `.env` file is in the repository**
The `.env` file (containing DB URI, JWT secrets, Google API keys) appears in the project directory. If this repo is public, all secrets are exposed. Fix: add `.env` to `.gitignore` immediately and rotate all secrets.

**3. Rate limit too permissive**
1000 requests per 15 minutes per IP is suitable for a CDN, not a medical API. The auth endpoint (login) should be limited to ~5-10 attempts per minute to prevent brute force attacks. Auth and non-auth routes should have separate, stricter rate limiters.

**4. No HTTPS enforcement**
The server doesn't redirect HTTP to HTTPS or enforce TLS. Helmet's HSTS header is set, but it only works if the server is already on HTTPS.

---

### 🟠 Architecture Issues

**5. Race condition in ID generation**
`countDocuments()` in pre-save hooks for generating `PAT000001`, `DOC000001`, etc. is not atomic. Two simultaneous registrations can get the same count, causing a unique constraint error on save. Fix: use a dedicated `Counters` collection with MongoDB's `$inc` + `findOneAndUpdate` for atomic increments.

**6. No database transactions**
Booking an appointment (creates `Appointment` doc) + sending a notification (creates `Notification` doc) are two separate writes. If the notification write fails, the appointment exists but the user never gets notified — with no rollback. Fix: use `mongoose.startSession()` with `session.withTransaction()`.

**7. Duplicate error handlers**
`errorHandler.js` and `errorHandler.middleware.js` both exist. `server.js` uses only the simpler one. The richer one with Mongoose/JWT error mapping is never called. Only one should exist.

**8. Duplicate `bio` field in Doctor schema**
`bio` is defined twice in `Doctor.model.js` — once as `{ type: String, default: '' }` and again as `{ type: String, maxlength: 1000 }`. Mongoose silently uses the last definition. The first one is dead code.

**9. In-memory rate limiter doesn't scale**
`userRateLimit` in `auth.middleware.js` stores request counts in a JavaScript `Map`. This resets every time the server restarts and doesn't work across multiple server instances (e.g., if you add a second Node process). Fix: use Redis-backed rate limiting (`rate-limit-redis`).

---

### 🟡 Code Quality

**10. Zero test coverage**
`jest` and `supertest` are installed but no test files exist. There are no unit tests for services, no integration tests for routes. For a medical application this is a significant gap — a prescription calculation bug or auth bypass could go undetected.

**11. Dead dependency**
`@reduxjs/toolkit` is installed in `frontend/node_modules` (visible in the lock file) but never imported in any component or page. It adds unnecessary weight to the build.

**12. Verbose console.log in production code**
`auth.middleware.js` logs every request with token presence details:
```
🔐 Auth middleware - checking authentication
Headers: Token present
✅ Token found, verifying...
✅ User found: user@example.com
```
This floods production logs, slows performance, and leaks user info to logs. Should use a proper logger (morgan is installed) with log levels.

**13. No `.env.example` file**
New developers cloning this repo have no way to know which environment variables are required without reading through all the source code. A `.env.example` with placeholder values is standard practice.

---

### 🟢 Production Readiness

**14. No Docker setup**
No `Dockerfile` or `docker-compose.yml` exists. Deploying to any cloud platform requires manual configuration of both the Node app and MongoDB.

**15. No API documentation**
The root route (`GET /`) mentions `/api/docs` in the response, but no Swagger/OpenAPI spec or Postman collection exists.

**16. File storage not production-ready**
Files are stored on the local filesystem under `uploads/`. This doesn't work when deployed to a cloud server (files are lost on redeploy, don't work across multiple instances). Should use cloud storage (AWS S3, Cloudinary).

**17. Appointment cancellation window hardcoded**
The 2-hour and 4-hour cancellation/reschedule windows are hardcoded in model methods. These should be configurable per-hospital or per-doctor, stored in a settings collection.

---

## 11. Interview Questions & Answers — Low to High Level

---

## LEVEL 1 — Basic (Fundamentals & Project Overview)

---

**Q1. Tell me about this project.**

> MediCare Plus is a full-stack Hospital Management System built with React on the frontend and Node.js/Express with MongoDB on the backend. It supports three user roles — patients, doctors, and admins — each with their own dashboard. Patients can register, search for doctors, book appointments, and view their prescriptions. Doctors manage their schedule, handle appointments, and write digital prescriptions. Admins oversee the entire system — approving doctors, managing departments, and viewing analytics. The project also includes Google OAuth login and a Gemini-powered AI chatbot.

---

**Q2. What is the MERN stack and which parts does this project use?**

> MERN stands for MongoDB, Express, React, and Node.js. This project uses all four: MongoDB as the database, Express.js as the backend web framework, React (v19) for the frontend UI, and Node.js as the server runtime. It's a classic MERN application with a REST API backend and a single-page application frontend.

---

**Q3. What is MongoDB and why use it instead of SQL for this project?**

> MongoDB is a NoSQL document database that stores data as JSON-like BSON documents. It's used here because medical data is inherently nested and variable — a doctor's profile has arrays of qualifications, availability slots, previous workplaces, and languages. In SQL, each of these would need a separate table with joins. In MongoDB, they're all part of one document. The flexible schema also allows a patient to have zero or many allergies without needing NULL columns everywhere. The tradeoff is weaker consistency guarantees compared to SQL — which is a real concern for medical data.

---

**Q4. What is an API and what does REST mean?**

> An API (Application Programming Interface) is a contract between two systems for how they communicate. REST (Representational State Transfer) is a style for designing APIs using standard HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove). This project exposes a RESTful API at `/api/*` — the frontend never talks to the database directly; it always goes through the API. For example, to book an appointment, the frontend sends `POST /api/appointments` with the booking details as JSON.

---

**Q5. What is Mongoose and what is a Schema?**

> Mongoose is an ODM (Object Document Mapper) — it's a layer on top of the MongoDB driver that lets you define the shape of your data using Schemas, enforce validation rules, and add methods and hooks. A Schema is a blueprint that says: "every Doctor document must have a `specialization` string, a `consultationFee` number that's at least 0, and an `availability` array." Without Mongoose, MongoDB would accept any shape of data with no validation.

---

**Q6. What is JWT and why is it used here?**

> JWT (JSON Web Token) is a compact, self-contained token that encodes user information (like user ID and role) and is signed with a secret key. When a user logs in, the server creates a JWT and sends it to the client. For every subsequent request, the client sends this token in the `Authorization: Bearer <token>` header. The server verifies the token's signature without needing to query the database for every request — making it stateless and scalable. This project uses a dual-token approach: a short-lived access token and a long-lived refresh token.

---

**Q7. What is the difference between `req.body`, `req.params`, and `req.query`?**

> These are three ways data can be sent to an Express route.
> - `req.params` — URL path segments: `GET /api/doctors/:id` → `req.params.id`
> - `req.query` — URL query string: `GET /api/doctors?specialization=cardiology` → `req.query.specialization`
> - `req.body` — Request body (JSON): `POST /api/appointments` with `{ doctorId, date, time }` → `req.body.doctorId`

---

**Q8. What is bcrypt and why is it used?**

> bcrypt is a password hashing algorithm designed to be slow (computationally expensive) on purpose. It adds a random "salt" to each password before hashing, meaning two users with the same password will have different hashes. The "cost factor" (10 in this project) controls how many iterations of hashing run — making it harder to brute-force even if the database is stolen. The plain password is never stored; only the hash. On login, `bcrypt.compare()` rehashes the attempt and checks if it matches the stored hash.

---

**Q9. What does `async/await` mean and why is it used throughout this project?**

> JavaScript is single-threaded. Database queries, file reads, and HTTP calls take time — if they blocked the thread, the server couldn't handle any other requests. `async/await` is syntactic sugar over Promises that lets you write asynchronous code that reads like synchronous code. Instead of chaining `.then().catch()` callbacks, you `await` each operation and use try/catch for errors. This project wraps all async controller functions in a `catchAsync` utility that forwards any unhandled errors to the global error handler, avoiding repetitive try/catch blocks in every function.

---

**Q10. What is CORS and why is it configured in this project?**

> CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks a web page from making requests to a different origin (domain + port) than the one that served the page. Since the frontend runs on `localhost:5173` and the backend on `localhost:5002`, every API call would be blocked without CORS. The backend uses the `cors` package configured with `origin: process.env.FRONTEND_URL` to explicitly allow requests from the frontend. The Vite proxy handles this in development by making requests appear same-origin to the browser.

---

## LEVEL 2 — Intermediate (Implementation & Design)

---

**Q11. Explain the User + Patient/Doctor split. Why not put everything in one model?**

> This is the extended profile pattern. `User` stores authentication data that's common to all roles — email, password, role, name, phone. Role-specific data would make `User` inconsistent and bloated: a patient has `bloodGroup`, `allergies`, and `insurance` that mean nothing for doctors; a doctor has `medicalLicenseNumber`, `consultationFee`, and `availability` that mean nothing for patients. Keeping them separate makes each model cohesive, keeps queries clean (search doctors without loading patient data), and makes it easy to add new role-specific fields without touching the auth model. They're linked via `user: { type: ObjectId, ref: 'User', unique: true }`.

---

**Q12. How does `.populate()` work in Mongoose? How is it different from a SQL JOIN?**

> In MongoDB, documents store references as ObjectIds. `.populate('department')` fires a second database query: "get the Department document whose `_id` matches this ObjectId." Mongoose then replaces the ObjectId with the full document in memory before returning the result. A SQL JOIN happens inside the database in one operation. `.populate()` is an application-level join — two round trips to the database. This project uses nested populate extensively: `populate({ path: 'patient', populate: { path: 'user' } })` — three models, two extra queries, all stitched together in the controller.

---

**Q13. What are Mongoose virtuals and where are they used?**

> Virtuals are computed properties that aren't stored in MongoDB but are derived from existing fields. In this project:
> - `User.fullName` — `${firstName} ${lastName}` — avoids storing it redundantly
> - `User.age` — calculated from `dateOfBirth` — always current
> - `Prescription.isValid` — `new Date() <= validUntil && status === 'active'`
> - `Prescription.daysRemaining` — days until expiry
> - `Appointment.isToday`, `isUpcoming`, `timeUntilAppointment`
>
> Virtual populate (e.g., `doctorSchema.virtual('appointments', { ref, localField, foreignField })`) is like a reverse reference — you can populate a doctor's appointments without storing an array of appointment IDs on the Doctor document itself.

---

**Q14. Walk me through what happens when a patient books an appointment.**

> 1. Patient sends `POST /api/appointments` with `{ doctorId, date, time, reasonForVisit, symptoms }`
> 2. `authenticate` middleware verifies the JWT and attaches `req.user`
> 3. `patientOnly` middleware confirms the role is `patient`
> 4. `appointmentController.bookAppointment()` calls `appointmentService.bookAppointment()`
> 5. Service fetches the Patient profile using `req.userId`
> 6. Service fetches the Doctor and checks `approvalStatus === 'approved'` and `isBlocked === false`
> 7. Service calls `doctor.isAvailableAt(date, time)` to check the weekly schedule
> 8. Service queries `BlockedSlot` for that date to check manual blocks
> 9. Service queries `Leave` to check if the doctor is on approved leave that day
> 10. Service queries `Appointment` to check for existing bookings at that slot
> 11. If all checks pass, creates the `Appointment` document (status: `scheduled`)
> 12. Creates a `Notification` for both patient and doctor
> 13. Returns the created appointment — `sendResponse(res, 201, true, 'Appointment booked', appointment)`

---

**Q15. How does the token refresh interceptor prevent infinite loops?**

> The interceptor has two guards. First, it checks `!originalRequest._retry` — when it retries a request after a refresh, it sets `_retry = true` on that config. If the retried request also gets a 401, the condition fails and it doesn't retry again. Second, it checks `!isAuthEndpoint` — if the refresh-token endpoint itself returns a 401, it won't try to refresh again. If refresh fails, it clears localStorage and redirects to `/login`.

---

**Q16. What is the `catchAsync` utility and why is it used?**

> Without it, every async controller would need its own `try/catch` block:
> ```js
> exports.bookAppointment = async (req, res) => {
>   try { ... } catch (err) { next(err); }
> };
> ```
> `catchAsync` is a wrapper function that takes an async function and returns a new function that automatically forwards any thrown error to Express's `next(err)`, which routes it to the global error handler. This reduces boilerplate across all 14 controllers and ensures no unhandled promise rejection slips through.

---

**Q17. How does the doctor approval workflow affect API access?**

> The `requireApprovedDoctor` middleware is applied to all doctor-functional routes. It:
> 1. Checks `req.user.role === 'doctor'`
> 2. Loads the Doctor profile if not already in `req.profile`
> 3. Checks `approvalStatus`
> 4. Returns tailored error messages:
>    - `pending` → "Your profile is pending approval. Please wait for admin verification."
>    - `rejected` → "Your profile was rejected. Please contact support."
>    - `suspended` → "Your account has been suspended. Please contact support."
>
> This means doctors can authenticate and log in but cannot view patients, write prescriptions, or accept appointments until an admin explicitly approves them.

---

**Q18. How does appointment rating update the doctor's score?**

> When a patient rates a completed appointment (`PATCH /appointments/:id/rate`), the controller:
> 1. Verifies the appointment belongs to the patient and is `status: 'completed'`
> 2. Saves `rating: { score, review, ratedAt }` on the Appointment document
> 3. Queries all `completed` appointments for that doctor where `rating.score` exists
> 4. Calculates a fresh average: `totalRating / count`
> 5. Updates `doctor.rating.average` and `doctor.rating.count`
>
> This recalculates from scratch rather than using the existing average, ensuring correctness if old ratings are edited or deleted.

---

## LEVEL 3 — Advanced (Architecture, Scaling & Production Thinking)

---

**Q19. Why are tokens stored in localStorage and what's the security risk?**

> localStorage was used for simplicity — it's easy to read/write with no configuration. The risk is XSS (Cross-Site Scripting): if any JavaScript on the page (including third-party scripts like analytics) is malicious or compromised, it can read `localStorage` and steal the tokens. The safer approach is `httpOnly` cookies — these are set by the server and are invisible to JavaScript entirely. The browser automatically sends them on every request to the same domain. CSRF then becomes the concern, mitigated with SameSite cookie attributes and CSRF tokens.

---

**Q20. The project uses `countDocuments()` to generate IDs. What race condition exists and how would you fix it?**

> If two patients register simultaneously, both `pre('save')` hooks call `countDocuments()` before either document is inserted. Both get the same count (e.g., 99), both try to save `PAT000100`, and one fails with a duplicate key error. The fix is atomic increment using a dedicated counters collection:
> ```js
> const counter = await Counter.findOneAndUpdate(
>   { model: 'Patient' },
>   { $inc: { seq: 1 } },
>   { new: true, upsert: true }
> );
> this.patientId = `PAT${String(counter.seq).padStart(6, '0')}`;
> ```
> `findOneAndUpdate` with `$inc` is atomic in MongoDB — only one operation wins at a time.

---

**Q21. How would you add real-time notifications without polling?**

> Currently, notifications are fetched by polling (`GET /notifications/unread-count`). The scalable approach is WebSockets or Server-Sent Events (SSE). With **Socket.io**, after login the frontend establishes a persistent WebSocket connection. When the backend creates a notification (e.g., appointment confirmed), it emits an event directly to that user's socket — instant delivery. Socket.io rooms map userId to socket connections. This eliminates unnecessary HTTP requests and reduces server load significantly.

---

**Q22. Why doesn't React Context scale well for this application as it grows?**

> React Context re-renders every component consuming that context whenever any value in the context changes. `AuthContext` currently holds `user`, `loading`, `isAuthenticated` and 5 methods. When `user` updates, every component using `useAuth()` re-renders — even if they only need `isAuthenticated`. As you add notification count, appointment cache, and doctor list to global state, the re-render cascade becomes expensive. Solutions: split contexts by domain, memoize values with `useMemo`, or migrate to **Zustand** (lightweight, selector-based — components only re-render when the specific slice they subscribe to changes).

---

**Q23. How would you make this application production-ready? List the key changes.**

> 1. **Security** — Move tokens to `httpOnly` cookies, tighten rate limits on auth routes to 5 req/min, enforce HTTPS, rotate all `.env` secrets that were ever committed to git
> 2. **File storage** — Replace local `uploads/` with AWS S3 or Cloudinary. Files survive redeploys and work across multiple instances
> 3. **Transactions** — Wrap multi-document operations (book + notify, approve + update status) in Mongoose sessions with `withTransaction()`
> 4. **Tests** — Write unit tests for services (jest), integration tests for all routes (supertest), targeting 80%+ coverage
> 5. **Redis** — Replace in-memory rate limiter with Redis for multi-instance support; also use Redis to cache frequently accessed data (doctor lists, department lists)
> 6. **Logging** — Replace `console.log` with a structured logger like `winston` or `pino` with log levels; ship logs to a service like Datadog or CloudWatch
> 7. **Docker** — Add `Dockerfile` + `docker-compose.yml` for consistent local and cloud environments
> 8. **API docs** — Add Swagger/OpenAPI spec with `swagger-jsdoc` and `swagger-ui-express`
> 9. **Environment** — Add `.env.example`, validate required env vars on startup (fail fast if missing)
> 10. **CI/CD** — The GitHub Actions workflow file exists; flesh it out to run tests and lint on every PR

---

**Q24. How does the Gemini AI chatbot work and how is it secured?**

> The chatbot route `POST /api/chatbot/message` is behind the `authenticate` middleware — only logged-in users can use it. The controller receives the user's message, constructs a prompt with a medical-context system instruction (to keep responses health-focused), and sends it to Google's Generative AI API using the `@google/generative-ai` SDK. The API key is only on the backend in the `.env` file — it's never exposed to the frontend. The conversation is persisted in the `ChatMessage` model, allowing history retrieval and clear functionality. The key security concern is prompt injection — a user could try to override the system prompt through their message.

---

**Q25. If this app got 100x more users, what would break first?**

> 1. **Local file storage** — `uploads/` on disk fills up and doesn't work across multiple server instances. Fix: S3
> 2. **In-memory rate limiter** — Doesn't work across Node processes. Fix: Redis
> 3. **No caching** — Doctor list, department list, and top-rated doctors are queried from MongoDB on every request. Under load, these become hotspots. Fix: Redis cache with TTL
> 4. **N+1 query problem** — Getting all appointments and then separately fetching patient + doctor for each is multiple DB round trips. Fix: Proper indexed aggregation pipelines
> 5. **Single MongoDB node** — No replica set means no failover. Fix: MongoDB Atlas with replica set
> 6. **No connection pooling config** — Default Mongoose pool size is 5. Under high concurrency, connections queue. Fix: Configure `maxPoolSize` appropriately

---

---

## Quick Reference — Key Numbers & Facts

| Fact | Value |
|---|---|
| Total Mongoose models | 13 |
| Total controllers | 14 |
| Total route files | 14 |
| Total API endpoints (approx.) | 60+ |
| Frontend pages | 20+ |
| Backend port | 5002 |
| Frontend dev port | 5173 |
| bcrypt salt rounds | 10 |
| Rate limit | 1000 req / 15 min per IP |
| Appointment cancellation window | < 2 hours before = cannot cancel |
| Reschedule window | < 4 hours before = cannot reschedule |
| Prescription default validity | 30 days |
| Doctor ID format | `DOC000001` |
| Patient ID format | `PAT000001` |
| Appointment ID format | `APT202501010001` |
| Prescription ID format | `RX202501010001` |
| Node.js minimum version | 18.0.0 |
| React version | 19.2.6 |
| MongoDB ODM | Mongoose 8.0.3 |
| AI model | Google Gemini |

---

## Glossary

| Term | Meaning in this project |
|---|---|
| **ODM** | Object Document Mapper — Mongoose maps JS objects to MongoDB documents |
| **JWT** | JSON Web Token — signed token encoding user ID and role |
| **RBAC** | Role-Based Access Control — permissions tied to roles, not users |
| **Middleware** | Functions that run between request and route handler (auth, logging, validation) |
| **Virtual** | Mongoose computed field not stored in DB |
| **Populate** | Mongoose's way of resolving ObjectId references into full documents |
| **Pre-save hook** | Mongoose lifecycle function that runs before a document is saved |
| **Interceptor** | Axios function that runs before every request or after every response |
| **CORS** | Browser security that restricts cross-origin HTTP requests |
| **Multer** | Node.js middleware for handling multipart/form-data (file uploads) |
| **Helmet** | Express middleware that sets security-related HTTP headers |
| **catchAsync** | Wrapper utility that forwards async errors to Express error handler |
| **SSE / WebSocket** | Protocols for real-time server-to-client communication (not yet implemented) |
| **Vite proxy** | Dev server config that forwards API calls to the backend to avoid CORS |

---

*Generated: June 2026 | Project: MediCare Plus Hospital Management System*
