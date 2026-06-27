<div align="center">

# 🏥 MediCare Plus

### Hospital Management System

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Google](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A full-stack healthcare management platform featuring **role-based dashboards**, **Google OAuth**, **AI-powered chatbot**, **real-time notifications**, **digital prescriptions with PDF export**, and **lab test management** — built with the MERN stack.

[Features](#-key-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture)

</div>

---

## 📌 Key Features

<table>
<tr>
<td width="33%">

### 🧑‍💼 Patient Portal
- Book appointments with doctors
- AI chatbot for health queries
- View & download prescriptions (PDF)
- Book lab tests & download reports
- Real-time notification center
- Google OAuth sign-in

</td>
<td width="33%">

### 👨‍⚕️ Doctor Dashboard
- Manage appointments & schedule
- Create digital prescriptions
- View patient history
- Apply & track leaves
- Performance analytics

</td>
<td width="33%">

### 🛡️ Admin Panel
- System-wide analytics dashboard
- User & department management
- Upload lab test reports
- Leave approval workflow
- Appointment oversight

</td>
</tr>
</table>

### 🔐 Security & Infrastructure
- **JWT Authentication** with Google OAuth
- **Role-based access control** (Patient / Doctor / Admin)
- **Email notifications** via Nodemailer (Gmail SMTP)
- **File uploads** with Multer (local disk storage)
- **API security** — Helmet, rate-limiting, XSS protection, mongo sanitization

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, React Router v7, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Multer |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT, Google OAuth (`@react-oauth/google`) |
| **AI** | Google Gemini AI (chatbot) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet, bcryptjs, express-validator, rate-limiter, mongo-sanitize |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 &nbsp;·&nbsp; **MongoDB** ≥ 6 &nbsp;·&nbsp; **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/ARYAN149489/Hospital_Management_System.git
cd Hospital_Management_System
```

**Backend**
```bash
cd backend
npm install
cp .env.example .env     # Add your MongoDB URI, JWT secret, API keys
npm run seed             # Seed admin account
npm start                # Runs on http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev              # Runs on http://localhost:5173
```

### Environment Variables

<details>
<summary>Backend <code>.env</code></summary>

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicare-plus
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
```

</details>

<details>
<summary>Frontend <code>.env</code></summary>

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

</details>

---

## 📐 Architecture

```
Hospital_Management_System/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers (14 controllers)
│   ├── middleware/       # Auth, validation, error handling, uploads
│   ├── models/          # Mongoose schemas (12 models)
│   ├── routes/          # API route definitions (14 modules)
│   ├── services/        # Business logic layer
│   ├── utils/           # Helpers, email, JWT utilities
│   ├── scripts/         # DB seeders & setup scripts
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (Navbar, Footer, Notifications)
│   │   ├── context/     # Auth context provider
│   │   ├── pages/       # 29 page components
│   │   │   ├── admin/   # 7 admin pages
│   │   │   ├── doctor/  # 8 doctor pages
│   │   │   └── patient/ # 10 patient pages
│   │   └── services/    # API service layer
│   └── index.html
│
└── README.md
```

---

## 🔮 Roadmap

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Video consultations via WebRTC
- [ ] Mobile app with React Native
- [ ] Real-time updates with Socket.io
- [ ] Advanced AI diagnostics & drug interaction warnings
- [ ] Multi-language support (i18n)

---

## 👤 Author

**Aryan Kansal** — Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ARYAN149489-181717?style=flat-square&logo=github)](https://github.com/ARYAN149489)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aryankansal113-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/aryankansal113)

---

<div align="center">

**⭐ If you found this project useful, consider giving it a star!**

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

</div>
