# 🏥 MediCare Plus - Hospital Management System

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A modern, full-stack healthcare management platform with AI-powered features, role-based dashboards, and real-time notifications.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-quick-start) • [API](#-api-overview)

</div>

---

## ⚠️ Disclaimer

**Educational Project Only** - Not intended for production healthcare environments. Requires HIPAA/GDPR compliance, security audits, and proper certifications before handling real patient data.

---

## 📝 About

MediCare Plus digitizes hospital operations with comprehensive patient, doctor, and admin management. Features include appointment scheduling, digital prescriptions, medical records, AI chatbot assistance, and analytics dashboards - all with enterprise-grade security.

## ✨ Features

### 👥 Patient Portal
- Search & book appointments with doctors
- View medical records & prescriptions
- Lab test booking & results
- AI chatbot for health queries
- Real-time notifications

### 👨‍⚕️ Doctor Dashboard
- Appointment & schedule management
- Digital prescription creation
- Patient history & consultation tracking
- Leave management
- Performance analytics

### 👑 Admin Panel
- System analytics & user management
- Department & lab test configuration
- Leave approvals & appointment oversight
- Activity logs & system monitoring

### 🔒 Security & Tech Highlights
- JWT authentication with OAuth (Google, Facebook)
- Role-based access control
- 113+ RESTful API endpoints
- Real-time updates with Socket.io
- Cloudinary file storage
- XSS & injection protection

## 🛠️ Tech Stack

**Frontend:** React 19.1.1 • Tailwind CSS • Vite • React Router • Recharts • Axios  
**Backend:** Node.js • Express • MongoDB • Mongoose • Socket.io  
**Authentication:** JWT • Passport • OAuth (Google, Facebook)  
**AI & Services:** Google Gemini AI • Cloudinary • Nodemailer • Twilio  
**Security:** Helmet • bcryptjs • express-validator • rate-limiter

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (v6+)
- npm/yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/medicare-plus.git
cd medicare-plus

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run seed          # Create admin account
npm run dev           # Start on http://localhost:5000

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env  # Add VITE_API_URL=http://localhost:5000/api
npm run dev           # Start on http://localhost:5173
```

### Default Credentials

**Admin:** admin@medicareplus.com / Admin@123  
**Doctor:** dr.rajesh.kumar@hospital.com / Doctor@123  
**Patient:** Register new account

### Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicare-plus
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# ... see full list in backend/.env.example
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📚 API Overview

**113+ RESTful Endpoints** organized in 14 modules:

| Module | Endpoints | Key Features |
|--------|-----------|--------------|
| 🔐 Authentication | 11 | Login, OAuth, password reset |
| 👨‍⚕️ Doctor Dashboard | 15 | Appointments, prescriptions, schedule |
| 👥 Patient Portal | 9 | Profile, bookings, medical records |
| 👑 Admin Management | 18 | Users, analytics, approvals |
| 📅 Appointments | 7 | Book, reschedule, cancel |
| 💊 Prescriptions | 6 | Create, view, verify |
| 🔔 Notifications | 9 | Real-time updates |
| 🧪 Lab Tests | 5 | Book & manage tests |
| 🏢 Departments | 9 | CRUD operations |
| 🌴 Leave Management | 6 | Apply & approve leaves |

**Base URL:** `http://localhost:5000/api`  
**Auth:** Bearer token required for protected routes

---

## 🚀 Future Enhancements

### Planned Features & Improvements

1. **💳 Payment Integration**
   - Online payment gateway (Stripe/Razorpay)
   - Invoice generation & billing management
   - Insurance claim processing
   - Payment history & refunds

2. **📹 Telemedicine & Video Consultations**
   - WebRTC video calling integration
   - Screen sharing for medical reports
   - Consultation recording & transcription
   - Virtual waiting rooms

3. **📱 Mobile Applications**
   - Native iOS & Android apps (React Native)
   - Push notifications
   - Offline mode support
   - Biometric authentication

4. **🤖 Advanced AI Features**
   - AI-assisted diagnosis suggestions
   - Medical image analysis (X-rays, MRIs)
   - Predictive analytics for disease patterns
   - Automated appointment scheduling with ML
   - Drug interaction warnings

5. **🔗 Third-Party Integrations**
   - Pharmacy systems integration
   - Lab equipment connectivity (HL7/FHIR)
   - Insurance provider APIs
   - Government health database sync
   - Wearable device data integration

### Additional Suggestions

- **Multi-language Support** - Internationalization (i18n)
- **Advanced Reporting** - Customizable reports & data exports
- **Blockchain** - Secure medical record sharing
- **IoT Integration** - Real-time patient monitoring devices
- **Ambulance Tracking** - GPS-based emergency services

## 👥 Made By

<table>
  <tr>
    <td align="center">
      <sub><b>Aryan Kansal</b></sub><br />
      <a href="https://github.com/ARYAN149489">GitHub</a> •
      <a href="https://linkedin.com/in/aryankansal113">LinkedIn</a><br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
   <tr>
    <td align="center">
      <sub><b>Kalpana</b></sub><br />
      <a href="https://github.com/KKKalpana">GitHub</a> •
      <a href="https://linkedin.com/in/kalpana-kalpana">LinkedIn</a><br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) • [Node.js](https://nodejs.org/) • [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/) • [Google Gemini AI](https://ai.google.dev/)
- All open-source contributors and libraries used in this project

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Built with ❤️ by the MediCare Plus Team

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

</div>
