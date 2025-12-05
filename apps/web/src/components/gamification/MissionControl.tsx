import React, { useState } from 'react';
import { useGamification } from '../../lib/gamification/GamificationStore';
import { Modal } from '../common/Modal';

export const MissionControl: React.FC = () => {
  const { missions, isComplete, completionCode, resetSession } = useGamification();
  const [minimized, setMinimized] = useState(false);
  const [hasMinimized, setHasMinimized] = useState(false);
  const [hasMaximized, setHasMaximized] = useState(false);
  const [modal, setModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {hasMinimized && !hasMaximized && (
            <div className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-bounce mr-2">
                Click to expand ↗
            </div>
        )}
        <button 
            onClick={() => {
                setMinimized(false);
                setHasMaximized(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 border border-blue-500/30 rounded-lg shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">Mission Control</h3>
        </div>
        <div className="flex items-center gap-2">
            {!hasMinimized && (
                <div className="text-[10px] text-blue-300 animate-pulse">
                    You can minimize this &rarr;
                </div>
            )}
            <button 
                onClick={() => {
                    setMinimized(true);
                    setHasMinimized(true);
                }} 
                className="text-gray-400 hover:text-white"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {!isComplete ? (
          <>
            <p className="text-xs text-blue-300 mb-2">
              CRITICAL ALERT: Network instability detected. Resolve active incidents to restore grid integrity.
            </p>
            <div className="space-y-3">
              {missions.map(mission => (
                <div 
                  key={mission.id} 
                  className={`p-3 rounded border ${
                    mission.completed 
                      ? 'bg-green-900/20 border-green-800' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm font-bold ${mission.completed ? 'text-green-400' : 'text-white'}`}>
                      {mission.title}
                    </h4>
                    {mission.completed && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{mission.description}</p>
                  {mission.completed && mission.completionKey && (
                    <div className="mt-2 bg-black/50 p-2 rounded border border-green-900 flex justify-between items-center">
                        <code className="text-[10px] text-green-400 font-mono break-all mr-2">{mission.completionKey}</code>
                        <button 
                            onClick={() => navigator.clipboard.writeText(mission.completionKey || '')}
                            className="text-xs bg-green-900 hover:bg-green-800 text-green-100 px-2 py-1 rounded transition-colors"
                            title="Copy Key"
                        >
                            Copy
                        </button>
                    </div>
                  )}
                  {!mission.completed && (
                    <div className="mt-2 text-[10px] text-blue-400 uppercase font-mono">
                      Hint: {mission.hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="inline-block p-3 bg-green-900/30 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mission Accomplished!</h3>
            <p className="text-sm text-gray-400 mb-4">
              Grid stability restored. Excellent work, Operator.
            </p>
            
            <div className="bg-black p-4 rounded border border-green-500/50 font-mono text-center mb-4">
              <div className="text-xs text-green-600 mb-1">MASTER VERIFICATION CODE</div>
              <div className="text-lg text-green-400 font-bold break-all select-all">
                {completionCode}
              </div>
            </div>

            <div className="space-y-2 text-left">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Mission Keys</h4>
                {missions.map(m => (
                    <div key={m.id} className="flex justify-between items-center bg-gray-800 p-2 rounded border border-gray-700">
                        <span className="text-xs text-gray-300 truncate w-1/3">{m.title}</span>
                        <code className="text-[10px] text-green-400 font-mono truncate w-1/2">{m.completionKey}</code>
                        <button 
                            onClick={() => navigator.clipboard.writeText(m.completionKey || '')}
                            className="text-xs text-blue-400 hover:text-white"
                        >
                            Copy
                        </button>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Send these codes to your supervisor to complete onboarding.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex justify-between items-center">
        <button
            onClick={() => {
                const allKeys = missions
                    .filter(m => m.completed && m.completionKey)
                    .map(m => `${m.title}: ${m.completionKey}`)
                    .join('\n');
                if (allKeys) {
                    navigator.clipboard.writeText(allKeys);
                    setModal({
                        isOpen: true,
                        title: 'Success',
                        message: 'All keys copied to clipboard!',
                        type: 'success'
                    });
                } else {
                    setModal({
                        isOpen: true,
                        title: 'Info',
                        message: 'No keys to copy yet!',
                        type: 'info'
                    });
                }
            }}
            className="text-xs bg-blue-900 hover:bg-blue-800 text-blue-100 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy Keys
        </button>
        <button
            onClick={() => {
                setModal({
                    isOpen: true,
                    title: 'Confirm Reset',
                    message: 'Are you sure you want to reset your session? All progress will be lost.',
                    type: 'warning',
                    onConfirm: () => {
                        resetSession();
                        setModal(prev => ({ ...prev, isOpen: false }));
                    }
                });
            }}
            className="text-xs bg-red-900 hover:bg-red-800 text-red-100 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
        </button>
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        type={modal.type}
        confirmText={modal.onConfirm ? 'Yes, Reset' : undefined}
        cancelText={modal.onConfirm ? 'Cancel' : undefined}
      >
        {modal.message}
      </Modal>
    </div>
  );
};
