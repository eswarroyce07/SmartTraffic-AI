import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
import pandas as pd
import io
from app.schemas import PredictionRequest, PredictionResponse, TokenData
from app.services import run_prediction, train_from_dataframe, get_current_user
from app.ml.data_generator import generate_dataset

router = APIRouter(prefix="/prediction", tags=["Prediction"])

RESULTS_PATH = Path(__file__).parent.parent / "ml" / "models_saved" / "training_results.json"


@router.post("/predict", response_model=PredictionResponse)
async def predict(req: PredictionRequest, _: TokenData = Depends(get_current_user)):
    try:
        return await run_prediction(req)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not trained yet. POST /prediction/train first.",
        )


@router.get("/history")
async def prediction_history(limit: int = 50, _: TokenData = Depends(get_current_user)):
    from app.database import get_predictions_collection, is_mongo
    col = get_predictions_collection()
    if is_mongo():
        cursor = col.find({}).sort("timestamp", -1).limit(limit)
        docs = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            docs.append(doc)
        return docs
    docs = sorted(col, key=lambda d: str(d.get("timestamp") or ""), reverse=True)[:limit]
    return [{**d, "id": d.get("_id", "")} for d in docs]


@router.post("/train")
async def train(_: TokenData = Depends(get_current_user)):
    df = generate_dataset(5000)
    result = await train_from_dataframe(df)
    return {"message": "Training complete", "results": result}


@router.post("/train/upload")
async def train_from_upload(
    file: UploadFile = File(...),
    _: TokenData = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    required = {"hour", "day_of_week", "month", "vehicle_count", "average_speed",
                "weather_condition", "road_type", "congestion_level"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")
    result = await train_from_dataframe(df)
    return {"message": "Training complete", "results": result}


@router.get("/model-info")
async def model_info(_: TokenData = Depends(get_current_user)):
    if not RESULTS_PATH.exists():
        raise HTTPException(status_code=404, detail="No trained model found")
    return json.loads(RESULTS_PATH.read_text())
