# AI DSA Learning Assistant

An AI-powered Data Structures & Algorithms learning app built with **Expo (React Native)** on the frontend and **FastAPI + MongoDB** on the backend.

---

## 📁 Project Structure

```
App/
├── app/                        # Expo Router screens (file-based routing)
│   ├── (tabs)/                 # Bottom-tab screens
│   │   ├── index.tsx           # Dashboard / Home
│   │   ├── topics.tsx          # DSA Topics list
│   │   ├── progress.tsx        # Progress tracker
│   │   └── profile.tsx         # User profile
│   ├── login.js                # Login screen
│   ├── register.js             # Register screen
│   ├── problems.js             # Problems list screen
│   ├── problem-detail.js       # Problem detail + AI hint
│   └── _layout.tsx             # Root layout / auth guard
│
├── src/                        # Shared frontend source
│   ├── components/             # Reusable UI components
│   ├── constants/
│   │   ├── config.js           # ⚙️  API base URL (reads from .env)
│   │   ├── theme.js            # Design tokens (colors, fonts)
│   │   └── leetcodeTopics.js   # LeetCode tag mappings
│   ├── context/
│   │   └── AuthContext.js      # Auth state & token management
│   ├── screens/                # Legacy screen components (referenced by app/)
│   ├── services/
│   │   ├── api.js              # Axios client + all API calls
│   │   ├── leetcodeApi.js      # LeetCode public API wrapper
│   │   └── progressService.js  # Local AsyncStorage progress tracker
│   └── utils/
│       └── mockData.js         # Fallback mock data
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── config.py           # ⚙️  Settings (reads from backend/.env)
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── database.py         # MongoDB connection
│   │   ├── routers/            # API route handlers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Pydantic models
│   │   ├── middleware/         # Rate limiter, error handler
│   │   └── utils/
│   ├── scripts/                # DB seed / utility scripts
│   ├── .env                    # 🔒 Secret config (git-ignored)
│   ├── .env.example            # ✅ Template — copy to .env
│   └── requirements.txt
│
├── .env                        # 🔒 Frontend secrets (git-ignored)
├── .env.example                # ✅ Frontend template — copy to .env
├── app.json                    # Expo config
└── package.json
```

---

## 🚀 Setup & Running

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| Python | ≥ 3.10 |
| MongoDB | Running locally on port 27017 |
| Expo Go app | Latest (on your phone) |

---

### 1. Clone & Install

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

---

### 2. Configure Environment Variables

#### Frontend (`App/.env`)

```bash
# Copy the template
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

Edit `.env`:

```env
EXPO_PUBLIC_API_IP=192.168.x.x   # ← your PC's Wi-Fi IP (see below)
EXPO_PUBLIC_API_PORT=8000
```

> **How to find your Wi-Fi IP:**
> - **Windows**: Run `ipconfig` → look for `IPv4 Address` under your Wi-Fi adapter
> - **Mac/Linux**: Run `ifconfig` → look for `inet` under `en0` or `wlan0`

#### Backend (`App/backend/.env`)

```bash
cd backend
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

The defaults in `.env.example` work out of the box. Key setting:

```env
HOST=0.0.0.0    # ← MUST be 0.0.0.0, NOT localhost
PORT=8000
```

---

### 3. Start the Backend

```bash
cd backend
venv\Scripts\activate        # Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify it's running: open `http://192.168.x.x:8000/docs` in your browser.

---

### 4. Start the Frontend (Expo)

```bash
# From the project root (App/)
npx expo start --host lan
```

> **`--host lan` is required** when testing on a physical device.
> It tells Expo to advertise your local network IP in the QR code
> instead of `localhost` (which your phone cannot reach).

Scan the QR code with **Expo Go** on your phone.

---

## 🔧 Troubleshooting: Network Errors on Mobile

### "Failed to download remote updates" / "Network Error: failed to connect to backend"

These errors mean your phone cannot reach your PC. Work through this checklist:

#### ✅ Checklist

| # | Check | Fix |
|---|-------|-----|
| 1 | **Same Wi-Fi?** | Phone and PC must be on the **same Wi-Fi network**. Mobile data won't work. |
| 2 | **Backend host** | Backend must run with `--host 0.0.0.0`, NOT `localhost`/`127.0.0.1` |
| 3 | **Expo host** | Expo must start with `--host lan`, NOT the default (which uses `localhost`) |
| 4 | **Correct IP in .env** | `EXPO_PUBLIC_API_IP` must match your PC's current Wi-Fi IP (`ipconfig`) |
| 5 | **Windows Firewall** | Allow inbound connections on ports `8000` and `8081` |
| 6 | **IP changed?** | If your router assigned a new IP, update `EXPO_PUBLIC_API_IP` in `.env` and restart both servers |

#### Why `localhost` doesn't work on a phone

`localhost` / `127.0.0.1` is a **loopback address** — it only routes to the same machine. When your phone tries to connect to `localhost:8000`, it looks for a server running *on the phone itself*, not on your PC. You must use your PC's actual Wi-Fi IP address (e.g. `192.168.1.38`).

#### Correct startup commands (copy-paste ready)

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
npx expo start --host lan
```

---

## 🌐 API Overview

Base URL: `http://<your-ip>:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user |
| GET | `/topics` | List all DSA topics |
| GET | `/questions` | List problems |
| GET | `/questions/{id}` | Problem details |
| POST | `/ai/hint` | Get AI hint for a problem |
| POST | `/ai/feedback` | Get AI code explanation |
| GET | `/progress/dashboard` | User progress stats |

Interactive docs: `http://<your-ip>:8000/docs`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo Router |
| State / Auth | React Context + AsyncStorage |
| HTTP Client | Axios |
| Backend | FastAPI (Python) |
| Database | MongoDB (Motor async driver) |
| Auth | JWT (python-jose) |
| AI | OpenAI API / LM Studio (local LLM) |
