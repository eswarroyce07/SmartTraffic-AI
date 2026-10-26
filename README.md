# SmartTraffic AI
### Urban Traffic Congestion Prediction & Intelligent Route Optimization Analytics Platform

---

## Overview
An AI-powered web platform that predicts urban traffic congestion using Machine Learning (Random Forest + XGBoost) and recommends optimal routes using Dijkstra and A* graph algorithms, with a live interactive analytics dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Tailwind CSS v4, React Router, Axios, Leaflet.js, Recharts |
| Backend | Python, FastAPI, Uvicorn, Pydantic v2, Motor |
| Database | MongoDB Atlas |
| ML | Scikit-learn, XGBoost, Pandas, NumPy, Joblib |
| Maps | OpenStreetMap, Leaflet |
| Deploy | Netlify (frontend), Render (backend) |

---

## Project Structure

```
SmartTrafficAI/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Route pages
│   │   └── utils/          # Helpers
│   └── netlify.toml
├── backend/                # FastAPI app
│   ├── app/
│   │   ├── config/         # Settings (pydantic-settings)
│   │   ├── database/       # MongoDB connection + collections
│   │   ├── models/         # ODM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── ml/             # ML pipeline + route optimizer
│   │   └── utils/          # Logger
│   ├── requirements.txt
│   └── Procfile
└── docs/
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Copy and fill in your MongoDB Atlas URL
cp .env.example .env

python run.py
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev
# App available at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login, get JWT |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/traffic/` | List traffic records |
| POST | `/api/v1/traffic/` | Add traffic record |
| POST | `/api/v1/prediction/train` | Train ML model (synthetic data) |
| POST | `/api/v1/prediction/train/upload` | Train from uploaded CSV |
| POST | `/api/v1/prediction/predict` | Predict congestion |
| GET | `/api/v1/prediction/model-info` | Model metrics |
| POST | `/api/v1/route/optimize` | Find optimal route |
| GET | `/api/v1/route/locations` | Available locations |
| GET | `/api/v1/dashboard/stats` | KPI stats |
| GET | `/api/v1/dashboard/analytics` | Analytics data |
| GET | `/api/v1/dashboard/heatmap` | Heatmap points |
| GET | `/health` | Health check |

---

## ML Pipeline

1. **Data Generation** — Synthetic 5000-row dataset with realistic peak-hour patterns
2. **Preprocessing** — Label encoding, StandardScaler, feature engineering
3. **Training** — Random Forest + XGBoost, compared by F1 score
4. **Evaluation** — Accuracy, Precision, Recall, F1, Confusion Matrix
5. **Saving** — Best model + encoders saved via Joblib
6. **Prediction API** — Real-time inference with confidence score

### Train the model (first time)
```
POST /api/v1/prediction/train
Authorization: Bearer <token>
```

---

## Route Optimization

- **Dijkstra** — Guaranteed shortest path by weight (time or distance)
- **A\*** — Heuristic-guided search using Haversine distance
- Both algorithms run on a 10-node urban road graph
- Returns primary route + alternative route comparison

---

## Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new Web Service on Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

### Frontend → Netlify
1. Push `frontend/` to GitHub
2. Connect repo on Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set `VITE_API_BASE_URL` to your Render backend URL

---

## CSV Upload Format

```csv
hour,day_of_week,month,vehicle_count,average_speed,weather_condition,road_type,congestion_level
8,1,6,450,25.5,clear,urban,high
17,3,9,380,30.0,rain,highway,medium
```

---

## Features
- JWT Authentication (register/login/protected routes)
- ML Congestion Prediction with model comparison
- Dijkstra + A* Route Optimization
- Interactive Leaflet Map with traffic overlays
- Real-time Analytics Dashboard (hourly/weekly/congestion charts)
- CSV Dataset Upload & Auto-training
- Dark mode professional UI
- RESTful API with FastAPI + auto-generated Swagger docs
