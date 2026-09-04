# 🎓 DropGuard — Early-Warning System for Student Dropout Risk

**SIH 2026 | PS Code: SIH-2026-13-002 | Category: SMART EDUCATION**

An AI-powered early-warning system that predicts student dropout risk using multi-factor analysis, provides explainable AI insights via SHAP, and empowers educators with actionable intervention recommendations.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (React) — Glassmorphic dark-themed dashboard
- **Backend**: FastAPI (Python) — REST API + ML Engine
- **ML Model**: XGBoost + SHAP Explainability
- **Database**: SQLite (hackathon) / PostgreSQL (production)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed_data.py
python -m ml.train
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Key Features

1. **Explainable AI Dashboard** — SHAP waterfall charts show WHY a student is at risk
2. **Intervention Recommendations** — AI suggests specific actions (counseling, financial aid, peer mentoring)
3. **Temporal Risk Tracking** — Track risk evolution over time
4. **Real-Time Alerts** — Configurable thresholds with instant notifications
5. **Cohort Analysis** — Identify systemic issues across classes/schools
6. **Privacy-First** — Role-based access, data anonymization

## 🌐 Global Cloud Deployment Guide

DropGuard can be deployed globally for zero cost using **Vercel** (Frontend) and **Render** (Backend).

### Step 1: Deploy Backend (FastAPI + ML + SQLite) on Render
1. Push your repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your repository and select the `backend` directory (or specify Root Directory as `backend`).
4. Set:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**. Once deployed, copy your live backend API URL (e.g., `https://dropguard-api.onrender.com`).

### Step 2: Deploy Frontend on Vercel
#### Option A: Direct CLI Deployment
Run from the `frontend/` directory:
```bash
cd frontend
npx vercel
```
Follow the interactive prompts. When prompted for environment variables, add:
- `NEXT_PUBLIC_API_URL` = `https://your-backend-service.onrender.com`

#### Option B: GitHub + Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. In **Environment Variables**, add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-service.onrender.com`
5. Click **Deploy**. Your site is now live globally on all devices!

---

## 👥 Team

Built for Smart India Hackathon 2026

