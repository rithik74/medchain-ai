# 🏥 MedChain AI

**AI-Powered IoT Healthcare Monitoring System with Blockchain Integration**

A full-stack healthcare platform that combines real-time vital sign monitoring, AI-powered risk analysis, blockchain data integrity, and secure doctor-patient communication.

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication & Roles** | JWT auth with Doctor, Patient, Admin roles |
| 📡 **IoT Device Simulation** | Phone-based vital sign monitoring with auto-submit |
| 🤖 **AI Risk Analysis** | Google Gemini-powered health risk assessment |
| 📈 **Multi-Line Vitals Charts** | Real-time colored graphs (HR, SpO2, Temp, BP) |
| 📋 **Vitals History Log** | Persistent line-by-line records, doctor-only delete |
| 🛡️ **Risk Assessment History** | Color-coded CRITICAL/HIGH/MEDIUM/LOW logs |
| 🔗 **Blockchain Verification** | Health records stored on Polygon Amoy |
| 💬 **Doctor-Patient Chat** | Real-time Socket.IO messaging |
| 🤖 **AI Health Chatbot** | Gemini-powered health assistant |
| 🚨 **Emergency SOS** | Panic button with doctor alerts |
| 📧 **Email Alerts** | Auto email to doctor + patient on risk detection |
| 📄 **PDF Reports** | Downloadable patient health reports |
| 📊 **Admin Analytics** | Dashboard with stats, charts, trends |
| 👨‍⚕️ **Doctor Assignment** | Patients choose their doctors |
| 📱 **PWA Support** | Installable on mobile devices |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | PostgreSQL, Sequelize ORM |
| **AI** | Google Gemini API |
| **Blockchain** | Ethers.js, Polygon Amoy Testnet |
| **Auth** | JWT, bcrypt |
| **Email** | Nodemailer (Gmail SMTP) |
| **Deployment** | Vercel (Frontend) + Render (Backend + DB) |

---

## 📁 Project Structure

```
medchain-ai/
├── backend/
│   ├── src/
│   │   ├── config/         # env.js, database.js
│   │   ├── controllers/    # auth, vitals, risk, chat, emergency, reports, analytics
│   │   ├── middleware/      # authMiddleware, validation, errorHandler
│   │   ├── models/          # Patient, Vitals, RiskLog, User, ChatMessage, Emergency, DoctorPatient
│   │   ├── routes/          # All API routes
│   │   ├── services/        # AI, blockchain, alert services
│   │   └── server.js        # Express + Socket.IO entry point
│   ├── .env                 # Environment variables (DO NOT COMMIT)
│   ├── .env.example         # Template for environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # All React components
│   │   ├── services/        # api.js, blockchain.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/              # manifest.json, sw.js
│   ├── vercel.json          # Vercel deployment config
│   ├── .env.production      # Production API URL
│   └── package.json
├── render.yaml              # Render deployment config
├── .gitignore
└── README.md
```

---

## 🖥️ Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL installed and running
- Gmail account with App Password (for email alerts)
- Google API Key (for Gemini AI)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/medchain-ai.git
cd medchain-ai
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```env
PORT=5000
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/medchain_db
JWT_SECRET=your-secret-key-here
GOOGLE_API_KEY=your-google-api-key
LLM_PROVIDER=google
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
ALERT_EMAIL=doctor-email@gmail.com
```

Start the backend:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App

```
http://localhost:5173
```

---

## ☁️ Deployment Guide

### 📦 Step 1: Push to GitHub

```bash
cd medchain-ai
git init
git add .
git commit -m "Initial commit - MedChain AI"
git branch -M main
git remote add origin https://github.com/yourusername/medchain-ai.git
git push -u origin main
```

> ⚠️ **IMPORTANT:** Make sure `.env` is in `.gitignore` — never push your secrets!

---

### 🟢 Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up / login

2. **Create a PostgreSQL Database:**
   - Click **New** → **PostgreSQL**
   - Name: `medchain-db`
   - Plan: **Free**
   - Click **Create Database**
   - Copy the **Internal Database URL** (starts with `postgres://...`)

3. **Create a Web Service:**
   - Click **New** → **Web Service**
   - Connect your GitHub repo
   - Configure:
     - **Name:** `medchain-ai-backend`
     - **Root Directory:** `backend`
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

4. **Add Environment Variables** in Render dashboard:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(paste Internal Database URL from step 2)* |
   | `JWT_SECRET` | `medchain-ai-jwt-secret-2024` |
   | `GOOGLE_API_KEY` | *(your Google API key)* |
   | `LLM_PROVIDER` | `google` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | *(your Gmail address)* |
   | `SMTP_PASS` | *(your Gmail App Password)* |
   | `ALERT_EMAIL` | *(doctor's email)* |
   | `FRONTEND_URL` | *(add this AFTER deploying frontend, e.g. `https://medchain-ai.vercel.app`)* |
   | `POLYGON_AMOY_RPC_URL` | `https://rpc-amoy.polygon.technology` |
   | `PRIVATE_KEY` | *(your wallet private key)* |
   | `CONTRACT_ADDRESS` | *(your contract address)* |

5. Click **Create Web Service** → Wait for deployment to finish

6. Your backend URL will be: `https://medchain-ai-backend.onrender.com`

7. **Test it:** Visit `https://medchain-ai-backend.onrender.com/api/health`
   - You should see: `{"status":"ok","timestamp":"..."}`

---

### ▲ Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / login

2. Click **Add New** → **Project**

3. Import your GitHub repo

4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variable:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://medchain-ai-backend.onrender.com/api` |

   > Replace with your actual Render backend URL from Step 2

6. Click **Deploy** → Wait for it to finish

7. Your frontend URL will be: `https://medchain-ai.vercel.app`

---

### 🔄 Step 4: Update CORS (Important!)

Go back to **Render** dashboard → Your backend service → **Environment**:

1. Add/Update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://medchain-ai.vercel.app
   ```
   *(use your actual Vercel URL)*

2. Click **Save Changes** → Render will auto-redeploy

---

### ✅ Step 5: Verify Deployment

1. Open your Vercel URL: `https://medchain-ai.vercel.app`
2. Register a new Doctor account
3. Register a new Patient account
4. Patient: Assign the doctor, submit vitals
5. Doctor: Check dashboard for patient data
6. Verify email alerts, chat, and blockchain features

---

## 📱 Using Your Phone as IoT Device

1. Open your deployed Vercel URL on your phone browser
2. Login as a Patient
3. Go to the **📡 IoT Device** tab
4. Select a scenario (Normal / Stress / Critical)
5. Tap **▶ Start IoT Device**
6. Your phone now sends vitals automatically!
7. On your computer, login as Doctor to see live updates

**Install as App:** In Chrome mobile → Menu (⋮) → "Add to Home Screen"

---

## 🔑 Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy and add to `GOOGLE_API_KEY`

### Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords** → Generate one for "Mail"
4. Copy the 16-character password to `SMTP_PASS`

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Patient** | Submit vitals, view own data, assign doctors, IoT device mode, SOS, chat |
| **Doctor** | View assigned patients, multi-line vitals graphs, delete vitals, chat, receive alerts |
| **Admin** | Full analytics dashboard, all patient access |

---

## 📄 License

MIT License — Feel free to use and modify for your projects.
