# API Reference — SmartTraffic AI

Base URL (local): `http://localhost:5000/api/v1`

All protected endpoints require: `Authorization: Bearer <token>`

---

## Authentication

### POST /auth/register
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "full_name": "John Doe"
}
```
Returns: `{ access_token, token_type, user }`

### POST /auth/login
```json
{ "email": "john@example.com", "password": "secret123" }
```
Returns: `{ access_token, token_type, user }`

---

## Prediction

### POST /prediction/train
Trains Random Forest + XGBoost on 5000-row synthetic dataset.
Returns model metrics for both models.

### POST /prediction/predict
```json
{
  "location": "Downtown",
  "hour": 8,
  "day_of_week": 1,
  "month": 6,
  "weather_condition": "clear",
  "road_type": "urban",
  "vehicle_count": 400,
  "average_speed": 25.0
}
```
Returns: `{ predicted_congestion, confidence, recommendation, timestamp }`

---

## Route Optimization

### POST /route/optimize
```json
{
  "source": "Downtown",
  "destination": "Airport",
  "algorithm": "dijkstra",
  "optimize_for": "time"
}
```
Returns: `{ path, total_distance_km, estimated_time_minutes, alternative_routes }`

---

## Dashboard

### GET /dashboard/stats
Returns: `{ total_records, congestion_distribution, average_speed_kmh }`

### GET /dashboard/analytics
Returns: `{ hourly_distribution, daily_distribution, congestion_by_location, total_predictions }`

### GET /dashboard/heatmap
Returns: `{ points: [{ latitude, longitude, congestion_level, vehicle_count }] }`
