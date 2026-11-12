from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import DATABASE_URL
from app.models import Base, User, Sensor, SensorReading, Alert, FloodPrediction, DrainageLocation
from app.auth import hash_password
from datetime import datetime, timedelta
import random
import json

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_initial_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if users already seeded
        if db.query(User).first():
            return

        # 1. Seed Users
        admin_user = User(
            email="admin@sewersense.ai",
            hashed_password=hash_password("password123"),
            full_name="Dr. Aris Thorne",
            role="admin",
            department="Chief Hydro-Informatics Officer"
        )
        operator_user = User(
            email="operator@sewersense.ai",
            hashed_password=hash_password("password123"),
            full_name="Elena Rostova",
            role="operator",
            department="Emergency Dispatch Operations"
        )
        db.add_all([admin_user, operator_user])
        db.commit()

        # 2. Seed Drainage Locations
        locations_data = [
            ("Central Trunk Outfall", "Downtown District", 4.2, 2.4, 0.4, 180.0, 4),
            ("Marina Bay Spillway", "Harbor Front", 5.8, 3.0, 0.2, 220.0, 2),
            ("North Canal Culvert", "Highland Residential", 2.1, 1.5, 0.8, 120.0, 5),
            ("Riverside Interceptor", "Old Riverbank", 3.6, 2.0, 0.5, 150.0, 3),
            ("Metro Underpass Drain A-4", "Commercial Corridor", 1.8, 1.2, 0.9, 90.0, 6),
            ("East Industrial Sluice", "Industrial Park", 4.9, 2.2, 0.3, 160.0, 1),
        ]

        loc_objs = []
        for name, sub, area, diam, grad, crit, flood_cnt in locations_data:
            loc = DrainageLocation(
                zone_name=name,
                subdistrict=sub,
                catchment_area_sqkm=area,
                pipe_diameter_meters=diam,
                pipe_gradient_pct=grad,
                critical_depth_cm=crit,
                flood_history_events=flood_cnt
            )
            db.add(loc)
            loc_objs.append(loc)
        db.commit()

        # 3. Seed Realistic Sensors (Real coordinates around Singapore / Metropolises)
        # Using Singapore downtown basin coordinates for realistic GIS layout: (1.290, 103.850)
        sensors_seed = [
            {
                "id": "SS-SEN-101",
                "name": "Central Trunk Inflow Monitor",
                "location_name": "Central Trunk Outfall",
                "lat": 1.2985,
                "lng": 103.8540,
                "type": "Ultrasonic Water Level",
                "conn": "LoRaWAN",
                "status": "online",
                "batt": 96.0,
                "level": 48.5,
                "rise": 0.2,
                "rain": 14.5,
                "block": 18.0,
                "risk": "NORMAL"
            },
            {
                "id": "SS-SEN-102",
                "name": "Marina Underpass Storm Sump",
                "location_name": "Marina Bay Spillway",
                "lat": 1.2840,
                "lng": 103.8610,
                "type": "Radar Doppler Depth",
                "conn": "4G LTE",
                "status": "warning",
                "batt": 88.0,
                "level": 112.4,
                "rise": 1.1,
                "rain": 38.0,
                "block": 45.0,
                "risk": "WARNING"
            },
            {
                "id": "SS-SEN-103",
                "name": "North Canal High-Flow Weir",
                "location_name": "North Canal Culvert",
                "lat": 1.3060,
                "lng": 103.8450,
                "type": "Submersible Pressure",
                "conn": "LoRaWAN",
                "status": "online",
                "batt": 92.5,
                "level": 35.0,
                "rise": 0.05,
                "rain": 8.0,
                "block": 12.0,
                "risk": "NORMAL"
            },
            {
                "id": "SS-SEN-104",
                "name": "Riverside Low-Level Collector",
                "location_name": "Riverside Interceptor",
                "lat": 1.2890,
                "lng": 103.8475,
                "type": "Ultrasonic Water Level",
                "conn": "NB-IoT",
                "status": "critical",
                "batt": 74.0,
                "level": 142.8,
                "rise": 1.8,
                "rain": 52.0,
                "block": 68.0,
                "risk": "CRITICAL"
            },
            {
                "id": "SS-SEN-105",
                "name": "Metro Underpass Siphon 04",
                "location_name": "Metro Underpass Drain A-4",
                "lat": 1.2930,
                "lng": 103.8390,
                "type": "Optical Rain & Flow",
                "conn": "ESP32 Wi-Fi",
                "status": "warning",
                "batt": 82.0,
                "level": 78.5,
                "rise": 0.8,
                "rain": 29.5,
                "block": 32.0,
                "risk": "WARNING"
            },
            {
                "id": "SS-SEN-106",
                "name": "East Industrial Retention Basin",
                "location_name": "East Industrial Sluice",
                "lat": 1.3020,
                "lng": 103.8710,
                "type": "Ultrasonic Water Level",
                "conn": "LoRaWAN",
                "status": "online",
                "batt": 98.0,
                "level": 52.0,
                "rise": 0.15,
                "rain": 16.0,
                "block": 15.0,
                "risk": "NORMAL"
            }
        ]

        sensor_objs = []
        for s in sensors_seed:
            sens = Sensor(
                id=s["id"],
                name=s["name"],
                location_name=s["location_name"],
                latitude=s["lat"],
                longitude=s["lng"],
                sensor_type=s["type"],
                connectivity=s["conn"],
                status=s["status"],
                battery_pct=s["batt"],
                current_water_level_cm=s["level"],
                rise_rate_cm_min=s["rise"],
                rainfall_intensity_mm_hr=s["rain"],
                blockage_prob_pct=s["block"],
                risk_category=s["risk"],
                last_ping=datetime.utcnow()
            )
            db.add(sens)
            sensor_objs.append(sens)
        db.commit()

        # 4. Seed Time-Series Historical Readings for Sensors (Past 24 hours)
        now = datetime.utcnow()
        for sens in sensor_objs:
            base_lvl = sens.current_water_level_cm
            for i in range(24, 0, -1):
                t = now - timedelta(hours=i)
                # gentle diurnal and rain curve
                variation = math_noise = (random.random() - 0.5) * 6.0
                r_val = max(10.0, base_lvl - (i * 0.8) + math_noise)
                rain_val = max(0.0, sens.rainfall_intensity_mm_hr * (1.0 - (i/30.0)) + random.uniform(-2, 3))
                reading = SensorReading(
                    sensor_id=sens.id,
                    timestamp=t,
                    water_level_cm=round(r_val, 1),
                    rise_rate_cm_min=round(random.uniform(0.05, 0.4), 2),
                    rainfall_mm_hr=round(rain_val, 1),
                    flow_velocity_mps=round(random.uniform(0.8, 2.2), 2),
                    battery_pct=round(sens.battery_pct - (i * 0.05), 1),
                    temperature_c=round(24.0 + random.uniform(-1.5, 2.5), 1),
                    humidity_pct=round(75.0 + random.uniform(0, 15), 1)
                )
                db.add(reading)
        db.commit()

        # 5. Seed Alerts
        initial_alerts = [
            {
                "sensor_id": "SS-SEN-104",
                "zone_name": "Riverside Interceptor",
                "priority": "CRITICAL",
                "title": "Severe Water Level & Rapid Surge Detected",
                "desc": "Conduit depth reached 142.8 cm (95.2% capacity). Rising at 1.8 cm/min. Imminent overflow risk at low-elevation riverbank road within 35 minutes.",
                "resp": "Dispatch rapid desiltation unit. Divert stormwater gate SG-02 to auxiliary Retention Basin #3. Notify traffic police.",
                "ack": False
            },
            {
                "sensor_id": "SS-SEN-102",
                "zone_name": "Marina Bay Spillway",
                "priority": "HIGH",
                "title": "High Blockage Probability & Inflow Surge",
                "desc": "Acoustic attenuation and radar reflection suggest 45% silt and plastic debris obstruction near culvert entrance.",
                "resp": "Send maintenance crew for mechanized screen raking. Check automated pump P-101 status.",
                "ack": False
            },
            {
                "sensor_id": "SS-SEN-105",
                "zone_name": "Metro Underpass Drain A-4",
                "priority": "MEDIUM",
                "title": "Heavy Localized Rain Intensity Spike",
                "desc": "Rain gauge recording 29.5 mm/hr. Water level risen by 24 cm over past 30 minutes.",
                "resp": "Monitor underpass pedestrian walkway CCTV. Stand by for automated sump pump cycle.",
                "ack": True,
                "ack_by": "Elena Rostova"
            }
        ]

        for a in initial_alerts:
            alt = Alert(
                sensor_id=a["sensor_id"],
                zone_name=a["zone_name"],
                priority=a["priority"],
                title=a["title"],
                description=a["desc"],
                suggested_response=a["resp"],
                is_acknowledged=a["ack"],
                acknowledged_by=a.get("ack_by"),
                acknowledged_at=datetime.utcnow() - timedelta(minutes=15) if a["ack"] else None,
                created_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 45))
            )
            db.add(alt)
        db.commit()

    finally:
        db.close()
