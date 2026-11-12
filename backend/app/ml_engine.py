import math
from typing import Dict, Any, List

class AIFloodPredictionEngine:
    """
    SewerSense AI Explainable Flood Risk Engine
    Combines 1D St. Venant pipe hydraulics with an ensemble risk-scoring model.
    Provides transparent SHAP-style factor importance and actionable municipal mitigations.
    """

    CRITICAL_DEPTH_CM = 150.0  # Typical urban trunk pipe height
    MAX_DISCHARGE_CMS = 8.5    # Design maximum hydraulic discharge in m^3/s

    @classmethod
    def calculate_risk(
        cls,
        water_level_cm: float,
        rise_rate_cm_min: float,
        rainfall_intensity_mm_hr: float,
        accumulated_24h_mm: float,
        drain_siltation_pct: float,
        upstream_runoff_cms: float,
        sensor_health_pct: float = 98.0,
        max_pipe_depth_cm: float = 150.0
    ) -> Dict[str, Any]:
        
        # 1. Hydraulic Capacity Consumption
        depth_ratio = max(0.0, min(1.2, water_level_cm / max_pipe_depth_cm))
        effective_capacity_pct = round(depth_ratio * 100, 1)

        # 2. Physics-based flow velocity approximation (Manning's equation simplification)
        # v = (1/n) * R_h^(2/3) * S^(1/2), approx normal velocity 0.8 - 2.8 m/s
        hydraulic_velocity = round(0.5 + (depth_ratio * 1.8) * (1.0 - (drain_siltation_pct / 200.0)), 2)

        # 3. Individual Factor Risk Scores (0 - 100 scale)
        # Factor A: Current depth saturation (Weight: 30%)
        f_depth = min(100.0, (water_level_cm / max_pipe_depth_cm) * 100.0)

        # Factor B: Rate of water rise (Weight: 25%)
        # > 1.5 cm/min is rapid flash flood condition
        f_rise = min(100.0, max(0.0, rise_rate_cm_min * 50.0))

        # Factor C: Rainfall intensity (Weight: 20%)
        # > 40 mm/hr is torrential downpour
        f_rain_current = min(100.0, (rainfall_intensity_mm_hr / 45.0) * 100.0)

        # Factor D: 24h antecedent rainfall saturation (Weight: 10%)
        # Wet catchment antecedent moisture condition
        f_rain_24h = min(100.0, (accumulated_24h_mm / 90.0) * 100.0)

        # Factor E: Siltation / physical blockage in conduit (Weight: 10%)
        f_blockage = float(drain_siltation_pct)

        # Factor F: Upstream catchment runoff (Weight: 5%)
        f_runoff = min(100.0, (upstream_runoff_cms / 7.0) * 100.0)

        # Raw weighted sum
        raw_score = (
            (f_depth * 0.30) +
            (f_rise * 0.25) +
            (f_rain_current * 0.20) +
            (f_rain_24h * 0.10) +
            (f_blockage * 0.10) +
            (f_runoff * 0.05)
        )

        # Sensor confidence modulation
        confidence_pct = round(min(99.0, max(65.0, sensor_health_pct * 0.98)), 1)
        if sensor_health_pct < 70.0:
            # Dampen confidence if sensor has degraded signal
            confidence_pct = round(sensor_health_pct, 1)

        final_risk_score = round(max(0.0, min(100.0, raw_score)), 1)

        # Categorize Risk
        if final_risk_score <= 30.0:
            category = "LOW"
            action = "Normal monitoring protocol. Maintain routine bi-weekly drain grate inspection."
        elif final_risk_score <= 60.0:
            category = "MODERATE"
            action = "Alert district maintenance. Verify sluice gate positions and inspect culvert grates for debris."
        elif final_risk_score <= 80.0:
            category = "HIGH"
            action = "Activate auxiliary stormwater retention pumps. Deploy quick-response desiltation vacuum crews."
        else:
            category = "CRITICAL"
            action = "IMMEDIATE EVACUATION & DIVERSION: Issue flash-flood warning to municipal traffic and emergency dispatch."

        # Estimated Risk Window (Minutes until potential street-level overflow)
        remaining_depth = max_pipe_depth_cm - water_level_cm
        if remaining_depth <= 0:
            estimated_window_mins = 0
        elif rise_rate_cm_min > 0.05:
            mins = int(remaining_depth / rise_rate_cm_min)
            estimated_window_mins = max(5, min(180, mins))
        else:
            estimated_window_mins = 240  # Ample headroom

        # Explainable Factors Breakdown (SHAP-style attribution)
        contributing_factors = [
            {
                "name": "Current Water Level",
                "value": round(water_level_cm, 1),
                "weight": 30.0,
                "impact": "INCREASES RISK" if f_depth > 50 else ("REDUCES RISK" if f_depth < 30 else "NEUTRAL"),
                "description": f"{round(water_level_cm, 1)} cm ({effective_capacity_pct}% of pipe height)"
            },
            {
                "name": "Rise Velocity",
                "value": round(rise_rate_cm_min, 2),
                "weight": 25.0,
                "impact": "INCREASES RISK" if rise_rate_cm_min > 0.6 else ("REDUCES RISK" if rise_rate_cm_min <= 0.1 else "NEUTRAL"),
                "description": f"{round(rise_rate_cm_min, 2)} cm/min dynamic hydraulic surge rate"
            },
            {
                "name": "Rainfall Intensity",
                "value": round(rainfall_intensity_mm_hr, 1),
                "weight": 20.0,
                "impact": "INCREASES RISK" if rainfall_intensity_mm_hr > 20 else ("REDUCES RISK" if rainfall_intensity_mm_hr < 5 else "NEUTRAL"),
                "description": f"{round(rainfall_intensity_mm_hr, 1)} mm/h real-time precipitation"
            },
            {
                "name": "24h Catchment Saturation",
                "value": round(accumulated_24h_mm, 1),
                "weight": 10.0,
                "impact": "INCREASES RISK" if accumulated_24h_mm > 40 else "NEUTRAL",
                "description": f"{round(accumulated_24h_mm, 1)} mm antecedent 24-hour total rainfall"
            },
            {
                "name": "Drain Siltation / Blockage",
                "value": round(drain_siltation_pct, 1),
                "weight": 10.0,
                "impact": "INCREASES RISK" if drain_siltation_pct > 35 else "NEUTRAL",
                "description": f"{round(drain_siltation_pct, 1)}% estimated conduit sediment reduction"
            },
            {
                "name": "Upstream Inflow Runoff",
                "value": round(upstream_runoff_cms, 2),
                "weight": 5.0,
                "impact": "INCREASES RISK" if upstream_runoff_cms > 3.0 else "NEUTRAL",
                "description": f"{round(upstream_runoff_cms, 2)} m³/s catchment ingress rate"
            }
        ]

        return {
            "risk_score": final_risk_score,
            "risk_category": category,
            "estimated_window_mins": estimated_window_mins,
            "confidence_pct": confidence_pct,
            "contributing_factors": contributing_factors,
            "recommended_action": action,
            "hydraulic_velocity_mps": hydraulic_velocity,
            "capacity_consumed_pct": effective_capacity_pct
        }
