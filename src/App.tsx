import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TelemetryProvider } from './context/TelemetryContext';
import { TabType } from './types';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

// Views
import { AuthView } from './views/AuthView';
import { OverviewView } from './views/OverviewView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { PredictionView } from './views/PredictionView';
import { MapView } from './views/MapView';
import { SensorManagementView } from './views/SensorManagementView';
import { AnalyticsView } from './views/AnalyticsView';
import { AlertsView } from './views/AlertsView';
import { HelpCentreView } from './views/HelpCentreView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('overview');

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-sky-300">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-600 shadow-xl shadow-brand-500/30 animate-pulse">
          <div className="w-8 h-8 rounded-full border-3 border-white border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 font-bold text-sm tracking-wider uppercase">Loading SewerSense AI...</p>
      </div>
    );
  }

  // 1. Mandatory First Screen: Authentication
  if (!isAuthenticated) {
    return <AuthView />;
  }

  // 2. Main Authenticated Command Dashboard
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Collapsible Sidebar with 10 sections */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar onNavigateTab={setCurrentTab} />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 scrollbar-thin scrollbar-thumb-sky-200 dark:scrollbar-thumb-navy-800">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && <OverviewView onNavigateTab={setCurrentTab} />}
            {currentTab === 'live-monitoring' && <LiveMonitoringView />}
            {currentTab === 'ai-prediction' && <PredictionView />}
            {currentTab === 'drainage-map' && <MapView />}
            {currentTab === 'sensor-management' && <SensorManagementView />}
            {currentTab === 'analytics-reports' && <AnalyticsView />}
            {currentTab === 'alerts' && <AlertsView />}
            {currentTab === 'help-centre' && <HelpCentreView />}
            {currentTab === 'settings' && <SettingsView />}
          </div>

          {/* Municipal Platform Footer */}
          <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-sky-100 dark:border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide uppercase text-slate-700 dark:text-slate-300">
                SewerSense AI
              </span>
              <span>—</span>
              <span className="font-semibold text-brand-600 dark:text-cyan-accent">
                "SEE THE RISK. PREDICT THE FLOOD. PROTECT THE CITY."
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Municipal Smart-City Infrastructure</span>
              <span>•</span>
              <span className="font-mono text-[11px]">System Status: Operational</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TelemetryProvider>
          <MainLayout />
        </TelemetryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
