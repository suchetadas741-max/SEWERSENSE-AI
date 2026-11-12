import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { FloodPrediction, FactorContribution } from '../types';
import { api } from '../utils/api';
import { 
  BrainCircuit, 
  Sliders, 
  ShieldAlert, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Info,
  Clock,
  Compass,
  ArrowRight
} from 'lucide-react';
import { audio } from '../utils/audio';

export const PredictionView: React.FC = () => {
  const { prediction: globalPrediction } = useTelemetry();

  // Scenario Simulator Interactive State
  const [simLevel, setSimLevel] = useState<number>(75);
  const [simRiseRate, setSimRiseRate] = useState<number>(0.65);
  const [simRain, setSimRain] = useState<number>(32);
  const [sim24hRain, setSim24hRain] = useState<number>(45);
  const [simBlockage, setSimBlockage] = useState<number>(35);
  const [simUpstream, setSimUpstream] = useState<number>(3.5);
  const [simPrediction, setSimPrediction] = useState<FloodPrediction>(globalPrediction);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Run simulation calculation
  const handleRunSimulation = async (
    level = simLevel,
    rise = simRiseRate,
    rain = simRain,
    rain24 = sim24hRain,
    block = simBlockage,
    up = simUpstream
  ) => {
    setIsSimulating(true);
    audio.playClick();
    const result = await api.simulateScenario({
      water_level_cm: level,
      rise_rate_cm_min: rise,
      rainfall_intensity_mm_hr: rain,
      accumulated_24h_mm: rain24,
      drain_siltation_pct: block,
      upstream_runoff_cms: up
    });
    setSimPrediction(result);
    setIsSimulating(false);
  };

  const handleSliderChange = (setter: (v: number) => void, val: number) => {
    setter(val);
  };

  const currentPred = simPrediction || globalPrediction;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Flood Early Warning & Explainable Risk Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physics-informed hydrodynamic modeling coupled with multi-factor feature attribution (SHAP-style)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-navy-900 text-brand-700 dark:text-cyan-accent border border-sky-100 dark:border-sky-800">
            Ensemble: St. Venant 1D + XGBoost
          </span>
        </div>
      </div>

      {/* Main Grid: Left Risk Meter & Factors, Right What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Animated Risk Meter & Result Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Risk Score Card */}
          <div className="p-6 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col items-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-sky-400 mb-2">
              Explainable Flood Risk Score
            </span>

            {/* Circular Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center my-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-100 dark:text-navy-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={314.15}
                  strokeDashoffset={314.15 - (314.15 * currentPred.risk_score) / 100}
                  strokeLinecap="round"
                  className={`transition-all duration-700 ${
                    currentPred.risk_score > 80 ? 'text-rose-500' :
                    currentPred.risk_score > 60 ? 'text-amber-500' :
                    currentPred.risk_score > 30 ? 'text-sky-500' : 'text-emerald-500'
                  }`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                  {currentPred.risk_score}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  INDEX / 100
                </span>
              </div>
            </div>

            {/* Risk Category Pill */}
            <div className="mt-1">
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                currentPred.risk_category === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                currentPred.risk_category === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                currentPred.risk_category === 'MODERATE' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {currentPred.risk_category} RISK LEVEL
              </span>
            </div>

            {/* Overflow Time Window */}
            <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-sky-50/70 dark:bg-navy-950/70 text-xs border border-sky-100/60 dark:border-sky-900/40 w-full">
              <Clock className="w-4 h-4 text-brand-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Estimated Street Overflow:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ~{currentPred.estimated_window_mins} mins
              </span>
            </div>

            {/* Actionable Protocol Box */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 to-brand-500/10 border border-sky-200/50 dark:border-sky-800/50 text-left w-full text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-cyan-accent block mb-1">
                Actionable Municipal Mitigation Recommendation
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {currentPred.recommended_action}
              </p>
            </div>
          </div>

          {/* Model Confidence & Scientific Integrity Card */}
          <div className="p-5 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-navy-800">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-500" /> AI Model Confidence
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {currentPred.confidence_pct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Confidence score dynamically penalizes sensor acoustic attenuation, LoRa packet jitter, and rainfall gauge drift.
            </p>
            <div className="pt-2 text-[10px] text-slate-400 italic">
              Notice: SewerSense AI combines transparent empirical hydraulic formulas (Manning pipe velocity) with statistical gradient boosting. Predictions reflect early risk warning indices.
            </div>
          </div>
        </div>

        {/* Right Column: "Why did AI predict this?" (SHAP Feature Importance) & Interactive Simulator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Explainability: "Why did the AI generate this prediction?" */}
          <div className="p-6 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-navy-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Why did the AI generate this prediction?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SHAP-style multi-factor feature attribution breakdown & weights
                </p>
              </div>
              <span className="text-[10px] font-mono text-brand-600 dark:text-cyan-accent font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-navy-800">
                Transparent AI
              </span>
            </div>

            {/* Contributing Factors Bar Stack */}
            <div className="mt-5 space-y-3.5">
              {currentPred.contributing_factors.map((factor, idx) => {
                const isHighImpact = factor.impact === 'INCREASES RISK';
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {factor.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {factor.description}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isHighImpact 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400'
                        }`}>
                          {factor.weight}% weight
                        </span>
                      </div>
                    </div>

                    {/* Progress representation */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHighImpact ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${Math.min(100, (factor.value / 150) * 100 || factor.weight * 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive What-If Scenario Simulator */}
          <div className="p-6 rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Interactive What-If Scenario Simulator
                </h3>
              </div>
              <button
                onClick={() => handleRunSimulation(50, 0.2, 15, 25, 15, 1.5)}
                className="text-xs text-brand-600 dark:text-cyan-accent font-semibold hover:underline"
              >
                Reset Defaults
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-5">
              Simulate dynamic storm scenarios: drag sliders to modify hydraulic inputs and watch the AI risk score and overflow time recalculate in real-time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Slider 1: Water Level */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/60 border border-sky-100 dark:border-sky-900/40">
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Water Depth</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-cyan-accent">{simLevel} cm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="160"
                  step="1"
                  value={simLevel}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleSliderChange(setSimLevel, val);
                    handleRunSimulation(val, simRiseRate, simRain, sim24hRain, simBlockage, simUpstream);
                  }}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Conduit height: 150 cm</span>
              </div>

              {/* Slider 2: Rate of Rise */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/60 border border-sky-100 dark:border-sky-900/40">
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Surge Rise Rate</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-cyan-accent">+{simRiseRate} cm/min</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="2.5"
                  step="0.05"
                  value={simRiseRate}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleSliderChange(setSimRiseRate, val);
                    handleRunSimulation(simLevel, val, simRain, sim24hRain, simBlockage, simUpstream);
                  }}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Normal: 0.1 - 0.4 cm/min</span>
              </div>

              {/* Slider 3: Current Rainfall */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/60 border border-sky-100 dark:border-sky-900/40">
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Current Rainfall</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-cyan-accent">{simRain} mm/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="1"
                  value={simRain}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleSliderChange(setSimRain, val);
                    handleRunSimulation(simLevel, simRiseRate, val, sim24hRain, simBlockage, simUpstream);
                  }}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Downpour threshold: 35 mm/h</span>
              </div>

              {/* Slider 4: Drain Siltation Blockage */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-navy-950/60 border border-sky-100 dark:border-sky-900/40">
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Drain Blockage / Silt</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-cyan-accent">{simBlockage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={simBlockage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleSliderChange(setSimBlockage, val);
                    handleRunSimulation(simLevel, simRiseRate, simRain, sim24hRain, val, simUpstream);
                  }}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Debris sediment reduction</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-sky-100 dark:border-navy-800">
              <span className="text-xs text-slate-500">
                {isSimulating ? 'Recalculating AI weights...' : 'Instant live simulation active'}
              </span>
              <button
                onClick={() => handleRunSimulation()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Recalculate Model</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
