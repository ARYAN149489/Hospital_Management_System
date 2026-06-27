<div align="center">

<img src="https://img.shields.io/badge/MediCare_Plus-Hospital_Management_System-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="MediCare Plus" />

<br /><br />

[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js_18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![AWS](https://img.shields.io/badge/AWS-Deployed-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br />

**A production-grade, full-stack Hospital Management System** built on the MERN stack and deployed on AWS — with role-based portals for Patients, Doctors, and Admins, real-time notifications, AI health assistant, and digital prescription management.

**[🔴 Live Demo](https://main.d7l75khae1g6o.amplifyapp.com)** · **[GitHub](https://github.com/ARYAN149489/Hospital_Management_System)**

</div>

---

## ✨ Key Features

| 🧑‍💼 Patient Portal | 👨‍⚕️ Doctor Dashboard | 🛡️ Admin Panel |
|---|---|---|
| Google OAuth & JWT login | Admin-verified onboarding | System-wide analytics (Recharts) |
| Search & filter doctors | Manage granular weekly availability | Full doctor approval workflow |
| Book / reschedule appointments | Write digital prescriptions + vitals | Lab test result upload & tracking |
| Download prescriptions (PDF) | View full patient history | Leave approval & user management |
| Book lab tests, view results | Apply for leaves | Department CRUD |
| AI health chatbot (Gemini) | Consultation analytics | Appointment oversight |

### 🔐 Security Highlights
`JWT dual-token (access + refresh)` · `bcryptjs password hashing` · `Helmet.js (14 headers)` · `express-mongo-sanitize` · `RBAC middleware` · `express-rate-limit`

---

## 🛠 Tech Stack

**Backend:** Node.js · Express.js · MongoDB + Mongoose · JWT · Google Gemini AI · Nodemailer · Multer

**Frontend:** React 19 · Vite · React Router v7 · Axios · Recharts · React Context API

**Cloud (AWS):** EC2 (Ubuntu + PM2 + Nginx reverse proxy + Certbot SSL) · AWS Amplify (CI/CD from GitHub) · MongoDB Atlas

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/ARYAN149489/Hospital_Management_System.git
cd Hospital_Management_System/hospital_management

# 2. Backend
cd backend && npm install
cp .env.example .env   # fill in your values
npm run seed           # creates the initial admin account
npm run dev            # → http://localhost:5002

# 3. Frontend (new terminal)
cd ../frontend && npm install
npm run dev            # → http://localhost:5173
```

### Environment Variables

<details>
<summary><strong>backend/.env</strong></summary>

```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medicare-plus
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```
</details>

<details>
<summary><strong>frontend/.env</strong></summary>

```env
VITE_API_URL=http://localhost:5002/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
</details>

---

## ☁️ AWS Deployment Architecture

```
GitHub Push → AWS Amplify (CI/CD) → React Frontend (SPA)
                                          │
                              HTTPS via custom domain
                                          │
                    EC2 t2.micro (Ubuntu + Nginx + PM2)
                         Node.js / Express Backend
                                    │
                          MongoDB Atlas (Cloud DB)
```

**Backend:** EC2 → Nginx reverse proxy → PM2 daemon → Express app → Let's Encrypt SSL (Certbot)

**Frontend:** AWS Amplify with GitHub-connected CI/CD, custom SPA rewrite rules for React Router

---

## 📡 API Overview

All responses follow a consistent structure: `{ success, message, data }`

| Prefix | Access | Description |
|---|---|---|
| `/auth/*` | Public | Register, login, Google OAuth, token refresh |
| `/patients/*` | Patient | Dashboard, prescriptions, lab tests, records |
| `/doctors/*` | Public / Doctor | Search doctors, availability, schedule, prescriptions |
| `/appointments/*` | Private | Book, cancel, reschedule, rate |
| `/admin/*` | Admin | Stats, doctor approval, leave management, departments |
| `/chatbot/*` | Patient | Gemini AI health assistant |
| `/notifications/*` | Private | In-app notification center |

---

## 🧪 Testing

A **37-step Java Selenium E2E test suite** runs against the live production URL, covering the full Patient → Doctor → Admin workflow:

```bash
cd selenium-tests
./run_e2e_tests.sh
```

---

## 👤 Author

**Aryan Kansal** — Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ARYAN149489-181717?style=flat-square&logo=github)](https://github.com/ARYAN149489)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aryankansal113-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/aryankansal113)

---

<div align="center">

Made with ❤️ by Aryan Kansal
