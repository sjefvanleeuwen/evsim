import React, { useState, useEffect } from 'react';
import { useGamification } from '../../lib/gamification/GamificationStore';

interface LogEntry {
  id: string;
  timestamp: string;
  protocol: 'MODBUS' | 'EEBUS';
  direction: 'IN' | 'OUT';
  message: string;
  details: any;
}

export const HEMSSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MODBUS' | 'EEBUS'>('MODBUS');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Mission State
  const { completeMission } = useGamification();
  const [loadBalancingEnabled, setLoadBalancingEnabled] = useState(false);
  const [heatPumpOn, setHeatPumpOn] = useState(false);
  const [evCharging, setEvCharging] = useState(true);
  const [gridLoad, setGridLoad] = useState(10); // Amps
  const [fuseTripped, setFuseTripped] = useState(false);
  const GRID_LIMIT = 25; // Amps

  // Peak Shaver Mission State
  const [dsoAlert, setDsoAlert] = useState(false);
  const [v2gEnabled, setV2gEnabled] = useState(false);

  // Simulation effect
  useEffect(() => {
    if (!isConnected || fuseTripped) return;

    const interval = setInterval(() => {
      // Calculate Load
      let currentLoad = 5; // Base load
      if (heatPumpOn) currentLoad += 15; // Heat Pump draws 15A
      if (dsoAlert) currentLoad += 10; // Extra load during peak hours (Cooking/TV)
      
      // EV Logic
      let evDraw = 0;
      if (evCharging) {
          if (v2gEnabled) {
              // V2G Mode: Discharge to support home
              evDraw = -16; // Discharging 16A
          } else if (loadBalancingEnabled) {
              // Smart throttling: Available = Limit - Current
              const available = GRID_LIMIT - currentLoad;
              evDraw = Math.max(0, Math.min(16, available)); // Max 16A charger
          } else {
              evDraw = 16; // Dumb charging always wants 16A
          }
      }
      
      const totalLoad = currentLoad + evDraw;
      setGridLoad(totalLoad);

      // Check Fuse
      if (totalLoad > GRID_LIMIT) {
          setFuseTripped(true);
          setLogs(prev => [{
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toLocaleTimeString(),
              protocol: 'EEBUS',
              direction: 'IN',
              message: 'CRITICAL: GRID OVERLOAD',
              details: { load: totalLoad, limit: GRID_LIMIT }
          }, ...prev]);
          return;
      }

      // Check Mission Success (Peak Shaver)
      if (dsoAlert && v2gEnabled && totalLoad <= 0) {
          completeMission('peak_shaver');
      }

      // Check Mission Success (HEMS Handshake)
      if (heatPumpOn && evCharging && loadBalancingEnabled && totalLoad <= GRID_LIMIT && !dsoAlert) {
          completeMission('hems_handshake');
      }

      // Generate Traffic Logs
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        protocol: activeTab,
        direction: Math.random() > 0.5 ? 'IN' : 'OUT',
        message: activeTab === 'MODBUS' ? 'Read Holding Register 4001' : 'SHIP Data Indication',
        details: activeTab === 'MODBUS' ? { register: 4001, value: 230 } : { type: 'Report', value: `${totalLoad}A` }
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 4000);

    return () => clearInterval(interval);
  }, [isConnected, activeTab, heatPumpOn, evCharging, loadBalancingEnabled, fuseTripped, dsoAlert, v2gEnabled]);

  const resetFuse = () => {
      setFuseTripped(false);
      setHeatPumpOn(false);
      setLogs([]);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-950 text-white p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h1 className="text-3xl font-bold text-blue-400">🏠 HEMS Protocol Simulator</h1>
          <div className="flex gap-2">
             <button
                onClick={() => setDsoAlert(!dsoAlert)}
                className={`px-4 py-2 rounded font-bold ${dsoAlert ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
             >
                {dsoAlert ? '⚠️ DSO PEAK ALERT' : 'Simulate DSO Alert'}
             </button>
             <button
                onClick={() => setIsConnected(!isConnected)}
                className={`px-4 py-2 rounded font-bold ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
             >
                {isConnected ? 'Disconnect' : 'Connect HEMS'}
             </button>
          </div>
        </div>

        {fuseTripped && (
            <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-6 flex justify-between items-center animate-pulse shrink-0">
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                        <h3 className="font-bold text-xl text-white">MAIN FUSE TRIPPED!</h3>
                        <p className="text-red-200">Total load exceeded {GRID_LIMIT}A. The house is dark.</p>
                    </div>
                </div>
                <button 
                    onClick={resetFuse}
                    className="bg-white text-red-900 px-4 py-2 rounded font-bold hover:bg-gray-200"
                >
                    Reset Breaker
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Controls */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 h-full overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Device Configuration</h2>
                
                <div className="flex space-x-2 mb-6 bg-gray-950 p-1 rounded border border-gray-800">
                    <button 
                        onClick={() => setActiveTab('MODBUS')}
                        className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'MODBUS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Modbus TCP (SunSpec)
                    </button>
                    <button 
                        onClick={() => setActiveTab('EEBUS')}
                        className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'EEBUS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        EEBUS (SHIP/SPINE)
                    </button>
                </div>

                {activeTab === 'MODBUS' ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-950 rounded border border-gray-800">
                            <h3 className="font-bold text-yellow-400 mb-2">☀️ Solar Inverter</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="text-gray-500 block">Current Power</label>
                                    <span className="text-xl font-mono">4.2 kW</span>
                                </div>
                                <div>
                                    <label className="text-gray-500 block">Status</label>
                                    <span className="text-green-400">Generating</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-950 rounded border border-gray-800">
                            <h3 className="font-bold text-blue-400 mb-2">🔋 Smart Meter</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="text-gray-500 block">Grid Import</label>
                                    <span className="text-xl font-mono">0.0 kW</span>
                                </div>
                                <div>
                                    <label className="text-gray-500 block">Grid Export</label>
                                    <span className="text-xl font-mono">2.1 kW</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-950 rounded border border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-purple-400">🌡️ Heat Pump</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={heatPumpOn} onChange={e => setHeatPumpOn(e.target.checked)} className="sr-only peer" disabled={!isConnected || fuseTripped} />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Status</span>
                                    <span className={heatPumpOn ? "text-green-400 animate-pulse" : "text-gray-500"}>{heatPumpOn ? "HEATING (15A)" : "IDLE"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-950 rounded border border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-green-400">🚗 EV Charger</h3>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400">Plugged In</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={evCharging} onChange={e => setEvCharging(e.target.checked)} className="sr-only peer" disabled={!isConnected || fuseTripped} />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Dynamic Load Balancing</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={loadBalancingEnabled} onChange={e => setLoadBalancingEnabled(e.target.checked)} className="sr-only peer" disabled={!isConnected || fuseTripped} />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">V2G (Discharge)</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={v2gEnabled} onChange={e => setV2gEnabled(e.target.checked)} className="sr-only peer" disabled={!isConnected || fuseTripped} />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                
                                <div className="bg-black/50 p-3 rounded">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Total Grid Load</span>
                                        <span>Limit: {GRID_LIMIT}A</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full transition-all duration-500 ${gridLoad > GRID_LIMIT ? 'bg-red-600' : gridLoad > 20 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                            style={{ width: `${Math.min(100, (gridLoad / GRID_LIMIT) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-xs font-mono mt-1 text-white">{gridLoad}A</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Traffic Inspector */}
            <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-800 flex flex-col h-full">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold">📡 Traffic Inspector</h2>
                    <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-white">Clear Logs</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
                    {logs.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            No traffic detected. Connect HEMS to start monitoring.
                        </div>
                    )}
                    {logs.map(log => (
                        <div key={log.id} className="flex gap-4 p-2 hover:bg-gray-800/50 rounded border-b border-gray-800/50">
                            <span className="text-gray-500 w-20 shrink-0">{log.timestamp}</span>
                            <span className={`w-16 shrink-0 font-bold ${log.protocol === 'MODBUS' ? 'text-yellow-500' : 'text-purple-500'}`}>
                                {log.protocol}
                            </span>
                            <span className={`w-10 shrink-0 font-bold ${log.direction === 'IN' ? 'text-green-400' : 'text-blue-400'}`}>
                                {log.direction === 'IN' ? '←' : '→'}
                            </span>
                            <div className="flex-1">
                                <div className="text-white">{log.message}</div>
                                <div className="text-gray-400 text-xs mt-1">{JSON.stringify(log.details)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
