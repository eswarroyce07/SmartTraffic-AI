from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TrafficRecord(BaseModel):
    location: str
    latitude: float
    longitude: float
    timestamp: datetime
    vehicle_count: int
    average_speed: float
    congestion_level: str  # low, medium, high, critical
    weather_condition: Optional[str] = None
    road_type: Optional[str] = None
    incident: bool = False


class TrafficRecordResponse(TrafficRecord):
    id: str
    created_at: datetime


class PredictionRequest(BaseModel):
    location: str
    hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    month: int = Field(..., ge=1, le=12)
    weather_condition: str = "clear"
    road_type: str = "urban"
    vehicle_count: Optional[int] = None
    average_speed: Optional[float] = None


class PredictionResponse(BaseModel):
    location: str
    predicted_congestion: str
    confidence: float
    predicted_vehicle_count: Optional[int] = None
    recommendation: str
    timestamp: datetime


class RouteRequest(BaseModel):
    source: str
    destination: str
    algorithm: str = "dijkstra"  # dijkstra or astar
    optimize_for: str = "time"   # time or distance


class RouteResponse(BaseModel):
    source: str
    destination: str
    algorithm: str
    path: list[str]
    total_distance_km: float
    estimated_time_minutes: float
    congestion_zones: list[str]
    alternative_routes: Optional[list[dict]] = None
