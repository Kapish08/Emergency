# 🏥 Emergency Hospital Finder System

> **AI-powered, real-time hospital bed availability finder with DevSecOps integration**  
> A university-level high-distinction prototype demonstrating full-stack development, Design Thinking, and DevOps practices.

---

## 🚀 Quick Start (Local Development)

### Prerequisites

| Tool     | Version  | Install                          |
|----------|----------|----------------------------------|
| Node.js  | ≥ 18     | https://nodejs.org               |
| npm      | ≥ 9      | Included with Node.js            |
| Docker   | ≥ 24     | https://docker.com (optional)    |

---

### Option A — Run Locally (Recommended for Development)

**Step 1 — Clone / open the project**
```bash
cd /path/to/Emergeny
```

**Step 2 — Install & Start Backend**
```bash
cd backend
npm install
npm run dev
# API running at http://localhost:5000
```

**Step 3 — Install & Start Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

**Step 4 — Open in browser**
```
http://localhost:5173
```

**Demo credentials:**
| Email                     | Password      | Role  |
|---------------------------|---------------|-------|
| `john@example.com`        | `password123` | user  |
| `admin@emergencyapp.com`  | `admin123`    | admin |

Or click **"Quick Demo Login"** on the login screen.

---

### Option B — Docker Compose (Production-like)

```bash
# From project root
docker-compose up --build

# App at:  http://localhost
# API at:  http://localhost:5000/api/health
```

To stop:
```bash
docker-compose down
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Expected output:
```
✓ Health Check - should return 200 OK
✓ Hospitals API - should return hospitals list
✓ Hospitals API - near NYC coordinates
✓ Hospitals API - emergency type weighting
✓ Hospitals API - stats endpoint
✓ Hospitals API - 404 for unknown ID
✓ Auth API - reject invalid credentials
✓ Auth API - login with valid credentials
✓ Alerts API - return active alerts

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

---

## 📱 Features Walkthrough

### 🗺️ Emergency Finder (Main Page)
1. Click **"Use My Location"** or enter manual coordinates
2. Select emergency type: General / Cardiac / Trauma / Minor
3. AI-sorted hospital list appears with colour-coded availability
4. Click any hospital card for full details + directions
5. Data auto-refreshes every 30 seconds
6. Use the **🔴 SOS button** (bottom-left) to simulate 911 call

### 📊 Dashboard
- System-wide stats: total hospitals, ICU/general bed availability
- Active emergency alerts (from API)
- Quick navigation shortcuts
- Capacity overview progress bars

### ❤️ Health Monitor
- Click **"Connect Wearable"** to start simulation
- Live heart rate, SpO₂, temperature, blood pressure, respiration
- ECG waveform animation
- Automatic alert if vitals go critical

### 🚑 Ambulance Tracker
- Select an available unit, click **"Dispatch"**
- Watch animated ambulance traverse route map
- ETA countdown + milestone notifications
- Stage tracker: Dispatch → En Route → Approaching → Arrived

### ⚙️ Settings
- Switch between **English, Hindi, Español, Français**
- Toggle notifications, voice commands, wearable sync
- System info and emergency contact numbers

---

## 🔐 Authentication

All API calls requiring authentication use **JWT Bearer tokens**:

```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are stored in `localStorage` and automatically attached via the Axios interceptor in `src/services/api.js`.

---

## 🐳 Docker

### Build individually:
```bash
# Backend
docker build -t ehf-backend ./backend

# Frontend
docker build -t ehf-frontend ./frontend
```

### Inspect running containers:
```bash
docker-compose ps
docker logs ehf-backend
docker logs ehf-frontend
```

---

## 🔧 Environment Variables

Create `.env` in project root for Docker Compose:

```env
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=production
```

Backend env vars:

| Variable       | Default                                | Description               |
|----------------|----------------------------------------|---------------------------|
| `PORT`         | `5000`                                 | API server port           |
| `JWT_SECRET`   | `emergency-finder-secret-key-2024`     | JWT signing secret        |
| `NODE_ENV`     | `development`                          | Environment mode          |
| `FRONTEND_URL` | `http://localhost:5173`                | Allowed CORS origin       |

---

## 📡 API Quick Reference

```
GET  /api/health                    → Server health check
POST /api/auth/signup               → Create account
POST /api/auth/login                → Get JWT token
GET  /api/auth/profile  [auth]      → Current user

GET  /api/hospitals                 → AI-sorted hospital list
     ?lat=40.7128&lng=-74.006
     &radius=50
     &emergencyType=cardiac
     &limit=10

GET  /api/hospitals/stats           → Network-wide bed stats
GET  /api/hospitals/:id             → Single hospital detail

GET  /api/alerts                    → Active system alerts
POST /api/alerts        [auth]      → Create alert
PATCH/api/alerts/:id/dismiss [auth] → Dismiss alert
```

---

## 🏗️ Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React 18, Vite 5, React Router 6  |
| Styling        | Vanilla CSS (custom design system)|
| Maps           | react-leaflet + OpenStreetMap     |
| HTTP Client    | Axios                             |
| Icons          | lucide-react                      |
| Backend        | Node.js, Express 4                |
| Auth           | JWT (jsonwebtoken) + bcryptjs     |
| Validation     | express-validator                 |
| Security HDRs  | helmet, CORS                      |
| Testing        | Jest + Supertest                  |
| Containerize   | Docker, Docker Compose, Nginx     |
| CI/CD          | Jenkins (declarative pipeline)    |
| Sec Scanning   | Snyk (deps) + Trivy (containers)  |
| Fonts          | Inter, JetBrains Mono (Google)    |

---

## 🗂️ Project Structure

```
Emergeny/
├── backend/            # Node.js Express API
├── frontend/           # React + Vite SPA
├── docker-compose.yml  # Container orchestration
├── Jenkinsfile         # CI/CD pipeline
├── architecture.md     # System architecture docs
└── README.md           # This file
```

See [architecture.md](./architecture.md) for:
- Full system architecture diagram
- Data flow explanations
- AI recommendation algorithm details  
- Complete API endpoint reference
- DevSecOps security measures

---

## 🎯 University Project Notes

This prototype demonstrates:

| Criterion                  | Implementation                                    |
|----------------------------|---------------------------------------------------|
| **Design Thinking**        | User-first emergency UI, one-click search         |
| **Full-Stack Development** | React SPA + Node.js REST API                      |
| **Real-Time Data**         | 30s polling, simulated live bed updates           |
| **AI Integration**         | Weighted scoring algorithm (distance + capacity)  |
| **Maps Integration**       | Leaflet + OpenStreetMap, color-coded markers      |
| **Authentication**         | JWT + bcrypt, protected routes                    |
| **Multi-Language**         | EN, HI, ES, FR with localStorage persistence      |
| **DevOps**                 | Dockerfiles, docker-compose, Jenkinsfile          |
| **Security**               | Helmet, CORS, validation, Snyk, Trivy             |
| **Testing**                | Jest + Supertest unit tests (9 test cases)        |
| **Scalability**            | Repository pattern, swappable DB layer            |
| **Future Innovation**      | Wearable mock, voice placeholder, ambulance sim   |

---

## 📄 License

MIT License — Built for educational purposes.

> ⚠️ **Disclaimer:** This is a prototype for academic demonstration. In a real emergency, always call **911** immediately.
