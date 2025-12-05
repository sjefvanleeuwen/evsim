import React, { useState } from 'react';
import { useGamification } from '../../lib/gamification/GamificationStore';

interface DomainItem {
  id: string;
  name: string;
  correctDomain: string;
}

interface Domain {
  id: string;
  name: string;
  color: string;
  description: string;
}

const DOMAINS: Domain[] = [
  { id: 'charging', name: 'Charging Domain', color: 'green', description: 'Real-time charging sessions, energy delivery, connector management' },
  { id: 'billing', name: 'Billing Domain', color: 'yellow', description: 'CDRs, pricing, invoicing, revenue, payments' },
  { id: 'asset', name: 'Asset Management', color: 'blue', description: 'Charger lifecycle, maintenance, firmware, installation' },
  { id: 'identity', name: 'Identity & Access', color: 'purple', description: 'RFID, authentication, authorization, user management' },
  { id: 'operations', name: 'Network Operations', color: 'red', description: 'Monitoring, alerts, diagnostics, remote control' },
];

const ITEMS: DomainItem[] = [
  { id: 'ocpp', name: 'OCPP Protocol', correctDomain: 'charging' },
  { id: 'connector_type', name: 'Connector Types (Type 2, CCS)', correctDomain: 'charging' },
  { id: 'energy_meter', name: 'Energy Metering', correctDomain: 'charging' },
  { id: 'session_start', name: 'Session Start/Stop', correctDomain: 'charging' },
  
  { id: 'cdr', name: 'Charge Detail Records', correctDomain: 'billing' },
  { id: 'tariff', name: 'Tariff Management', correctDomain: 'billing' },
  { id: 'invoice', name: 'Invoice Generation', correctDomain: 'billing' },
  { id: 'ocpi_billing', name: 'OCPI CDR Exchange', correctDomain: 'billing' },
  
  { id: 'firmware', name: 'Firmware Updates', correctDomain: 'asset' },
  { id: 'installation', name: 'Installation Orders', correctDomain: 'asset' },
  { id: 'cpq', name: 'CPQ (Configure Price Quote)', correctDomain: 'asset' },
  { id: 'maintenance', name: 'Maintenance Scheduling', correctDomain: 'asset' },
  
  { id: 'rfid', name: 'RFID Authorization', correctDomain: 'identity' },
  { id: 'emsp', name: 'eMSP Roaming', correctDomain: 'identity' },
  { id: 'plug_charge', name: 'Plug & Charge (ISO 15118)', correctDomain: 'identity' },
  { id: 'user_wallet', name: 'User Wallet / App Auth', correctDomain: 'identity' },
  
  { id: 'heartbeat', name: 'Heartbeat Monitoring', correctDomain: 'operations' },
  { id: 'remote_start', name: 'Remote Start/Stop', correctDomain: 'operations' },
  { id: 'diagnostics', name: 'Diagnostics & Alerts', correctDomain: 'operations' },
  { id: 'occupancy', name: 'Occupancy Tracking', correctDomain: 'operations' },
];

interface DDDChallengeProps {
  onComplete: () => void;
  onBack: () => void;
}

export const DDDChallenge: React.FC<DDDChallengeProps> = ({ onComplete, onBack }) => {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);
  const { completeMission } = useGamification();

  // Shuffle items on mount
  const [shuffledItems] = useState(() => {
    const array = [...ITEMS];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  });

  const unplacedItems = shuffledItems.filter(item => !placements[item.id]);
  
  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (domainId: string) => {
    if (draggedItem) {
      const item = ITEMS.find(i => i.id === draggedItem);
      if (item && item.correctDomain !== domainId) {
        setWrongTries(prev => prev + 1);
      }

      setPlacements(prev => ({ ...prev, [draggedItem]: domainId }));
      setDraggedItem(null);
    }
  };

  const handleRemove = (itemId: string) => {
    setPlacements(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const checkAnswers = () => {
    const totalItems = ITEMS.length;
    let correct = 0;
    
    ITEMS.forEach(item => {
      if (placements[item.id] === item.correctDomain) {
        correct++;
      }
    });

    const percentage = Math.round((correct / totalItems) * 100);
    
    if (percentage === 100) {
      setFeedback(`🎉 Perfect! All ${totalItems} items correctly placed!`);
      setIsComplete(true);
      completeMission('ddd_master', { wrongTries });
      onComplete();
    } else {
      setWrongTries(prev => prev + 1);
      if (percentage >= 80) {
        setFeedback(`Almost there! ${correct}/${totalItems} correct (${percentage}%). Review the misplaced items (marked in red).`);
      } else {
        setFeedback(`${correct}/${totalItems} correct (${percentage}%). Keep trying! Incorrect items are marked in red.`);
      }
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'border-green-500 bg-green-900/20';
      case 'yellow': return 'border-yellow-500 bg-yellow-900/20';
      case 'blue': return 'border-blue-500 bg-blue-900/20';
      case 'purple': return 'border-purple-500 bg-purple-900/20';
      case 'red': return 'border-red-500 bg-red-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'blue': return 'text-blue-400';
      case 'purple': return 'text-purple-400';
      case 'red': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
            ← Back to App
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">🏛️ Domain-Driven Design Challenge</h1>
          <div className="flex justify-between items-end">
            <div>
                <p className="text-gray-400 text-lg">
                    Final Mission: Organize the EV charging ecosystem into its correct bounded contexts.
                </p>
                <p className="text-gray-500 mt-2">
                    Drag each concept from the pool below into the appropriate domain. Get 100% to complete the mission!
                </p>
            </div>
            {wrongTries > 0 && (
                <div className="text-red-400 font-mono bg-red-900/20 px-4 py-2 rounded border border-red-900">
                    Failed Attempts: {wrongTries}
                </div>
            )}
          </div>
        </div>

        {/* Domains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {DOMAINS.map(domain => (
            <div
              key={domain.id}
              className={`border-2 rounded-lg p-4 min-h-[250px] transition-all ${getColorClasses(domain.color)} ${
                draggedItem ? 'ring-2 ring-white/20' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(domain.id)}
            >
              <h3 className={`font-bold text-lg mb-1 ${getTextColor(domain.color)}`}>{domain.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{domain.description}</p>
              
              <div className="space-y-2">
                {ITEMS.filter(item => placements[item.id] === domain.id).map(item => (
                  <div
                    key={item.id}
                    className={`px-3 py-2 rounded text-sm text-white flex justify-between items-center group cursor-pointer hover:opacity-80 ${
                        item.correctDomain === domain.id ? 'bg-green-800 border border-green-600' : 'bg-red-800 border border-red-600'
                    }`}
                    onClick={() => handleRemove(item.id)}
                  >
                    <span>{item.name}</span>
                    <span className="text-gray-500 group-hover:text-red-400 text-xs">×</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Unplaced Items Pool */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">
            📦 Concept Pool ({unplacedItems.length} remaining)
          </h3>
          <div className="flex flex-wrap gap-2">
            {unplacedItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white cursor-grab active:cursor-grabbing transition-all hover:scale-105 select-none"
              >
                {item.name}
              </div>
            ))}
            {unplacedItems.length === 0 && (
              <p className="text-gray-500 italic">All items have been placed! Click "Check Answers" to verify.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            {feedback && (
              <div className={`text-lg font-medium ${isComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                {feedback}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setPlacements({})}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Reset All
            </button>
            <button
              onClick={checkAnswers}
              disabled={unplacedItems.length > 0}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                unplacedItems.length > 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              Check Answers
            </button>
          </div>
        </div>

        {/* Completion */}
        {isComplete && (
          <div className="mt-8 p-6 bg-green-900/30 border border-green-700 rounded-lg text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">DDD Master Achieved!</h2>
            <p className="text-gray-300">
              You've demonstrated deep understanding of the EV charging domain architecture.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
