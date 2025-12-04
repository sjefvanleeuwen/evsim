import React from 'react';
import { IdleView } from './firmware/IdleView';
import { AuthorizingView } from './firmware/AuthorizingView';
import { ChargingView } from './firmware/ChargingView';
import { SummaryView } from './firmware/SummaryView';

type ScreenState = 'Idle' | 'Authorizing' | 'Charging' | 'Summary';

interface ChargingStationProps {
  screenState: ScreenState;
  energy: number;
  duration: number;
  power: number;
  cost: number;
  isConnected: boolean;
  onCloseSummary: () => void;
}

export const ChargingStation: React.FC<ChargingStationProps> = ({
  screenState,
  energy,
  duration,
  power,
  cost,
  isConnected,
  onCloseSummary
}) => {
  return (
    <div className="flex-1 flex justify-center items-center p-4 bg-gray-900/50 relative min-h-0 overflow-hidden">
      {/* Kiosk Container - Scales to fit while maintaining aspect ratio */}
      <div 
        className="relative aspect-[4/3] max-h-full max-w-full bg-black rounded-3xl border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-gray-700 flex flex-col"
        style={{ 
          height: '100%',
          width: 'auto',
          fontSize: 'clamp(10px, 2vh, 16px)' // Scale fonts with viewport height
        }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-gray-900 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            {screenState === 'Idle' && <IdleView />}
            {screenState === 'Authorizing' && <AuthorizingView />}
            {screenState === 'Charging' && (
              <ChargingView 
                energy={energy} 
                duration={duration} 
                power={power} 
                cost={cost} 
              />
            )}
            {screenState === 'Summary' && (
              <SummaryView 
                energy={energy} 
                duration={duration} 
                cost={cost} 
                onClose={onCloseSummary} 
              />
            )}
          </div>
        </div>
        
        {/* Status Bar Overlay (Top) */}
        <div className="absolute top-0 left-0 right-0 p-[2%] flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10">
          <span className="text-gray-400 font-mono text-[0.9em]">{new Date().toLocaleTimeString()}</span>
          <div className="flex gap-2 items-center">
            <div className={`w-[0.6em] h-[0.6em] rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-[0.7em] text-gray-500">NET</span>
          </div>
        </div>
      </div>
    </div>
  );
};
