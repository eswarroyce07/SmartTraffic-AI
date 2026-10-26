from datetime import datetime, timezone
import json
from pathlib import Path
import pandas as pd
from app.database import get_traffic_collection, get_predictions_collection, is_mongo
from app.database.local_store import new_id
from app.schemas import TrafficRecord, PredictionRequest, PredictionResponse
from app.ml.pipeline import train_models, predict_congestion
from app.utils import get_logger

logger = get_logger(__name__)

RESULTS_PATH = Path(__file__).parent.parent / "ml" / "models_saved" / "training_results.json"


async def insert_traffic_record(record: TrafficRecord) -> str:
    col = get_traffic_collection()
    doc = record.model_dump()
    if is_mongo():
        result = await col.insert_one(doc)
        return str(result.inserted_id)
    doc["_id"] = new_id()
    doc["created_at"] = datetime.now(timezone.utc)
    col.append(doc)
    return doc["_id"]


async def get_traffic_records(limit: int = 100) -> list[dict]:
    col = get_traffic_collection()
    if is_mongo():
        cursor = col.find({}, {"hashed_password": 0}).sort("timestamp", -1).limit(limit)
        docs = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            docs.append(doc)
        return docs
    docs = sorted(col, key=lambda d: d.get("timestamp") or "", reverse=True)[:limit]
    result = []
    for d in docs:
        d2 = d.copy()
        d2["id"] = d2.pop("_id", d2.get("id", ""))
        result.append(d2)
    return result


async def get_dashboard_stats() -> dict:
    traffic_col = get_traffic_collection()
    pred_col = get_predictions_collection()

    if is_mongo():
        total = await traffic_col.count_documents({})
        total_preds = await pred_col.count_documents({})
        pipeline = [{"$group": {"_id": "$congestion_level", "count": {"$sum": 1}}}]
        congestion_dist = {}
        async for doc in traffic_col.aggregate(pipeline):
            congestion_dist[doc["_id"]] = doc["count"]
        speed_pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$average_speed"}}}]
        avg_speed = 0.0
        async for doc in traffic_col.aggregate(speed_pipeline):
            avg_speed = round(doc["avg"] or 0, 2)
        # Avg travel time from predictions
        time_pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$estimated_time_minutes"}}}]
        avg_travel_time = 0.0
        async for doc in pred_col.aggregate(time_pipeline):
            avg_travel_time = round(doc["avg"] or 0, 1)
    else:
        total = len(traffic_col)
        total_preds = len(pred_col)
        congestion_dist: dict = {}
        speeds = []
        for r in traffic_col:
            level = r.get("congestion_level")
            congestion_dist[level] = congestion_dist.get(level, 0) + 1
            if r.get("average_speed") is not None:
                speeds.append(r["average_speed"])
        avg_speed = round(sum(speeds) / len(speeds), 2) if speeds else 0.0
        avg_travel_time = 0.0

    # Model accuracy from saved results
    model_accuracy = None
    if RESULTS_PATH.exists():
        try:
            data = json.loads(RESULTS_PATH.read_text())
            best = data.get("best_model", "")
            model_accuracy = data.get("models", {}).get(best, {}).get("accuracy")
        except Exception:
            pass

    active_zones = len([k for k, v in congestion_dist.items() if k in ("high", "critical") and v > 0])

    return {
        "total_records": total,
        "total_predictions": total_preds,
        "congestion_distribution": congestion_dist,
        "average_speed_kmh": avg_speed,
        "average_travel_time_minutes": avg_travel_time,
        "active_congestion_zones": active_zones,
        "model_accuracy": model_accuracy,
    }


async def run_prediction(req: PredictionRequest) -> PredictionResponse:
    result = predict_congestion(
        hour=req.hour,
        day_of_week=req.day_of_week,
        month=req.month,
        weather_condition=req.weather_condition,
        road_type=req.road_type,
        vehicle_count=req.vehicle_count or 300,
        average_speed=req.average_speed or 40.0,
    )
    response = PredictionResponse(
        location=req.location,
        predicted_congestion=result["predicted_congestion"],
        confidence=result["confidence"],
        recommendation=result["recommendation"],
        timestamp=datetime.now(timezone.utc),
    )
    col = get_predictions_collection()
    prediction = response.model_dump()
    if is_mongo():
        await col.insert_one(prediction)
    else:
        prediction["_id"] = new_id()
        col.append(prediction)
    return response


async def train_from_dataframe(df: pd.DataFrame) -> dict:
    logger.info(f"Training on {len(df)} records")
    return train_models(df)
