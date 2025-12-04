import React, { useState } from 'react';
import { SimulatedERP } from '../../lib/simulation/backend/SimulatedERP';

type CustomerType = 'B2B2C_LEASE' | 'B2B_RETAIL';
type Step = 'CUSTOMER' | 'HARDWARE' | 'INSTALLATION' | 'QUOTE';

interface QuoteData {
  customerType: CustomerType;
  customerName: string;
  email: string;
  hardwareId: string;
  cableLength: number;
  surfaceWork: boolean;
  wallboxColor: string;
}

const HARDWARE_OPTIONS = {
  B2B2C_LEASE: [
    { id: 'HOME_11', name: 'HomeFlex 11kW', price: 899, image: '🏠' },
    { id: 'HOME_22', name: 'HomePro 22kW', price: 1199, image: '🏡' },
  ],
  B2B_RETAIL: [
    { id: 'BIZ_50', name: 'Express 50kW DC', price: 15000, image: '⚡' },
    { id: 'BIZ_150', name: 'ExpressPlus 150kW DC', price: 45000, image: '⚡⚡' },
  ]
};

export const CPQWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('CUSTOMER');
  const [data, setData] = useState<QuoteData>({
    customerType: 'B2B2C_LEASE',
    customerName: '',
    email: '',
    hardwareId: '',
    cableLength: 10,
    surfaceWork: false,
    wallboxColor: 'white'
  });

  const calculateTotal = () => {
    const hwPrice = HARDWARE_OPTIONS[data.customerType].find(h => h.id === data.hardwareId)?.price || 0;
    const installBase = 500;
    const cablePrice = data.cableLength * 15; // $15 per meter
    const surfacePrice = data.surfaceWork ? 200 : 0;
    return hwPrice + installBase + cablePrice + surfacePrice;
  };

  const handleSubmit = () => {
    const hwOption = HARDWARE_OPTIONS[data.customerType].find(h => h.id === data.hardwareId);
    
    SimulatedERP.getInstance().createQuote({
      customerType: data.customerType,
      customerName: data.customerName || 'Guest User',
      email: data.email || 'guest@example.com',
      hardware: {
        model: hwOption?.name || 'Unknown',
        price: hwOption?.price || 0
      },
      installation: {
        cableLength: data.cableLength,
        excavation: data.surfaceWork,
        panelUpgrade: false, // Not in UI yet
        price: calculateTotal() - (hwOption?.price || 0)
      },
      totalPrice: calculateTotal()
    });

    alert("Order Submitted! Check the Partner Portal for approval.");
    // Reset or redirect?
    setStep('CUSTOMER');
    setData({
      customerType: 'B2B2C_LEASE',
      customerName: '',
      email: '',
      hardwareId: '',
      cableLength: 10,
      surfaceWork: false,
      wallboxColor: 'white'
    });
  };

  const renderCustomerStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Select Customer Journey</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Customer Name</label>
          <input 
            type="text" 
            value={data.customerName}
            onChange={(e) => setData({...data, customerName: e.target.value})}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
            placeholder="Enter name..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Email Address</label>
          <input 
            type="email" 
            value={data.email}
            onChange={(e) => setData({...data, email: e.target.value})}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
            placeholder="Enter email..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setData({ ...data, customerType: 'B2B2C_LEASE', hardwareId: '' });
            setStep('HARDWARE');
          }}
          className="p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition"
        >
          <div className="text-3xl mb-2">🚗</div>
          <h3 className="text-xl font-bold text-white">Lease Driver (Home)</h3>
          <p className="text-gray-400 text-sm mt-2">B2B2C Flow. Driver configures home charger via Lease Company link.</p>
        </button>

        <button
          onClick={() => {
            setData({ ...data, customerType: 'B2B_RETAIL', hardwareId: '' });
            setStep('HARDWARE');
          }}
          className="p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition"
        >
          <div className="text-3xl mb-2">🏢</div>
          <h3 className="text-xl font-bold text-white">Site Owner (Business)</h3>
          <p className="text-gray-400 text-sm mt-2">B2B Flow. Retailer configures fast chargers for parking lot.</p>
        </button>
      </div>
    </div>
  );

  const renderHardwareStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Select Hardware</h2>
      <div className="grid grid-cols-2 gap-4">
        {HARDWARE_OPTIONS[data.customerType].map(opt => (
          <button
            key={opt.id}
            onClick={() => setData({ ...data, hardwareId: opt.id })}
            className={`p-6 border rounded-lg text-left transition ${
              data.hardwareId === opt.id 
                ? 'bg-blue-900/30 border-blue-500' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <div className="text-3xl mb-2">{opt.image}</div>
            <h3 className="text-xl font-bold text-white">{opt.name}</h3>
            <p className="text-blue-400 font-mono mt-2">${opt.price.toLocaleString()}</p>
          </button>
        ))}
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={() => setStep('CUSTOMER')} className="text-gray-400 hover:text-white">Back</button>
        <button 
          disabled={!data.hardwareId}
          onClick={() => setStep('INSTALLATION')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
        >
          Next: Installation
        </button>
      </div>
    </div>
  );

  const renderInstallationStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Installation Details</h2>
      
      <div className="bg-gray-800 p-6 rounded-lg space-y-6 border border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Distance from Fuse Box (Meters)
          </label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={data.cableLength}
            onChange={(e) => setData({ ...data, cableLength: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-right text-white font-mono mt-1">{data.cableLength}m</div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Requires Excavation / Surface Work?</span>
          <button 
            onClick={() => setData({ ...data, surfaceWork: !data.surfaceWork })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              data.surfaceWork ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              data.surfaceWork ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={() => setStep('HARDWARE')} className="text-gray-400 hover:text-white">Back</button>
        <button 
          onClick={() => setStep('QUOTE')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
        >
          Generate Quote
        </button>
      </div>
    </div>
  );

  const renderQuoteStep = () => {
    const hw = HARDWARE_OPTIONS[data.customerType].find(h => h.id === data.hardwareId);
    const total = calculateTotal();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Quote Summary</h2>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded uppercase border border-yellow-500/30">
            Draft
          </span>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Hardware</h3>
            <div className="flex justify-between text-gray-300">
              <span>{hw?.name}</span>
              <span>${hw?.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-6 border-b border-gray-700 bg-gray-800/50">
            <h3 className="text-lg font-medium text-white mb-4">Installation Services</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Base Installation Fee</span>
                <span>$500</span>
              </div>
              <div className="flex justify-between">
                <span>Cabling ({data.cableLength}m @ $15/m)</span>
                <span>${data.cableLength * 15}</span>
              </div>
              {data.surfaceWork && (
                <div className="flex justify-between">
                  <span>Excavation / Surface Work</span>
                  <span>$200</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-900">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-white">Total Estimated Cost</span>
              <span className="text-2xl font-bold text-green-400">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button onClick={() => setStep('INSTALLATION')} className="text-gray-400 hover:text-white">Edit Configuration</button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg shadow-green-900/20"
          >
            Submit Order
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Configure Your Charging Solution</h1>
          <div className="text-gray-500">Step: {step}</div>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ 
              width: step === 'CUSTOMER' ? '25%' : 
                     step === 'HARDWARE' ? '50%' : 
                     step === 'INSTALLATION' ? '75%' : '100%' 
            }}
          />
        </div>
      </div>

      {step === 'CUSTOMER' && renderCustomerStep()}
      {step === 'HARDWARE' && renderHardwareStep()}
      {step === 'INSTALLATION' && renderInstallationStep()}
      {step === 'QUOTE' && renderQuoteStep()}
    </div>
  );
};
