import asyncio
import random
import json
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import seed_initial_data
from app.routers import auth_router, sensors_router, predict_router, alerts_router, analytics_router

app = FastAPI(
    title="SewerSense AI Backend API",
    description="Next-Generation Intelligent Urban Flood Prediction & Drainage Monitoring Platform API",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Hook
@app.on_event("startup")
def on_startup():
    seed_initial_data()
    print("SewerSense AI: Database initialized and baseline telemetry seeded.")

# Include Sub-Routers
app.include_router(auth_router.router)
app.include_router(sensors_router.router)
app.include_router(predict_router.router)
app.include_router(alerts_router.router)
app.include_router(analytics_router.router)

@app.get("/")
def root():
    return {
        "platform": "SewerSense AI",
        "tagline": "Predict Before It Floods. Protect Before It Happens.",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "services": {
            "database": "sqlite_connected",
            "ml_engine": "operational",
            "iot_telemetry": "streaming_active",
            "alerts_dispatcher": "active"
        },
        "time": datetime.utcnow().isoformat()
    }

# WebSocket Real-Time Telemetry Hub
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    print("SewerSense AI: WebSocket client connected to telemetry stream.")
    try:
        while True:
            # Emit live sensor pulse every 3 seconds
            payload = {
                "type": "TELEMETRY_PULSE",
                "timestamp": datetime.utcnow().isoformat(),
                "sensor_id": "SS-SEN-101",
                "water_level_cm": round(48.5 + random.uniform(-1.2, 1.8), 1),
                "rainfall_mm_hr": round(max(0.0, 14.5 + random.uniform(-2.0, 3.0)), 1),
                "blockage_prob_pct": round(min(100.0, max(5.0, 18.0 + random.uniform(-1.0, 2.0))), 1),
                "battery_pct": 96.0,
                "surge_event": False
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        print("SewerSense AI: WebSocket client disconnected.")
    except Exception as e:
        print(f"SewerSense AI: WebSocket error: {e}")
