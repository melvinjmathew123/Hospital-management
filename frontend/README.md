# 🏥 MediPulse / Voguemark HMS - Frontend Application

> Modern, responsive React 19 + Vite single-page web client for the Hospital Management System (HMS).

---

## ⚡ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & React Context (`AuthContext`, `NotificationContext`)
- **Real-Time Client**: [Socket.IO Client 4.8](https://socket.io/)
- **Payment Integration**: Razorpay Checkout Modal SDK
- **Styling**: Custom CSS design system with CSS custom properties, responsive grids, and modern healthcare UI tokens

---

## 📂 Directory Structure

```
frontend/
├── public/                  # Static assets & illustrations
├── src/
│   ├── components/          # Reusable UI components & modals
│   ├── context/
│   │   ├── AuthContext.jsx         # User login, registration, OTP & session handling
│   │   └── NotificationContext.jsx # Toast alerts & live notification queue
│   ├── pages/               # Role-specific portals & auth pages
│   │   ├── Homepage.jsx            # Landing page & emergency hotline
│   │   ├── Login.jsx               # Sign-in & OTP verification
│   │   ├── SignUp.jsx              # Patient registration
│   │   ├── ForgotPassword.jsx      # Password reset flow
│   │   ├── SuperAdminDashboard.jsx # Department, ward & staff controls
│   │   ├── HospitalAdminDashboard.jsx # Bed allocation & admissions
│   │   ├── DoctorDashboard.jsx     # Consultations, appointments & prescriptions
│   │   ├── NurseDashboard.jsx      # Vitals logging & bed status tracking
│   │   ├── LabTechDashboard.jsx    # Diagnostic tests & lab order reports
│   │   ├── PharmacistDashboard.jsx # Inventory & medication dispensing
│   │   └── PatientDashboard.jsx    # Appointment booking & medical records
│   ├── store/               # Redux store slices
│   ├── App.jsx              # Role-based dashboard router
│   ├── index.css            # Global typography & design system tokens
│   └── main.jsx             # React DOM entry point
├── package.json
├── vercel.json              # SPA rewrite rule for Vercel deployment
└── vite.config.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in this directory with the following variables:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api

# Hospital Branding
VITE_HOSPITAL_NAME=Voguemark Hospital

# Razorpay Key ID (for payments in test or live mode)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

---

## 🛠️ Available Scripts

In the `frontend/` directory, you can run:

### `npm run dev`
Runs the app in development mode with Hot Module Replacement (HMR).  
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### `npm run build`
Builds the app for production into the `dist/` folder.  
It optimizes the build for the best performance.

### `npm run preview`
Locally preview the production build after running `npm run build`.

### `npm run lint`
Runs ESLint across the source code to check for syntax and styling issues.

---

## 🚀 Deployment

The frontend is ready for zero-configuration deployment on **Vercel** or **Netlify**.  
A preconfigured [`vercel.json`](./vercel.json) handles client-side SPA routing.
