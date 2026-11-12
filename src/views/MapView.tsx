import React from 'react';
import { DrainageMap } from '../components/map/DrainageMap';
import { MapPin, Layers, Info, ShieldAlert } from 'lucide-react';

export const MapView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
              <MapPin className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Interactive GIS Drainage Network Map
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geospatial IoT telemetry stations, subterranean stormwater trunk conduits, and low-lying waterlogging hazard zones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 text-slate-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800 shadow-sm">
            Map Projection: EPSG:3857 (WGS 84)
          </span>
        </div>
      </div>

      {/* Full-width Map Container */}
      <DrainageMap />

      {/* Legend & Geospatial Guidance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex items-start gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">Safe Conditions (Green)</span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Conduit water level &lt; 50% capacity. Flow velocity within laminar design parameters.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex items-start gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">Moderate Warning (Yellow)</span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Depth between 50%–80% capacity or rapid rise rate detected. Maintenance crews notified.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex items-start gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 mt-1 flex-shrink-0 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">Critical Surcharge (Red)</span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Conduit exceeds 85% depth capacity. Imminent risk of street-level manhole ejection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
