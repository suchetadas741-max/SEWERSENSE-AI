import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sensor, Alert, FloodPrediction } from '../types';
import { api } from '../utils/api';
import { INITIAL_SENSORS, INITIAL_ALERTS, INITIAL_PREDICTION } from '../data/mockData';
import { audio } from '../utils/audio';

interface TelemetryContextType {
  sensors: Sensor[];
  alerts: Alert[];
  prediction: FloodPrediction;
  stormMode: boolean;
  toggleStormMode: () => void;
  selectedSensor: Sensor | null;
  setSelectedSensor: (sensor: Sensor | null) => void;
  acknowledgeAlert: (id: number) => Promise<void>;
  createSensor: (sensorData: Partial<Sensor>) => Promise<void>;
  updateSensor: (id: string, updates: Partial<Sensor>) => Promise<void>;
  deleteSensor: (id: string) => Promise<void>;
  calibrateSensor: (id: string, offset: number) => Promise<void>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [prediction, setPrediction] = useState<FloodPrediction>(INITIAL_PREDICTION);
  const [stormMode, setStormMode] = useState<boolean>(false);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(INITIAL_SENSORS[0]);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const setSoundEnabled = (val: boolean) => {
    audio.enabled = val;
    setSoundEnabledState(val);
  };

  // Initial fetch from backend API
  const refreshData = useCallback(async () => {
    try {
      const [fetchedSensors, fetchedAlerts, fetchedPred] = await Promise.all([
        api.getSensors(),
        api.getAlerts(),
        api.getCurrentPrediction()
      ]);
      if (fetchedSensors?.length) setSensors(fetchedSensors);
      if (fetchedAlerts?.length) setAlerts(fetchedAlerts);
      if (fetchedPred) setPrediction(fetchedPred);
    } catch (e) {
      console.warn("Backend poll fallback to current state", e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time telemetry ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prevSensors =>
        prevSensors.map(s => {
          const delta = stormMode ? (Math.random() * 2.5 + 0.5) : (Math.random() * 0.8 - 0.4);
          const newLevel = Math.max(15, Math.min(160, s.current_water_level_cm + delta));
          const newRain = stormMode ? Math.min(75, s.rainfall_intensity_mm_hr + Math.random() * 3) : Math.max(5, s.rainfall_intensity_mm_hr + (Math.random() * 2 - 1));
          const newRise = Math.max(0.01, Math.min(2.5, stormMode ? 1.4 + Math.random() * 0.5 : (s.rise_rate_cm_min + (Math.random() * 0.04 - 0.02))));
          
          let risk: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
          let status = s.status;
          if (newLevel > 130 || newRise > 1.2) {
            risk = 'CRITICAL';
            status = 'critical';
          } else if (newLevel > 85 || newRise > 0.6) {
            risk = 'WARNING';
            status = 'warning';
          } else {
            risk = 'NORMAL';
            status = 'online';
          }

          return {
            ...s,
            current_water_level_cm: Math.round(newLevel * 10) / 10,
            rainfall_intensity_mm_hr: Math.round(newRain * 10) / 10,
            rise_rate_cm_min: Math.round(newRise * 100) / 100,
            risk_category: risk,
            status,
            last_ping: new Date().toISOString()
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [stormMode]);

  const toggleStormMode = () => {
    setStormMode(prev => {
      const next = !prev;
      if (next) {
        audio.playCriticalAlert();
        // Inject a simulated surge alert
        const surgeAlert: Alert = {
          id: Date.now(),
          zone_name: "Simulated Metropolitan Storm Surge",
          priority: "CRITICAL",
          title: "Flash Flood Warning: Category 4 Rain Surge",
          description: "Catchment runoff accelerated rapidly. Peak inflow exceeded 5.2 m³/s across low-elevation trunk corridors.",
          suggested_response: "Activate city retention basins. Dispatch maintenance pump crews immediately.",
          is_acknowledged: false,
          created_at: new Date().toISOString()
        };
        setAlerts(old => [surgeAlert, ...old]);
      } else {
        audio.playClick();
      }
      return next;
    });
  };

  const acknowledgeAlert = async (id: number) => {
    audio.playClick();
    await api.acknowledgeAlert(id, "Operator On Duty");
    setAlerts(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              is_acknowledged: true,
              acknowledged_by: "Operator On Duty",
              acknowledged_at: new Date().toISOString()
            }
          : a
      )
    );
  };

  const createSensor = async (sensorData: Partial<Sensor>) => {
    const created = await api.createSensor(sensorData);
    setSensors(prev => [...prev, created]);
    audio.playSuccess();
  };

  const updateSensor = async (id: string, updates: Partial<Sensor>) => {
    await api.updateSensor(id, updates);
    setSensors(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    audio.playSuccess();
  };

  const deleteSensor = async (id: string) => {
    await api.deleteSensor(id);
    setSensors(prev => prev.filter(s => s.id !== id));
    if (selectedSensor?.id === id) setSelectedSensor(null);
    audio.playClick();
  };

  const calibrateSensor = async (id: string, offset: number) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/sensors/${id}/calibrate?offset_mm=${offset}`, { method: 'POST' });
    } catch {}
    audio.playSuccess();
  };

  return (
    <TelemetryContext.Provider
      value={{
        sensors,
        alerts,
        prediction,
        stormMode,
        toggleStormMode,
        selectedSensor,
        setSelectedSensor,
        acknowledgeAlert,
        createSensor,
        updateSensor,
        deleteSensor,
        calibrateSensor,
        soundEnabled,
        setSoundEnabled,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) throw new Error('useTelemetry must be used within TelemetryProvider');
  return context;
};
