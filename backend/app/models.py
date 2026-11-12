from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="engineer")  # admin, engineer, operator, analyst
    department = Column(String(100), default="Municipal Drainage Authority")
    created_at = Column(DateTime, default=datetime.utcnow)

class DrainageLocation(Base):
    __tablename__ = "drainage_locations"

    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String(100), index=True, nullable=False)
    subdistrict = Column(String(100), nullable=False)
    catchment_area_sqkm = Column(Float, default=2.5)
    pipe_diameter_meters = Column(Float, default=1.8)
    pipe_gradient_pct = Column(Float, default=0.5)
    critical_depth_cm = Column(Float, default=140.0)
    flood_history_events = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)

    sensors = relationship("Sensor", back_populates="location")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String(50), primary_key=True, index=True) # e.g. SS-SEN-101
    name = Column(String(100), nullable=False)
    location_id = Column(Integer, ForeignKey("drainage_locations.id"), nullable=True)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sensor_type = Column(String(50), default="Ultrasonic Water Level") # Ultrasonic, Radar, Optical Rain Gauge, Pressure
    connectivity = Column(String(50), default="LoRaWAN") # LoRaWAN, 4G LTE, NB-IoT, ESP32 Wi-Fi
    status = Column(String(30), default="online") # online, warning, critical, offline, calibrating
    battery_pct = Column(Float, default=95.0)
    signal_strength_dbm = Column(Integer, default=-72)
    current_water_level_cm = Column(Float, default=45.0)
    rise_rate_cm_min = Column(Float, default=0.3)
    rainfall_intensity_mm_hr = Column(Float, default=12.0)
    blockage_prob_pct = Column(Float, default=15.0)
    risk_category = Column(String(30), default="NORMAL") # NORMAL, WARNING, CRITICAL
    last_ping = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    location = relationship("DrainageLocation", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="sensor")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), ForeignKey("sensors.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    water_level_cm = Column(Float, nullable=False)
    rise_rate_cm_min = Column(Float, default=0.0)
    rainfall_mm_hr = Column(Float, default=0.0)
    flow_velocity_mps = Column(Float, default=1.2)
    battery_pct = Column(Float, default=90.0)
    temperature_c = Column(Float, default=24.5)
    humidity_pct = Column(Float, default=78.0)

    sensor = relationship("Sensor", back_populates="readings")

class RainfallData(Base):
    __tablename__ = "rainfall_data"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(50), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    hourly_mm = Column(Float, default=0.0)
    accumulated_24h_mm = Column(Float, default=0.0)
    storm_forecast_prob_pct = Column(Float, default=30.0)

class FloodPrediction(Base):
    __tablename__ = "flood_predictions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    zone_name = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False) # 0 - 100
    risk_category = Column(String(30), nullable=False) # LOW, MODERATE, HIGH, CRITICAL
    estimated_window_mins = Column(Integer, default=60) # Minutes until overflow threshold
    confidence_pct = Column(Float, default=92.5)
    factors_json = Column(Text, nullable=True) # JSON of feature contributions
    recommended_action = Column(String(255), nullable=False)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), ForeignKey("sensors.id"), nullable=True)
    zone_name = Column(String(100), nullable=False)
    priority = Column(String(30), default="HIGH") # CRITICAL, HIGH, MEDIUM, INFO
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    suggested_response = Column(Text, nullable=False)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sensor = relationship("Sensor", back_populates="alerts")

class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, nullable=False)
    action_taken = Column(String(150), nullable=False)
    operator_name = Column(String(100), nullable=False)
    resolution_time_mins = Column(Integer, default=25)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), ForeignKey("sensors.id"), nullable=False)
    technician = Column(String(100), nullable=False)
    work_performed = Column(String(255), nullable=False) # e.g. "Acoustic transducer cleaning & battery swap"
    calibration_offset_mm = Column(Float, default=0.0)
    status = Column(String(50), default="completed") # scheduled, in_progress, completed
    scheduled_date = Column(DateTime, default=datetime.utcnow)
