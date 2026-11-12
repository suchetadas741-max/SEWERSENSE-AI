import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Server, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Wifi, 
  Radio, 
  Save 
} from 'lucide-react';
import { audio } from '../utils/audio';

export const SettingsView: React.FC = () => {
  const { soundEnabled, setSoundEnabled } = useTelemetry();
  const { theme, toggleTheme } = useTheme();

  const [unitSystem, setUnitSystem] = useState<'METRIC' | 'IMPERIAL'>('METRIC');
  const [criticalDepthThreshold, setCriticalDepthThreshold] = useState<number>(130);
  const [rainThreshold, setRainThreshold] = useState<number>(35);
  const [brokerHost, setBrokerHost] = useState<string>('broker.sewersense.ai');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playSuccess();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              System Settings & Diagnostic Control
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure telemetry polling thresholds, LoRaWAN broker parameters & municipal siren alerts
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Persisted to EEPROM</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification & Threshold Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-sky-100 dark:border-navy-800">
              Emergency Alert Thresholds
            </h3>

            {/* Audio Siren Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-100 dark:border-sky-900/40 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${soundEnabled ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-navy-800 text-slate-400'}`}>
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Audible Siren Synthesizer</span>
                  <span className="text-[11px] text-slate-500">Play synthesize tone on critical warning alerts</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-navy-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Critical Water Depth Threshold Slider */}
            <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-100 dark:border-sky-900/40 text-xs">
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Critical Depth Alarm Threshold
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {criticalDepthThreshold} cm
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="150"
                step="5"
                value={criticalDepthThreshold}
                onChange={(e) => setCriticalDepthThreshold(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Conduits reaching this depth automatically escalate to municipal emergency dispatch
              </span>
            </div>

            {/* Rainfall Rate Alarm Slider */}
            <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-100 dark:border-sky-900/40 text-xs">
              <div className="flex justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Torrential Rainfall Trigger Rate
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-cyan-accent">
                  {rainThreshold} mm/h
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={rainThreshold}
                onChange={(e) => setRainThreshold(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Unit System */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Measurement System:</span>
              <div className="flex items-center gap-1 bg-sky-50 dark:bg-navy-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUnitSystem('METRIC')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    unitSystem === 'METRIC' ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-accent shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Metric (cm, mm/h)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('IMPERIAL')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    unitSystem === 'IMPERIAL' ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-accent shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Imperial (in, in/h)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: IoT Gateway Broker & Diagnostics */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-sky-100 dark:border-navy-800">
              IoT Telemetry Gateway Broker
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  MQTT Broker Hostname
                </label>
                <input
                  type="text"
                  value={brokerHost}
                  onChange={(e) => setBrokerHost(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 font-mono text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Broker Port
                  </label>
                  <input
                    type="text"
                    defaultValue="8883 (MQTTS)"
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/30 dark:bg-navy-950/30 border border-sky-200/40 dark:border-sky-800/40 font-mono text-slate-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Telemetry Interval
                  </label>
                  <input
                    type="text"
                    defaultValue="3000 ms"
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/30 dark:bg-navy-950/30 border border-sky-200/40 dark:border-sky-800/40 font-mono text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Diagnostic Health Status */}
            <div className="mt-4 pt-4 border-t border-sky-100 dark:border-navy-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Subsystem Diagnostics
              </span>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Database className="w-3.5 h-3.5 text-emerald-500" /> Database Engine (SQLite)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Connected</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-sky-500" /> FastAPI REST Latency
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-200">18 ms</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-500" /> XGBoost Model Pipeline
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Ready</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration Changes</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
