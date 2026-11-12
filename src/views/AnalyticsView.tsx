import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Droplet,
  FileSpreadsheet
} from 'lucide-react';
import { exportSensorsToCSV } from '../utils/export';
import { audio } from '../utils/audio';

export const AnalyticsView: React.FC = () => {
  const { sensors } = useTelemetry();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Multi-period Trend Data for charts
  const weeklyTrends = [
    { day: 'Mon', rainfall_mm: 12.4, avg_depth_cm: 42.0, risk_score: 28 },
    { day: 'Tue', rainfall_mm: 18.2, avg_depth_cm: 55.4, risk_score: 36 },
    { day: 'Wed', rainfall_mm: 48.0, avg_depth_cm: 98.6, risk_score: 72 },
    { day: 'Thu', rainfall_mm: 34.5, avg_depth_cm: 82.1, risk_score: 58 },
    { day: 'Fri', rainfall_mm: 8.0, avg_depth_cm: 45.0, risk_score: 22 },
    { day: 'Sat', rainfall_mm: 14.0, avg_depth_cm: 50.2, risk_score: 30 },
    { day: 'Sun', rainfall_mm: 22.5, avg_depth_cm: 64.0, risk_score: 44 },
  ];

  // Risk Distribution Data for Donut Chart
  const riskDistribution = [
    { name: 'Low Risk (0-30)', value: 45, color: '#10b981' },
    { name: 'Moderate (31-60)', value: 30, color: '#38bdf8' },
    { name: 'High (61-80)', value: 18, color: '#f59e0b' },
    { name: 'Critical (81-100)', value: 7, color: '#ef4444' },
  ];

  // High-Risk Location Rankings
  const locationRankings = [
    { rank: 1, location: 'Riverside Interceptor', riskIndex: 94.2, events: 14, blockage: '68%', status: 'CRITICAL' },
    { rank: 2, location: 'Marina Bay Spillway', riskIndex: 78.5, events: 9, blockage: '45%', status: 'HIGH' },
    { rank: 3, location: 'Metro Underpass Siphon 04', riskIndex: 64.0, events: 7, blockage: '32%', status: 'WARNING' },
    { rank: 4, location: 'Central Trunk Outfall', riskIndex: 38.2, events: 3, blockage: '18%', status: 'NORMAL' },
    { rank: 5, location: 'East Industrial Sluice', riskIndex: 25.0, events: 1, blockage: '15%', status: 'NORMAL' },
  ];

  const handleExportCSV = () => {
    audio.playSuccess();
    exportSensorsToCSV(sensors);
  };

  const handlePrint = () => {
    audio.playClick();
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hydro-Analytics & Municipal Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical rainfall accumulation, hydraulic surcharge analysis & blockage vulnerability rankings
          </p>
        </div>

        {/* Action Buttons: CSV & Print */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-navy-900 hover:bg-sky-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 border border-sky-100 dark:border-sky-800 text-xs font-semibold shadow-sm transition-all"
            title="Download CSV Telemetry Export"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all"
            title="Print or Save PDF Municipal Report"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 dark:bg-navy-900/70 border border-sky-100 dark:border-sky-900/40">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Range:</span>
          <div className="flex items-center gap-1 bg-sky-50 dark:bg-navy-950 p-1 rounded-xl">
            {(['24h', '7d', '30d', '1y'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-accent shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Catchment:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
          >
            <option value="ALL">All Metropolitan Basins</option>
            <option value="Downtown">Downtown Commercial Trunk</option>
            <option value="Marina">Marina Bay Spillway</option>
            <option value="Riverside">Riverside Lowland Basin</option>
          </select>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekly Water Depth vs Risk Variation */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hydraulic Depth & Flood Risk Surcharge Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Average water depth curve vs composite risk score (0-100)
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">7-Day Aggregation</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 110]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a1128', 
                    borderColor: '#0284c7', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px' 
                  }} 
                />
                <Area type="monotone" dataKey="avg_depth_cm" stroke="#0284c7" strokeWidth={2.5} fill="url(#depthGrad)" name="Average Depth (cm)" />
                <Area type="monotone" dataKey="risk_score" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" fill="transparent" name="Risk Score Index" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Flood-Risk Distribution Donut */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Annual Risk Distribution (%)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Historical hours categorized by flood threat level
            </p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a1128', 
                      borderColor: '#38bdf8', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-sky-100 dark:border-navy-800">
            {riskDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-Risk Drainage Location Vulnerability Rankings */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-navy-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Top 5 High-Risk Drainage Corridors & Blockage Rankings
            </h3>
          </div>
          <span className="text-xs text-slate-400">Prioritized for Desiltation Crews</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-50/50 dark:bg-navy-950/50 text-[10px] uppercase font-bold text-slate-400 dark:text-sky-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Location Basin</th>
                <th className="px-4 py-3">Cumulative Risk Index</th>
                <th className="px-4 py-3">Debris Siltation</th>
                <th className="px-4 py-3">Historical Flood Inundations</th>
                <th className="px-4 py-3">Threat Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {locationRankings.map(item => (
                <tr key={item.rank} className="hover:bg-sky-50/30 dark:hover:bg-navy-800/30">
                  <td className="px-4 py-3 font-bold font-mono text-brand-600 dark:text-cyan-accent">
                    #{item.rank}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {item.location}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">
                    {item.riskIndex} / 100
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                    {item.blockage}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {item.events} recorded events
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      item.status === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      item.status === 'WARNING' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
