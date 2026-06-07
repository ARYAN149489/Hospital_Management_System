<div align="center">

# 🏥 MediCare Plus

### Hospital Management System

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

A full-stack healthcare management platform featuring **role-based dashboards**, **AI-powered chatbot**, **real-time notifications**, **digital prescriptions with PDF export**, and **lab test management** — built with the MERN stack.

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
- **JWT Authentication** with Google & Facebook OAuth
- **Role-based access control** (Patient / Doctor / Admin)
- **Real-time updates** via Socket.io
- **File uploads** with Cloudinary integration
- **API security** — Helmet, rate-limiting, XSS protection, mongo sanitization

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, React Router v7, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Socket.io, Multer |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT, Passport.js, Google & Facebook OAuth |
| **AI** | Google Gemini AI (chatbot) |
| **Services** | Cloudinary (media), Nodemailer (email), Twilio (SMS) |
| **Security** | Helmet, bcryptjs, express-validator, rate-limiter, xss-clean |

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
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

</details>

---

## 📐 Architecture

```
Hospital_Management_System/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers (15 controllers)
│   ├── middleware/       # Auth, validation, error handling
│   ├── models/          # Mongoose schemas (12 models)
│   ├── routes/          # API route definitions (15 modules)
│   ├── services/        # Business logic layer
│   ├── utils/           # Helpers, email, SMS, JWT utilities
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
