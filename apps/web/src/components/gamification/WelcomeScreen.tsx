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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">1. System Failure Detected</strong>
                Reboot a critical charger in Amsterdam.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">2. Capacity Alert</strong>
                Approve infrastructure expansion for a busy site.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">3. Revenue Audit</strong>
                Verify a high-value VIP session.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">4. Forensic Analysis</strong>
                Flag a suspicious zero-cost session.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">5. Protocol Omega</strong>
                Hack into a locked charger terminal.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">6. Safety Override</strong>
                Perform an emergency stop on a dangerous unit.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">7. Sales Pipeline</strong>
                Configure a quote for a major B2B client.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">8. Remote Operator</strong>
                Force start a session from the Network Map.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">9. Quality Assurance</strong>
                Simulate a test charge with a Type 2 connector.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">10. Domain Architect</strong>
                Map the ecosystem to DDD bounded contexts.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">11. Grid Protection</strong>
                Prevent a blackout using HEMS load balancing.
            </div>
            <div className="p-2 bg-gray-900/50 rounded border border-gray-800">
                <strong className="text-green-400 block">12. Peak Shaver</strong>
                Save the grid with V2G discharge during a DSO alert.
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
             <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                <span>🚀</span> FINAL OBJECTIVE
             </h3>
             <p className="text-gray-300 text-sm">
                As you complete each task, you will unlock a unique <strong>Completion Key</strong> in Mission Control.
                <br/><br/>
                Your ultimate goal: <strong>Gather all keys</strong> from Mission Control and email the complete list to your Game Master (GM) to verify your success and secure the grid permanently.
             </p>
          </div>
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
