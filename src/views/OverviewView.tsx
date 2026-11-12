import React from 'react';
import { CityHeroCanvas } from '../components/3d/CityHeroCanvas';
import { useTelemetry } from '../context/TelemetryContext';
import { TabType } from '../types';
import { 
  Waves, 
  CloudRain, 
  ShieldAlert, 
  Activity, 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { audio } from '../utils/audio';

interface OverviewViewProps {
  onNavigateTab: (tab: TabType) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab }) => {
  const { sensors, alerts, prediction, acknowledgeAlert, stormMode, toggleStormMode } = useTelemetry();

  const criticalSensors = sensors.filter(s => s.risk_category === 'CRITICAL');
  const warningSensors = sensors.filter(s => s.risk_category === 'WARNING');
  const unacknowledgedAlerts = alerts.filter(a => !a.is_acknowledged);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Hero Section: 3D Smart City Digital Twin */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Metropolitan Stormwater Command Centre
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time hydro-telemetry, ultrasonic depth gauges & explainable AI flood warning
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-sky-300 bg-sky-50 dark:bg-navy-900 px-3 py-1.5 rounded-xl border border-sky-200/50 dark:border-sky-800/50">
              Live Basin: <b>Downtown Marina Catchment (42 km²)</b>
            </span>
          </div>
        </div>

        <CityHeroCanvas />
      </section>

      {/* Critical Alerts Banner (If any active unacknowledged critical/high alerts) */}
      {unacknowledgedAlerts.length > 0 && (
        <section className="p-4 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-200/60 dark:border-rose-900/50 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/30 flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Active Flood Early Warning
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                    {unacknowledgedAlerts[0].priority}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {unacknowledgedAlerts[0].title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                  {unacknowledgedAlerts[0].description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => acknowledgeAlert(unacknowledgedAlerts[0].id)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-900 dark:text-white text-xs font-bold transition-all shadow-sm border border-slate-200 dark:border-navy-700"
              >
                Acknowledge Alert
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  onNavigateTab('alerts');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/25 flex items-center gap-1.5"
              >
                <span>Alerts Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Grid: Catchment Status & AI Risk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Flood Risk Summary */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Predictive Flood Hazard Score
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">XGBoost-Hydro Ensemble</span>
            </div>

            {/* Circular Risk Meter */}
            <div className="flex items-center gap-6 my-6">
              <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-navy-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * prediction.risk_score) / 100}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${
                      prediction.risk_score > 80 ? 'text-rose-500' :
                      prediction.risk_score > 60 ? 'text-amber-500' :
                      prediction.risk_score > 30 ? 'text-sky-500' : 'text-emerald-500'
                    }`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {prediction.risk_score}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">/ 100</span>
                </div>
              </div>

              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider mb-1.5 ${
                  prediction.risk_score > 80 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                  prediction.risk_score > 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-sky-100 text-brand-700 dark:bg-navy-800 dark:text-cyan-accent'
                }`}>
                  {prediction.risk_category} Hazard
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Estimated Overflow Window: <b>~{prediction.estimated_window_mins} minutes</b>
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Model confidence: <b>{prediction.confidence_pct}%</b> based on telemetry reliability & rainfall gradient.
                </p>
              </div>
            </div>

            {/* Recommended Protocol Action */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-navy-950/60 border border-sky-100 dark:border-sky-900/40 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-cyan-accent block mb-1">
                AI Suggested Response Protocol
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {prediction.recommended_action}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onNavigateTab('ai-prediction');
            }}
            className="w-full mt-5 py-2.5 px-4 rounded-2xl bg-sky-50 dark:bg-navy-800 hover:bg-sky-100 dark:hover:bg-navy-700 text-brand-700 dark:text-cyan-accent text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-sky-200/60 dark:border-sky-800/60"
          >
            <span>Open Explainable AI & What-If Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Column: High Risk Drainage Points & Quick Hotspots */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <MapPin className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Drainage Stations Status ({sensors.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  audio.playClick();
                  onNavigateTab('drainage-map');
                }}
                className="text-xs font-semibold text-brand-600 dark:text-cyan-accent hover:underline flex items-center gap-1"
              >
                <span>View Full GIS Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sensor cards list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {sensors.map((sensor) => {
                const isCritical = sensor.risk_category === 'CRITICAL';
                const isWarning = sensor.risk_category === 'WARNING';
                return (
                  <div
                    key={sensor.id}
                    onClick={() => {
                      audio.playClick();
                      onNavigateTab('live-monitoring');
                    }}
                    className="p-3.5 rounded-2xl bg-sky-50/40 hover:bg-sky-50/80 dark:bg-navy-950/40 dark:hover:bg-navy-800/50 border border-sky-100/80 dark:border-sky-900/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-brand-600 dark:group-hover:text-cyan-accent">
                        {sensor.id}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                      {sensor.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">{sensor.location_name}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-navy-800 text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[9px] block uppercase">Water Depth</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                          {sensor.current_water_level_cm} cm
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[9px] block uppercase">Blockage</span>
                        <span className={`font-mono font-bold ${
                          sensor.blockage_prob_pct > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {sensor.blockage_prob_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="mt-5 pt-4 border-t border-sky-100 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">Quick Navigation:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audio.playClick();
                  onNavigateTab('sensor-management');
                }}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-medium"
              >
                Sensor Fleet ({sensors.length})
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  onNavigateTab('help-centre');
                }}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-medium"
              >
                System Architecture Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
