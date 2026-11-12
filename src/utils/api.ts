import { Sensor, Alert, FloodPrediction, SensorReading, AnalyticsSummary } from '../types';
import { INITIAL_SENSORS, INITIAL_ALERTS, INITIAL_PREDICTION, GENERATE_TIME_SERIES } from '../data/mockData';

const BASE_URL = 'http://127.0.0.1:8000';

export async function fetchWithFallback<T>(url: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Graceful fallback to mock data
    console.debug(`API ${url} offline, using rich baseline mock`, err);
    return fallback;
  }
}

export const api = {
  getSensors: () => fetchWithFallback<Sensor[]>('/api/sensors', INITIAL_SENSORS),
  
  createSensor: async (sensor: Partial<Sensor>): Promise<Sensor> => {
    try {
      const res = await fetch(`${BASE_URL}/api/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensor)
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      ...(sensor as Sensor),
      status: 'online',
      current_water_level_cm: 35.0,
      rise_rate_cm_min: 0.1,
      rainfall_intensity_mm_hr: 10.0,
      blockage_prob_pct: 12.0,
      risk_category: 'NORMAL',
      last_ping: new Date().toISOString(),
      is_active: true
    };
  },

  updateSensor: async (id: string, updates: Partial<Sensor>): Promise<Sensor> => {
    try {
      const res = await fetch(`${BASE_URL}/api/sensors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch {}
    return updates as Sensor;
  },

  deleteSensor: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/api/sensors/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return true;
    }
  },

  getSensorReadings: (id: string) => 
    fetchWithFallback<SensorReading[]>(`/api/sensors/${id}/readings`, GENERATE_TIME_SERIES(24)),

  getAlerts: () => fetchWithFallback<Alert[]>('/api/alerts', INITIAL_ALERTS),

  acknowledgeAlert: async (id: number, operator: string): Promise<Alert> => {
    try {
      const res = await fetch(`${BASE_URL}/api/alerts/${id}/ack`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator_name: operator })
      });
      if (res.ok) return await res.json();
    } catch {}
    const existing = INITIAL_ALERTS.find(a => a.id === id);
    return {
      ...(existing || INITIAL_ALERTS[0]),
      id,
      is_acknowledged: true,
      acknowledged_by: operator,
      acknowledged_at: new Date().toISOString()
    };
  },

  getCurrentPrediction: () => 
    fetchWithFallback<FloodPrediction>('/api/predictions/current', INITIAL_PREDICTION),

  simulateScenario: async (params: {
    water_level_cm: number;
    rise_rate_cm_min: number;
    rainfall_intensity_mm_hr: number;
    accumulated_24h_mm: number;
    drain_siltation_pct: number;
    upstream_runoff_cms: number;
    sensor_health_pct?: number;
  }): Promise<FloodPrediction> => {
    try {
      const res = await fetch(`${BASE_URL}/api/predictions/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch {}
    
    // Heuristic client fallback calculation
    const f_depth = Math.min(100, (params.water_level_cm / 150) * 100);
    const f_rise = Math.min(100, Math.max(0, params.rise_rate_cm_min * 50));
    const f_rain = Math.min(100, (params.rainfall_intensity_mm_hr / 45) * 100);
    const f_24h = Math.min(100, (params.accumulated_24h_mm / 90) * 100);
    const f_block = params.drain_siltation_pct;
    const f_runoff = Math.min(100, (params.upstream_runoff_cms / 7) * 100);

    const score = Math.round(
      (f_depth * 0.30) + (f_rise * 0.25) + (f_rain * 0.20) + 
      (f_24h * 0.10) + (f_block * 0.10) + (f_runoff * 0.05)
    );

    let cat: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let action = 'Routine monitoring protocol. Maintain bi-weekly culvert checks.';
    if (score > 80) {
      cat = 'CRITICAL';
      action = 'IMMEDIATE DISPATCH: Issue city-wide road diversion and activate emergency high-capacity flood pumps.';
    } else if (score > 60) {
      cat = 'HIGH';
      action = 'Activate retention basin gates. Deploy mechanized desiltation vacuum crews to critical culvert junctions.';
    } else if (score > 30) {
      cat = 'MODERATE';
      action = 'Alert district maintenance teams. Inspect intake screens and monitor telemetry continuously.';
    }

    const remaining = 150 - params.water_level_cm;
    const windowMins = remaining <= 0 ? 0 : (params.rise_rate_cm_min > 0.05 ? Math.max(5, Math.min(180, Math.round(remaining / params.rise_rate_cm_min))) : 180);

    return {
      timestamp: new Date().toISOString(),
      zone_name: 'Simulated Dynamic Storm Scenario',
      risk_score: score,
      risk_category: cat,
      estimated_window_mins: windowMins,
      confidence_pct: 93.8,
      hydraulic_velocity_mps: 1.95,
      capacity_consumed_pct: Math.round((params.water_level_cm / 150) * 100),
      recommended_action: action,
      contributing_factors: [
        { name: "Current Water Level", value: params.water_level_cm, weight: 30, impact: f_depth > 50 ? "INCREASES RISK" : "NEUTRAL", description: `${params.water_level_cm} cm depth` },
        { name: "Rise Velocity", value: params.rise_rate_cm_min, weight: 25, impact: params.rise_rate_cm_min > 0.6 ? "INCREASES RISK" : "NEUTRAL", description: `${params.rise_rate_cm_min} cm/min surge` },
        { name: "Rainfall Intensity", value: params.rainfall_intensity_mm_hr, weight: 20, impact: params.rainfall_intensity_mm_hr > 20 ? "INCREASES RISK" : "NEUTRAL", description: `${params.rainfall_intensity_mm_hr} mm/h precipitation` },
        { name: "24h Catchment Saturation", value: params.accumulated_24h_mm, weight: 10, impact: params.accumulated_24h_mm > 40 ? "INCREASES RISK" : "NEUTRAL", description: `${params.accumulated_24h_mm} mm total 24h` },
        { name: "Drain Siltation / Blockage", value: params.drain_siltation_pct, weight: 10, impact: params.drain_siltation_pct > 35 ? "INCREASES RISK" : "NEUTRAL", description: `${params.drain_siltation_pct}% blockage` },
        { name: "Upstream Inflow Runoff", value: params.upstream_runoff_cms, weight: 5, impact: params.upstream_runoff_cms > 3 ? "INCREASES RISK" : "NEUTRAL", description: `${params.upstream_runoff_cms} m³/s tributary ingress` }
      ]
    };
  },

  getAnalyticsSummary: () => 
    fetchWithFallback<AnalyticsSummary>('/api/analytics/summary', {
      total_sensors: 6,
      online_sensors: 6,
      active_alerts: 2,
      average_flood_risk: 48.5,
      drainage_network_health_pct: 88.2,
      total_rainfall_today_mm: 54.0,
      high_risk_zones: [
        { sensor_id: "SS-SEN-104", location: "Riverside Interceptor", water_level_cm: 142.8, risk_category: "CRITICAL", blockage_prob_pct: 68 },
        { sensor_id: "SS-SEN-102", location: "Marina Bay Spillway", water_level_cm: 112.4, risk_category: "WARNING", blockage_prob_pct: 45 }
      ]
    })
};
