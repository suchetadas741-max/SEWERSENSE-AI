import { Sensor, Alert, FloodPrediction, SensorReading } from '../types';

export const INITIAL_SENSORS: Sensor[] = [
  {
    id: "SS-SEN-101",
    name: "Central Trunk Inflow Monitor",
    location_name: "Central Trunk Outfall",
    latitude: 1.2985,
    longitude: 103.8540,
    sensor_type: "Ultrasonic Water Level",
    connectivity: "LoRaWAN",
    status: "online",
    battery_pct: 96.0,
    signal_strength_dbm: -72,
    current_water_level_cm: 48.5,
    rise_rate_cm_min: 0.2,
    rainfall_intensity_mm_hr: 14.5,
    blockage_prob_pct: 18.0,
    risk_category: "NORMAL",
    last_ping: new Date().toISOString(),
    is_active: true
  },
  {
    id: "SS-SEN-102",
    name: "Marina Underpass Storm Sump",
    location_name: "Marina Bay Spillway",
    latitude: 1.2840,
    longitude: 103.8610,
    sensor_type: "Radar Doppler Depth",
    connectivity: "4G LTE",
    status: "warning",
    battery_pct: 88.0,
    signal_strength_dbm: -68,
    current_water_level_cm: 112.4,
    rise_rate_cm_min: 1.1,
    rainfall_intensity_mm_hr: 38.0,
    blockage_prob_pct: 45.0,
    risk_category: "WARNING",
    last_ping: new Date().toISOString(),
    is_active: true
  },
  {
    id: "SS-SEN-103",
    name: "North Canal High-Flow Weir",
    location_name: "North Canal Culvert",
    latitude: 1.3060,
    longitude: 103.8450,
    sensor_type: "Submersible Pressure",
    connectivity: "LoRaWAN",
    status: "online",
    battery_pct: 92.5,
    signal_strength_dbm: -75,
    current_water_level_cm: 35.0,
    rise_rate_cm_min: 0.05,
    rainfall_intensity_mm_hr: 8.0,
    blockage_prob_pct: 12.0,
    risk_category: "NORMAL",
    last_ping: new Date().toISOString(),
    is_active: true
  },
  {
    id: "SS-SEN-104",
    name: "Riverside Low-Level Collector",
    location_name: "Riverside Interceptor",
    latitude: 1.2890,
    longitude: 103.8475,
    sensor_type: "Ultrasonic Water Level",
    connectivity: "NB-IoT",
    status: "critical",
    battery_pct: 74.0,
    signal_strength_dbm: -82,
    current_water_level_cm: 142.8,
    rise_rate_cm_min: 1.8,
    rainfall_intensity_mm_hr: 52.0,
    blockage_prob_pct: 68.0,
    risk_category: "CRITICAL",
    last_ping: new Date().toISOString(),
    is_active: true
  },
  {
    id: "SS-SEN-105",
    name: "Metro Underpass Siphon 04",
    location_name: "Metro Underpass Drain A-4",
    latitude: 1.2930,
    longitude: 103.8390,
    sensor_type: "Optical Rain & Flow",
    connectivity: "ESP32 Wi-Fi",
    status: "warning",
    battery_pct: 82.0,
    signal_strength_dbm: -65,
    current_water_level_cm: 78.5,
    rise_rate_cm_min: 0.8,
    rainfall_intensity_mm_hr: 29.5,
    blockage_prob_pct: 32.0,
    risk_category: "WARNING",
    last_ping: new Date().toISOString(),
    is_active: true
  },
  {
    id: "SS-SEN-106",
    name: "East Industrial Retention Basin",
    location_name: "East Industrial Sluice",
    latitude: 1.3020,
    longitude: 103.8710,
    sensor_type: "Ultrasonic Water Level",
    connectivity: "LoRaWAN",
    status: "online",
    battery_pct: 98.0,
    signal_strength_dbm: -70,
    current_water_level_cm: 52.0,
    rise_rate_cm_min: 0.15,
    rainfall_intensity_mm_hr: 16.0,
    blockage_prob_pct: 15.0,
    risk_category: "NORMAL",
    last_ping: new Date().toISOString(),
    is_active: true
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 101,
    sensor_id: "SS-SEN-104",
    zone_name: "Riverside Interceptor",
    priority: "CRITICAL",
    title: "Severe Water Level & Rapid Surge Detected",
    description: "Conduit depth reached 142.8 cm (95.2% capacity). Rising at 1.8 cm/min. Imminent overflow risk at low-elevation riverbank road within 35 minutes.",
    suggested_response: "Dispatch rapid desiltation unit. Divert stormwater gate SG-02 to auxiliary Retention Basin #3. Notify traffic police.",
    is_acknowledged: false,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: 102,
    sensor_id: "SS-SEN-102",
    zone_name: "Marina Bay Spillway",
    priority: "HIGH",
    title: "High Blockage Probability & Inflow Surge",
    description: "Acoustic attenuation and radar reflection suggest 45% silt and plastic debris obstruction near culvert entrance.",
    suggested_response: "Send maintenance crew for mechanized screen raking. Check automated pump P-101 status.",
    is_acknowledged: false,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: 103,
    sensor_id: "SS-SEN-105",
    zone_name: "Metro Underpass Drain A-4",
    priority: "MEDIUM",
    title: "Heavy Localized Rain Intensity Spike",
    description: "Rain gauge recording 29.5 mm/hr. Water level risen by 24 cm over past 30 minutes.",
    suggested_response: "Monitor underpass pedestrian walkway CCTV. Stand by for automated sump pump cycle.",
    is_acknowledged: true,
    acknowledged_by: "Elena Rostova",
    acknowledged_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
  }
];

export const INITIAL_PREDICTION: FloodPrediction = {
  timestamp: new Date().toISOString(),
  zone_name: "Metropolitan Drainage Basin (Aggregate)",
  risk_score: 68.4,
  risk_category: "HIGH",
  estimated_window_mins: 42,
  confidence_pct: 94.2,
  contributing_factors: [
    {
      name: "Current Water Level",
      value: 112.4,
      weight: 30.0,
      impact: "INCREASES RISK",
      description: "112.4 cm (74.9% of conduit capacity)"
    },
    {
      name: "Rise Velocity",
      value: 1.15,
      weight: 25.0,
      impact: "INCREASES RISK",
      description: "1.15 cm/min surge gradient"
    },
    {
      name: "Rainfall Intensity",
      value: 38.0,
      weight: 20.0,
      impact: "INCREASES RISK",
      description: "38.0 mm/h torrential downpour"
    },
    {
      name: "24h Catchment Saturation",
      value: 48.5,
      weight: 10.0,
      impact: "INCREASES RISK",
      description: "48.5 mm antecedent moisture accumulation"
    },
    {
      name: "Drain Siltation / Blockage",
      value: 45.0,
      weight: 10.0,
      impact: "INCREASES RISK",
      description: "45% debris and silt sediment profile"
    },
    {
      name: "Upstream Inflow Runoff",
      value: 3.8,
      weight: 5.0,
      impact: "INCREASES RISK",
      description: "3.8 m³/s tributary ingress"
    }
  ],
  recommended_action: "Activate auxiliary stormwater retention pumps. Deploy quick-response desiltation vacuum crews to Riverside and Marina corridors.",
  hydraulic_velocity_mps: 1.85,
  capacity_consumed_pct: 74.9
};

export const GENERATE_TIME_SERIES = (hours: number = 24): SensorReading[] => {
  const readings: SensorReading[] = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000).toISOString();
    const surge = i <= 6 ? (7 - i) * 8 : 0;
    readings.push({
      id: 5000 + i,
      sensor_id: "SS-SEN-101",
      timestamp: time,
      water_level_cm: Math.round(42 + surge + Math.sin(i / 2) * 5),
      rise_rate_cm_min: Math.round((0.15 + (surge > 0 ? 0.6 : 0) + Math.random() * 0.1) * 100) / 100,
      rainfall_mm_hr: Math.round(Math.max(0, (surge * 0.9) + Math.random() * 4)),
      flow_velocity_mps: Math.round((1.1 + (surge * 0.02) + Math.random() * 0.2) * 100) / 100,
      battery_pct: Math.round((96 - i * 0.04) * 10) / 10,
      temperature_c: 25.2,
      humidity_pct: 82
    });
  }
  return readings;
};
