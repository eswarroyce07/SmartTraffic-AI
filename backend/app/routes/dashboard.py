from fastapi import APIRouter, Depends
from app.services import get_dashboard_stats, get_current_user, get_traffic_records
from app.schemas import TokenData
from app.database import get_traffic_collection, get_predictions_collection, is_mongo
from app.database.local_store import predictions, traffic_records

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])


@router.get("/stats")
async def dashboard_stats(_: TokenData = Depends(get_current_user)):
    return await get_dashboard_stats()


@router.get("/analytics")
async def analytics(_: TokenData = Depends(get_current_user)):
    traffic_col = get_traffic_collection()
    pred_col = get_predictions_collection()

    if is_mongo():
        hourly_pipeline = [
            {"$group": {
                "_id": "$hour",
                "count": {"$sum": 1},
                "avg_speed": {"$avg": "$average_speed"},
            }},
            {"$sort": {"_id": 1}},
        ]
        hourly = []
        async for doc in traffic_col.aggregate(hourly_pipeline):
            hourly.append({
                "_id": doc["_id"],
                "count": doc["count"],
                "avg_speed": round(doc.get("avg_speed") or 0, 2),
            })

        daily_pipeline = [
            {"$group": {"_id": "$day_of_week", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}},
        ]
        daily = []
        async for doc in traffic_col.aggregate(daily_pipeline):
            daily.append({"_id": doc["_id"], "count": doc["count"]})

        loc_pipeline = [
            {"$group": {"_id": {"location": "$location", "level": "$congestion_level"}, "count": {"$sum": 1}}},
        ]
        by_location = []
        async for doc in traffic_col.aggregate(loc_pipeline):
            by_location.append({"_id": doc["_id"], "count": doc["count"]})

        total_preds = await pred_col.count_documents({})
    else:
        hourly_groups: dict = {}
        daily_groups: dict = {}
        location_groups: dict = {}
        for record in traffic_col:
            hour = record.get("hour")
            hourly_groups.setdefault(hour, {"_id": hour, "count": 0, "speeds": []})
            hourly_groups[hour]["count"] += 1
            if record.get("average_speed") is not None:
                hourly_groups[hour]["speeds"].append(record["average_speed"])
            day = record.get("day_of_week")
            daily_groups[day] = daily_groups.get(day, 0) + 1
            key = (record.get("location"), record.get("congestion_level"))
            location_groups[key] = location_groups.get(key, 0) + 1

        hourly = [
            {
                "_id": item["_id"],
                "count": item["count"],
                "avg_speed": round(sum(item["speeds"]) / len(item["speeds"]), 2) if item["speeds"] else 0,
            }
            for item in sorted(hourly_groups.values(), key=lambda x: x["_id"] or 0)
        ]
        daily = [
            {"_id": k, "count": v}
            for k, v in sorted(daily_groups.items(), key=lambda x: x[0] or 0)
        ]
        by_location = [
            {"_id": {"location": k[0], "level": k[1]}, "count": v}
            for k, v in location_groups.items()
        ]
        total_preds = len(pred_col)

    return {
        "hourly_distribution": hourly,
        "daily_distribution": daily,
        "congestion_by_location": by_location,
        "total_predictions": total_preds,
    }


@router.get("/heatmap")
async def heatmap_data(_: TokenData = Depends(get_current_user)):
    traffic_col = get_traffic_collection()
    if is_mongo():
        cursor = traffic_col.find(
            {"latitude": {"$exists": True}, "longitude": {"$exists": True}},
            {"latitude": 1, "longitude": 1, "congestion_level": 1, "vehicle_count": 1, "_id": 0},
        ).limit(500)
        docs = []
        async for doc in cursor:
            docs.append(doc)
    else:
        docs = [
            {k: r[k] for k in ("latitude", "longitude", "congestion_level", "vehicle_count") if k in r}
            for r in traffic_col
            if r.get("latitude") is not None and r.get("longitude") is not None
        ][:500]
    return {"points": docs}
