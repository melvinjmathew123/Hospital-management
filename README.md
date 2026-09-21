<div align="center">

# 🏥 MediPulse / Apollo Hospital Management System (HMS)

### *Enterprise-Grade, Full-Stack MERN Healthcare Operations & Clinical Portal*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-State-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

<p align="center">
  A secure, modern, multi-role hospital management web platform built to automate hospital workflows, clinical consultations, real-time bed allocations, lab tests, pharmacy dispensing, billing, and patient self-service appointments.
</p>

[Live Web Demo](https://hospital-management-wk23.vercel.app) • [Report Bug](https://github.com/melvinjmathew123/Hospital-management/issues) • [Request Feature](https://github.com/melvinjmathew123/Hospital-management/issues)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features by Role](#-key-features-by-role)
  - [👑 Super Admin](#1--super-admin)
  - [🏥 Hospital Admin](#2--hospital-admin)
  - [🩺 Doctor](#3--doctor)
  - [👩‍⚕️ Nurse](#4--nurse)
  - [🧪 Lab Technician](#5--lab-technician)
  - [💊 Pharmacist](#6--pharmacist)
  - [🧑‍🦽 Patient](#7--patient)
- [Core Functional Modules](#-core-functional-modules)
  - [Real-Time WebSocket Engine](#real-time-websocket-engine)
  - [Razorpay Payment Gateway](#razorpay-payment-gateway)
  - [Two-Factor Email OTP Verification](#two-factor-email-otp-verification)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Reference & Endpoints](#-api-reference--endpoints)
- [Database Models](#-database-models)
- [Deployment Guide](#-deployment-guide)
  - [Backend (Render)](#backend-render)
  - [Frontend (Vercel)](#frontend-vercel)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Hospital Management System (HMS)** is a full-stack MERN application engineered to eliminate operational bottlenecks in modern healthcare centers. It provides dedicated, role-tailored dashboards for seven different user personas, ensuring strict data privacy, seamless inter-departmental collaboration, and transparent patient care.

### Core Highlights
- **7 Distinct User Portals**: Super Admin, Hospital Admin, Doctor, Nurse, Lab Technician, Pharmacist, and Patient.
- **Bi-directional Real-Time Updates**: Instant notifications, live consultation status changes, and bed availability updates powered by Socket.IO.
- **Secure Online Billing**: Integrated with Razorpay checkout for card, UPI, net banking payments, plus sandbox simulation mode for offline testing.
- **Robust Authentication**: JWT authorization, role-based access control (RBAC), bcrypt salt encryption, and 6-digit OTP verification via Nodemailer with fail-safe on-screen delivery.
- **Responsive UI/UX**: Built with React 19, Vite, and custom CSS design system offering sleek glassmorphism, micro-animations, and full mobile responsiveness.

---

## 🏛 System Architecture

```
                       ┌───────────────────────────────┐
                       │     React 19 + Vite Client    │
                       │   (Redux Toolkit + Socket.IO) │
                       └──────────────┬────────────────┘
                                      │ HTTP / HTTPS (REST API)
                                      │ WebSockets (ws://)
                                      ▼
                       ┌───────────────────────────────┐
                       │      Node.js + Express 5      │
                       │          API Server           │
                       └───────┬──────────────┬────────┘
                               │              │
         ┌─────────────────────┼──────────────┼─────────────────────┐
         ▼                     ▼              ▼                     ▼
┌────────────────┐   ┌────────────────┐   ┌───────────────┐   ┌────────────────┐
│ MongoDB Atlas  │   │   Socket.IO    │   │   Razorpay    │   │ Nodemailer     │
│   (Mongoose)   │   │ Manager Engine │   │ Payment API   │   │ (Gmail SMTP)   │
└────────────────┘   └────────────────┘   └───────────────┘   └────────────────┘
```

---

## 👥 Key Features by Role

### 1. 👑 Super Admin
- **Department & Ward Management**: Create, view, and organize medical departments, inpatient wards, and bed capacities.
- **Global Staff Directory**: View all registered doctors, nurses, lab technicians, and pharmacists; toggle account statuses (Active / Inactive).
- **System-Wide Auditing**: Monitor platform telemetry, system health, and hospital capacity across all wards.

### 2. 🏥 Hospital Admin
- **Operational Oversight**: Real-time summary of admissions, outpatient visits, and doctor availability.
- **Ward & Bed Allocations**: Assign and reassign patients to ICU, general, and private wards; monitor live occupancy rates.
- **Staff Scheduling**: Review department loads and streamline day-to-day operations.

### 3. 🩺 Doctor
- **Appointment Queue**: Real-time view of daily appointments with patient history and check-in statuses.
- **Clinical Consultations**: Record diagnoses, clinical observations, symptoms, and doctor consultation notes.
- **E-Prescriptions**: Prescribe medications with dosage, frequency, and duration that instantly sync to the Pharmacy module.
- **Lab Requisitions**: Order pathology and diagnostic tests directly from the consultation interface.

### 4. 👩‍⚕️ Nurse
- **Inpatient Vital Tracking**: Record patient blood pressure, pulse, temperature, SpO2, and respiratory rates.
- **Nursing Notes**: Log shift observations, medication administration timestamps, and patient responses.
- **Bed Management**: Update bed statuses in real-time (Available, Occupied, Maintenance) with instantaneous broadcast to the admin team.

### 5. 🧪 Lab Technician
- **Order Queue**: View pending diagnostic test requests ordered by clinical physicians.
- **Test Processing**: Update status (`Pending` ➔ `In-Progress` ➔ `Completed`).
- **Diagnostic Uploads**: Enter test results, clinical reference ranges, and diagnostic impressions accessible immediately by doctors and patients.

### 6. 💊 Pharmacist
- **Live Prescription Queue**: View medications prescribed by doctors during consultations.
- **Inventory Control**: Add, track, and update pharmaceutical medicine stocks, batches, and unit costs.
- **Medication Dispensing**: Verify doses, record dispensed quantities, and sync charges directly into the patient's billing record.

### 7. 🧑‍🦽 Patient
- **Doctor Discovery & Booking**: Filter specialists by department, check doctor slot availability, and book appointments.
- **Electronic Health Records**: Download and view consultation history, vital logs, and completed lab results.
- **Online Invoicing & Payment**: View itemized hospital bills and pay securely online via Razorpay or simulated sandbox.
- **Profile & Medical Info**: Maintain blood group, emergency contact details, and personal profile data.

---

## ⚡ Core Functional Modules

### Real-Time WebSocket Engine
The backend integrates Socket.IO with a centralized `socketManager`:
- Automatically maps authenticated `userId` to active socket connections.
- Emits instantaneous notifications when:
  - An appointment is confirmed or updated.
  - A doctor finishes a consultation and issues a prescription.
  - Lab test results are published.
  - Bed statuses change in any ward.

### Razorpay Payment Gateway
Supports dual-mode processing configured in `.env`:
- **Live / Test Mode (`RAZORPAY_SIMULATION_MODE=false`)**: Creates authentic Razorpay orders (`/api/payment/create-order`), displays the official Razorpay checkout SDK, and validates payments using cryptographic **HMAC-SHA256** signature verification (`/api/payment/verify`).
- **Sandbox Simulation Mode (`RAZORPAY_SIMULATION_MODE=true`)**: Provides an internal mock payment UI for testing without requiring active Razorpay API keys.

### Two-Factor Email OTP Verification
- Uses **Nodemailer** with SSL over SMTP (Port 465) for registration verification and password reset requests.
- **Graceful Fallback**: If email delivery fails due to SMTP connectivity or configuration errors, the system safely generates the verification OTP and renders it directly in the client UI, ensuring testing is never blocked.

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19.2 | Component-driven declarative UI library |
| **Frontend Tooling** | Vite 8.0 | Next-generation ultra-fast frontend build tool |
| **State Management** | Redux Toolkit & Context API | Centralized application state and auth sessions |
| **Styling** | Modern Vanilla CSS | Custom design system with glassmorphism & responsive layouts |
| **Backend Framework** | Node.js & Express 5.2 | Scalable REST API with expressive middleware architecture |
| **Database** | MongoDB & Mongoose 9.7 | Document-oriented database with schema validation |
| **Real-Time Engine** | Socket.IO 4.8 | Bidirectional event-based communication |
| **Security & Auth** | JWT & Bcrypt.js | Stateless token authentication & password hashing |
| **Payment Gateway** | Razorpay SDK 2.9 | Online payment processing & webhook signature validation |
| **Email Service** | Nodemailer 9.0 | Automated SMTP email delivery for OTP verification |
| **Validation** | Express-Validator 7.3 | Server-side request sanitization & schema validation |

---

## 📂 Project Directory Structure

```
Hospital-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/              # Request handling & business logic
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── billingController.js
│   │   ├── clinicalController.js
│   │   ├── hospitalController.js
│   │   ├── labController.js
│   │   ├── patientController.js
│   │   ├── paymentController.js
│   │   └── pharmacyController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT protection & RBAC authorization
│   │   └── validate.js           # Express-validator input constraints
│   ├── models/                   # Mongoose data schemas
│   │   ├── Appointment.js
│   │   ├── Bed.js
│   │   ├── Billing.js
│   │   ├── Consultation.js
│   │   ├── Department.js
│   │   ├── LabOrder.js
│   │   ├── Patient.js
│   │   ├── PharmacyInventory.js
│   │   ├── User.js
│   │   └── Ward.js
│   ├── routes/                   # Express API routes
│   ├── utils/
│   │   ├── mailer.js             # Nodemailer OTP email templates
│   │   └── socketManager.js      # Socket.IO connection mapping
│   ├── package.json
│   └── server.js                 # Server entry point & Socket.IO initialization
│
├── frontend/
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/           # Reusable UI widgets & modal dialogs
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global session state & login routines
│   │   │   └── NotificationContext.jsx # In-app notification toasts
│   │   ├── pages/                # Role dashboards & auth screens
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Homepage.jsx
│   │   │   ├── HospitalAdminDashboard.jsx
│   │   │   ├── LabTechDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NurseDashboard.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── PharmacistDashboard.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── SuperAdminDashboard.jsx
│   │   ├── store/                # Redux store slices
│   │   ├── App.jsx               # Top-level routing & role switcher
│   │   ├── index.css             # Design tokens, variables & typography
│   │   └── main.jsx              # React DOM mounting
│   ├── .env.example              # Frontend environment template
│   ├── package.json
│   ├── vercel.json               # SPA rewrite rules for Vercel
│   └── vite.config.js
│
├── .gitignore
├── render.yaml                   # Backend Render deployment manifest
├── run.ps1                       # Windows PowerShell one-click runner
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- **Git** - [Download Git](https://git-scm.com/)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/melvinjmathew123/Hospital-management.git
   cd Hospital-management
   ```

2. **Install Backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

### Environment Variables

#### 1. Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hms?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_change_me
HOSPITAL_NAME=Apollo Hospital
CLIENT_URL=http://localhost:5173,http://localhost:3000

# Razorpay Settings (Set to 'true' for simulated testing without keys)
RAZORPAY_SIMULATION_MODE=true
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Gmail SMTP for OTP emails
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### 2. Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_HOSPITAL_NAME=Apollo Hospital
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

### Running the Application

#### Option A: One-Click Launch (Windows PowerShell)
From the root directory, simply run:
```powershell
.\run.ps1
```
This script launches two separate terminal windows: one running the Express backend on port `5000` and the other running the Vite dev server on port `5173`.

#### Option B: Manual Launch

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   *Backend will start on:* `http://localhost:5000`

2. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   *Frontend will open at:* `http://localhost:5173`

---

## 📡 API Reference & Endpoints

All backend endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header (`Bearer <token>`).

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user account | Public |
| `POST` | `/verify-email` | Verify registration with 6-digit OTP | Public |
| `POST` | `/resend-otp` | Resend email verification code | Public |
| `POST` | `/login` | Authenticate user & issue JWT | Public |
| `GET` | `/me` | Get currently logged in profile | Private |
| `GET` | `/users` | Get user list with role filters | Private |
| `PUT` | `/users/:id` | Update user details or active status | Super Admin |
| `POST` | `/forgot-password` | Request password reset OTP | Public |
| `POST` | `/verify-otp` | Verify password reset code | Public |
| `POST` | `/reset-password` | Set new password with verified OTP | Public |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/availability` | Check available slots for a doctor by date | Private |
| `GET` | `/` | List appointments (filtered by user role) | Private |
| `POST` | `/` | Book a new consultation appointment | Private |
| `PUT` | `/:id` | Update appointment status or reschedule | Private |

### Clinical Care (`/api/clinical`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/consultations` | Retrieve clinical consultation history | Private |
| `POST` | `/consultations` | Record diagnosis, notes, and e-prescription | Doctor |

### Patients (`/api/patients`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Search and list patient profiles | Private |
| `GET` | `/:id` | Retrieve patient record by ID | Private |
| `POST` | `/` | Register a new patient profile | Private |
| `POST` | `/:id/vitals` | Record vital signs (BP, heart rate, temp) | Nurse / Doctor |
| `POST` | `/:id/notes` | Add clinical or nursing progress note | Nurse / Doctor |
| `POST` | `/:id/documents` | Attach medical documents or lab reports | Private |

### Hospital Infrastructure (`/api/hospital`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/departments` | List all clinical departments | Private |
| `POST` | `/departments` | Add a new department | Super Admin |
| `GET` | `/wards` | List wards and capacities | Private |
| `POST` | `/wards` | Create a new hospital ward | Super Admin |
| `GET` | `/beds` | Get status of all hospital beds | Private |
| `POST` | `/beds` | Create a new bed in a ward | Super Admin |
| `PUT` | `/beds/:id` | Update bed occupancy or maintenance status | Nurse / Admin |

### Laboratory (`/api/labs`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all diagnostic lab orders | Private |
| `PUT` | `/:id` | Update lab test status and upload findings | Lab Tech |

### Pharmacy (`/api/pharmacy`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/inventory` | List pharmacy medicines & stock counts | Private |
| `POST` | `/inventory` | Add a new medication to inventory | Pharmacist / Admin |
| `PUT` | `/inventory/:id` | Update medicine pricing and stock levels | Pharmacist / Admin |
| `POST` | `/dispense` | Dispense medication against prescription | Pharmacist |

### Billing & Payments (`/api/billing` & `/api/payment`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/billing` | List billing invoices | Private |
| `GET` | `/billing/:id` | Get itemized invoice details | Private |
| `POST` | `/billing` | Generate a new patient bill | Admin / Staff |
| `POST` | `/billing/:id/payments` | Record payment against invoice | Private |
| `POST` | `/payment/create-order` | Create Razorpay payment order | Private |
| `POST` | `/payment/verify` | Verify Razorpay HMAC payment signature | Private |

---

## 🗄 Database Models

The MongoDB database leverages Mongoose schemas with indexes, relationships, and validation hooks:
- **`User`**: Account credentials, hashed password, role (`Super Admin`, `Hospital Admin`, `Doctor`, `Nurse`, `Lab Technician`, `Pharmacist`, `Patient`), verification status, and OTP tokens.
- **`Patient`**: Demographics, emergency contacts, medical history, vitals log, and clinical attachments.
- **`Appointment`**: Linkages between patient, doctor, department, scheduled slot, status (`Scheduled`, `Completed`, `Cancelled`), and queue index.
- **`Consultation`**: Clinical findings, diagnosis, vitals at encounter, and electronic prescriptions.
- **`Department` & `Ward`**: Hospital organizational layout and capacity tracking.
- **`Bed`**: Bed identifier, ward reference, status (`Available`, `Occupied`, `Cleaning`, `Maintenance`), and current patient assignment.
- **`LabOrder`**: Test name, ordering physician, patient reference, priority, status, and diagnostic results.
- **`PharmacyInventory`**: Medication name, SKU/batch, dosage form, unit price, and current stock level.
- **`Billing`**: Itemized charges (consultations, lab tests, pharmacy, bed fees), tax, discount, insurance details, and payment history.

---

## 🌐 Deployment Guide

### Backend (Render)
A deployment blueprint is included in [`render.yaml`](file:///c:/MERN/MERN%20STACK%20PROJECT/render.yaml):
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Blueprint Web Service** or manual Node service.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set the environment variables in Render's dashboard (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `RAZORPAY_*`, `EMAIL_*`).

### Frontend (Vercel)
A configuration file [`vercel.json`](file:///c:/MERN/MERN%20STACK%20PROJECT/frontend/vercel.json) is preconfigured for single-page app routing:
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure environment variables (`VITE_API_URL`, `VITE_HOSPITAL_NAME`, `VITE_RAZORPAY_KEY_ID`).
5. Deploy!

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Developed with ❤️ by <a href="https://github.com/melvinjmathew123">Melvin J Mathew</a></sub>
</div>
