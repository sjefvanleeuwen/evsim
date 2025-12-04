import React from 'react';

export const IdleView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6 text-center">
      <div className="mb-6">
        <svg className="w-24 h-24 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-3">Welcome</h1>
      <p className="text-lg text-gray-300 mb-6">Please plug in your vehicle to start charging</p>
      
      <div className="mt-auto w-full border-t border-gray-700 pt-4 flex justify-between text-sm text-gray-400">
        <span>$0.35 / kWh</span>
        <span>ID: CP-001</span>
      </div>
    </div>
  );
};
