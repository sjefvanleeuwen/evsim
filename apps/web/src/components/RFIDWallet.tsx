import React from 'react';

interface RFIDWalletProps {
  onSwipe: (tagId: string) => void;
  disabled?: boolean;
  isPlugAndChargeCapable?: boolean;
}

export const RFIDWallet: React.FC<RFIDWalletProps> = ({ onSwipe, disabled, isPlugAndChargeCapable }) => {
  const cards = [
    { id: 'DEADBEEF', label: 'Valid User', color: 'bg-blue-600', icon: '👤' },
    { id: '12345678', label: 'Roaming User', color: 'bg-purple-600', icon: '🌐' },
    { id: 'BLOCKED', label: 'Blocked User', color: 'bg-red-600', icon: '🚫' },
    { id: 'EXPIRED', label: 'Expired Card', color: 'bg-yellow-600', icon: '⚠️' },
  ];

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg flex-shrink-0">
      <h3 className="text-sm font-semibold mb-3 text-gray-300 border-b border-gray-800 pb-2">
        RFID Wallet & Auth
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSwipe(card.id)}
            disabled={disabled}
            className={`p-2 rounded text-xs font-medium text-white transition flex items-center gap-2 ${card.color} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>{card.icon}</span>
            {card.label}
          </button>
        ))}
      </div>

      {isPlugAndChargeCapable && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <button
            onClick={() => onSwipe('PLUG-N-CHARGE')}
            disabled={disabled}
            className="w-full p-2 rounded text-xs font-medium text-white bg-green-700 hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simulate Plug & Charge (ISO 15118)
          </button>
        </div>
      )}
    </div>
  );
};
