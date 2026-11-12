import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';
import { 
  Waves, 
  CloudRain, 
  Activity, 
  AlertTriangle, 
  Radio, 
  Battery, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  Play, 
  Square,
  Droplet,
  Layers
} from 'lucide-react';
import { audio } from '../utils/audio';
import { GENERATE_TIME_SERIES } from '../data/mockData';

export const LiveMonitoringView: React.FC = () => {
  const { sensors, selectedSensor, setSelectedSensor, stormMode, toggleStormMode } = useTelemetry();
  const [activeSensorId, setActiveSensorId] = useState<string>(selectedSensor?.id || sensors[0]?.id || "SS-SEN-101");
  const [historyData, setHistoryData] = useState(() => GENERATE_TIME_SERIES(18));

  const currentSensor = sensors.find(s => s.id === activeSensorId) || sensors[0];

  // Update history data slightly as time ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setHistoryData(prev => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newPt = {
          id: last.id + 1,
          sensor_id: currentSensor.id,
          timestamp: timeStr,
          water_level_cm: currentSensor.current_water_level_cm,
          rise_rate_cm_min: currentSensor.rise_rate_cm_min,
          rainfall_mm_hr: currentSensor.rainfall_intensity_mm_hr,
          flow_velocity_mps: 1.4 + (currentSensor.current_water_level_cm * 0.01),
          battery_pct: currentSensor.battery_pct,
          temperature_c: 25.1,
          humidity_pct: 80
        };
        return [...prev.slice(1), newPt];
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [currentSensor]);

  const handleSelectStation = (id: string) => {
    audio.playClick();
    setActiveSensorId(id);
    const s = sensors.find(item => item.id === id);
    if (s) setSelectedSensor(s);
  };

  const isCritical = currentSensor.risk_category === 'CRITICAL';
  const isWarning = currentSensor.risk_category === 'WARNING';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Live Hydro-Monitoring Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time ultrasonic water depth, acoustic blockage analysis & rainfall gradient tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-navy-900 border border-sky-100 dark:border-sky-800 shadow-sm text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">MQTT Stream: Active</span>
            <span className="font-mono text-slate-400">3s interval</span>
          </div>

          <button
            onClick={toggleStormMode}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${
              stormMode
                ? 'bg-rose-600 text-white shadow-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-sky-500 to-brand-600 hover:from-sky-600 hover:to-brand-700 text-white'
            }`}
          >
            {stormMode ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{stormMode ? 'Surge Event Active' : 'Inject Storm Surge'}</span>
          </button>
        </div>
      </div>

      {/* Station Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sensors.map(s => {
          const isAct = s.id === activeSensorId;
          const isCrit = s.risk_category === 'CRITICAL';
          const isWarn = s.risk_category === 'WARNING';
          return (
            <button
              key={s.id}
              onClick={() => handleSelectStation(s.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isAct
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/25'
                  : 'bg-white/80 dark:bg-navy-900/80 hover:bg-sky-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 border-sky-100 dark:border-sky-900/40'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                isCrit ? 'bg-rose-500 animate-ping' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span>{s.name}</span>
              <span className="font-mono text-[10px] opacity-75">({s.current_water_level_cm} cm)</span>
            </button>
          );
        })}
      </div>

      {/* Current Station Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Water Level */}
        <div className="p-4 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Water Level</span>
            <Waves className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {currentSensor.current_water_level_cm}
            </span>
            <span className="text-xs font-medium text-slate-400">cm</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
            Max Conduit: 150 cm
          </span>
        </div>

        {/* Metric 2: Rise Rate */}
        <div className="p-4 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rate of Rise</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black font-mono ${
              currentSensor.rise_rate_cm_min > 1.0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              +{currentSensor.rise_rate_cm_min}
            </span>
            <span className="text-xs font-medium text-slate-400">cm/m</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
            Surge Gradient
          </span>
        </div>

        {/* Metric 3: Rainfall Intensity */}
        <div className="p-4 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rain Intensity</span>
            <CloudRain className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {currentSensor.rainfall_intensity_mm_hr}
            </span>
            <span className="text-xs font-medium text-slate-400">mm/h</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
            Optical Gauge
          </span>
        </div>

        {/* Metric 4: Drainage Capacity */}
        <div className="p-4 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Used Capacity</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {Math.round((currentSensor.current_water_level_cm / 150) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-navy-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (currentSensor.current_water_level_cm / 150) > 0.8 ? 'bg-rose-500' :
                (currentSensor.current_water_level_cm / 150) > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (currentSensor.current_water_level_cm / 150) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 5: Blockage Probability */}
        <div className="p-4 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Blockage Prob</span>
            <AlertTriangle className={`w-4 h-4 ${currentSensor.blockage_prob_pct > 50 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black font-mono ${
              currentSensor.blockage_prob_pct > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {currentSensor.blockage_prob_pct}%
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
            Acoustic Silt Profile
          </span>
        </div>

        {/* Metric 6: Status Indicator (GREEN / AMBER / RED) */}
        <div className={`p-4 rounded-3xl backdrop-blur-xl border shadow-sm flex flex-col justify-between ${
          isCritical
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300'
            : isWarning
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider">System State</span>
            <div className={`w-3 h-3 rounded-full ${
              isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider uppercase block">
              {currentSensor.risk_category}
            </span>
            <span className="text-[10px] font-semibold opacity-80 block mt-0.5">
              {isCritical ? 'RED — Critical Alert' : isWarning ? 'AMBER — Warning Level' : 'GREEN — Normal Flow'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Line Graphs (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Water Level Variation vs Warning Threshold */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Water Level Variation Curve (cm) — {currentSensor.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live line chart reflecting ultrasonic sensor depth readings vs 130cm warning ceiling
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-brand-600 dark:text-cyan-accent font-semibold">
                <span className="w-3 h-1 bg-brand-500 rounded" /> Depth
              </span>
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <span className="w-3 h-1 bg-rose-500 rounded border-dashed" /> Critical (130cm)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 160]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a1128', 
                    borderColor: '#0284c7', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="water_level_cm" 
                  stroke="#0284c7" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#waterLevelGrad)" 
                  name="Water Level (cm)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Rainfall Intensity Bar Graph */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Precipitation History (mm/h)
              </h3>
              <CloudRain className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Hourly rainfall intensity histogram from local catchment tipping-bucket gauge
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData.slice(-10)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 70]} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a1128', 
                      borderColor: '#38bdf8', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px' 
                    }} 
                  />
                  <Bar dataKey="rainfall_mm_hr" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Rainfall (mm/h)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 dark:border-navy-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Transducer Battery:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Battery className="w-3.5 h-3.5" /> {currentSensor.battery_pct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
