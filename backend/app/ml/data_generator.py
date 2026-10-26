"""Generate a synthetic traffic dataset for training."""
import numpy as np
import pandas as pd
from pathlib import Path

LOCATIONS = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul",
    "Thanjavur", "Kanchipuram", "Tiruppur", "Hosur", "Nagercoil",
    "Kumbakonam", "Cuddalore", "Namakkal", "Karur", "Tiruvannamalai",
    "Villupuram", "Krishnagiri", "Dharmapuri", "Ooty", "Pollachi",
    "Palani", "Sivakasi", "Virudhunagar", "Ramanathapuram", "Pudukkottai",
    "Nagapattinam", "Mayiladuthurai", "Ariyalur", "Perambalur", "Kallakurichi",
    "Ranipet", "Tirupattur", "Chengalpattu", "Tenkasi", "Theni",
    "Tiruvallur", "Kanyakumari", "Nilgiris", "Tambaram", "Avadi",
    "Ambattur", "Porur", "Chromepet", "Pallavaram", "Vandalur",
    "Pondicherry", "Karaikal", "Tindivanam", "Gingee", "Ulundurpet",
    "Sankarankovil", "Ambasamudram", "Papanasam", "Pattukkottai", "Karaikudi",
    "Sivaganga", "Paramakudi", "Rameswaram", "Mandapam", "Sattur",
    "Kovilpatti", "Tiruchendur", "Courtallam", "Shenkottai", "Kadayanallur",
    "Vriddhachalam", "Chidambaram", "Sirkazhi", "Vedaranyam", "Thiruvarur",
    "Mannargudi", "Musiri", "Lalgudi", "Manapparai", "Thuraiyur",
    "Jayankondam", "Bhuvanagiri", "Mettur", "Attur", "Rasipuram",
    "Tiruchengode", "Bhavani", "Gobichettipalayam", "Sathyamangalam", "Kangeyam",
    "Dharapuram", "Udumalaipettai", "Palladam", "Avinashi", "Mettupalayam",
    "Coonoor", "Kotagiri", "Valparai", "Gudalur", "Kodaikanal",
    "Periyakulam", "Bodinayakanur", "Andipatti", "Cumbum", "Batlagundu",
    "Natham", "Oddanchatram", "Vedasandur", "Kulithalai", "Manamadurai",
    "Devakottai", "Aranthangi", "Orathanadu", "Needamangalam", "Nannilam",
]
WEATHER = ["clear", "rain", "fog", "snow", "cloudy"]
ROAD_TYPES = ["urban", "highway", "residential", "arterial"]
CONGESTION_LEVELS = ["low", "medium", "high", "critical"]


def generate_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    hours = rng.integers(0, 24, n_samples)
    days = rng.integers(0, 7, n_samples)
    months = rng.integers(1, 13, n_samples)

    # Peak hours: 7-9 AM and 5-7 PM
    is_peak = ((hours >= 7) & (hours <= 9)) | ((hours >= 17) & (hours <= 19))
    is_weekend = days >= 5

    base_count = 200 + is_peak.astype(int) * 300 - is_weekend.astype(int) * 100
    vehicle_count = (base_count + rng.integers(-50, 100, n_samples)).clip(10, 800)

    avg_speed = (60 - vehicle_count * 0.05 + rng.normal(0, 5, n_samples)).clip(5, 120)

    # Derive congestion label from vehicle count
    congestion_idx = np.select(
        [vehicle_count < 150, vehicle_count < 350, vehicle_count < 550],
        [0, 1, 2],
        default=3,
    )

    df = pd.DataFrame({
        "hour": hours,
        "day_of_week": days,
        "month": months,
        "is_peak_hour": is_peak.astype(int),
        "is_weekend": is_weekend.astype(int),
        "vehicle_count": vehicle_count,
        "average_speed": avg_speed.round(2),
        "weather_condition": rng.choice(WEATHER, n_samples),
        "road_type": rng.choice(ROAD_TYPES, n_samples),
        "location": rng.choice(LOCATIONS, n_samples),
        "congestion_level": [CONGESTION_LEVELS[i] for i in congestion_idx],
    })
    return df


if __name__ == "__main__":
    out = Path(__file__).parent / "data" / "traffic_dataset.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    df = generate_dataset()
    df.to_csv(out, index=False)
    print(f"Dataset saved → {out}  ({len(df)} rows)")
