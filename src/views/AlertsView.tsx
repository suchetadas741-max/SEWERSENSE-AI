import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { PriorityType } from '../types';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Filter, 
  Send, 
  Volume2, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { audio } from '../utils/audio';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert } = useTelemetry();
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNACK' | 'ACK'>('ALL');
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestBrowserPermission = async () => {
    audio.playClick();
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('SewerSense AI Alerts Enabled', {
          body: 'You will receive instant desktop warnings for rapid stormwater surges and drain blockages.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesPriority = filterPriority === 'ALL' || a.priority === filterPriority;
    const matchesStatus = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'UNACK' ? !a.is_acknowledged : a.is_acknowledged;
    return matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Alerts & Dispatch Centre
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated threshold triggers, flood surge escalations & municipal maintenance response protocols
          </p>
        </div>

        {/* Browser Push Notifications Button */}
        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' ? (
            <button
              onClick={requestBrowserPermission}
              className="px-3.5 py-2 rounded-2xl bg-sky-50 dark:bg-navy-900 hover:bg-sky-100 dark:hover:bg-navy-800 border border-sky-200 dark:border-sky-800 text-brand-700 dark:text-cyan-accent text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Enable Browser Push Alerts</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Push Notifications Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 dark:bg-navy-900/70 border border-sky-100 dark:border-sky-900/40">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority:</span>
          <div className="flex items-center gap-1">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterPriority === p
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-sky-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-sky-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Status:</span>
          <div className="flex items-center gap-1 bg-sky-50 dark:bg-navy-950 p-1 rounded-xl">
            {(['ALL', 'UNACK', 'ACK'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === s
                    ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-accent shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {s === 'ALL' ? 'All Alerts' : s === 'UNACK' ? 'Unacknowledged' : 'Resolved'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed Cards */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-navy-900/60 border border-sky-100 dark:border-sky-900/40">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">All Clear in Metropolitan Basins</h4>
            <p className="text-xs text-slate-400 mt-1">No alerts match the active filter criteria.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCrit = alert.priority === 'CRITICAL';
            const isHigh = alert.priority === 'HIGH';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl backdrop-blur-xl border transition-all ${
                  isCrit
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : isHigh
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                    : 'bg-white/80 dark:bg-navy-900/80 border-sky-100 dark:border-sky-900/40'
                } shadow-sm hover:shadow-md`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCrit ? 'bg-rose-500 text-white animate-pulse' :
                        isHigh ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'
                      }`}>
                        {alert.priority}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-sky-300">
                        {alert.zone_name}
                      </span>
                      {alert.sensor_id && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                          Sensor: {alert.sensor_id}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white pt-1">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Suggested Municipal Response */}
                    <div className="mt-3 p-3 rounded-2xl bg-white/70 dark:bg-navy-950/60 border border-slate-200/60 dark:border-navy-700/60 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-cyan-accent block mb-1">
                        Mandated Emergency Action:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {alert.suggested_response}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 flex-shrink-0">
                    {!alert.is_acknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Acknowledge & Dispatch Crew</span>
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          By: {alert.acknowledged_by || 'Officer On Duty'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
