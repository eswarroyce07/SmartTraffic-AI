"""ML pipeline: preprocessing → training → evaluation → model saving."""
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix,
)
from xgboost import XGBClassifier
from app.utils import get_logger

logger = get_logger(__name__)

MODELS_DIR = Path(__file__).parent / "models_saved"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_COLS = [
    "hour", "day_of_week", "month", "is_peak_hour", "is_weekend",
    "vehicle_count", "average_speed", "weather_encoded", "road_type_encoded",
]
TARGET_COL = "congestion_encoded"
LABEL_ORDER = ["low", "medium", "high", "critical"]


# ── Preprocessing ────────────────────────────────────────────────────────────

def preprocess(df: pd.DataFrame) -> tuple[pd.DataFrame, LabelEncoder, LabelEncoder, LabelEncoder]:
    df = df.copy()
    df["is_peak_hour"] = ((df["hour"].between(7, 9)) | (df["hour"].between(17, 19))).astype(int)
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

    weather_enc = LabelEncoder().fit(df["weather_condition"])
    road_enc = LabelEncoder().fit(df["road_type"])
    target_enc = LabelEncoder().fit(LABEL_ORDER)

    df["weather_encoded"] = weather_enc.transform(df["weather_condition"])
    df["road_type_encoded"] = road_enc.transform(df["road_type"])
    df["congestion_encoded"] = target_enc.transform(df["congestion_level"])
    return df, weather_enc, road_enc, target_enc


def _evaluate(model, X_test, y_test, name: str) -> dict:
    y_pred = model.predict(X_test)
    metrics = {
        "model": name,
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }
    logger.info(f"{name} → accuracy={metrics['accuracy']}  f1={metrics['f1_score']}")
    return metrics


# ── Training ─────────────────────────────────────────────────────────────────

def train_models(df: pd.DataFrame) -> dict:
    df, weather_enc, road_enc, target_enc = preprocess(df)

    X = df[FEATURE_COLS].values
    y = df[TARGET_COL].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_metrics = _evaluate(rf, X_test, y_test, "RandomForest")
    rf_metrics["feature_importance"] = dict(
        zip(FEATURE_COLS, rf.feature_importances_.round(4).tolist())
    )

    xgb = XGBClassifier(n_estimators=100, random_state=42, eval_metric="mlogloss", verbosity=0, n_jobs=-1)
    xgb.fit(X_train, y_train)
    xgb_metrics = _evaluate(xgb, X_test, y_test, "XGBoost")
    xgb_metrics["feature_importance"] = dict(
        zip(FEATURE_COLS, xgb.feature_importances_.round(4).tolist())
    )

    best_model = rf if rf_metrics["f1_score"] >= xgb_metrics["f1_score"] else xgb
    best_name = "RandomForest" if best_model is rf else "XGBoost"
    logger.info(f"Best model: {best_name}")

    # Save artefacts
    joblib.dump(best_model, MODELS_DIR / "best_model.pkl")
    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")
    joblib.dump(weather_enc, MODELS_DIR / "weather_encoder.pkl")
    joblib.dump(road_enc, MODELS_DIR / "road_encoder.pkl")
    joblib.dump(target_enc, MODELS_DIR / "target_encoder.pkl")

    result = {
        "best_model": best_name,
        "models": {"RandomForest": rf_metrics, "XGBoost": xgb_metrics},
        "feature_columns": FEATURE_COLS,
        "label_classes": LABEL_ORDER,
    }
    (MODELS_DIR / "training_results.json").write_text(json.dumps(result, indent=2))
    return result


# ── Prediction ────────────────────────────────────────────────────────────────

def load_artefacts():
    return {
        "model": joblib.load(MODELS_DIR / "best_model.pkl"),
        "scaler": joblib.load(MODELS_DIR / "scaler.pkl"),
        "weather_enc": joblib.load(MODELS_DIR / "weather_encoder.pkl"),
        "road_enc": joblib.load(MODELS_DIR / "road_encoder.pkl"),
        "target_enc": joblib.load(MODELS_DIR / "target_encoder.pkl"),
    }


def predict_congestion(
    hour: int, day_of_week: int, month: int,
    weather_condition: str, road_type: str,
    vehicle_count: int = 300, average_speed: float = 40.0,
) -> dict:
    arts = load_artefacts()
    is_peak = int(7 <= hour <= 9 or 17 <= hour <= 19)
    is_weekend = int(day_of_week >= 5)

    try:
        weather_enc = arts["weather_enc"].transform([weather_condition])[0]
    except ValueError:
        weather_enc = 0
    try:
        road_enc = arts["road_enc"].transform([road_type])[0]
    except ValueError:
        road_enc = 0

    features = np.array([[
        hour, day_of_week, month, is_peak, is_weekend,
        vehicle_count, average_speed, weather_enc, road_enc,
    ]])
    features_scaled = arts["scaler"].transform(features)
    pred_idx = arts["model"].predict(features_scaled)[0]
    try:
        proba = arts["model"].predict_proba(features_scaled)[0]
        confidence = round(float(proba.max()), 4)
    except AttributeError:
        confidence = 1.0
    label = arts["target_enc"].inverse_transform([pred_idx])[0]

    recommendations = {
        "low": "Traffic is flowing smoothly. No action needed.",
        "medium": "Moderate traffic. Consider alternate routes during peak hours.",
        "high": "Heavy congestion detected. Use alternate routes.",
        "critical": "Severe congestion! Avoid this area. Use alternate routes immediately.",
    }
    return {
        "predicted_congestion": label,
        "confidence": confidence,
        "recommendation": recommendations.get(label, "Monitor traffic conditions."),
    }
