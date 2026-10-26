"""
Reset MongoDB Atlas Cluster1:
  - Drop ALL databases except system ones
  - Recreate smarttraffic DB with proper collections, indexes, and seed data
"""
import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import random

MONGO_URL = "mongodb+srv://eswarakumarr2024cse_db_user:u9BShXeu3eI784jP@cluster1.ck0p7sv.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = "smarttraffic"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

LOCATIONS = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul",
    "Thanjavur", "Kanchipuram", "Tiruppur", "Hosur", "Nagercoil",
    "Kumbakonam", "Cuddalore", "Namakkal", "Karur",
]

LOCATION_COORDS = {
    "Chennai": (13.0827, 80.2707), "Coimbatore": (11.0168, 76.9558),
    "Madurai": (9.9252, 78.1198), "Tiruchirappalli": (10.7905, 78.7047),
    "Salem": (11.6643, 78.1460), "Tirunelveli": (8.7139, 77.7567),
    "Vellore": (12.9165, 79.1325), "Erode": (11.3410, 77.7172),
    "Thoothukudi": (8.7642, 78.1348), "Dindigul": (10.3624, 77.9695),
    "Thanjavur": (10.7870, 79.1378), "Kanchipuram": (12.8185, 79.6947),
    "Tiruppur": (11.1085, 77.3411), "Hosur": (12.7409, 77.8253),
    "Nagercoil": (8.1833, 77.4119), "Kumbakonam": (10.9602, 79.3845),
    "Cuddalore": (11.7480, 79.7714), "Namakkal": (11.2189, 78.1674),
    "Karur": (10.9601, 78.0766),
}

WEATHER = ["clear", "rain", "fog", "cloudy", "clear", "clear"]  # weighted clear
ROAD_TYPES = ["urban", "highway", "residential", "arterial"]
CONGESTION_LEVELS = ["low", "medium", "high", "critical"]

random.seed(42)


def congestion_for(hour, vehicle_count):
    if vehicle_count < 150:
        return "low"
    elif vehicle_count < 350:
        return "medium"
    elif vehicle_count < 550:
        return "high"
    return "critical"


def make_traffic_records(n=120):
    records = []
    base_time = datetime.now(timezone.utc) - timedelta(days=7)
    for i in range(n):
        loc = random.choice(LOCATIONS)
        lat, lon = LOCATION_COORDS[loc]
        hour = random.randint(0, 23)
        is_peak = (7 <= hour <= 9) or (17 <= hour <= 19)
        base_count = 200 + (300 if is_peak else 0) - (100 if random.randint(0, 6) >= 5 else 0)
        vehicle_count = max(10, min(800, base_count + random.randint(-50, 100)))
        avg_speed = max(5, min(120, round(60 - vehicle_count * 0.05 + random.gauss(0, 5), 2)))
        congestion = congestion_for(hour, vehicle_count)
        ts = base_time + timedelta(hours=i * 1.4)
        records.append({
            "location": loc,
            "latitude": lat + random.uniform(-0.01, 0.01),
            "longitude": lon + random.uniform(-0.01, 0.01),
            "timestamp": ts,
            "vehicle_count": vehicle_count,
            "average_speed": avg_speed,
            "congestion_level": congestion,
            "weather_condition": random.choice(WEATHER),
            "road_type": random.choice(ROAD_TYPES),
            "incident": random.random() < 0.05,
            "hour": hour,
            "day_of_week": ts.weekday(),
            "month": ts.month,
            "created_at": ts,
        })
    return records


def make_predictions(n=30):
    preds = []
    recommendations = {
        "low": "Traffic is flowing smoothly. No action needed.",
        "medium": "Moderate traffic. Consider alternate routes during peak hours.",
        "high": "Heavy congestion detected. Use alternate routes.",
        "critical": "Severe congestion! Avoid this area. Use alternate routes immediately.",
    }
    base_time = datetime.now(timezone.utc) - timedelta(days=3)
    for i in range(n):
        loc = random.choice(LOCATIONS)
        level = random.choice(CONGESTION_LEVELS)
        ts = base_time + timedelta(hours=i * 2.4)
        preds.append({
            "location": loc,
            "predicted_congestion": level,
            "confidence": round(random.uniform(0.72, 0.98), 4),
            "recommendation": recommendations[level],
            "timestamp": ts,
        })
    return preds


async def main():
    print("Connecting to MongoDB Atlas Cluster1...")
    client = AsyncIOMotorClient(MONGO_URL)

    # ── 1. List and drop all non-system databases ──────────────────────────
    system_dbs = {"admin", "local", "config"}
    existing = await client.list_database_names()
    print(f"Found databases: {existing}")

    for db_name in existing:
        if db_name not in system_dbs:
            await client.drop_database(db_name)
            print(f"  Dropped: {db_name}")

    print("\nAll non-system databases dropped.")

    # ── 2. Create smarttraffic DB ──────────────────────────────────────────
    db = client[DB_NAME]

    # users
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("username")

    # traffic_data
    await db["traffic_data"].create_index("location")
    await db["traffic_data"].create_index("timestamp")
    await db["traffic_data"].create_index("congestion_level")
    await db["traffic_data"].create_index([("latitude", 1), ("longitude", 1)])

    # predictions
    await db["predictions"].create_index("timestamp")
    await db["predictions"].create_index("location")

    # routes
    await db["routes"].create_index("source")
    await db["routes"].create_index("destination")

    print(f"\nCreated '{DB_NAME}' database with indexes.")

    # ── 3. Seed users ──────────────────────────────────────────────────────
    now = datetime.now(timezone.utc)
    users = [
        {
            "username": "admin",
            "email": "admin@smarttraffic.ai",
            "full_name": "Admin User",
            "hashed_password": pwd_context.hash("admin123"),
            "role": "admin",
            "created_at": now,
        },
        {
            "username": "eswar",
            "email": "eswar@smarttraffic.ai",
            "full_name": "Eswar Kumar",
            "hashed_password": pwd_context.hash("eswar123"),
            "role": "user",
            "created_at": now,
        },
    ]
    await db["users"].insert_many(users)
    print(f"Seeded {len(users)} users.")

    # ── 4. Seed traffic records ────────────────────────────────────────────
    traffic = make_traffic_records(120)
    await db["traffic_data"].insert_many(traffic)
    print(f"Seeded {len(traffic)} traffic records.")

    # ── 5. Seed predictions ────────────────────────────────────────────────
    predictions = make_predictions(30)
    await db["predictions"].insert_many(predictions)
    print(f"Seeded {len(predictions)} predictions.")

    # ── 6. Verify ──────────────────────────────────────────────────────────
    cols = await db.list_collection_names()
    dbs_final = await client.list_database_names()
    print(f"\nFinal databases: {dbs_final}")
    print(f"'{DB_NAME}' collections: {cols}")
    print(f"  users:        {await db['users'].count_documents({})}")
    print(f"  traffic_data: {await db['traffic_data'].count_documents({})}")
    print(f"  predictions:  {await db['predictions'].count_documents({})}")
    print(f"  routes:       {await db['routes'].count_documents({})}")

    client.close()
    print("\nDone! MongoDB Atlas is clean and seeded for SmartTraffic AI.")
    print("\nLogin credentials:")
    print("  Admin  -> email: admin@smarttraffic.ai  | password: admin123")
    print("  User   -> email: eswar@smarttraffic.ai  | password: eswar123")


asyncio.run(main())
