import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  MapPin, 
  Cpu, 
  BarChart3, 
  Bell, 
  HelpCircle, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Droplets
} from 'lucide-react';
import { TabType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTelemetry } from '../../context/TelemetryContext';
import { audio } from '../../utils/audio';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { alerts } = useTelemetry();

  const unreadAlerts = alerts.filter(a => !a.is_acknowledged).length;

  const navItems = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'live-monitoring' as TabType, label: 'Live Monitoring', icon: Activity },
    { id: 'ai-prediction' as TabType, label: 'AI Flood Prediction', icon: BrainCircuit },
    { id: 'drainage-map' as TabType, label: 'Drainage Network Map', icon: MapPin },
    { id: 'sensor-management' as TabType, label: 'Sensor Management', icon: Cpu },
    { id: 'analytics-reports' as TabType, label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'alerts' as TabType, label: 'Alerts & Notifications', icon: Bell, badge: unreadAlerts },
    { id: 'help-centre' as TabType, label: 'Help Centre', icon: HelpCircle },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (id: TabType) => {
    audio.playClick();
    onSelectTab(id);
  };

  const handleLogout = () => {
    audio.playClick();
    logout();
  };

  return (
    <aside
      className={`relative flex flex-col h-screen transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      } bg-white/80 dark:bg-navy-900/90 backdrop-blur-xl border-r border-sky-100 dark:border-sky-900/40 shadow-sm`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-sky-100/80 dark:border-sky-900/40">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleTabClick('overview')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-cyan-accent shadow-md shadow-brand-500/30 flex-shrink-0">
            <Droplets className="w-5 h-5 text-white animate-pulse-slow" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-20 pointer-events-none" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-sky-500 dark:from-sky-300 dark:to-cyan-accent bg-clip-text text-transparent truncate">
                SewerSense AI
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-sky-300/60 uppercase tracking-wider truncate">
                Urban Flood Intel
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl hover:bg-sky-50 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-600 dark:hover:text-sky-300 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`group relative flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-brand-500/15 to-sky-400/10 text-brand-700 dark:text-cyan-accent font-semibold shadow-sm border border-brand-200/50 dark:border-brand-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50/70 dark:hover:bg-navy-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-500 dark:bg-cyan-accent shadow-glow-cyan" />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive ? 'text-brand-600 dark:text-cyan-accent' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-sky-300'
              }`} />
              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-auto flex items-center justify-center font-mono font-bold text-[10px] rounded-full transition-all ${
                    collapsed
                      ? 'absolute top-1 right-1 w-3 h-3 bg-rose-500'
                      : 'px-2 py-0.5 bg-rose-500 text-white shadow-sm'
                  }`}
                >
                  {collapsed ? '' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-sky-100/80 dark:border-sky-900/40">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2 rounded-xl bg-sky-50/60 dark:bg-navy-800/50 border border-sky-100/50 dark:border-sky-900/30 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
              {user.full_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 dark:text-sky-300/70 truncate">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
