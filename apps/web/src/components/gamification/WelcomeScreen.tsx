import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* Logo / Icon */}
        <div className="text-8xl mb-8 animate-pulse">⚡</div>
        
        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-4">
          EV Escape Room
        </h1>
        <p className="text-xl text-green-400 mb-8 font-mono">
          ChargePoint Network Operations Center
        </p>

        {/* Story */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8 text-left space-y-4">
          <p className="text-gray-300">
            <span className="text-yellow-400 font-bold">INCOMING TRANSMISSION...</span>
          </p>
          <p className="text-gray-300">
            Agent, you've been recruited to the ChargePoint Network Operations Center. 
            Our EV charging network across the Netherlands is experiencing... 
            <span className="text-red-400">anomalies</span>.
          </p>
          <p className="text-gray-300">
            Chargers are faulting. Suspicious sessions are appearing. A VIP customer is 
            demanding answers. And somewhere in Rotterdam, a charger has gone completely 
            <span className="text-yellow-400"> rogue</span>.
          </p>
          <p className="text-gray-300">
            Your mission? Navigate our systems, investigate the incidents, and restore 
            order to the grid. Oh, and try not to cause a city-wide blackout. 
            <span className="text-gray-500 italic"> (We had an intern do that once. Very awkward.)</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span>📋</span> Mission Briefing
          </h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400">▸</span>
              <span>Use the <strong>navigation bar</strong> to access different systems</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">▸</span>
              <span>The <strong>Mission Control</strong> panel (bottom-right) tracks your objectives</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">▸</span>
              <span>Click on things. Poke around. <span className="text-gray-500">What's the worst that could happen?</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">▸</span>
              <span>Each completed mission reveals a <strong>unique key</strong> — collect them all!</span>
            </li>
          </ul>
        </div>

        {/* Hints about locations */}
        <div className="text-gray-500 text-sm mb-8">
          <p>Hints: Simulator • Partner Portal • CPQ • Installer App • Connectors Page</p>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-lg shadow-lg shadow-green-900/30 transition-all hover:scale-105 active:scale-95"
        >
          Begin Mission
        </button>

        <p className="mt-6 text-gray-600 text-xs">
          Good luck, Agent. The grid is counting on you. 🔌
        </p>
      </div>
    </div>
  );
};
