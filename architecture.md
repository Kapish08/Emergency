# Emergency Hospital Finder — System Architecture & API Documentation

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMERGENCY HOSPITAL FINDER                     │
│                    System Architecture v1.0                      │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │                        CLIENT LAYER                          │
  │                                                              │
  │   Browser / Mobile                                           │
  │   ┌──────────────────────────────────────────────────────┐  │
  │   │  React 18 + Vite SPA (localhost:5173 / port 80)      │  │
  │   │                                                      │  │
  │   │  Pages:                Components:                   │  │
  │   │  ├─ AuthPage            ├─ Sidebar                   │  │
  │   │  ├─ Dashboard           ├─ HospitalMap (Leaflet)     │  │
  │   │  ├─ EmergencyFinder     ├─ HospitalCard              │  │
  │   │  ├─ HealthMonitor       ├─ HospitalDetailModal       │  │
  │   │  ├─ AmbulanceTracker    ├─ SOSButton                 │  │
  │   │  └─ SettingsPage        └─ Toast Notifications       │  │
  │   │                                                      │  │
  │   │  Context:                                            │  │
  │   │  ├─ AuthContext (JWT storage + login/logout)         │  │
  │   │  ├─ ToastContext (global notification system)        │  │
  │   │  └─ LanguageContext (i18n: EN, HI, ES, FR)          │  │
  │   └──────────────────────────────────────────────────────┘  │
  └──────────────────┬───────────────────────────────────────────┘
                     │  HTTP / REST (Axios + JWT Bearer Token)
                     │  Proxy: /api/* → localhost:5000
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │                        API LAYER                             │
  │                                                              │
  │   Node.js + Express (localhost:5000)                         │
  │   ┌──────────────────────────────────────────────────────┐  │
  │   │  Middleware Stack:                                    │  │
  │   │  [Helmet] → [CORS] → [Morgan] → [JSON Parser]        │  │
  │   │       → [JWT Auth Middleware] → [Route Handlers]     │  │
  │   │                                                      │  │
  │   │  Routes:                                             │  │
  │   │  POST /api/auth/signup      → authController        │  │
  │   │  POST /api/auth/login       → authController        │  │
  │   │  GET  /api/auth/profile 🔒  → authController        │  │
  │   │  GET  /api/hospitals        → hospitalController     │  │
  │   │  GET  /api/hospitals/stats  → hospitalController     │  │
  │   │  GET  /api/hospitals/:id    → hospitalController     │  │
  │   │  GET  /api/alerts           → alertController        │  │
  │   │  POST /api/alerts      🔒   → alertController        │  │
  │   │  PATCH/api/alerts/:id  🔒   → alertController        │  │
  │   │  GET  /api/health           → healthCheck            │  │
  │   └──────────────────────────────────────────────────────┘  │
  └──────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────────────────┐
  │                       DATA LAYER                             │
  │                                                              │
  │   In-Memory JSON Store (swap with MongoDB/PostgreSQL)        │
  │   ┌──────────────────────────────────────────────────────┐  │
  │   │  data/hospitals.json  →  8 hospitals, NYC area       │  │
  │   │  controllers/authController.js  →  users[]           │  │
  │   │  controllers/alertController.js →  alerts[]          │  │
  │   └──────────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────────────────────────┘

  External Services:
  ┌─────────────────────┐  ┌──────────────────────────────────┐
  │  OpenStreetMap      │  │  Google Maps (Directions Link)   │
  │  (Tile layer via    │  │  Opens in new tab for navigation │
  │   react-leaflet)    │  └──────────────────────────────────┘
  └─────────────────────┘
```

---

## 2. Data Flow

### 2a. Emergency Hospital Search Flow

```
User Opens App
     │
     ▼
[AuthPage] → JWT Login → Token stored in localStorage
     │
     ▼
[EmergencyFinder Page]
     │
     ├── Detect GPS location (navigator.geolocation)
     │         OR Manual coordinate input
     │
     ▼
GET /api/hospitals?lat=X&lng=Y&radius=60&emergencyType=cardiac
     │
     ▼
[hospitalController.getHospitals()]
     │
     ├── simulateLiveData(hospital)   → adds random ±variation
     ├── haversineDistance(user, hosp) → km distance
     ├── computeAIScore(hosp, dist, type) → 0-100 score
     │       Weights: 40% proximity + 30% ICU + 20% general + 10% wait
     │       Emergency-type adjustments for cardiac/trauma/minor
     ├── getRecommendationLabel(score) → green/yellow/red
     └── Sort by aiScore DESC → Return top 10
     │
     ▼
Frontend renders:
  [HospitalMap]  ← Colored markers (green/amber/red) by AI score
  [HospitalCard] ← Bed availability bars, meta chips, CTA buttons
     │
     └── User clicks card → [HospitalDetailModal] (full details)
              │
              └── "Get Directions" → Google Maps URL opens
```

### 2b. Authentication Flow

```
User submits login form
     │
     ▼
POST /api/auth/login { email, password }
     │
     ├── express-validator validates input
     ├── Find user by email (case-insensitive)
     ├── bcrypt.compare(password, hash)
     └── jwt.sign({ id, email, role }, SECRET, { expiresIn: '7d' })
     │
     ▼
Response: { token, user: { id, name, email, role } }
     │
     ▼
Frontend: localStorage.setItem('ehf_token', token)
     │
     ▼
All subsequent API calls include:
  Authorization: Bearer <token>
     │
     ▼
authMiddleware.js verifies token on protected routes
```

### 2c. Real-Time Simulation Flow

```
Every 30 seconds:
  EmergencyFinder → fetchHospitals() → GET /api/hospitals

Each request:
  hospitalController → simulateLiveData(each hospital)
    ├── ICU beds ± 2 (min 0)
    ├── General beds ± 5 (min 0)
    ├── Emergency beds ± 3 (min 0)
    └── Wait time ± 5 mins (min 2)

→ Frontend re-renders with updated numbers
→ Live badge pulses green to indicate fresh data
```

---

## 3. Folder Structure

```
Emergeny/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # JWT signup/login/profile
│   │   ├── hospitalController.js   # AI scoring, distance, bed data
│   │   └── alertController.js      # System-wide emergency alerts
│   ├── data/
│   │   └── hospitals.json          # 8 NYC hospitals mock data
│   ├── middlewares/
│   │   └── authMiddleware.js       # JWT verification + RBAC
│   ├── routes/
│   │   ├── auth.js                 # Auth routes with validation
│   │   ├── hospitals.js            # Hospital routes with validation
│   │   └── alerts.js               # Alert routes
│   ├── tests/
│   │   └── api.test.js             # Jest + Supertest unit tests
│   ├── server.js                   # Express entry, middleware config
│   ├── package.json
│   └── Dockerfile                  # Multi-stage Node.js build
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   ├── HospitalMap.jsx     # react-leaflet map
│   │   │   ├── HospitalCard.jsx    # Card with beds + actions
│   │   │   ├── HospitalDetailModal.jsx  # Full hospital details
│   │   │   └── SOSButton.jsx       # Floating emergency SOS
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User auth state
│   │   │   ├── ToastContext.jsx    # Notification system
│   │   │   └── LanguageContext.jsx # i18n (EN/HI/ES/FR)
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx        # Login + Signup
│   │   │   ├── Dashboard.jsx       # Overview stats + alerts
│   │   │   ├── EmergencyFinder.jsx # Main search + map
│   │   │   ├── HealthMonitor.jsx   # Wearable vitals simulation
│   │   │   ├── AmbulanceTracker.jsx # Dispatch simulation
│   │   │   └── SettingsPage.jsx    # Language, prefs, contacts
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + JWT interceptor
│   │   ├── App.jsx                 # Router + layout + providers
│   │   ├── index.css               # Design system (900+ lines CSS)
│   │   └── main.jsx                # ReactDOM entry
│   ├── index.html                  # SEO meta + font imports
│   ├── vite.config.js              # Vite + proxy config
│   ├── nginx.conf                  # SPA routing + API proxy
│   ├── package.json
│   └── Dockerfile                  # Vite build + Nginx serve
│
├── docker-compose.yml              # Full stack orchestration
├── Jenkinsfile                     # CI/CD pipeline
├── architecture.md                 # This document
└── README.md                       # Setup instructions
```

---

## 4. Complete API Endpoints Reference

### Authentication

| Method | Endpoint            | Auth | Body                              | Response                        |
|--------|---------------------|------|-----------------------------------|---------------------------------|
| POST   | `/api/auth/signup`  | ❌   | `{ name, email, password }`       | `{ token, user }`               |
| POST   | `/api/auth/login`   | ❌   | `{ email, password }`             | `{ token, user }`               |
| GET    | `/api/auth/profile` | ✅   | —                                 | `{ user }`                      |

### Hospitals

| Method | Endpoint                | Auth | Query Params                                                  | Response                              |
|--------|-------------------------|------|---------------------------------------------------------------|---------------------------------------|
| GET    | `/api/hospitals`        | ❌   | `lat, lng, radius, emergencyType, limit`                      | `{ hospitals[], count, generatedAt }` |
| GET    | `/api/hospitals/stats`  | ❌   | —                                                             | `{ stats: { icu, general, ... } }`    |
| GET    | `/api/hospitals/:id`    | ❌   | `lat, lng`                                                    | `{ hospital }`                        |

**emergencyType values:** `general` | `cardiac` | `trauma` | `minor`

#### Hospital Object Schema

```json
{
  "id": "h001",
  "name": "City General Hospital",
  "address": "123 Main St, New York",
  "phone": "+1-212-555-0101",
  "emergencyPhone": "+1-212-555-9911",
  "lat": 40.7128,
  "lng": -74.006,
  "type": "General",
  "rating": 4.5,
  "departments": ["Emergency", "ICU", "Cardiology"],
  "beds": {
    "icu":       { "total": 40, "available": 8 },
    "general":   { "total": 200, "available": 45 },
    "emergency": { "total": 30, "available": 12 }
  },
  "ambulanceAvailable": true,
  "averageWaitTime": 15,
  "facilities": ["MRI", "CT Scan", "Blood Bank"],
  "acceptsInsurance": ["BlueCross", "Medicare"],
  "isOpen24h": true,
  "distance":       { "km": 2.4, "miles": 1.49 },
  "aiScore":        82,
  "recommendation": { "label": "Highly Recommended", "color": "green" },
  "lastUpdated":    "2024-01-01T12:00:00.000Z"
}
```

### Alerts

| Method | Endpoint                    | Auth | Body                                     | Response          |
|--------|-----------------------------|------|------------------------------------------|-------------------|
| GET    | `/api/alerts`               | ❌   | —                                        | `{ alerts[] }`    |
| POST   | `/api/alerts`               | ✅   | `{ type, severity, hospitalId, message }` | `{ alert }`       |
| PATCH  | `/api/alerts/:id/dismiss`   | ✅   | —                                        | `{ message }`     |

**Alert severity values:** `low` | `medium` | `high`

### Health Check

| Method | Endpoint      | Description                   |
|--------|---------------|-------------------------------|
| GET    | `/api/health` | Returns `{ status: "OK" }`    |

---

## 5. AI Recommendation Algorithm

```
Score = (proximityScore × W₁) + (icuRatio × W₂) + (generalRatio × W₃) + (waitScore × W₄) + ratingBonus

Where:
  proximityScore = max(0, 100 - (distanceKm / 50) × 100)
  icuRatio       = (icu.available / icu.total) × 100
  generalRatio   = (general.available / general.total) × 100
  waitScore      = max(0, 100 - averageWaitTime × 2)
  ratingBonus    = (rating / 5) × 20

Weight sets by emergencyType:
  ┌──────────────────┬──────┬──────┬─────────┬──────┐
  │ Emergency Type   │  W₁  │  W₂  │   W₃    │  W₄  │
  │                  │ Prox │  ICU │ General │ Wait │
  ├──────────────────┼──────┼──────┼─────────┼──────┤
  │ General          │ 0.40 │ 0.30 │  0.20   │ 0.10 │
  │ Cardiac / Trauma │ 0.35 │ 0.40 │  0.15   │ 0.10 │
  │ Minor            │ 0.40 │ 0.10 │  0.35   │ 0.15 │
  └──────────────────┴──────┴──────┴─────────┴──────┘

Score interpretation:
  ≥ 70  →  "Highly Recommended" (green)
  45–69 →  "Recommended"        (yellow)
  < 45  →  "Limited Availability" (red)
```

---

## 6. DevSecOps Security Measures

| Layer         | Measure                                    | Implementation                          |
|---------------|--------------------------------------------|-----------------------------------------|
| Authentication| JWT Bearer tokens                          | `jsonwebtoken`, 7-day expiry            |
| Passwords     | Bcrypt hashing (cost factor 10)            | `bcryptjs`                              |
| HTTP Security | Secure headers                             | `helmet`                                |
| Input Validation | Server-side validation                  | `express-validator` on all endpoints    |
| Payload limit | Body size restriction                      | `express.json({ limit: '10kb' })`       |
| CORS          | Allowlist origin                           | Configured to frontend URL only         |
| Error handling| No stack traces in production              | Conditional error detail in response    |
| Dep scanning  | Dependency vulnerability scan              | Snyk (Jenkins pipeline Stage 4)         |
| Image scanning| Container image CVE scan                   | Trivy (Jenkins pipeline Stage 6)        |
| Non-root user | Docker containers run as non-root          | `adduser appuser` in Dockerfiles        |
| Rate limiting | (Future) Add `express-rate-limit`          | Install: `npm install express-rate-limit`|

---

## 7. CI/CD Pipeline Stages

```
Git Push
   │
   ▼
[Stage 1] Checkout      — clone latest code, show git log
   │
   ▼ (parallel)
[Stage 2] Install       — npm ci (backend + frontend in parallel)
   │
   ▼ (parallel)
[Stage 3] Test/Lint     — Jest tests (backend) + ESLint (frontend)
   │
   ▼
[Stage 4] Snyk Scan     — Dependency vulnerability scan
   │                       Fails on HIGH/CRITICAL CVEs
   ▼ (parallel)
[Stage 5] Docker Build  — Build backend + frontend images
   │
   ▼
[Stage 6] Trivy Scan    — Container image vulnerability scan
   │                       Uses Alpine base = minimal attack surface
   ▼
[Stage 7] Push Images   — Push to Docker Hub (main branch only)
   │
   ▼
[Stage 8] Deploy        — docker-compose up -d (main branch only)
   │
   ▼
[Stage 9] Health Check  — curl /api/health + curl frontend
   │
   ▼
[Post] Notify           — Slack/email on success/failure
       Cleanup          — cleanWs()
```

---

## 8. Future Scalability Roadmap

| Feature                    | Tech                                | Priority |
|----------------------------|-------------------------------------|----------|
| Real DB                    | MongoDB Atlas / PostgreSQL          | High     |
| Real-time updates          | WebSockets / Socket.io              | High     |
| Google Maps integration    | Google Maps Platform API            | Medium   |
| Push notifications (PWA)   | Firebase Cloud Messaging            | Medium   |
| Real wearable integration  | Apple HealthKit / Google Fit API    | Medium   |
| Voice commands             | Web Speech API / Whisper            | Medium   |
| Rate limiting              | express-rate-limit + Redis          | High     |
| Kubernetes deployment      | Helm chart + K8s manifests          | Low      |
| Multi-city support         | Location-based DB sharding          | Low      |
| Real ambulance GPS         | GPS hardware + MQTT broker          | Low      |
