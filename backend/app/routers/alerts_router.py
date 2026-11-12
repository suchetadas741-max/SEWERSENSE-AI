from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Alert
from app.schemas import AlertOut, AlertAckRequest

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertOut])
def list_alerts(
    priority: Optional[str] = None,
    acknowledged: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if priority and priority.upper() != "ALL":
        query = query.filter(Alert.priority == priority.upper())
    if acknowledged is not None:
        query = query.filter(Alert.is_acknowledged == acknowledged)
    alerts = query.order_by(Alert.created_at.desc()).all()
    return alerts

@router.patch("/{alert_id}/ack", response_model=AlertOut)
def acknowledge_alert(alert_id: int, req: AlertAckRequest, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.is_acknowledged = True
    alert.acknowledged_by = req.operator_name or "Active Duty Operator"
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert

@router.get("/stats")
def get_alert_stats(db: Session = Depends(get_db)):
    total = db.query(Alert).count()
    unacknowledged = db.query(Alert).filter(Alert.is_acknowledged == False).count()
    critical = db.query(Alert).filter(Alert.priority == "CRITICAL", Alert.is_acknowledged == False).count()
    high = db.query(Alert).filter(Alert.priority == "HIGH", Alert.is_acknowledged == False).count()
    medium = db.query(Alert).filter(Alert.priority == "MEDIUM", Alert.is_acknowledged == False).count()
    return {
        "total_alerts": total,
        "unacknowledged_alerts": unacknowledged,
        "critical_unresolved": critical,
        "high_unresolved": high,
        "medium_unresolved": medium
    }
