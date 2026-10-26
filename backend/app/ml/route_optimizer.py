"""Graph-based route optimization using Dijkstra and A* algorithms — Tamil Nadu road network."""
import heapq
import math
from typing import Optional
from app.utils import get_logger

logger = get_logger(__name__)

# Tamil Nadu road graph: node -> {neighbor: (distance_km, travel_time_min)}
CITY_GRAPH: dict[str, dict[str, tuple[float, float]]] = {
    "Chennai": {
        "Vellore": (145.0, 165), "Kanchipuram": (76.0, 90),
        "Cuddalore": (162.0, 180), "Hosur": (340.0, 240),
        "Tiruvallur": (42.0, 55), "Chengalpattu": (55.0, 70),
        "Villupuram": (162.0, 185),
    },
    "Tiruvallur": {
        "Chennai": (42.0, 55), "Vellore": (110.0, 130), "Ranipet": (95.0, 115),
    },
    "Vellore": {
        "Chennai": (145.0, 165), "Salem": (160.0, 180),
        "Kanchipuram": (90.0, 110), "Tiruchirappalli": (270.0, 300),
        "Ranipet": (25.0, 35), "Tirupattur": (60.0, 75), "Tiruvallur": (110.0, 130),
    },
    "Ranipet": {
        "Vellore": (25.0, 35), "Tiruvallur": (95.0, 115), "Kanchipuram": (75.0, 90),
    },
    "Tirupattur": {
        "Vellore": (60.0, 75), "Krishnagiri": (55.0, 65), "Dharmapuri": (80.0, 95),
    },
    "Kanchipuram": {
        "Chennai": (76.0, 90), "Vellore": (90.0, 110),
        "Cuddalore": (110.0, 130), "Chengalpattu": (45.0, 55), "Ranipet": (75.0, 90),
    },
    "Chengalpattu": {
        "Chennai": (55.0, 70), "Kanchipuram": (45.0, 55), "Villupuram": (100.0, 120),
    },
    "Cuddalore": {
        "Chennai": (162.0, 180), "Kanchipuram": (110.0, 130),
        "Kumbakonam": (95.0, 110), "Thanjavur": (120.0, 135),
        "Villupuram": (40.0, 50), "Nagapattinam": (100.0, 115),
    },
    "Villupuram": {
        "Chennai": (162.0, 185), "Cuddalore": (40.0, 50),
        "Tiruvannamalai": (65.0, 80), "Kallakurichi": (55.0, 65),
        "Chengalpattu": (100.0, 120),
    },
    "Kallakurichi": {
        "Villupuram": (55.0, 65), "Salem": (90.0, 110), "Tiruvannamalai": (70.0, 85),
    },
    "Tiruvannamalai": {
        "Villupuram": (65.0, 80), "Vellore": (85.0, 100),
        "Salem": (110.0, 130), "Kallakurichi": (70.0, 85),
    },
    "Hosur": {
        "Chennai": (340.0, 240), "Salem": (120.0, 140),
        "Coimbatore": (200.0, 210), "Erode": (160.0, 175),
        "Krishnagiri": (30.0, 40),
    },
    "Krishnagiri": {
        "Hosur": (30.0, 40), "Dharmapuri": (45.0, 55),
        "Salem": (90.0, 110), "Tirupattur": (55.0, 65),
    },
    "Dharmapuri": {
        "Krishnagiri": (45.0, 55), "Salem": (65.0, 80), "Tirupattur": (80.0, 95),
    },
    "Salem": {
        "Vellore": (160.0, 180), "Hosur": (120.0, 140),
        "Erode": (60.0, 75), "Namakkal": (48.0, 60),
        "Tiruchirappalli": (145.0, 165), "Dharmapuri": (65.0, 80),
        "Krishnagiri": (90.0, 110), "Tiruvannamalai": (110.0, 130),
        "Kallakurichi": (90.0, 110),
    },
    "Erode": {
        "Salem": (60.0, 75), "Hosur": (160.0, 175),
        "Coimbatore": (80.0, 95), "Tiruppur": (40.0, 50),
        "Karur": (75.0, 90), "Namakkal": (70.0, 85),
    },
    "Coimbatore": {
        "Erode": (80.0, 95), "Hosur": (200.0, 210),
        "Tiruppur": (50.0, 60), "Dindigul": (130.0, 150),
        "Ooty": (85.0, 120), "Pollachi": (40.0, 55),
    },
    "Ooty": {
        "Coimbatore": (85.0, 120), "Nilgiris": (15.0, 25), "Pollachi": (70.0, 100),
    },
    "Nilgiris": {
        "Ooty": (15.0, 25), "Coimbatore": (90.0, 130),
    },
    "Pollachi": {
        "Coimbatore": (40.0, 55), "Palani": (65.0, 80), "Ooty": (70.0, 100),
        "Dindigul": (80.0, 95),
    },
    "Tiruppur": {
        "Coimbatore": (50.0, 60), "Erode": (40.0, 50),
        "Dindigul": (100.0, 120), "Karur": (65.0, 80),
    },
    "Namakkal": {
        "Salem": (48.0, 60), "Tiruchirappalli": (95.0, 110),
        "Karur": (55.0, 65), "Erode": (70.0, 85),
    },
    "Karur": {
        "Erode": (75.0, 90), "Tiruppur": (65.0, 80),
        "Namakkal": (55.0, 65), "Tiruchirappalli": (85.0, 100),
        "Dindigul": (75.0, 90),
    },
    "Tiruchirappalli": {
        "Vellore": (270.0, 300), "Salem": (145.0, 165),
        "Namakkal": (95.0, 110), "Karur": (85.0, 100),
        "Thanjavur": (56.0, 70), "Kumbakonam": (95.0, 110),
        "Dindigul": (100.0, 115), "Madurai": (140.0, 160),
        "Ariyalur": (75.0, 90), "Perambalur": (50.0, 60),
        "Pudukkottai": (55.0, 65),
    },
    "Ariyalur": {
        "Tiruchirappalli": (75.0, 90), "Perambalur": (35.0, 45),
        "Kumbakonam": (65.0, 80),
    },
    "Perambalur": {
        "Tiruchirappalli": (50.0, 60), "Ariyalur": (35.0, 45), "Salem": (90.0, 110),
    },
    "Thanjavur": {
        "Tiruchirappalli": (56.0, 70), "Kumbakonam": (40.0, 50),
        "Cuddalore": (120.0, 135), "Madurai": (175.0, 195),
        "Nagapattinam": (85.0, 100), "Mayiladuthurai": (55.0, 65),
    },
    "Kumbakonam": {
        "Thanjavur": (40.0, 50), "Cuddalore": (95.0, 110),
        "Tiruchirappalli": (95.0, 110), "Nagapattinam": (55.0, 65),
        "Mayiladuthurai": (30.0, 40), "Ariyalur": (65.0, 80),
    },
    "Mayiladuthurai": {
        "Kumbakonam": (30.0, 40), "Nagapattinam": (35.0, 45), "Thanjavur": (55.0, 65),
    },
    "Nagapattinam": {
        "Kumbakonam": (55.0, 65), "Mayiladuthurai": (35.0, 45),
        "Cuddalore": (100.0, 115),
    },
    "Pudukkottai": {
        "Tiruchirappalli": (55.0, 65), "Madurai": (110.0, 130),
        "Ramanathapuram": (100.0, 120),
    },
    "Dindigul": {
        "Coimbatore": (130.0, 150), "Tiruppur": (100.0, 120),
        "Karur": (75.0, 90), "Tiruchirappalli": (100.0, 115),
        "Madurai": (65.0, 75), "Palani": (55.0, 65), "Theni": (70.0, 85),
        "Pollachi": (80.0, 95),
    },
    "Palani": {
        "Dindigul": (55.0, 65), "Pollachi": (65.0, 80), "Theni": (60.0, 75),
    },
    "Theni": {
        "Dindigul": (70.0, 85), "Palani": (60.0, 75), "Madurai": (65.0, 80),
    },
    "Madurai": {
        "Tiruchirappalli": (140.0, 160), "Dindigul": (65.0, 75),
        "Thanjavur": (175.0, 195), "Tirunelveli": (160.0, 180),
        "Thoothukudi": (155.0, 175), "Virudhunagar": (65.0, 80),
        "Sivakasi": (80.0, 95), "Pudukkottai": (110.0, 130),
        "Ramanathapuram": (130.0, 150), "Theni": (65.0, 80),
    },
    "Virudhunagar": {
        "Madurai": (65.0, 80), "Sivakasi": (25.0, 35),
        "Tirunelveli": (100.0, 120), "Thoothukudi": (75.0, 90),
    },
    "Sivakasi": {
        "Virudhunagar": (25.0, 35), "Madurai": (80.0, 95),
        "Thoothukudi": (65.0, 80), "Tirunelveli": (80.0, 95),
    },
    "Ramanathapuram": {
        "Madurai": (130.0, 150), "Thoothukudi": (55.0, 65),
        "Pudukkottai": (100.0, 120),
    },
    "Tirunelveli": {
        "Madurai": (160.0, 180), "Thoothukudi": (60.0, 70),
        "Nagercoil": (75.0, 85), "Tenkasi": (55.0, 65),
        "Virudhunagar": (100.0, 120), "Sivakasi": (80.0, 95),
    },
    "Thoothukudi": {
        "Madurai": (155.0, 175), "Tirunelveli": (60.0, 70),
        "Nagercoil": (90.0, 105), "Ramanathapuram": (55.0, 65),
        "Virudhunagar": (75.0, 90), "Sivakasi": (65.0, 80),
    },
    "Tenkasi": {
        "Tirunelveli": (55.0, 65), "Nagercoil": (65.0, 80),
    },
    "Nagercoil": {
        "Tirunelveli": (75.0, 85), "Thoothukudi": (90.0, 105),
        "Kanyakumari": (20.0, 30), "Tenkasi": (65.0, 80),
    },
    "Kanyakumari": {
        "Nagercoil": (20.0, 30),
    },
    # Chennai suburbs
    "Ambattur": {
        "Chennai": (18.0, 30), "Avadi": (8.0, 15), "Porur": (12.0, 20), "Tiruvallur": (30.0, 40),
    },
    "Avadi": {
        "Chennai": (25.0, 35), "Ambattur": (8.0, 15), "Tiruvallur": (22.0, 30),
    },
    "Tambaram": {
        "Chennai": (25.0, 35), "Chengalpattu": (30.0, 40), "Chromepet": (5.0, 10), "Pallavaram": (4.0, 8),
    },
    "Porur": {
        "Chennai": (18.0, 28), "Ambattur": (12.0, 20), "Kanchipuram": (60.0, 75),
    },
    "Chromepet": {
        "Tambaram": (5.0, 10), "Pallavaram": (3.0, 6), "Chennai": (20.0, 30),
    },
    "Pallavaram": {
        "Tambaram": (4.0, 8), "Chromepet": (3.0, 6), "Chennai": (18.0, 28),
    },
    "Vandalur": {
        "Tambaram": (8.0, 12), "Chengalpattu": (22.0, 30),
    },
    "Sholinganallur": {
        "Chennai": (20.0, 30), "Tambaram": (15.0, 22),
    },
    "Perambur": {
        "Chennai": (8.0, 15), "Ambattur": (10.0, 18),
    },
    "Guindy": {
        "Chennai": (12.0, 18), "Tambaram": (14.0, 22),
    },
    "Velachery": {
        "Chennai": (14.0, 22), "Tambaram": (12.0, 18),
    },
    "Adyar": {
        "Chennai": (10.0, 16), "Velachery": (5.0, 10),
    },
    "Mylapore": {
        "Chennai": (5.0, 10), "Adyar": (6.0, 12),
    },
    "Egmore": {
        "Chennai": (3.0, 8), "Perambur": (5.0, 10),
    },
    "Anna Nagar": {
        "Chennai": (8.0, 14), "Ambattur": (10.0, 18),
    },
    "Madipakkam": {
        "Velachery": (4.0, 8), "Tambaram": (10.0, 16),
    },
    "Maraimalai Nagar": {
        "Tambaram": (20.0, 28), "Chengalpattu": (15.0, 22),
    },
    # Pondicherry region
    "Pondicherry": {
        "Cuddalore": (30.0, 40), "Villupuram": (40.0, 50), "Tindivanam": (45.0, 55),
    },
    "Karaikal": {
        "Nagapattinam": (15.0, 22), "Mayiladuthurai": (25.0, 35),
    },
    "Tindivanam": {
        "Villupuram": (30.0, 38), "Pondicherry": (45.0, 55), "Chengalpattu": (55.0, 65),
    },
    "Gingee": {
        "Villupuram": (35.0, 45), "Tiruvannamalai": (40.0, 50),
    },
    "Ulundurpet": {
        "Villupuram": (40.0, 50), "Kallakurichi": (20.0, 28),
    },
    # South TN
    "Sankarankovil": {
        "Tirunelveli": (50.0, 60), "Tenkasi": (30.0, 38), "Kovilpatti": (35.0, 45),
    },
    "Ambasamudram": {
        "Tirunelveli": (30.0, 40), "Tenkasi": (25.0, 32),
    },
    "Papanasam": {
        "Tirunelveli": (40.0, 50), "Ambasamudram": (15.0, 22),
    },
    "Pattukkottai": {
        "Thanjavur": (55.0, 65), "Aranthangi": (30.0, 38),
    },
    "Karaikudi": {
        "Sivaganga": (20.0, 28), "Pudukkottai": (45.0, 55), "Devakottai": (15.0, 22),
    },
    "Sivaganga": {
        "Madurai": (55.0, 65), "Karaikudi": (20.0, 28), "Ramanathapuram": (50.0, 60), "Manamadurai": (20.0, 28),
    },
    "Paramakudi": {
        "Ramanathapuram": (30.0, 38), "Virudhunagar": (55.0, 65),
    },
    "Rameswaram": {
        "Mandapam": (15.0, 22), "Ramanathapuram": (65.0, 78),
    },
    "Mandapam": {
        "Rameswaram": (15.0, 22), "Ramanathapuram": (50.0, 60),
    },
    "Sattur": {
        "Virudhunagar": (30.0, 38), "Kovilpatti": (25.0, 32),
    },
    "Kovilpatti": {
        "Thoothukudi": (35.0, 45), "Sattur": (25.0, 32), "Sankarankovil": (35.0, 45),
    },
    "Tiruchendur": {
        "Thoothukudi": (55.0, 65), "Nagercoil": (80.0, 95),
    },
    "Courtallam": {
        "Tenkasi": (10.0, 15), "Shenkottai": (15.0, 22),
    },
    "Shenkottai": {
        "Tenkasi": (20.0, 28), "Courtallam": (15.0, 22),
    },
    "Kadayanallur": {
        "Tenkasi": (25.0, 32), "Sankarankovil": (20.0, 28),
    },
    "Vallioor": {
        "Tirunelveli": (25.0, 32), "Nagercoil": (50.0, 60),
    },
    "Nanguneri": {
        "Tirunelveli": (30.0, 38), "Nagercoil": (45.0, 55),
    },
    "Cheranmahadevi": {
        "Tirunelveli": (20.0, 28), "Ambasamudram": (15.0, 22),
    },
    "Alangulam": {
        "Tenkasi": (20.0, 28), "Tirunelveli": (45.0, 55),
    },
    # Delta / Cauvery
    "Vriddhachalam": {
        "Cuddalore": (45.0, 55), "Villupuram": (50.0, 60), "Kallakurichi": (35.0, 45),
    },
    "Chidambaram": {
        "Cuddalore": (55.0, 65), "Sirkazhi": (20.0, 28), "Vriddhachalam": (40.0, 50),
    },
    "Sirkazhi": {
        "Chidambaram": (20.0, 28), "Mayiladuthurai": (25.0, 32),
    },
    "Vedaranyam": {
        "Nagapattinam": (40.0, 50), "Thiruvarur": (45.0, 55),
    },
    "Thiruvarur": {
        "Kumbakonam": (35.0, 45), "Nagapattinam": (30.0, 38), "Mannargudi": (20.0, 28), "Vedaranyam": (45.0, 55),
    },
    "Mannargudi": {
        "Thiruvarur": (20.0, 28), "Thanjavur": (45.0, 55), "Needamangalam": (15.0, 22),
    },
    "Needamangalam": {
        "Mannargudi": (15.0, 22), "Thiruvarur": (30.0, 38),
    },
    "Nannilam": {
        "Mayiladuthurai": (20.0, 28), "Thiruvarur": (25.0, 32),
    },
    "Orathanadu": {
        "Thanjavur": (25.0, 32), "Pattukkottai": (30.0, 38),
    },
    "Aranthangi": {
        "Pudukkottai": (35.0, 45), "Pattukkottai": (30.0, 38),
    },
    # Trichy region
    "Musiri": {
        "Tiruchirappalli": (35.0, 45), "Karur": (30.0, 38),
    },
    "Lalgudi": {
        "Tiruchirappalli": (20.0, 28), "Ariyalur": (40.0, 50),
    },
    "Manapparai": {
        "Tiruchirappalli": (35.0, 45), "Dindigul": (65.0, 78),
    },
    "Thuraiyur": {
        "Tiruchirappalli": (45.0, 55), "Perambalur": (30.0, 38),
    },
    "Jayankondam": {
        "Ariyalur": (25.0, 32), "Bhuvanagiri": (20.0, 28),
    },
    "Bhuvanagiri": {
        "Jayankondam": (20.0, 28), "Chidambaram": (35.0, 45),
    },
    "Sendurai": {
        "Ariyalur": (20.0, 28), "Perambalur": (25.0, 32),
    },
    # Salem region
    "Mettur": {
        "Salem": (45.0, 55), "Bhavani": (35.0, 45),
    },
    "Attur": {
        "Salem": (35.0, 45), "Rasipuram": (25.0, 32),
    },
    "Rasipuram": {
        "Namakkal": (20.0, 28), "Attur": (25.0, 32),
    },
    "Tiruchengode": {
        "Namakkal": (30.0, 38), "Erode": (40.0, 50),
    },
    "Bhavani": {
        "Erode": (15.0, 22), "Gobichettipalayam": (30.0, 38), "Mettur": (35.0, 45),
    },
    "Gobichettipalayam": {
        "Erode": (40.0, 50), "Bhavani": (30.0, 38), "Sathyamangalam": (25.0, 32),
    },
    "Sathyamangalam": {
        "Gobichettipalayam": (25.0, 32), "Coimbatore": (60.0, 72),
    },
    "Sankari": {
        "Salem": (25.0, 32), "Tiruchengode": (15.0, 22),
    },
    "Omalur": {
        "Salem": (20.0, 28), "Mettur": (30.0, 38),
    },
    # Coimbatore region
    "Kangeyam": {
        "Tiruppur": (30.0, 38), "Dharapuram": (20.0, 28),
    },
    "Dharapuram": {
        "Kangeyam": (20.0, 28), "Udumalaipettai": (25.0, 32), "Palladam": (20.0, 28),
    },
    "Udumalaipettai": {
        "Dharapuram": (25.0, 32), "Pollachi": (35.0, 45),
    },
    "Palladam": {
        "Coimbatore": (30.0, 38), "Tiruppur": (20.0, 28), "Dharapuram": (20.0, 28),
    },
    "Avinashi": {
        "Tiruppur": (15.0, 22), "Coimbatore": (35.0, 45),
    },
    "Mettupalayam": {
        "Coimbatore": (40.0, 50), "Ooty": (50.0, 70),
    },
    "Coonoor": {
        "Ooty": (20.0, 30), "Mettupalayam": (30.0, 45),
    },
    "Kotagiri": {
        "Ooty": (25.0, 38), "Coonoor": (15.0, 22),
    },
    "Valparai": {
        "Pollachi": (65.0, 90), "Coimbatore": (100.0, 120),
    },
    "Gudalur": {
        "Ooty": (55.0, 75), "Nilgiris": (30.0, 45),
    },
    # Dindigul region
    "Kodaikanal": {
        "Dindigul": (80.0, 100), "Batlagundu": (60.0, 75),
    },
    "Periyakulam": {
        "Theni": (20.0, 28), "Bodinayakanur": (15.0, 22),
    },
    "Bodinayakanur": {
        "Periyakulam": (15.0, 22), "Theni": (30.0, 38),
    },
    "Andipatti": {
        "Theni": (20.0, 28), "Madurai": (50.0, 60),
    },
    "Cumbum": {
        "Theni": (40.0, 50), "Bodinayakanur": (25.0, 32),
    },
    "Batlagundu": {
        "Dindigul": (20.0, 28), "Kodaikanal": (60.0, 75),
    },
    "Natham": {
        "Dindigul": (30.0, 38), "Madurai": (45.0, 55),
    },
    "Oddanchatram": {
        "Dindigul": (25.0, 32), "Palani": (30.0, 38),
    },
    "Vedasandur": {
        "Dindigul": (20.0, 28), "Karur": (55.0, 65),
    },
    # Karur / misc
    "Kulithalai": {
        "Karur": (20.0, 28), "Tiruchirappalli": (40.0, 50),
    },
    "Manamadurai": {
        "Sivaganga": (20.0, 28), "Madurai": (65.0, 78),
    },
    "Devakottai": {
        "Karaikudi": (15.0, 22), "Sivaganga": (30.0, 38),
    },
    "Thirumayam": {
        "Pudukkottai": (25.0, 32), "Karaikudi": (30.0, 38),
    },
    "Alangudi": {
        "Pudukkottai": (20.0, 28), "Aranthangi": (20.0, 28),
    },
}

# Real GPS coordinates of Tamil Nadu cities and towns
NODE_COORDS: dict[str, tuple[float, float]] = {
    # Major cities
    "Chennai":           (13.0827, 80.2707),
    "Coimbatore":        (11.0168, 76.9558),
    "Madurai":           (9.9252,  78.1198),
    "Tiruchirappalli":   (10.7905, 78.7047),
    "Salem":             (11.6643, 78.1460),
    "Tirunelveli":       (8.7139,  77.7567),
    "Vellore":           (12.9165, 79.1325),
    "Erode":             (11.3410, 77.7172),
    "Thoothukudi":       (8.7642,  78.1348),
    "Dindigul":          (10.3624, 77.9695),
    "Thanjavur":         (10.7870, 79.1378),
    "Kanchipuram":       (12.8185, 79.6947),
    "Tiruppur":          (11.1085, 77.3411),
    "Hosur":             (12.7409, 77.8253),
    "Nagercoil":         (8.1833,  77.4119),
    "Kumbakonam":        (10.9602, 79.3845),
    "Cuddalore":         (11.7480, 79.7714),
    "Namakkal":          (11.2189, 78.1674),
    "Karur":             (10.9601, 78.0766),
    "Tiruvannamalai":    (12.2253, 79.0747),
    "Villupuram":        (11.9401, 79.4930),
    "Krishnagiri":       (12.5186, 78.2137),
    "Dharmapuri":        (12.1211, 78.1582),
    "Ooty":              (11.4102, 76.6950),
    "Pollachi":          (10.6590, 77.0070),
    "Palani":            (10.4500, 77.5200),
    "Sivakasi":          (9.4533,  77.7997),
    "Virudhunagar":      (9.5850,  77.9624),
    "Ramanathapuram":    (9.3762,  78.8309),
    "Pudukkottai":       (10.3797, 78.8201),
    "Nagapattinam":      (10.7672, 79.8449),
    "Mayiladuthurai":    (11.1034, 79.6516),
    "Ariyalur":          (11.1400, 79.0800),
    "Perambalur":        (11.2333, 78.8833),
    "Kallakurichi":      (11.7380, 78.9590),
    "Ranipet":           (12.9228, 79.3330),
    "Tirupattur":        (12.4965, 78.5726),
    "Chengalpattu":      (12.6921, 79.9764),
    "Tenkasi":           (8.9600,  77.3150),
    "Theni":             (10.0104, 77.4770),
    "Nilgiris":          (11.4916, 76.7337),
    "Tiruvallur":        (13.1437, 79.9083),
    "Kanyakumari":       (8.0883,  77.5385),
    # Chennai suburbs
    "Ambattur":          (13.1143, 80.1548),
    "Avadi":             (13.1067, 80.1000),
    "Tambaram":          (12.9249, 80.1000),
    "Porur":             (13.0358, 80.1573),
    "Chromepet":         (12.9516, 80.1462),
    "Pallavaram":        (12.9675, 80.1491),
    "Vandalur":          (12.8900, 80.0800),
    "Sholinganallur":    (12.9010, 80.2279),
    "Perambur":          (13.1167, 80.2333),
    "Guindy":            (13.0067, 80.2206),
    "Velachery":         (12.9750, 80.2176),
    "Adyar":             (13.0012, 80.2565),
    "Mylapore":          (13.0368, 80.2676),
    "Egmore":            (13.0732, 80.2609),
    "Anna Nagar":        (13.0850, 80.2101),
    "Madipakkam":        (12.9602, 80.2002),
    "Maraimalai Nagar":  (12.7950, 80.0250),
    # Union Territory
    "Pondicherry":       (11.9416, 79.8083),
    "Karaikal":          (10.9254, 79.8380),
    # North TN
    "Tindivanam":        (12.2333, 79.6500),
    "Gingee":            (12.2500, 79.4167),
    "Ulundurpet":        (11.6833, 79.3167),
    # South TN
    "Sankarankovil":     (9.1667,  77.5500),
    "Ambasamudram":      (8.7000,  77.4500),
    "Papanasam":         (8.9167,  77.5500),
    "Pattukkottai":      (10.4167, 79.3167),
    "Karaikudi":         (10.0747, 78.7767),
    "Sivaganga":         (9.8433,  78.4800),
    "Paramakudi":        (9.5333,  78.5833),
    "Rameswaram":        (9.2876,  79.3129),
    "Mandapam":          (9.2833,  79.1333),
    "Sattur":            (9.3500,  77.9167),
    "Kovilpatti":        (9.1667,  77.8667),
    "Tiruchendur":       (8.4833,  78.1167),
    "Courtallam":        (8.9333,  77.2667),
    "Shenkottai":        (8.9667,  77.2500),
    "Kadayanallur":      (9.0833,  77.3500),
    "Vallioor":          (8.3833,  77.6167),
    "Nanguneri":         (8.5000,  77.6667),
    "Cheranmahadevi":    (8.6833,  77.5333),
    "Alangulam":         (8.8667,  77.5833),
    # Delta / Cauvery region
    "Vriddhachalam":     (11.5167, 79.3333),
    "Chidambaram":       (11.3993, 79.6936),
    "Sirkazhi":          (11.2333, 79.7500),
    "Vedaranyam":        (10.3833, 79.8500),
    "Thiruvarur":        (10.7667, 79.6333),
    "Mannargudi":        (10.6667, 79.4500),
    "Needamangalam":     (10.8000, 79.4500),
    "Nannilam":          (10.9167, 79.6667),
    "Orathanadu":        (10.5167, 79.0167),
    "Aranthangi":        (10.1667, 79.0667),
    # Trichy region
    "Musiri":            (10.9500, 78.4500),
    "Lalgudi":           (10.8667, 78.8167),
    "Manapparai":        (10.6000, 78.4167),
    "Thuraiyur":         (11.1500, 78.5833),
    "Jayankondam":       (11.2000, 79.1000),
    "Bhuvanagiri":       (11.4333, 79.6333),
    "Sendurai":          (11.1167, 79.0500),
    # Salem region
    "Mettur":            (11.7833, 77.8000),
    "Attur":             (11.5833, 78.6000),
    "Rasipuram":         (11.4667, 78.1833),
    "Tiruchengode":      (11.3833, 77.8833),
    "Bhavani":           (11.4500, 77.6833),
    "Gobichettipalayam": (11.4500, 77.4333),
    "Sathyamangalam":    (11.5000, 77.2333),
    "Sankari":           (11.4833, 77.9167),
    "Omalur":            (11.7333, 78.0500),
    # Coimbatore region
    "Kangeyam":          (11.0000, 77.5667),
    "Dharapuram":        (10.7333, 77.5167),
    "Udumalaipettai":    (10.5833, 77.2500),
    "Palladam":          (10.9833, 77.2833),
    "Avinashi":          (11.1833, 77.2667),
    "Mettupalayam":      (11.2983, 76.9344),
    "Coonoor":           (11.3530, 76.7959),
    "Kotagiri":          (11.4333, 76.8667),
    "Valparai":          (10.3267, 76.9550),
    "Gudalur":           (11.4967, 76.4950),
    # Dindigul region
    "Kodaikanal":        (10.2381, 77.4892),
    "Periyakulam":       (10.1167, 77.5500),
    "Bodinayakanur":     (10.0000, 77.3500),
    "Andipatti":         (9.9833,  77.6167),
    "Cumbum":            (9.7333,  77.2833),
    "Batlagundu":        (10.1667, 77.7500),
    "Natham":            (10.2167, 78.0833),
    "Oddanchatram":      (10.2833, 77.7333),
    "Vedasandur":        (10.5333, 77.9167),
    # Karur / Trichy
    "Kulithalai":        (10.9333, 78.4167),
    "Manamadurai":       (9.6833,  78.4667),
    "Devakottai":        (9.9500,  78.8167),
    # Pudukkottai region
    "Aranthangi":        (10.1667, 79.0667),
    "Thirumayam":        (10.2667, 78.7500),
    "Alangudi":          (10.3667, 79.0000),
}


def _heuristic(a: str, b: str) -> float:
    """Haversine distance in km between two nodes."""
    lat1, lon1 = NODE_COORDS.get(a, (0, 0))
    lat2, lon2 = NODE_COORDS.get(b, (0, 0))
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    h = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(h))


def dijkstra(source: str, destination: str, weight: str = "time") -> Optional[dict]:
    idx = 1 if weight == "time" else 0
    dist = {node: float("inf") for node in CITY_GRAPH}
    dist[source] = 0
    prev: dict[str, Optional[str]] = {node: None for node in CITY_GRAPH}
    heap = [(0.0, source)]

    while heap:
        cost, u = heapq.heappop(heap)
        if cost > dist[u]:
            continue
        if u == destination:
            break
        for v, weights in CITY_GRAPH.get(u, {}).items():
            new_cost = cost + weights[idx]
            if new_cost < dist[v]:
                dist[v] = new_cost
                prev[v] = u
                heapq.heappush(heap, (new_cost, v))

    if dist[destination] == float("inf"):
        return None

    path, node = [], destination
    while node:
        path.append(node)
        node = prev[node]
    path.reverse()
    return {"path": path, "cost": dist[destination]}


def astar(source: str, destination: str, weight: str = "time") -> Optional[dict]:
    idx = 1 if weight == "time" else 0
    g: dict[str, float] = {source: 0.0}
    prev: dict[str, Optional[str]] = {source: None}
    heap = [(_heuristic(source, destination), 0.0, source)]

    while heap:
        _, cost, u = heapq.heappop(heap)
        if u == destination:
            break
        for v, weights in CITY_GRAPH.get(u, {}).items():
            new_g = g.get(u, float("inf")) + weights[idx]
            if new_g < g.get(v, float("inf")):
                g[v] = new_g
                prev[v] = u
                f = new_g + _heuristic(v, destination)
                heapq.heappush(heap, (f, new_g, v))

    if destination not in g:
        return None

    path, node = [], destination
    while node:
        path.append(node)
        node = prev.get(node)
    path.reverse()
    return {"path": path, "cost": g[destination]}


def find_route(source: str, destination: str, algorithm: str = "dijkstra", optimize_for: str = "time") -> dict:
    if source not in CITY_GRAPH or destination not in CITY_GRAPH:
        raise ValueError(f"Unknown location(s): {source}, {destination}")

    fn = dijkstra if algorithm == "dijkstra" else astar
    result = fn(source, destination, weight=optimize_for)
    if not result:
        raise ValueError(f"No route found from {source} to {destination}")

    total_dist = total_time = 0.0
    for i in range(len(result["path"]) - 1):
        u, v = result["path"][i], result["path"][i + 1]
        d, t = CITY_GRAPH[u][v]
        total_dist += d
        total_time += t

    alt_fn = astar if algorithm == "dijkstra" else dijkstra
    alt = alt_fn(source, destination, weight=optimize_for)
    alt_routes = []
    if alt and alt["path"] != result["path"]:
        alt_dist = alt_time = 0.0
        for i in range(len(alt["path"]) - 1):
            u, v = alt["path"][i], alt["path"][i + 1]
            d, t = CITY_GRAPH[u][v]
            alt_dist += d
            alt_time += t
        alt_routes.append({
            "algorithm": "astar" if algorithm == "dijkstra" else "dijkstra",
            "path": alt["path"],
            "total_distance_km": round(alt_dist, 2),
            "estimated_time_minutes": round(alt_time, 1),
        })

    logger.info(f"Route {source}->{destination} via {algorithm}: {result['path']}")
    return {
        "path": result["path"],
        "total_distance_km": round(total_dist, 2),
        "estimated_time_minutes": round(total_time, 1),
        "congestion_zones": [],
        "alternative_routes": alt_routes,
    }
