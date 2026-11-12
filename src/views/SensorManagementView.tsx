import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Sensor } from '../types';
import { 
  Cpu, 
  Plus, 
  Edit3, 
  Trash2, 
  Radio, 
  Battery, 
  Wifi, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Search,
  Filter,
  Sliders,
  Server,
  Share2
} from 'lucide-react';
import { audio } from '../utils/audio';

export const SensorManagementView: React.FC = () => {
  const { sensors, createSensor, updateSensor, deleteSensor, calibrateSensor } = useTelemetry();
  
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTxt, setSearchTxt] = useState<string>('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [calibratingId, setCalibratingId] = useState<string | null>(null);
  const [calibOffset, setCalibOffset] = useState<number>(0.0);
  const [showTopology, setShowTopology] = useState<boolean>(true);

  // New Sensor form state
  const [newId, setNewId] = useState(`SS-SEN-${100 + sensors.length + 1}`);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newType, setNewType] = useState('Ultrasonic Water Level');
  const [newConn, setNewConn] = useState('LoRaWAN');
  const [newLat, setNewLat] = useState(1.2950);
  const [newLng, setNewLng] = useState(103.8540);

  const filteredSensors = sensors.filter(s => {
    const matchesFilter = filterType === 'ALL' || s.sensor_type.includes(filterType) || s.status === filterType.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchTxt.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTxt.toLowerCase()) || 
                          s.location_name.toLowerCase().includes(searchTxt.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName || !newLocation) {
      alert('Please fill out all required fields.');
      return;
    }

    await createSensor({
      id: newId,
      name: newName,
      location_name: newLocation,
      sensor_type: newType,
      connectivity: newConn,
      latitude: Number(newLat),
      longitude: Number(newLng),
      battery_pct: 98.0,
      signal_strength_dbm: -70
    });

    setShowAddModal(false);
    setNewName('');
    setNewLocation('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSensor) return;
    await updateSensor(editingSensor.id, {
      name: editingSensor.name,
      location_name: editingSensor.location_name,
      sensor_type: editingSensor.sensor_type,
      connectivity: editingSensor.connectivity,
      battery_pct: editingSensor.battery_pct
    });
    setEditingSensor(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to decommission and remove sensor station ${id}?`)) {
      await deleteSensor(id);
    }
  };

  const handleApplyCalibration = async () => {
    if (!calibratingId) return;
    await calibrateSensor(calibratingId, calibOffset);
    setCalibratingId(null);
    setCalibOffset(0);
    alert(`Zero-datum offset of ${calibOffset}mm applied successfully.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-accent">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              IoT Sensor Fleet & Network Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maintain telemetry calibration, battery charge, LoRaWAN gateways, and transducer health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTopology(!showTopology)}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-white dark:bg-navy-900 border border-sky-100 dark:border-sky-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-navy-800 flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-4 h-4 text-brand-500" />
            <span>{showTopology ? 'Hide Topology' : 'View Network Topology'}</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Sensor</span>
          </button>
        </div>
      </div>

      {/* Visual Network Topology Diagram (Gateway -> BTS -> Edge Nodes) */}
      {showTopology && (
        <section className="p-6 rounded-3xl bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-navy-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-cyan-accent">
                <Share2 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Sensor Mesh Network Topology
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
              Packet Delivery: 99.4% • Avg Latency: 42ms
            </span>
          </div>

          {/* Topology Schematic Visual */}
          <div className="relative py-4 flex flex-col md:flex-row items-center justify-around gap-6">
            {/* Cloud Gateway */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-sky-50 dark:bg-navy-950 border border-sky-200/60 dark:border-sky-800/60 w-44">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 mb-2">
                <Server className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Central Cloud MQTT</span>
              <span className="text-[10px] font-mono text-slate-400">broker.sewersense.ai</span>
            </div>

            {/* Connecting line */}
            <div className="hidden md:flex flex-col items-center text-[10px] font-mono text-brand-500 font-bold">
              <div className="w-16 h-0.5 bg-gradient-to-r from-brand-500 to-sky-400 relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              </div>
              <span className="mt-1">TLS / WSS</span>
            </div>

            {/* Base Station Tower */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-sky-50 dark:bg-navy-950 border border-sky-200/60 dark:border-sky-800/60 w-44">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 mb-2">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">LoRa Gateway & 4G BTS</span>
              <span className="text-[10px] font-mono text-slate-400">Station Marina Alpha</span>
            </div>

            {/* Connecting line */}
            <div className="hidden md:flex flex-col items-center text-[10px] font-mono text-sky-500 font-bold">
              <div className="w-16 h-0.5 bg-gradient-to-r from-sky-400 to-cyan-accent relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-accent animate-ping" />
              </div>
              <span className="mt-1">Sub-GHz RF</span>
            </div>

            {/* Edge Node Cluster */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-sky-50 dark:bg-navy-950 border border-sky-200/60 dark:border-sky-800/60 w-44">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-2">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Edge Sensor Nodes</span>
              <span className="text-[10px] font-mono text-slate-400">{sensors.length} Stations Online</span>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 dark:bg-navy-900/70 border border-sky-100 dark:border-sky-900/40">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            placeholder="Search sensor ID or zone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-sky-50/70 dark:bg-navy-950 border border-sky-200/50 dark:border-sky-800/50 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
          {['ALL', 'Ultrasonic', 'Radar', 'Pressure', 'ONLINE', 'WARNING', 'CRITICAL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === f
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-sky-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Inventory Table */}
      <div className="rounded-3xl bg-white/85 dark:bg-navy-900/85 backdrop-blur-xl border border-sky-100 dark:border-sky-900/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-50/75 dark:bg-navy-950/80 text-[10px] uppercase font-bold text-slate-400 dark:text-sky-400 border-b border-sky-100 dark:border-navy-800">
              <tr>
                <th className="px-5 py-3.5">Sensor ID & Name</th>
                <th className="px-4 py-3.5">Location Basin</th>
                <th className="px-4 py-3.5">Transducer Type</th>
                <th className="px-4 py-3.5">Protocol</th>
                <th className="px-4 py-3.5">Water Depth</th>
                <th className="px-4 py-3.5">Battery</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredSensors.map((s) => {
                const isCrit = s.risk_category === 'CRITICAL';
                const isWarn = s.risk_category === 'WARNING';
                return (
                  <tr key={s.id} className="hover:bg-sky-50/40 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-rose-500 animate-ping' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span>{s.id}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[180px]">
                        {s.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {s.location_name}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {s.sensor_type}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-500 dark:text-slate-400">
                      {s.connectivity}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {s.current_water_level_cm} cm
                    </td>
                    <td className="px-4 py-4 font-mono">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Battery className="w-3.5 h-3.5 text-amber-500" />
                        {s.battery_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCrit ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        isWarn ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {s.risk_category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            audio.playClick();
                            setCalibratingId(s.id);
                          }}
                          className="p-1.5 rounded-lg bg-sky-50 dark:bg-navy-800 text-brand-600 dark:text-sky-300 hover:bg-sky-100"
                          title="Calibrate Zero-Datum Offset"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            audio.playClick();
                            setEditingSensor(s);
                          }}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                          title="Edit Station"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                          title="Decommission Station"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sensor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-900 border border-sky-100 dark:border-sky-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Provision New IoT Sensor Station
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter station telemetry identifier and geospatial coordinates
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Station ID</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Station Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. South Culvert Collector B-02"
                  className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Location Zone</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Marina Spillway Junction"
                  className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Transducer Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white"
                  >
                    <option value="Ultrasonic Water Level">Ultrasonic Water Level</option>
                    <option value="Radar Doppler Depth">Radar Doppler Depth</option>
                    <option value="Submersible Pressure">Submersible Pressure</option>
                    <option value="Optical Rain & Flow">Optical Rain & Flow</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Connectivity</label>
                  <select
                    value={newConn}
                    onChange={(e) => setNewConn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white"
                  >
                    <option value="LoRaWAN">LoRaWAN</option>
                    <option value="4G LTE">4G LTE</option>
                    <option value="NB-IoT">NB-IoT</option>
                    <option value="ESP32 Wi-Fi">ESP32 Wi-Fi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLat}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLng}
                    onChange={(e) => setNewLng(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sky-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold shadow-md shadow-brand-500/25"
                >
                  Provision Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calibration Modal */}
      {calibratingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-navy-900 border border-sky-100 dark:border-sky-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Zero-Datum Calibration: {calibratingId}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Apply a remote datum offset adjustment in millimeters to account for transducer silt accumulation or seasonal drift.
            </p>

            <div className="my-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Acoustic Offset Adjustment (mm)
              </label>
              <input
                type="number"
                value={calibOffset}
                onChange={(e) => setCalibOffset(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-sky-50/50 dark:bg-navy-950 border border-sky-200 dark:border-sky-800 text-slate-900 dark:text-white font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-sky-100 dark:border-navy-800">
              <button
                onClick={() => setCalibratingId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCalibration}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25"
              >
                Apply Calibration Offset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
