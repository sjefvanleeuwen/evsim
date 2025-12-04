import React from 'react';
import type { VehicleSettings, ConnectorType } from './VehicleControls';

interface ConnectorProps {

  name: string;
  id: ConnectorType;
  type: 'AC' | 'DC';
  phases: number | string;
  voltage: string;
  current: string;
  power: string;
  description: string;
  svg: React.ReactNode;
  onSimulate: (settings: VehicleSettings) => void;
}

const ConnectorCard: React.FC<ConnectorProps> = ({ name, id, type, phases, voltage, current, power, description, svg, onSimulate }) => {
  
  const handleSimulate = () => {
    // Define default simulation parameters for each connector
    let simPhases: 1 | 3 = 1;
    let simCurrent = 16;

    if (id === 'Type 2') {
      simPhases = 3;
      simCurrent = 32; // 22kW
    } else if (id === 'CCS2') {
      simPhases = 1; // DC doesn't use phases in the same way for calc, but let's keep it simple
      simCurrent = 150; // High current for DC
    } else if (id === 'CHAdeMO') {
      simPhases = 1;
      simCurrent = 125;
    } else if (id === 'Schuko') {
      simPhases = 1;
      simCurrent = 10; // 2.3kW
    }

    onSimulate({
      connector: id,
      type: type,
      phases: simPhases,
      maxCurrent: simCurrent
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex flex-col gap-4 hover:border-blue-500 transition-colors group">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{name}</h3>
          <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${type === 'AC' ? 'bg-blue-900 text-blue-300' : 'bg-orange-900 text-orange-300'}`}>
            {type} Charging
          </span>
        </div>
        <div className="w-24 h-24 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 p-2 group-hover:border-blue-500/50 transition-colors">
          {svg}
        </div>
      </div>
      
      <p className="text-gray-400 text-sm">{description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-900 p-2 rounded">
          <span className="text-gray-500 block text-xs">Phases</span>
          <span className="text-gray-200">{phases}</span>
        </div>
        <div className="bg-gray-900 p-2 rounded">
          <span className="text-gray-500 block text-xs">Max Power</span>
          <span className="text-gray-200">{power}</span>
        </div>
        <div className="bg-gray-900 p-2 rounded">
          <span className="text-gray-500 block text-xs">Voltage</span>
          <span className="text-gray-200">{voltage}</span>
        </div>
        <div className="bg-gray-900 p-2 rounded">
          <span className="text-gray-500 block text-xs">Max Current</span>
          <span className="text-gray-200">{current}</span>
        </div>
      </div>

      <button 
        onClick={handleSimulate}
        className="mt-auto w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        Simulate Charging
      </button>
    </div>
  );
};

interface ConnectorsPageProps {
  onSelectConnector: (settings: VehicleSettings) => void;
}

export const ConnectorsPage: React.FC<ConnectorsPageProps> = ({ onSelectConnector }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950 text-white p-8 font-sans">

      <header className="mb-8 flex items-center gap-4 border-b border-gray-800 pb-6">

        <div>
          <h1 className="text-3xl font-bold text-blue-400">EU Connector Standards</h1>
          <p className="text-gray-400">Common charging interfaces in Europe (IEC 62196)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Type 2 (Mennekes) */}
        <ConnectorCard 
          name="Type 2 (Mennekes)"
          id="Type 2"
          type="AC"
          phases="1 or 3"
          voltage="230V / 400V"
          current="Up to 63A"
          power="Up to 43 kW"
          description="The European standard for AC charging. Supports both single-phase and three-phase charging. Found on almost all modern EVs in Europe."
          onSimulate={onSelectConnector}
          svg={
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              {/* Housing */}
              <path d="M 20 30 A 30 30 0 0 1 80 30 L 80 70 A 30 30 0 0 1 20 70 Z" />
              {/* Pins */}
              <circle cx="50" cy="25" r="4" fill="currentColor" /> {/* PP */}
              <circle cx="30" cy="35" r="5" fill="currentColor" /> {/* L1 */}
              <circle cx="70" cy="35" r="5" fill="currentColor" /> {/* L2 */}
              <circle cx="25" cy="55" r="5" fill="currentColor" /> {/* L3 */}
              <circle cx="75" cy="55" r="5" fill="currentColor" /> {/* N */}
              <circle cx="50" cy="50" r="4" fill="currentColor" /> {/* CP */}
              <circle cx="50" cy="75" r="5" fill="currentColor" /> {/* PE */}
            </svg>
          }
        />

        {/* CCS2 */}
        <ConnectorCard 
          name="CCS2 (Combo 2)"
          id="CCS2"
          type="DC"
          phases="N/A (DC)"
          voltage="200V - 1000V"
          current="Up to 500A"
          power="Up to 350 kW+"
          description="The standard for high-power DC fast charging in Europe. Combines the Type 2 upper section (for signaling) with two large DC pins."
          onSimulate={onSelectConnector}
          svg={
            <svg viewBox="0 0 100 140" className="w-full h-full text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              {/* Type 2 Top Part */}
              <path d="M 20 30 A 30 30 0 0 1 80 30 L 80 60 L 20 60 Z" />
              <circle cx="50" cy="25" r="4" fill="currentColor" /> {/* PP */}
              <circle cx="50" cy="50" r="4" fill="currentColor" /> {/* CP */}
              <circle cx="50" cy="75" r="5" fill="currentColor" /> {/* PE */}
              
              {/* DC Bottom Part */}
              <path d="M 15 60 L 85 60 L 85 100 A 35 35 0 0 1 15 100 Z" />
              <circle cx="35" cy="95" r="12" fill="currentColor" /> {/* DC- */}
              <circle cx="65" cy="95" r="12" fill="currentColor" /> {/* DC+ */}
            </svg>
          }
        />

        {/* CHAdeMO */}
        <ConnectorCard 
          name="CHAdeMO"
          id="CHAdeMO"
          type="DC"
          phases="N/A (DC)"
          voltage="Up to 500V"
          current="Up to 400A"
          power="Up to 62.5 kW (typ)"
          description="Japanese DC charging standard, still common in Europe (Nissan Leaf, older EVs). Being phased out in favor of CCS2."
          onSimulate={onSelectConnector}
          svg={
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="50" cy="50" r="45" />
              <circle cx="30" cy="35" r="8" fill="currentColor" />
              <circle cx="70" cy="35" r="8" fill="currentColor" />
              <circle cx="30" cy="65" r="8" fill="currentColor" />
              <circle cx="70" cy="65" r="8" fill="currentColor" />
              {/* Small signal pins */}
              <circle cx="50" cy="20" r="3" />
              <circle cx="50" cy="80" r="3" />
              <circle cx="20" cy="50" r="3" />
              <circle cx="80" cy="50" r="3" />
            </svg>
          }
        />

        {/* Schuko */}
        <ConnectorCard 
          name="Schuko (Type F)"
          id="Schuko"
          type="AC"
          phases="1"
          voltage="230V"
          current="10A - 16A"
          power="2.3 - 3.7 kW"
          description="Standard domestic socket in many EU countries. Used for emergency charging ('Granny cable'). Very slow."
          onSimulate={onSelectConnector}
          svg={

            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="50" cy="50" r="40" />
              <circle cx="30" cy="50" r="6" fill="currentColor" />
              <circle cx="70" cy="50" r="6" fill="currentColor" />
              {/* Ground clips */}
              <path d="M 50 10 L 50 25" strokeWidth="4" />
              <path d="M 50 75 L 50 90" strokeWidth="4" />
            </svg>
          }
        />

      </div>
    </div>
  );
};
