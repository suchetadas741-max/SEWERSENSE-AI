export type TabType = 
  | 'overview'
  | 'live-monitoring'
  | 'ai-prediction'
  | 'drainage-map'
  | 'sensor-management'
  | 'analytics-reports'
  | 'alerts'
  | 'help-centre'
  | 'settings';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type StatusType = 'online' | 'warning' | 'critical' | 'offline' | 'calibrating';
export type PriorityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  department: string;
}

export interface Sensor {
  id: string;
  name: string;
  location_name: string;
  latitude: float;
  longitude: float;
  sensor_type: string;
  connectivity: string;
  status: StatusType;
  battery_pct: number;
  signal_strength_dbm: number;
  current_water_level_cm: number;
  rise_rate_cm_min: number;
  rainfall_intensity_mm_hr: number;
  blockage_prob_pct: number;
  risk_category: 'NORMAL' | 'WARNING' | 'CRITICAL';
  last_ping: string;
  is_active: boolean;
}

export interface SensorReading {
  id: number;
  sensor_id: string;
  timestamp: string;
  water_level_cm: number;
  rise_rate_cm_min: number;
  rainfall_mm_hr: number;
  flow_velocity_mps: number;
  battery_pct: number;
  temperature_c: number;
  humidity_pct: number;
}

export interface FactorContribution {
  name: string;
  value: number;
  weight: number;
  impact: 'INCREASES RISK' | 'REDUCES RISK' | 'NEUTRAL';
  description: string;
}

export interface FloodPrediction {
  timestamp: string;
  zone_name: string;
  risk_score: number;
  risk_category: RiskLevel;
  estimated_window_mins: number;
  confidence_pct: number;
  contributing_factors: FactorContribution[];
  recommended_action: string;
  hydraulic_velocity_mps: number;
  capacity_consumed_pct: number;
}

export interface Alert {
  id: number;
  sensor_id?: string;
  zone_name: string;
  priority: PriorityType;
  title: string;
  description: string;
  suggested_response: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_sensors: number;
  online_sensors: number;
  active_alerts: number;
  average_flood_risk: number;
  drainage_network_health_pct: number;
  total_rainfall_today_mm: number;
  high_risk_zones: Array<{
    sensor_id: string;
    location: string;
    water_level_cm: number;
    risk_category: string;
    blockage_prob_pct: number;
  }>;
}

type float = number;
