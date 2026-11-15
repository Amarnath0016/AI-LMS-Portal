# UptoSkills AI LMS - Production Deployment Guide

This document provides step-by-step instructions for deploying the **UptoSkills AI LMS** platform to production environments, including Docker Compose, cloud platforms (Render/Railway for backend, Vercel/Netlify for frontend), and MongoDB Atlas.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    Client Frontend (SPA / React 19)  │
                      │       Vercel / Netlify / Nginx       │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS / REST API
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Node.js Express Server (ESM)      │
                      │         Render / Railway / VPS       │
                      └────┬──────────────┬──────────────┬───┘
                           │              │              │
                           ▼              ▼              ▼
                 ┌──────────────┐  ┌─────────────┐  ┌───────────────┐
                 │ MongoDB 7.0  │  │ Google Cloud│  │ ElevenLabs /  │
                 │ Atlas / Host │  │ Gemini API  │  │ Google TTS    │
                 └──────────────┘  └─────────────┘  └───────────────┘
```

---

## 1. Quick Local & VPS Deployment (Docker Compose)

The easiest way to spin up the entire production stack (MongoDB 7.0, Express Server, and Nginx Client) with a single command:

### Prerequisites
- Docker Engine 24.0+ and Docker Compose 2.0+

### Steps
1. Clone the repository and navigate to root:
   ```bash
   git clone <repo-url> uptoskills
   cd uptoskills
   ```

2. Configure environment secrets in `server/.env` (or pass via environment):
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your production secrets (JWT_SECRET, GEMINI_API_KEY, etc.)
   ```

3. Launch all services:
   ```bash
   docker compose up -d --build
   ```

4. Verify service health:
   ```bash
   docker compose ps
   curl http://localhost:5001/api/health
   ```

5. Seed initial data (run once inside the server container):
   ```bash
   docker compose exec server npm run seed
   ```

6. Open your browser:
   - Frontend: `http://localhost:5173` (or port 80/custom domain)
   - Backend API: `http://localhost:5001/api`

---

## 2. Backend Deployment (Render or Railway)

### Option A: Render (`render.yaml` or Web Service)
1. In the [Render Dashboard](https://dashboard.render.com), create a new **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`
4. Set required Environment Variables:
   | Variable | Value / Description |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` (or Render's default `$PORT`) |
   | `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/uptoskills?retryWrites=true&w=majority` |
   | `CLIENT_ORIGIN` | `https://your-frontend.vercel.app` |
   | `JWT_SECRET` | *Random 64-character secret string* |
   | `JWT_REFRESH_SECRET` | *Random 64-character secret string* |
   | `ADMIN_ACCESS_CODE` | *Your admin security code* |
   | `GEMINI_API_KEY` | *Google Gemini API Key* |
   | `GEMINI_MODEL` | `gemini-1.5-flash` |
   | `TTS_PROVIDER` | `google` (or `elevenlabs`) |
5. Click **Deploy**.
6. Seed the production database using Render Shell:
   ```bash
   npm run seed
   ```

### Option B: Railway
1. In [Railway](https://railway.app), create a new project and add a **MongoDB Plugin** or provide your MongoDB Atlas URI.
2. Add a new **GitHub Repo Service** pointing to the repository.
3. In Service Settings:
   - Set **Root Directory** to `/server`.
   - Railway auto-detects `package.json` and runs `npm install` and `npm start`.
4. Add the environment variables listed in the table above.
5. In Networking, generate a public domain (e.g. `uptoskills-api.up.railway.app`).

---

## 3. Frontend Deployment (Vercel or Netlify)

### Option A: Vercel
1. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
2. Configure Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-api.onrender.com/api` |
   | `VITE_ENABLE_AVATAR_AUDIO_ANALYSER` | `true` |
4. Click **Deploy**. SPA routing is automatically handled via `vercel.json`.

### Option B: Netlify
1. In [Netlify Dashboard](https://app.netlify.com), click **Add new site** > **Import an existing project**.
2. Configure Build Settings:
   - **Base directory**: (empty / root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL`: `https://your-api.onrender.com/api`
4. Click **Deploy Site**. SPA routing is handled via `public/_redirects`.

---

## 4. Production Database Setup (MongoDB Atlas)

1. Create a free M0 or production M10+ cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add the IP addresses of your Render/Railway backend (or `0.0.0.0/0` if your cloud host uses dynamic IPs).
3. Under **Database Access**, create a database user with read/write permissions.
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/uptoskills?retryWrites=true&w=majority
   ```
5. Set this string as `MONGO_URI` in your backend environment variables.

---

## 5. Security & Verification Checklist

- [ ] `MONGO_URI` connects successfully; verified by `/api/health` returning HTTP 200:
  ```json
  {
    "status": "healthy",
    "checks": {
      "database": { "status": "healthy", "readyState": 1 },
      "aiProvider": { "status": "configured", "provider": "google-gemini" }
    }
  }
  ```
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are random, unique, >= 32 characters, and not stored in git.
- [ ] `ADMIN_ACCESS_CODE` is set to a secure secret.
- [ ] `CLIENT_ORIGIN` matches the exact deployed frontend origin (CORS protection).
- [ ] Sensitive uploads directory (`server/uploads/materials`) is secured outside the web root and guarded by authentication & enrollment middleware.
- [ ] Daily Challenge evaluation runs in isolated subprocesses with timeouts and resource ceilings.
- [ ] All 10 AI mentors display ethical disclosure banners stating they are synthetic AI personas.
