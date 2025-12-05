import React from 'react';

interface SummaryViewProps {
  energy: number;
  duration: number;
  cost: number;
  onClose: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ energy, duration, cost, onClose }) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-6">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Session Complete</h2>
          <p className="text-gray-400 text-sm">Thank you for charging</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="text-gray-400 text-sm">Total Energy</span>
            <span className="font-mono text-lg">{energy.toFixed(2)} kWh</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="text-gray-400 text-sm">Duration</span>
            <span className="font-mono text-lg">{formatTime(duration)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="text-gray-400 text-sm">Total Cost</span>
            <span className="font-mono text-xl text-green-400">€{cost.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};
