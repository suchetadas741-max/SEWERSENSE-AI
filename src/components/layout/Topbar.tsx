import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { TabType } from '../../types';
import { audio } from '../../utils/audio';

interface TopbarProps {
  onNavigateTab: (tab: TabType) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onNavigateTab }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { 
    alerts, 
    acknowledgeAlert, 
    soundEnabled, 
    setSoundEnabled, 
    stormMode, 
    toggleStormMode,
    searchQuery,
    setSearchQuery 
  } = useTelemetry();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.is_acknowledged);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white/75 dark:bg-navy-950/80 backdrop-blur-xl border-b border-sky-100/80 dark:border-sky-900/40 select-none">
      {/* Left: Global Search Input */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-sky-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sensors, drainage basins, alert records..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-sky-50/70 dark:bg-navy-900/60 border border-sky-200/50 dark:border-sky-800/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50/60 dark:bg-navy-900/60 border border-sky-200/40 dark:border-sky-800/40 text-[11px] font-mono text-slate-600 dark:text-sky-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentTime || 'Syncing...'}</span>
        </div>

        {/* Storm Simulation Quick Button */}
        <button
          onClick={toggleStormMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            stormMode
              ? 'bg-rose-600 text-white shadow-rose-500/30 animate-pulse'
              : 'bg-sky-100 hover:bg-sky-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-sky-800 dark:text-sky-300'
          }`}
          title="Toggle Storm Surge Simulation"
        >
          {stormMode ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-brand-500" />}
          <span className="hidden sm:inline">{stormMode ? 'Surge Active' : 'Storm Surge Sim'}</span>
        </button>

        {/* Audio Siren Mute Toggle */}
        <button
          onClick={() => {
            audio.playClick();
            setSoundEnabled(!soundEnabled);
          }}
          className={`p-2 rounded-xl transition-all ${
            soundEnabled
              ? 'bg-sky-50 dark:bg-navy-900 text-brand-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-navy-800'
              : 'bg-slate-100 dark:bg-navy-900 text-slate-400 hover:text-slate-600'
          }`}
          title={soundEnabled ? 'Alert Audio On' : 'Alert Audio Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => {
            audio.playClick();
            toggleTheme();
          }}
          className="p-2 rounded-xl bg-sky-50 dark:bg-navy-900 hover:bg-sky-100 dark:hover:bg-navy-800 text-slate-600 dark:text-sky-300 transition-all border border-sky-100 dark:border-sky-900/40"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              audio.playClick();
              setShowNotifications(!showNotifications);
            }}
            className="relative p-2 rounded-xl bg-sky-50 dark:bg-navy-900 hover:bg-sky-100 dark:hover:bg-navy-800 text-slate-600 dark:text-sky-300 transition-all border border-sky-100 dark:border-sky-900/40"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-navy-900 border border-sky-100 dark:border-sky-800 shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 bg-sky-50/70 dark:bg-navy-950/80 border-b border-sky-100 dark:border-sky-800/50">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-brand-600 dark:text-cyan-accent" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Drainage Alerts ({alerts.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigateTab('alerts');
                  }}
                  className="text-[11px] font-semibold text-brand-600 dark:text-cyan-accent hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="p-3 hover:bg-sky-50/40 dark:hover:bg-navy-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          alert.priority === 'CRITICAL' ? 'bg-rose-500' :
                          alert.priority === 'HIGH' ? 'bg-amber-500' : 'bg-sky-500'
                        }`} />
                        <span className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                          {alert.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-navy-800">
                      <span className="text-[10px] text-slate-400">{alert.zone_name}</span>
                      {!alert.is_acknowledged ? (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-sky-300"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Popover */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sky-50 dark:hover:bg-navy-900 border border-transparent hover:border-sky-100 dark:hover:border-sky-800 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user ? user.full_name.charAt(0) : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-navy-900 border border-sky-100 dark:border-sky-800 shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-navy-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-100 dark:bg-navy-800 text-sky-700 dark:text-sky-300">
                  {user?.role}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateTab('settings');
                  }}
                  className="flex items-center w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-navy-800 rounded-xl"
                >
                  <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    audio.playClick();
                    logout();
                  }}
                  className="flex items-center w-full px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
