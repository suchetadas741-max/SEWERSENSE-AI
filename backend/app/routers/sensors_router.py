from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Sensor, SensorReading, MaintenanceRecord
from app.schemas import SensorCreate, SensorUpdate, SensorOut, SensorReadingOut

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])

@router.get("", response_model=List[SensorOut])
def list_sensors(db: Session = Depends(get_db)):
    sensors = db.query(Sensor).order_by(Sensor.id.asc()).all()
    return sensors

@router.post("", response_model=SensorOut, status_code=status.HTTP_201_CREATED)
def create_sensor(sensor_in: SensorCreate, db: Session = Depends(get_db)):
    existing = db.query(Sensor).filter(Sensor.id == sensor_in.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sensor ID '{sensor_in.id}' already exists."
        )
    sensor = Sensor(
        id=sensor_in.id,
        name=sensor_in.name,
        location_name=sensor_in.location_name,
        latitude=sensor_in.latitude,
        longitude=sensor_in.longitude,
        sensor_type=sensor_in.sensor_type,
        connectivity=sensor_in.connectivity,
        battery_pct=sensor_in.battery_pct,
        signal_strength_dbm=sensor_in.signal_strength_dbm,
        status="online",
        current_water_level_cm=35.0,
        rise_rate_cm_min=0.1,
        rainfall_intensity_mm_hr=10.0,
        blockage_prob_pct=10.0,
        risk_category="NORMAL",
        last_ping=datetime.utcnow()
    )
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor

@router.get("/{sensor_id}", response_model=SensorOut)
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")
    return sensor

@router.put("/{sensor_id}", response_model=SensorOut)
def update_sensor(sensor_id: str, sensor_in: SensorUpdate, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")

    update_data = sensor_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sensor, key, value)

    # Recalculate status and risk based on reading
    if sensor.current_water_level_cm > 130.0 or sensor.rise_rate_cm_min > 1.2:
        sensor.risk_category = "CRITICAL"
        sensor.status = "critical"
    elif sensor.current_water_level_cm > 90.0 or sensor.rise_rate_cm_min > 0.6:
        sensor.risk_category = "WARNING"
        sensor.status = "warning"
    else:
        sensor.risk_category = "NORMAL"
        sensor.status = "online"

    sensor.last_ping = datetime.utcnow()
    db.commit()
    db.refresh(sensor)
    return sensor

@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor(sensor_id: str, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")
    db.delete(sensor)
    db.commit()
    return None

@router.get("/{sensor_id}/readings", response_model=List[SensorReadingOut])
def get_sensor_readings(sensor_id: str, limit: int = 24, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_id == sensor_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(readings))

@router.post("/{sensor_id}/calibrate")
def calibrate_sensor(sensor_id: str, offset_mm: float = 0.0, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")

    rec = MaintenanceRecord(
        sensor_id=sensor_id,
        technician="Remote Telemetry Auto-Calibrator",
        work_performed=f"Zero-datum acoustic offset calibration applied: {offset_mm}mm",
        calibration_offset_mm=offset_mm,
        status="completed"
    )
    db.add(rec)
    db.commit()
    return {"message": f"Sensor {sensor_id} zero-plane calibrated successfully.", "offset_mm": offset_mm}
