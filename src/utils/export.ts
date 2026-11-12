import { Sensor } from '../types';

export function exportSensorsToCSV(sensors: Sensor[]) {
  const headers = [
    "Sensor ID",
    "Sensor Name",
    "Location Name",
    "Latitude",
    "Longitude",
    "Sensor Type",
    "Connectivity",
    "Status",
    "Water Level (cm)",
    "Rise Rate (cm/min)",
    "Rainfall Intensity (mm/h)",
    "Blockage Prob (%)",
    "Risk Category",
    "Battery (%)",
    "Signal (dBm)",
    "Last Ping"
  ];

  const rows = sensors.map(s => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.location_name.replace(/"/g, '""')}"`,
    s.latitude,
    s.longitude,
    `"${s.sensor_type}"`,
    s.connectivity,
    s.status.toUpperCase(),
    s.current_water_level_cm,
    s.rise_rate_cm_min,
    s.rainfall_intensity_mm_hr,
    s.blockage_prob_pct,
    s.risk_category,
    s.battery_pct,
    s.signal_strength_dbm,
    s.last_ping
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `SewerSense_Sensors_Telemetry_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "_")}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
