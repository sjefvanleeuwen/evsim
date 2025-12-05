import React, { useState, useEffect } from 'react';
import { SimulatedERP, type Order, type Quote } from '../../lib/simulation/backend/SimulatedERP';
import { SimulatedProvisioning } from '../../lib/simulation/backend/SimulatedProvisioning';
import { useGamification } from '../../lib/gamification/GamificationStore';
import { Modal } from '../common/Modal';

type View = 'JOB_LIST' | 'JOB_DETAIL' | 'COMMISSIONING' | 'DIAGNOSTICS';

export const InstallerApp: React.FC = () => {
  const [view, setView] = useState<View>('JOB_LIST');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { completeMission } = useGamification();
  const [modal, setModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  // Diagnostics
  const [searchId, setSearchId] = useState('');
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

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
      setModal({
        isOpen: true,
        title: 'Success',
        message: "Commissioning Successful! Charger is now online.",
        type: 'success'
      });
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

  const [terminalInput, setTerminalInput] = useState('');

  const handleDiagnosticSearch = () => {
    if (searchId === 'EV-CRITICAL-001') {
        setDiagnosticResult('CRITICAL_FAILURE');
    } else if (searchId === 'EV-OMEGA-13') {
        setDiagnosticResult('LOCKED');
    } else if (searchId === 'EV-DANGER-HIGH') {
        setDiagnosticResult('DANGER');
    } else {
        setDiagnosticResult('ONLINE');
    }
  };

  const handleReboot = () => {
    completeMission('fix_charger');
    setDiagnosticResult('REBOOTING...');
    setTimeout(() => {
        setDiagnosticResult('ONLINE');
        setModal({
            isOpen: true,
            title: 'Success',
            message: 'System Rebooted Successfully. Unit is back online.',
            type: 'success'
        });
    }, 2000);
  };

  const handleEmergencyStop = () => {
    completeMission('emergency_stop');
    setDiagnosticResult('SAFE');
    setModal({
        isOpen: true,
        title: 'Critical Alert',
        message: 'EMERGENCY STOP EXECUTED. HAZARD CONTAINED.',
        type: 'warning'
    });
  };

  const handleUnlock = () => {
      if (terminalInput === 'ROOT') {
          completeMission('unlock_protocol');
          setDiagnosticResult('ONLINE');
          setModal({
              isOpen: true,
              title: 'Access Granted',
              message: 'ACCESS GRANTED. PROTOCOL OMEGA DISABLED.',
              type: 'success'
          });
      } else {
          setModal({
              isOpen: true,
              title: 'Access Denied',
              message: 'ACCESS DENIED. INCORRECT PASSWORD.',
              type: 'error'
          });
      }
  };

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (view === 'DIAGNOSTICS' && diagnosticResult) {
        const interval = setInterval(() => {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            let newLog = '';
            
            if (diagnosticResult === 'LOCKED') {
                const msgs = [
                    `[${timestamp}] [SYS] Boot sequence initiated...`,
                    `[${timestamp}] [ERR] Integrity check failed.`,
                    `[${timestamp}] [SEC] LOCKDOWN MODE ENGAGED.`,
                    `[${timestamp}] [SEC] Ref: 0x52 0x4F 0x4F 0x54`,
                    `[${timestamp}] [SYS] Waiting for admin override...`
                ];
                newLog = msgs[Math.floor(Math.random() * msgs.length)];
            } else if (diagnosticResult === 'CRITICAL_FAILURE') {
                newLog = `[${timestamp}] [CRIT] HEARTBEAT TIMEOUT - CONTROLLER UNRESPONSIVE`;
            } else if (diagnosticResult === 'DANGER') {
                const msgs = [
                    `[${timestamp}] [WARN] TEMP CRITICAL: 85°C`,
                    `[${timestamp}] [ERR] ISOLATION FAULT DETECTED`,
                    `[${timestamp}] [WARN] CURRENT LEAKAGE: 300mA`,
                    `[${timestamp}] [SYS] SAFETY INTERLOCK: FAILED`
                ];
                newLog = msgs[Math.floor(Math.random() * msgs.length)];
            } else {
                const actions = ['Heartbeat', 'StatusNotification', 'MeterValues'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                newLog = `[${timestamp}] [OCPP] -> ${action}Request { "connectorId": 1, "status": "Available" }`;
            }
            
            setLogs(prev => [...prev.slice(-8), newLog]);
        }, 1500);
        return () => clearInterval(interval);
    } else {
        setLogs([]);
    }
  }, [view, diagnosticResult]);

  const renderDiagnostics = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-4">Field Diagnostics</h2>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">Enter Charger ID</label>
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. EV-12345"
                />
                <button 
                    onClick={handleDiagnosticSearch}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-medium"
                >
                    Scan
                </button>
            </div>
        </div>

        {diagnosticResult && (
            <div className={`p-6 rounded-lg border ${
                diagnosticResult === 'CRITICAL_FAILURE' ? 'bg-red-900/20 border-red-800' : 
                diagnosticResult === 'LOCKED' ? 'bg-purple-900/20 border-purple-800' :
                diagnosticResult === 'ONLINE' ? 'bg-green-900/20 border-green-800' :
                'bg-gray-800 border-gray-700'
            }`}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-bold ${
                        diagnosticResult === 'CRITICAL_FAILURE' ? 'text-red-500 animate-pulse' : 
                        diagnosticResult === 'LOCKED' ? 'text-purple-500' :
                        diagnosticResult === 'ONLINE' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                        {diagnosticResult}
                    </span>
                </div>
                
                {diagnosticResult === 'CRITICAL_FAILURE' && (
                    <div className="space-y-4">
                        <div className="text-sm text-red-400 font-mono bg-black p-3 rounded">
                            ERROR: HEARTBEAT_TIMEOUT<br/>
                            ERROR: CONTROLLER_UNRESPONSIVE<br/>
                            RECOMMENDATION: HARD_RESET
                        </div>
                        <button 
                            onClick={handleReboot}
                            className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded font-bold uppercase tracking-wider shadow-lg animate-pulse"
                        >
                            INITIATE HARD REBOOT
                        </button>
                    </div>
                )}

                {diagnosticResult === 'DANGER' && (
                    <div className="space-y-4">
                        <div className="text-sm text-red-400 font-mono bg-black p-3 rounded">
                            WARNING: HIGH VOLTAGE HAZARD<br/>
                            ISOLATION FAULT DETECTED<br/>
                            IMMEDIATE STOP REQUIRED
                        </div>
                        <button 
                            onClick={handleEmergencyStop}
                            className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded font-bold uppercase tracking-wider shadow-lg animate-pulse"
                        >
                            EMERGENCY STOP
                        </button>
                    </div>
                )}

                {diagnosticResult === 'LOCKED' && (
                    <div className="space-y-4">
                        <div className="text-sm text-purple-400 font-mono bg-black p-3 rounded">
                            SECURITY LOCKDOWN ACTIVE<br/>
                            SYSTEM LOGS DUMPED BELOW<br/>
                            ENTER PASSWORD TO UNLOCK
                        </div>
                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                value={terminalInput}
                                onChange={(e) => setTerminalInput(e.target.value)}
                                className="flex-1 bg-black border border-purple-500/50 rounded px-3 py-2 text-green-400 font-mono focus:outline-none"
                                placeholder="PASSWORD"
                            />
                            <button 
                                onClick={handleUnlock}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold"
                            >
                                UNLOCK
                            </button>
                        </div>
                    </div>
                )}

                {/* Live Logs */}
                <div className="mt-4 bg-black rounded border border-gray-700 p-3 font-mono text-xs h-48 overflow-y-auto">
                    <div className="text-gray-500 border-b border-gray-800 pb-1 mb-2">LIVE PROTOCOL INSPECTOR</div>
                    {logs.map((log, i) => (
                        <div key={i} className={`${
                            log.includes('ERR') || log.includes('CRIT') ? 'text-red-500' : 
                            log.includes('SEC') ? 'text-purple-400' : 'text-green-400'
                        }`}>
                            {log}
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-gray-600 italic">Waiting for stream...</div>}
                </div>
            </div>
        )}
        
        <button onClick={() => setView('JOB_LIST')} className="text-gray-400 hover:text-white text-sm">
            &larr; Back to Jobs
        </button>
    </div>
  );

  const renderJobList = () => {
    const jobs = getMyJobs();
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider">My Jobs</h2>
            <button 
                onClick={() => setView('DIAGNOSTICS')}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-900 px-3 py-1 rounded"
            >
                Open Diagnostics Tool
            </button>
        </div>
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
      {view === 'DIAGNOSTICS' && renderDiagnostics()}

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        type={modal.type}
      >
        {modal.message}
      </Modal>
    </div>
  );
};
