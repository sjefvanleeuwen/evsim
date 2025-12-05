import React, { useEffect, useState } from 'react';
import { SimulatedERP, type Quote, type Order } from '../../lib/simulation/backend/SimulatedERP';
import { SimulatedAssetStore } from '../../lib/simulation/backend/SimulatedAssetStore';
import { SessionList } from './SessionList';
import { NetworkMap } from './NetworkMap';
import { OccupancyView } from './OccupancyView';
import { useGamification } from '../../lib/gamification/GamificationStore';

export const QuoteList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'sessions' | 'map' | 'occupancy'>('orders');
  const { completeMission } = useGamification();

  useEffect(() => {
    // Ensure Simulation is running
    SimulatedAssetStore.getInstance();

    const erp = SimulatedERP.getInstance();
    const unsubscribe = erp.subscribe((q, o) => {
      setQuotes(q);
      setOrders(o);
    });
    return unsubscribe;
  }, []);

  const handleApprove = (quoteId: string) => {
    SimulatedERP.getInstance().approveQuote(quoteId);
    if (quoteId === 'Q-EXPANSION-001') {
        completeMission('approve_expansion');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Partner Portal</h1>
        <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'orders' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Orders & Quotes
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'sessions' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Charge Sessions
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'map' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Network Map
          </button>
          <button 
            onClick={() => setActiveTab('occupancy')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'occupancy' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Occupancy
          </button>
        </div>
      </div>
      
      {activeTab === 'map' ? (
        <NetworkMap />
      ) : activeTab === 'occupancy' ? (
        <OccupancyView />
      ) : activeTab === 'sessions' ? (
        <SessionList />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quotes Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-400 uppercase tracking-wider">Incoming Quotes</h2>
            {quotes.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-lg border border-gray-800">
                No quotes received yet.
              </div>
            )}
            {quotes.map(quote => (
              <div key={quote.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-white text-lg">{quote.customerName}</div>
                    <div className="text-sm text-gray-400">{quote.email}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                    quote.status === 'PENDING_APPROVAL' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' :
                    quote.status === 'APPROVED' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {quote.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-4">
                  <div>Hardware: <span className="text-white">{quote.hardware.model}</span></div>
                  <div>Total: <span className="text-white font-mono">€{quote.totalPrice.toLocaleString()}</span></div>
                  <div>Type: <span className="text-white">{quote.customerType === 'B2B2C_LEASE' ? 'Lease (Home)' : 'Retail (Biz)'}</span></div>
                  <div>Date: <span className="text-white">{new Date(quote.createdAt).toLocaleDateString()}</span></div>
                </div>

                {quote.status === 'PENDING_APPROVAL' && (
                  <button 
                    onClick={() => handleApprove(quote.id)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition"
                  >
                    Approve Quote
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Orders Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-400 uppercase tracking-wider">Active Orders</h2>
            {orders.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-lg border border-gray-800">
                No active orders.
              </div>
            )}
            {orders.map(order => {
              const quote = quotes.find(q => q.id === order.quoteId);
              return (
                <div key={order.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-sm opacity-75">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-blue-400">{order.id}</span>
                    <span className="text-xs font-bold bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-800">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-white font-medium mb-1">{quote?.customerName || 'Unknown Customer'}</div>
                  <div className="text-sm text-gray-400">{quote?.hardware.model}</div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                    <div className="text-xs text-gray-500">Next Step: Installation</div>
                    <button className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
