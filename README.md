# SewerSense AI — Next-Generation Intelligent Urban Flood Prediction & Drainage Monitoring Platform

> **"SEE THE RISK. PREDICT THE FLOOD. PROTECT THE CITY."**
>
> *"Predict Before It Floods. Protect Before It Happens."*

[![Status](https://img.shields.io/badge/Status-Operational-10b981.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_TypeScript_%7C_Vite_%7C_Tailwind-0ea5e9.svg)]()
[![3D](https://img.shields.io/badge/3D_Engine-Three.js_WebGL-38bdf8.svg)]()
[![GIS](https://img.shields.io/badge/GIS-Leaflet-0284c7.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI_%7C_Uvicorn_%7C_SQLite-0f172a.svg)]()
[![AI](https://img.shields.io/badge/AI_Engine-St._Venant_%2B_XGBoost_%7C_SHAP-10b981.svg)]()

---

## 🌊 Overview

**SewerSense AI** is an enterprise-grade intelligent urban drainage monitoring and flood early-warning platform designed for municipal stormwater authorities and smart cities. By fusing low-power autonomous IoT sensor stations with physics-informed hydrodynamic algorithms and explainable machine learning, SewerSense AI detects subterranean pipe debris blockages, models hydraulic capacity consumption, and predicts street inundations **30 to 90 minutes before surface ponding occurs**.

---

## 🏛️ System Architecture

```
                  ┌──────────────────────────────────────────────────┐
                  │             IoT Edge Sensing Layer               │
                  │  • JSN-SR04T Waterproof Ultrasonic Depth Gauge   │
                  │  • Optical / Tipping-Bucket Rain Gauge           │
                  │  • ESP32 MCU with Edge Digital Signal Filtering  │
                  └────────────────────────┬─────────────────────────┘
                                           │ LoRaWAN (868/915 MHz) / 4G LTE
                                           ▼
                  ┌──────────────────────────────────────────────────┐
                  │             Central Telemetry Ingestion          │
                  │  • FastAPI REST & WebSocket Streaming Hub        │
                  │  • MQTT Telemetry Broker (3s Real-Time Pulses)   │
                  │  • SQLite / PostgreSQL Database with ORM         │
                  └────────────────────────┬─────────────────────────┘
                                           │
                                           ▼
                  ┌──────────────────────────────────────────────────┐
                  │         Physics-Informed AI Risk Engine          │
                  │  • 1D St. Venant Hydrodynamic Velocity Modeling │
                  │  • Ensemble Multi-Factor Surcharge Regressor     │
                  │  • SHAP-Style Transparent Feature Attribution    │
                  └────────────────────────┬─────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        SewerSense AI Command Dashboard (React + TS)                   │
│                                                                                        │
│  [1] First-Screen Premium Auth       [6] Analytics & CSV/PDF Reports                   │
│  [2] 3D Smart City & Pipes Hero      [7] Emergency Alert Dispatch Centre               │
│  [3] Live Hydro-Monitoring Charts     [8] Compulsory 7-Part Help Centre Knowledge Base  │
│  [4] AI Explainable Risk & Simulator  [9] Diagnostic Settings & Thresholds             │
│  [5] Interactive GIS Leaflet Map     [10] Full Persistent Dark / Light Mode            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Backend Setup & Launch
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
*The FastAPI backend will start on `http://127.0.0.1:8000` with Swagger documentation available at `http://127.0.0.1:8000/docs`.*

### 3. Frontend Setup & Launch
```bash
cd frontend
npm install
npm run dev
```
*The React application will open on `http://127.0.0.1:5173`.*

---

## 🔐 Credentials for Hackathon Evaluators

- **Instant 1-Click Access**: Click the **⚡ Instant Demo Login (Chief Engineer)** button on the authentication screen.
- **Manual Credentials**:
  - **Email**: `admin@sewersense.ai`
  - **Password**: `password123`
- *New account registration and password validation are also fully functional.*

---

## 🧠 Explainable AI & Hydrodynamic Engine

The flood hazard index is calculated using a hybrid approach combining transparent open-channel fluid mechanics with gradient-boosted trees:

$$\text{Velocity: } v = \frac{1}{n} R_h^{2/3} S^{1/2}$$

$$\text{Risk Score: } \text{Index} = \sum (w_i \cdot \text{Feature}_i) \times \text{Confidence Factor}$$

### Feature Weight Breakdown:
1. **Water Depth Ratio (30% weight)**: Fraction of vertical pipe headroom consumed.
2. **Surge Gradient $\frac{dh}{dt}$ (25% weight)**: Rate of water-level rise in cm/min.
3. **Precipitation Intensity (20% weight)**: Real-time rainfall rate in mm/h.
4. **24h Antecedent Saturation (10% weight)**: Moisture saturation index of catchment.
5. **Acoustic Siltation / Blockage % (10% weight)**: Acoustic reflection attenuation indicating sediment.
6. **Upstream Inflow Tributary Runoff (5% weight)**: Catchment boundary inflow rate in m³/s.

---

## 🗺️ Interactive GIS Mapping & Layers

- **Coordinate System**: WGS 84 (EPSG:3857) focused on the Downtown Marina Basin.
- **Layers**:
  - IoT Ultrasonic & Radar Sensor Stations (Pulsing Green, Amber, Red).
  - Underground Stormwater Trunk Conduits.
  - Waterlogging Hazard Polygons with calibrated risk buffers.
- **Tile System**: Dynamic synchronized dark and light map layers using CartoDB Positron and Dark Matter.

---

## 📊 Database Schema (SQLAlchemy / SQLite)

1. `users`: Credentials, full names, roles, departments.
2. `drainage_locations`: Zones, subdistricts, catchment areas, pipe diameters, gradients.
3. `sensors`: Station ID, name, location, lat/lng, transducer type, connectivity, water depth, battery, risk tier.
4. `sensor_readings`: Time-series depth, rise rate, rainfall, temperature, battery.
5. `rainfall_data`: Hourly mm, 24h accumulated precipitation.
6. `flood_predictions`: Risk score, category, overflow window, SHAP factors JSON, recommended actions.
7. `alerts`: Priority (Critical, High, Medium, Info), title, description, response protocols, acknowledgment logs.
8. `alert_history`: Resolution metrics and operator audit logs.
9. `maintenance_records`: Transducer zero-datum calibration logs and technician field work.

---

## 🎯 Verification & Testing Checklist

- [x] **First Screen Authentication**: 3D fluid sphere, validation, demo login, logout.
- [x] **10 Sidebar Sections**: Seamless transitions across all command tabs.
- [x] **3D Smart City Digital Twin**: Underground pipes, moving water particles, rain storm simulation toggle, floating stat cards.
- [x] **Live Monitoring**: Telemetry cards, Recharts water level & rainfall curves, GREEN/AMBER/RED status.
- [x] **AI Prediction & What-If Simulator**: Explainable SHAP factor weights, interactive sliders, overflow window.
- [x] **Leaflet GIS Map**: Risk radar markers, hazard polygons, inspection drawer, light/dark tile sync.
- [x] **Sensor Fleet Management**: Inventory table, Add/Edit/Delete modals, zero-datum acoustic calibration, visual network topology.
- [x] **Analytics & Export**: Multi-period trends, blockage rankings, valid CSV export download, print layout.
- [x] **Alerts Dispatch**: Web Notifications API, priority filtering, acknowledge workflow.
- [x] **Compulsory Help Centre**: Sections A through G, animated 7-step pipeline, hardware illustrations, FAQs, troubleshooting.
- [x] **Light & Dark Themes**: High-contrast, persistent `localStorage` theme toggle.
