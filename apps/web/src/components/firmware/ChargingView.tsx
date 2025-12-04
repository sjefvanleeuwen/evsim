import React from 'react';

interface ChargingViewProps {

  energy: number;
  duration: number;
  power: number;
  cost: number;
}

export const ChargingView: React.FC<ChargingViewProps> = ({ energy, duration, power, cost }) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
        <h2 className="text-xl font-bold text-blue-400">Charging in Progress</h2>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          <span className="text-green-500 font-mono text-sm">ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col justify-center items-center border border-gray-700">
          <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Energy Delivered</span>
          <div className="text-4xl font-bold font-mono text-white">
            {energy.toFixed(2)} <span className="text-xl text-gray-500">kWh</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 flex flex-col justify-center items-center border border-gray-700">
          <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Power</span>
          <div className="text-4xl font-bold font-mono text-blue-400">
            {power.toFixed(1)} <span className="text-xl text-gray-500">kW</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 flex flex-col justify-center items-center border border-gray-700">
          <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Duration</span>
          <div className="text-3xl font-bold font-mono text-white">
            {formatTime(duration)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 flex flex-col justify-center items-center border border-gray-700">
          <span className="text-gray-400 text-sm uppercase tracking-wider mb-2">Current Cost</span>
          <div className="text-4xl font-bold font-mono text-green-400">
            ${cost.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">Press "Stop" on your vehicle or card to end session</p>
      </div>
    </div>
  );
};
