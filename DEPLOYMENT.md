# 🚀 Deployment Guide — Vehicle Commerce Full-Stack

This project consists of:
1. **Frontend**: Next.js 16 (React 19, Tailwind CSS, Turbopack)
2. **Backend**: Go 1.24+ (High-Performance REST API, JWT Auth)
3. **Database**: PostgreSQL (Active on Supabase Cloud)

---

## 🌟 Method 1: Cloud Deployment (Vercel + Render + Supabase) — Recommended

This is the easiest, zero-maintenance setup with free tiers, automatic SSL, and continuous deployment from GitHub (`Panhacha/vehicle-commerce`).

### Step 1: Push Code to GitHub
Ensure all code and the newly tracked `frontend/` files are committed and pushed to GitHub:
```bash
git add .
git commit -m "chore: prepare production deployment configs and tracked frontend"
git push origin main
```

---

### Step 2: Deploy Go Backend on Render (or Railway)

#### Using Render (with included `render.yaml` Blueprint):
1. Log in to [Render.com](https://render.com).
2. Click **New +** > **Blueprint**.
3. Select your repository: `Panhacha/vehicle-commerce`.
4. Render automatically reads `render.yaml`, configures Docker, health checks (`/api/v1/health`), and connects to your Supabase PostgreSQL.
5. Click **Apply**.
6. Once deployed, copy your backend URL (e.g., `https://vehicle-commerce-api.onrender.com`).

#### Or Manual Web Service on Render:
* **Environment**: Docker
* **Root Directory**: `backend`
* **Port**: `8080`
* **Health Check Path**: `/api/v1/health`
* **Environment Variables**: Copy values from `backend/.env.example`.

---

### Step 3: Deploy Next.js Frontend on Vercel

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `Panhacha/vehicle-commerce`.
4. In the configuration screen:
   * **Root Directory**: Click *Edit* and select **`frontend`**.
   * **Framework Preset**: Next.js.
5. Expand **Environment Variables** and add:
   * `NEXT_PUBLIC_BACKEND_URL`: `https://<YOUR-RENDER-BACKEND-URL>/api/v1`
   * `NEXT_PUBLIC_API_URL`: `https://<YOUR-RENDER-BACKEND-URL>/api/v1`
6. Click **Deploy**.

---

### Step 4: Allow CORS on Backend
Once your Vercel URL is live (e.g., `https://vehicle-commerce-xxx.vercel.app`):
* Go to your Render Backend dashboard > **Environment**.
* Set `FRONTEND_URL` to your Vercel URL:
  ```env
  FRONTEND_URL=https://vehicle-commerce-xxx.vercel.app
  ```
* Render will restart with CORS enabled for your domain.

---

## 🐳 Method 2: VPS / Self-Hosted Server (Docker Compose)

For deployment on an Ubuntu VPS (DigitalOcean, AWS EC2, Hetzner, Linode):

### 1. SSH into your VPS & Clone Repository:
```bash
git clone https://github.com/Panhacha/vehicle-commerce.git
cd vehicle-commerce
```

### 2. Configure Environment:
```bash
cp backend/.env.example backend/.env
# Verify your Supabase DB or local credentials
```

### 3. Run with Docker Compose:
```bash
cd deploy
docker compose up -d --build
```

### 4. Setup Domain & SSL (Nginx / Caddy):
Point your domain DNS (A record) to the VPS IP, then set up reverse proxy:
* `https://your-domain.com` ➔ `http://localhost:3000` (Frontend)
* `https://api.your-domain.com` ➔ `http://localhost:8080` (Backend)

---

## 🛠️ Verification & Health Checks
* **Backend Health**: `GET /api/v1/health`
  ```json
  {"service":"Vehicle E-commerce & Multi-Branch Backend API","status":"healthy","version":"1.0.0"}
  ```
* **Catalog API**: `GET /api/v1/products`
* **Frontend Home**: `https://your-domain.com/`
* **Frontend Admin**: `https://your-domain.com/admin`

