from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "engineer"
    department: str = "Municipal Drainage Authority"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- Sensor Schemas ---
class SensorBase(BaseModel):
    name: str
    location_name: str
    latitude: float
    longitude: float
    sensor_type: str = "Ultrasonic Water Level"
    connectivity: str = "LoRaWAN"
    battery_pct: float = 95.0
    signal_strength_dbm: int = -72

class SensorCreate(SensorBase):
    id: str  # e.g. SS-SEN-108

class SensorUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    sensor_type: Optional[str] = None
    connectivity: Optional[str] = None
    status: Optional[str] = None
    battery_pct: Optional[float] = None
    current_water_level_cm: Optional[float] = None
    rise_rate_cm_min: Optional[float] = None
    rainfall_intensity_mm_hr: Optional[float] = None
    blockage_prob_pct: Optional[float] = None
    is_active: Optional[bool] = None

class SensorOut(SensorBase):
    id: str
    status: str
    current_water_level_cm: float
    rise_rate_cm_min: float
    rainfall_intensity_mm_hr: float
    blockage_prob_pct: float
    risk_category: str
    last_ping: datetime
    is_active: bool

    class Config:
        from_attributes = True

# --- Reading Schemas ---
class SensorReadingOut(BaseModel):
    id: int
    sensor_id: str
    timestamp: datetime
    water_level_cm: float
    rise_rate_cm_min: float
    rainfall_mm_hr: float
    flow_velocity_mps: float
    battery_pct: float
    temperature_c: float
    humidity_pct: float

    class Config:
        from_attributes = True

# --- Prediction & Scenario Schemas ---
class FactorContribution(BaseModel):
    name: str
    value: float
    weight: float
    impact: str # "INCREASES RISK", "REDUCES RISK", "NEUTRAL"
    description: str

class FloodPredictionOut(BaseModel):
    id: Optional[int] = None
    timestamp: datetime
    zone_name: str
    risk_score: float # 0 - 100
    risk_category: str # LOW, MODERATE, HIGH, CRITICAL
    estimated_window_mins: int
    confidence_pct: float
    contributing_factors: List[FactorContribution]
    recommended_action: str
    hydraulic_velocity_mps: float
    capacity_consumed_pct: float

class SimulationRequest(BaseModel):
    water_level_cm: float
    rise_rate_cm_min: float
    rainfall_intensity_mm_hr: float
    accumulated_24h_mm: float
    drain_siltation_pct: float
    upstream_runoff_cms: float
    sensor_health_pct: float = 98.0

# --- Alert Schemas ---
class AlertOut(BaseModel):
    id: int
    sensor_id: Optional[str] = None
    zone_name: str
    priority: str
    title: str
    description: str
    suggested_response: str
    is_acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertAckRequest(BaseModel):
    operator_name: str
    action_note: Optional[str] = None

# --- Analytics Schemas ---
class TrendPoint(BaseModel):
    time: str
    water_level: float
    rainfall: float
    risk_score: float

class AnalyticsSummary(BaseModel):
    total_sensors: int
    online_sensors: int
    active_alerts: int
    average_flood_risk: float
    drainage_network_health_pct: float
    total_rainfall_today_mm: float
    high_risk_zones: List[Dict[str, Any]]
