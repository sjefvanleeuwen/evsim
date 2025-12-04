import React, { useState, useEffect } from 'react';
import { SimulatedERP, type Order, type Quote } from '../../lib/simulation/backend/SimulatedERP';
import { SimulatedProvisioning } from '../../lib/simulation/backend/SimulatedProvisioning';

type View = 'JOB_LIST' | 'JOB_DETAIL' | 'COMMISSIONING';

export const InstallerApp: React.FC = () => {
  const [view, setView] = useState<View>('JOB_LIST');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Commissioning Form
  const [serialNumber, setSerialNumber] = useState('');
  const [cpId, setCpId] = useState('');
  const [checklist, setChecklist] = useState({
    safetyCheck: false,
    mountingSecure: false,
    electricalConnected: false,
    voltageVerified: false
  });

  useEffect(() => {
    const erp = SimulatedERP.getInstance();
    const unsubscribe = erp.subscribe((q, o) => {
      setQuotes(q);
      setOrders(o);
    });
    return unsubscribe;
  }, []);

  const getMyJobs = () => {
    return orders.filter(o => o.status === 'ORDERED' || o.status === 'SCHEDULED');
  };

  const handleSelectJob = (id: string) => {
    setSelectedOrderId(id);
    setView('JOB_DETAIL');
  };

  const handleStartCommissioning = () => {
    setView('COMMISSIONING');
    // Auto-generate some values for convenience
    setSerialNumber(`SN-${Math.floor(Math.random() * 1000000)}`);
    setCpId(`CP-${Math.floor(Math.random() * 1000)}`);
  };

  const handleComplete = () => {
    if (selectedOrderId && serialNumber && cpId) {
      SimulatedProvisioning.getInstance().commissionCharger(selectedOrderId, serialNumber, cpId);
      alert("Commissioning Successful! Charger is now online.");
      setView('JOB_LIST');
      setSelectedOrderId(null);
      setChecklist({
        safetyCheck: false,
        mountingSecure: false,
        electricalConnected: false,
        voltageVerified: false
      });
    }
  };

  const renderJobList = () => {
    const jobs = getMyJobs();
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-4">My Jobs</h2>
        {jobs.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-lg border border-gray-800">
            No pending installation jobs.
          </div>
        )}
        {jobs.map(job => {
          const quote = quotes.find(q => q.id === job.quoteId);
          return (
            <button 
              key={job.id}
              onClick={() => handleSelectJob(job.id)}
              className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 shadow-sm transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white">{quote?.customerName}</span>
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">{job.status}</span>
              </div>
              <div className="text-sm text-gray-400 mb-1">{quote?.hardware.model}</div>
              <div className="text-xs text-gray-500 font-mono">{job.id}</div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderJobDetail = () => {
    const job = orders.find(o => o.id === selectedOrderId);
    const quote = quotes.find(q => q.id === job?.quoteId);
    
    if (!job || !quote) return <div>Job not found</div>;

    return (
      <div className="space-y-6">
        <button onClick={() => setView('JOB_LIST')} className="text-blue-400 hover:text-blue-300 mb-4">← Back to Jobs</button>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-2">{quote.customerName}</h2>
          <p className="text-gray-400 mb-4">{quote.email}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <span className="block text-gray-500">Hardware</span>
              <span className="text-white">{quote.hardware.model}</span>
            </div>
            <div>
              <span className="block text-gray-500">Cable Length</span>
              <span className="text-white">{quote.installation.cableLength}m</span>
            </div>
            <div>
              <span className="block text-gray-500">Excavation</span>
              <span className="text-white">{quote.installation.excavation ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <button 
            onClick={handleStartCommissioning}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg"
          >
            Start Installation
          </button>
        </div>
      </div>
    );
  };

  const renderCommissioning = () => {
    const allChecked = Object.values(checklist).every(v => v);

    return (
      <div className="space-y-6">
        <button onClick={() => setView('JOB_DETAIL')} className="text-blue-400 hover:text-blue-300 mb-4">← Back to Details</button>
        
        <h2 className="text-2xl font-bold text-white">Commissioning</h2>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
          <h3 className="font-bold text-gray-300">1. Safety Checklist</h3>
          <div className="space-y-2">
            {Object.entries(checklist).map(([key, val]) => (
              <label key={key} className="flex items-center space-x-3 p-2 bg-gray-900 rounded cursor-pointer hover:bg-gray-800 border border-gray-800">
                <input 
                  type="checkbox" 
                  checked={val}
                  onChange={() => setChecklist(prev => ({...prev, [key]: !val}))}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                />
                <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
          <h3 className="font-bold text-gray-300">2. Device Identification</h3>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Serial Number (Scan)</label>
            <input 
              type="text" 
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Charge Point ID (CPID)</label>
            <input 
              type="text" 
              value={cpId}
              onChange={(e) => setCpId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white font-mono"
            />
          </div>
        </div>

        <button 
          onClick={handleComplete}
          disabled={!allChecked || !serialNumber || !cpId}
          className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded shadow-lg"
        >
          Complete Commissioning
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-950 text-white">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <h1 className="text-lg font-bold text-white">⚡ Installer App</h1>
        <div className="text-xs text-gray-500">v1.0.0</div>
      </div>

      {view === 'JOB_LIST' && renderJobList()}
      {view === 'JOB_DETAIL' && renderJobDetail()}
      {view === 'COMMISSIONING' && renderCommissioning()}
    </div>
  );
};
