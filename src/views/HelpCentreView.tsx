import React, { useState } from 'react';
import { 
  HelpCircle, 
  Cpu, 
  BrainCircuit, 
  Activity, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Radio, 
  Sun, 
  Battery, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Bell, 
  Server,
  Droplet
} from 'lucide-react';
import { audio } from '../utils/audio';

export const HelpCentreView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      num: 1,
      title: "IoT Sensing Layer",
      desc: "Waterproof ultrasonic transducers (JSN-SR04T) and optical rain gauges measure water depth and precipitation downpour intensity at subterranean drainage junctions.",
      tag: "Edge Capture"
    },
    {
      num: 2,
      title: "Microcontroller Processing",
      desc: "ESP32 / ESP8266 microcontrollers sample acoustic reflections, filter out water surface turbulence noise via moving averages, and packetize readings.",
      tag: "Edge DSP"
    },
    {
      num: 3,
      title: "Secure Telemetry Ingestion",
      desc: "Packets are broadcasted over Sub-GHz LoRaWAN or 4G LTE to the municipal MQTT Broker with TLS encryption and automated schema validation.",
      tag: "Gateway Hub"
    },
    {
      num: 4,
      title: "AI Hydrodynamic Analysis",
      desc: "Physics-informed St. Venant pipe hydraulics determine flow velocity and capacity consumption, fed into an XGBoost ensemble trained on historic urban deluge records.",
      tag: "ML Engine"
    },
    {
      num: 5,
      title: "Explainable Risk Scoring",
      desc: "The system generates an explainable flood hazard score from 0 to 100 with SHAP-style factor importance weights and estimated time-to-crest.",
      tag: "Risk Scoring"
    },
    {
      num: 6,
      title: "3D Geospatial Visualization",
      desc: "The command dashboard renders a live 3D digital twin of the city, animated subsurface pipes, water level variations, and GIS hazard polygons.",
      tag: "Digital Twin"
    },
    {
      num: 7,
      title: "Automated Alert Dispatch",
      desc: "When thresholds exceed warning levels, audio sirens, browser desktop notifications, and maintenance crew work orders trigger simultaneously.",
      tag: "Dispatch Action"
    }
  ];

  const hardwareComponents = [
    {
      name: "ESP32 / ESP8266 MCU",
      icon: Cpu,
      specs: "Dual-core Xtensa 240MHz • Built-in Wi-Fi & BLE • Ultra-low deep-sleep (10µA)",
      desc: "Central processing core reading ultrasonic pulses and executing edge anomaly detection before telemetry transmission."
    },
    {
      name: "Ultrasonic Water Sensor (JSN-SR04T)",
      icon: Activity,
      specs: "IP67 Submersible Probe • 20cm to 600cm range • ±1mm acoustic precision",
      desc: "Mounted inside manhole ceiling facing down toward the sewer invert. Measures time-of-flight of 40kHz ultrasound bursts."
    },
    {
      name: "Tipping Bucket / Optical Rain Gauge",
      icon: Droplet,
      specs: "0.2mm resolution per tip • Anti-debris mesh shield • Self-emptying dual buckets",
      desc: "Records localized precipitation downpour rates in real-time to correlate catchment inflow before subterranean depth spikes."
    },
    {
      name: "SX1278 LoRa / SIM800L Cellular",
      icon: Radio,
      specs: "868/915 MHz Sub-GHz LoRa • Up to 15km range • +20dBm power amplifier",
      desc: "Enables robust long-distance transmission through underground cast-iron manhole covers and concrete conduit slabs."
    },
    {
      name: "High-Decibel Piezo Siren & LED",
      icon: Bell,
      specs: "105dB acoustic horn • Strobe LED beacon • Local relay trigger",
      desc: "Provides immediate on-site audible warning to road pedestrians and municipal maintenance workers during sudden flash floods."
    },
    {
      name: "Solar MPPT & 18650 Li-Ion BMS",
      icon: Sun,
      specs: "5W Monocrystalline PV • Dual 3400mAh 18650 cells • 30 days autonomous standby",
      desc: "Self-sustaining power architecture ensuring continuous telemetry even during extended grid power outages in severe storms."
    }
  ];

  const faqs = [
    {
      q: "How does SewerSense AI detect drain blockages before water starts pooling on streets?",
      a: "SewerSense AI continuously cross-correlates rainfall downpour rates with observed water rise gradients. If water levels in a conduit rise significantly faster than expected under moderate rainfall, or fail to drain at normal velocity once rain subsides, the acoustic attenuation model flags a high probability of sediment, silt, or plastic debris accumulation."
    },
    {
      q: "Can the platform operate in areas without stable Wi-Fi or cellular reception?",
      a: "Yes! SewerSense AI edge nodes utilize long-range, low-power Sub-GHz LoRaWAN (868/915 MHz). A single elevated municipal LoRa gateway covers an entire 10-15 km radius, reliably piercing through subterranean manhole chambers without requiring cellular SIM cards at every node."
    },
    {
      q: "How are false alarms prevented during brief localized water splashes?",
      a: "The ESP32 firmware executes a median moving-average filter over 50 acoustic pings per sample cycle. Outliers and transient surface ripples are automatically discarded before packets reach the AI engine."
    },
    {
      q: "What makes the AI prediction 'explainable'?",
      a: "Unlike black-box models, SewerSense AI calculates SHAP (SHapley Additive exPlanations) attribution scores for each reading. The UI explicitly visualizes how much each factor (Water Depth, Rise Rate, Rainfall, Blockage %, Inflow) contributed to the final 0-100 risk score."
    }
  ];

  const toggleFaq = (idx: number) => {
    audio.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              SewerSense AI — System Architecture & Knowledge Base
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete guide to hardware engineering, edge microcontrollers, hydrodynamic AI models & emergency troubleshooting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-navy-900 text-brand-700 dark:text-cyan-accent border border-sky-100 dark:border-sky-800">
            Municipal Technical Blueprint
          </span>
        </div>
      </div>

      {/* SECTION A: What is SewerSense AI? */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-500/10 via-brand-500/10 to-transparent border border-sky-200/60 dark:border-sky-900/50 backdrop-blur-xl">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-cyan-accent block mb-2">
          SECTION A • EXECUTIVE SUMMARY
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          What is SewerSense AI?
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed max-w-4xl">
          <b>SewerSense AI</b> is a next-generation intelligent urban drainage monitoring and flood early-warning platform designed for municipal governments, smart cities, and stormwater authorities.
          By fusing low-cost autonomous IoT sensors with real-time physics-informed hydrodynamic algorithms and machine learning, SewerSense AI detects subterranean pipe blockages, models hydraulic surcharges, and predicts street flooding <b>30 to 90 minutes before surface ponding occurs</b>.
        </p>
      </section>

      {/* SECTION B: How does the system work? (Animated 7-Step Diagram) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-cyan-accent block mb-1">
              SECTION B • DATA PIPELINE
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              How Does the System Work? (Step-by-Step Architecture)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click any step to inspect</span>
        </div>

        {/* 7-Step Interactive Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
          {steps.map((st) => {
            const isSelected = activeStep === st.num;
            return (
              <button
                key={st.num}
                onClick={() => {
                  audio.playClick();
                  setActiveStep(st.num);
                }}
                className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/30 -translate-y-1'
                    : 'bg-sky-50/50 dark:bg-navy-950/60 hover:bg-sky-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 border-sky-100 dark:border-sky-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-white text-brand-600' : 'bg-brand-100 dark:bg-navy-800 text-brand-700 dark:text-cyan-accent'
                    }`}>
                      {st.num}
                    </span>
                    <span className={`text-[9px] uppercase font-bold tracking-wider opacity-80`}>
                      {st.tag}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold truncate">{st.title}</h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Detailed Inspector */}
        <div className="p-5 rounded-2xl bg-sky-50/80 dark:bg-navy-950/80 border border-sky-200/60 dark:border-sky-800/60">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Step {steps[activeStep - 1].num}: {steps[activeStep - 1].title}
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {steps[activeStep - 1].desc}
          </p>
        </div>
      </section>

      {/* SECTION C: Hardware Explanation */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-cyan-accent block mb-1">
          SECTION C • HARDWARE BLUEPRINT
        </span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          IoT Hardware Modules & Microcontroller Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hardwareComponents.map((hw, idx) => {
            const Icon = hw.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-sky-50/40 dark:bg-navy-950/40 border border-sky-100 dark:border-sky-900/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{hw.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">Component {idx + 1}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {hw.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-sky-100/60 dark:border-navy-800 text-[10px] font-mono text-brand-700 dark:text-sky-300">
                  {hw.specs}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION D & E: AI Explanation & Risk Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION D: AI Explanation */}
        <section className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-cyan-accent block mb-1">
              SECTION D • AI & HYDRAULIC LOGIC
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              How Does the AI Calculate Risk?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              The AI combines empirical <b>Manning's open-channel hydraulic formula</b> with a supervised gradient-boosted regressor:
            </p>

            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-navy-950 font-mono text-[11px] text-slate-800 dark:text-sky-300 mb-4 border border-sky-200/50 dark:border-sky-800/50">
              v = (1/n) × R_h^(2/3) × S^(1/2)<br />
              Risk_Index = Σ (w_i × Feature_i) × (Confidence_Factor)
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <span><b>Water Depth (30% weight):</b> Percentage of conduit vertical headroom consumed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <span><b>Surge Gradient (25% weight):</b> First-derivative dh/dt rate of rise in cm/min.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <span><b>Rainfall Intensity (20% weight):</b> Instantaneous precipitation downpour rate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <span><b>Debris Siltation (10% weight):</b> Acoustic backscatter attenuation indicating pipe blockage.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION E: Understanding Risk Levels */}
        <section className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-cyan-accent block mb-1">
              SECTION E • PROTOCOL TIERS
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Understanding Risk Levels
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                  GREEN • 0 – 30 (NORMAL)
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Drainage operates within laminar design capacity. Routine bi-weekly grate clearance.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 text-xs">
                <span className="font-bold text-sky-800 dark:text-sky-300 block mb-0.5">
                  YELLOW • 31 – 60 (MODERATE)
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Depth &gt; 50% capacity. District maintenance crew alerted to check intake grates.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                  ORANGE • 61 – 80 (HIGH)
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Rapid water surge detected. Auxiliary stormwater retention pumps activated.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs">
                <span className="font-bold text-rose-800 dark:text-rose-300 block mb-0.5">
                  RED • 81 – 100 (CRITICAL)
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Imminent overflow threshold. Municipal traffic diversions and emergency sirens triggered.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION F: Frequently Asked Questions */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-cyan-accent block mb-1">
          SECTION F • KNOWLEDGE BASE
        </span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Frequently Asked Questions (FAQ)
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-sky-100 dark:border-navy-800 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-sky-50/40 dark:bg-navy-950/50 hover:bg-sky-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-navy-900/50 leading-relaxed border-t border-sky-100 dark:border-navy-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION G: Troubleshooting Guide */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-cyan-accent block mb-1">
          SECTION G • OPERATOR PLAYBOOK
        </span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Emergency Operations Troubleshooting Playbook
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-100 dark:border-navy-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Scenario 1: A Sensor Station Disconnects
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If an edge node ceases LoRaWAN heartbeat for &gt; 10 minutes, the watchdog daemon marks its status as 'DEGRADED'. Neighboring stations automatically triangulate water level approximations using upstream-downstream hydrographs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-100 dark:border-navy-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Scenario 2: Internet / Cloud Connectivity Fails
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Edge ESP32 microcontrollers store 72 hours of telemetry in local SPIFFS flash memory. If the backend is unreachable, the frontend automatically activates rich offline simulation mode.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-100 dark:border-navy-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Scenario 3: Sensor Provides Abnormal Readings
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Use the Sensor Management tab to trigger a remote zero-datum acoustic calibration pulse. A pneumatic purge pulse is sent to blast away cobwebs or spider nests from the transducer face.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-navy-950/50 border border-sky-100 dark:border-navy-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Scenario 4: A Critical Alert is Generated
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Immediately click 'Acknowledge' in the Alerts Hub. Deploy quick-response desiltation vacuum trucks to the flagged conduit coordinates and notify municipal traffic police to divert low-lying roadways.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
