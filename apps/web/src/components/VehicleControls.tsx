import React, { useState, useEffect } from 'react';
import { ConnectorIcons } from './ConnectorIcons';

export type ConnectorType = 'Type 2' | 'CCS2' | 'CHAdeMO' | 'Schuko';

export interface VehicleSettings {
  connector: ConnectorType;
  phases: 1 | 3;
  maxCurrent: number; // Amps
  type: 'AC' | 'DC';
  batteryVoltage?: number; // Volts (DC only)
}

interface VehicleControlsProps {
  onPlugIn: (settings: VehicleSettings) => void;
  onUnplug: () => void;
  onUpdate?: (settings: VehicleSettings) => void;
  isPluggedIn: boolean;
  isCharging: boolean;
  lockedConnector?: ConnectorType;
}

export const VehicleControls: React.FC<VehicleControlsProps> = ({ 
  onPlugIn, 
  onUnplug, 
  onUpdate,
  isPluggedIn,
  isCharging,
  lockedConnector = 'Type 2'
}) => {
  const [phases, setPhases] = useState<1 | 3>(3);
  const [maxCurrent, setMaxCurrent] = useState<number>(32);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(400);
  const [calculatedPower, setCalculatedPower] = useState<number>(0);

  // Reset defaults when connector changes
  useEffect(() => {
    if (lockedConnector === 'Schuko') {
      setPhases(1);
      setMaxCurrent(16);
    } else if (lockedConnector === 'Type 2') {
      setPhases(3);
      setMaxCurrent(32);
    } else if (lockedConnector === 'CCS2') {
      setMaxCurrent(200);
      setBatteryVoltage(400);
    } else if (lockedConnector === 'CHAdeMO') {
      setMaxCurrent(125);
      setBatteryVoltage(400);
    }
  }, [lockedConnector]);

  const isDC = lockedConnector === 'CCS2' || lockedConnector === 'CHAdeMO';

  // Notify parent of updates when plugged in
  useEffect(() => {
    if (isPluggedIn && onUpdate) {
      onUpdate({
        connector: lockedConnector,
        phases,
        maxCurrent,
        type: isDC ? 'DC' : 'AC',
        batteryVoltage: isDC ? batteryVoltage : undefined
      });
    }
  }, [maxCurrent, phases, batteryVoltage, isPluggedIn, onUpdate, lockedConnector, isDC]);

  useEffect(() => {
    let powerW = 0;
    if (isDC) {
      // DC Power = V_battery * I
      powerW = batteryVoltage * maxCurrent;
    } else {
      // AC Power = V * I * Phases (V = 230V for EU)
      const voltage = 230;
      powerW = voltage * maxCurrent * phases;
    }
    setCalculatedPower(powerW / 1000); // kW
  }, [phases, maxCurrent, batteryVoltage, isDC]);

  const handlePlugToggle = () => {
    if (isPluggedIn) {
      onUnplug();
    } else {
      onPlugIn({ 
        connector: lockedConnector, 
        phases, 
        maxCurrent, 
        type: isDC ? 'DC' : 'AC',
        batteryVoltage: isDC ? batteryVoltage : undefined
      });
    }
  };

  // Constraints
  const currentLimit = lockedConnector === 'Schuko' ? 16 : 
                       lockedConnector === 'Type 2' ? 63 : 
                       lockedConnector === 'CCS2' ? 500 : 400;
  
  const voltageLimit = lockedConnector === 'CCS2' ? 920 : 500;

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 border-b border-gray-800 pb-2">
        Vehicle Simulation
      </h3>
      
      <div className="flex items-center gap-3 mb-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
        <div className="w-12 h-12 text-blue-400">
          {ConnectorIcons[lockedConnector.replace(' ', '') as keyof typeof ConnectorIcons]}
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Connected Port</div>
          <div className="text-lg font-bold text-white leading-tight">{lockedConnector}</div>
          <div className="text-[10px] text-blue-400 font-mono">
            {isDC ? 'DC Fast Charging' : 'AC Charging'}
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        
        {/* Phases Selection (AC Only) */}
        {!isDC && lockedConnector !== 'Schuko' && (
          <div>
            <label className="block text-[10px] text-gray-500 uppercase mb-1">On-Board Charger Phases</label>
            <div className="flex gap-2 bg-gray-800 p-1 rounded border border-gray-700">
              <button
                onClick={() => setPhases(1)}
                disabled={isPluggedIn}
                className={`flex-1 py-1 rounded text-xs transition font-medium ${
                  phases === 1 ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                } ${isPluggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                1-Phase
              </button>
              <button
                onClick={() => setPhases(3)}
                disabled={isPluggedIn}
                className={`flex-1 py-1 rounded text-xs transition font-medium ${
                  phases === 3 ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                } ${isPluggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                3-Phase
              </button>
            </div>
          </div>
        )}

        {/* Battery Voltage (DC Only) */}
        {isDC && (
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-gray-500 uppercase">Battery Voltage</label>
              <span className="text-[10px] font-mono text-blue-400">{batteryVoltage} V</span>
            </div>
            <input
              type="range"
              min="200"
              max={voltageLimit}
              step="10"
              value={batteryVoltage}
              onChange={(e) => setBatteryVoltage(Number(e.target.value))}
              disabled={isPluggedIn} // Usually fixed for a session, though technically changes slightly with SoC
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
              <span>200V</span>
              <span>{voltageLimit}V</span>
            </div>
          </div>
        )}

        {/* Max Current Slider */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-[10px] text-gray-500 uppercase">
              {isPluggedIn ? 'Requested Current (BMS)' : 'Max Current Capability'}
            </label>
            <span className="text-[10px] font-mono text-blue-400">{maxCurrent} A</span>
          </div>
          <input
            type="range"
            min="6"
            max={currentLimit}
            step="1"
            value={maxCurrent}
            onChange={(e) => setMaxCurrent(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
            <span>6A</span>
            <span>{currentLimit}A</span>
          </div>
        </div>

        {/* Power Preview */}
        <div className="bg-gray-800 rounded p-2 flex justify-between items-center border border-gray-700">
          <span className="text-xs text-gray-400">Theoretical Max Power</span>
          <span className="text-base font-bold text-white font-mono">
            {calculatedPower.toFixed(1)} kW
          </span>
        </div>
      </div>

      <button
        onClick={handlePlugToggle}
        className={`w-full py-3 rounded-lg font-bold text-base transition shadow-lg ${
          isPluggedIn
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
            : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
        }`}
      >
        {isPluggedIn ? 'Unplug Vehicle' : 'Plug In Vehicle'}
      </button>

      {isCharging && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-900/50 rounded text-center">
          <span className="text-green-400 text-sm animate-pulse">⚡ Vehicle Charging Active</span>
        </div>
      )}
    </div>
  );
};
