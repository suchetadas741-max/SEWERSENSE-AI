import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTelemetry } from '../../context/TelemetryContext';
import { useTheme } from '../../context/ThemeContext';
import { Sensor } from '../../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Battery, 
  Wifi, 
  Clock, 
  MapPin, 
  Maximize2, 
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { audio } from '../../utils/audio';

export const DrainageMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);

  const { sensors, selectedSensor, setSelectedSensor } = useTelemetry();
  const { theme } = useTheme();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL'>('ALL');
  const [showHazardZones, setShowHazardZones] = useState<boolean>(true);
  const [inspectingSensor, setInspectingSensor] = useState<Sensor | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Singapore downtown drainage basin
    const map = L.map(mapContainerRef.current, {
      center: [1.2950, 103.8540],
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile Layer based on active theme
    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    zonesLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tiles when theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);
  }, [theme]);

  // Render Markers and Hazard Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const zonesLayer = zonesLayerRef.current;
    if (!map || !markersLayer || !zonesLayer) return;

    markersLayer.clearLayers();
    zonesLayer.clearLayers();

    // 1. Render Waterlogging-prone Areas / Flood Hazard Circles
    if (showHazardZones) {
      const hazardZones = [
        { lat: 1.2890, lng: 103.8475, radius: 450, color: '#ef4444', label: 'Riverside Lowland Basin' },
        { lat: 1.2840, lng: 103.8610, radius: 380, color: '#f59e0b', label: 'Marina Spillway Junction' },
        { lat: 1.2930, lng: 103.8390, radius: 300, color: '#f59e0b', label: 'Metro Underpass Sump' },
      ];

      hazardZones.forEach(zone => {
        const circle = L.circle([zone.lat, zone.lng], {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.18,
          radius: zone.radius,
          weight: 1.5,
          dashArray: '4, 4'
        });
        circle.bindTooltip(`<b>Flood Risk Zone:</b> ${zone.label}`, { className: 'custom-tooltip' });
        zonesLayer.addLayer(circle);
      });
    }

    // 2. Render Color-coded Sensor Markers with Radar Pulse Animation
    const filteredSensors = sensors.filter(s => {
      if (activeFilter === 'ALL') return true;
      return s.risk_category === activeFilter;
    });

    filteredSensors.forEach(sensor => {
      const isCritical = sensor.risk_category === 'CRITICAL';
      const isWarning = sensor.risk_category === 'WARNING';
      const colorHex = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-8 h-8 rounded-full opacity-60 animate-ping" style="background-color: ${colorHex}"></div>
          <div class="relative w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-navy-900 shadow-md text-white font-bold text-[9px]" style="background-color: ${colorHex}">
            ${sensor.id.slice(-2)}
          </div>
          <div class="absolute -bottom-5 bg-white dark:bg-navy-900 px-1.5 py-0.5 rounded shadow text-[9px] font-semibold text-slate-800 dark:text-sky-300 border border-slate-200 dark:border-navy-700 whitespace-nowrap opacity-90">
            ${sensor.current_water_level_cm}cm
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-sensor-icon',
        html: customHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([sensor.latitude, sensor.longitude], { icon });
      marker.on('click', () => {
        audio.playClick();
        setSelectedSensor(sensor);
        setInspectingSensor(sensor);
        map.panTo([sensor.latitude, sensor.longitude], { animate: true, duration: 0.8 });
      });

      markersLayer.addLayer(marker);
    });
  }, [sensors, activeFilter, showHazardZones]);

  // Synchronize when selectedSensor updates externally
  useEffect(() => {
    if (selectedSensor) {
      setInspectingSensor(selectedSensor);
    }
  }, [selectedSensor]);

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-sky-100 dark:border-sky-900/40 shadow-xl bg-slate-100 dark:bg-navy-950">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Filter Bar Overlay */}
      <div className="absolute top-5 left-5 z-20 flex flex-wrap items-center gap-2 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md p-2 rounded-2xl border border-sky-200/60 dark:border-sky-800/60 shadow-lg">
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-slate-700 dark:text-sky-300 border-r border-slate-200 dark:border-slate-700">
          <Filter className="w-3.5 h-3.5 text-brand-500" />
          <span>Filters</span>
        </div>

        {(['ALL', 'CRITICAL', 'WARNING', 'NORMAL'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => {
              audio.playClick();
              setActiveFilter(filter);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === filter
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-navy-800'
            }`}
          >
            {filter === 'ALL' ? 'All Stations' : filter}
          </button>
        ))}

        <button
          onClick={() => setShowHazardZones(!showHazardZones)}
          className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
            showHazardZones
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400'
              : 'border-slate-200 dark:border-navy-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-800'
          }`}
        >
          {showHazardZones ? 'Hazard Polygons Active' : 'Hazard Polygons Hidden'}
        </button>
      </div>

      {/* Flyout Sensor Detail Panel on Right */}
      {inspectingSensor && (
        <div className="absolute top-5 right-5 bottom-5 w-80 sm:w-96 z-20 bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl rounded-3xl border border-sky-200/60 dark:border-sky-800/60 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right-4 duration-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  inspectingSensor.risk_category === 'CRITICAL' ? 'bg-rose-500 animate-ping' :
                  inspectingSensor.risk_category === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-sky-400">
                  {inspectingSensor.id}
                </span>
              </div>
              <button
                onClick={() => setInspectingSensor(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">
              {inspectingSensor.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              {inspectingSensor.location_name}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-navy-950/70 border border-sky-100 dark:border-sky-900/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-sky-300">
                  Water Level
                </span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {inspectingSensor.current_water_level_cm} <span className="text-xs font-normal">cm</span>
                </p>
                <span className="text-[10px] text-slate-500">
                  Rise: +{inspectingSensor.rise_rate_cm_min} cm/m
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-navy-950/70 border border-sky-100 dark:border-sky-900/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-sky-300">
                  Rainfall
                </span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {inspectingSensor.rainfall_intensity_mm_hr} <span className="text-xs font-normal">mm/h</span>
                </p>
                <span className="text-[10px] text-slate-500">
                  Blockage: {inspectingSensor.blockage_prob_pct}%
                </span>
              </div>
            </div>

            {/* Telemetry Technical Attributes */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-navy-800/40 border border-slate-200/50 dark:border-navy-700/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-sky-500" /> Transducer Type
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{inspectingSensor.sensor_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Protocol
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{inspectingSensor.connectivity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-amber-500" /> Battery Cell
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{inspectingSensor.battery_pct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Ping
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Just now</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 pt-3 border-t border-sky-100 dark:border-navy-800 space-y-2">
            <button
              onClick={() => {
                audio.playSuccess();
                alert(`Manual pneumatic purge signal sent to station ${inspectingSensor.id}. Silt clearing cycle triggered.`);
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Trigger Remote Sump Flush
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Station coordinates: {inspectingSensor.latitude.toFixed(4)}, {inspectingSensor.longitude.toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
