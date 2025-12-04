import React, { useState, useEffect, useRef } from 'react';
import { OCPPClient } from '../lib/ocpp/OCPPClient';
import { SimulatedApiClient } from '../lib/api/SimulatedApiClient';
import { SimulatedCSMS } from '../lib/simulation/backend/SimulatedCSMS';
import { VehicleControls, type VehicleSettings } from './VehicleControls';
import { RFIDWallet } from './RFIDWallet';
import { TerminalPane } from './TerminalPane';
import { ChargingStation } from './ChargingStation';

type ScreenState = 'Idle' | 'Authorizing' | 'Charging' | 'Summary';

interface DashboardProps {
  initialSettings?: VehicleSettings | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialSettings }) => {
  // Firmware State
  const [screenState, setScreenState] = useState<ScreenState>('Idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [csmsLogs, setCsmsLogs] = useState<string[]>([]);
  const [trafficLogs, setTrafficLogs] = useState<{
    dir: 'in'|'out', 
    msg: any, 
    time: string,
    protocol: string,
    standard: string
  }[]>([]);
  const [client, setClient] = useState<OCPPClient | null>(null);
  const clientRef = useRef<OCPPClient | null>(null);
  
  // Vehicle State
  const [vehicleSettings, setVehicleSettings] = useState<VehicleSettings | null>(null);
  
  // Charging Session State
  const [energy, setEnergy] = useState(0);
  const [duration, setDuration] = useState(0);
  const [power, setPower] = useState(0);
  const [cost, setCost] = useState(0);
  const [, setTransactionId] = useState<number | null>(null);
  
  const powerRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const energyRef = useRef(0);
  const costRef = useRef(0);
  const transactionIdRef = useRef<number | null>(null);
  const lastMeterValueTimeRef = useRef<number>(0);

  useEffect(() => {
    const newClient = new OCPPClient('ws://localhost:9000', 'CP001');
    const newOcpiClient = SimulatedApiClient.getInstance();
    const csms = SimulatedCSMS.getInstance();

    csms.setLogger((msg) => {
      setCsmsLogs(prev => [msg, ...prev].slice(0, 50));
    });
    
    newClient.onAuthStatus = (status) => {
      addLog(`Auth Status: ${status}`);
      if (status === 'Accepted') {
        startCharging();
      } else {
        setScreenState('Idle'); // Or some error state
        addLog(`Authorization Failed: ${status}`);
      }
    };

    newClient.onTransactionStart = (id) => {
      setTransactionId(id);
      transactionIdRef.current = id;
      addLog(`Transaction Started: ${id}`);
    };

    newClient.onTraffic = (dir, msg) => {
      setTrafficLogs(prev => [{
        dir, 
        msg, 
        time: new Date().toLocaleTimeString(),
        protocol: 'WSS',
        standard: 'OCPP 1.6'
      }, ...prev].slice(0, 50));
    };

    newOcpiClient.setTrafficCallback((log) => {
      setTrafficLogs(prev => [{
        ...log,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 50));
    });

    newClient.connect();
    setClient(newClient);
    clientRef.current = newClient;
    addLog("System Booted");
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle initial settings from Connectors Page
  useEffect(() => {
    if (initialSettings && screenState === 'Idle') {
      handlePlugIn(initialSettings);
    }
  }, [initialSettings]);

  // Update power calculation when settings change
  useEffect(() => {
    if (screenState === 'Charging' && vehicleSettings) {
      let powerKW = 0;
      if (vehicleSettings.type === 'DC') {
        const voltage = vehicleSettings.batteryVoltage || 400;
        powerKW = (voltage * vehicleSettings.maxCurrent) / 1000;
      } else {
        const voltage = 230;
        powerKW = (voltage * vehicleSettings.maxCurrent * vehicleSettings.phases) / 1000;
      }
      setPower(powerKW);
      powerRef.current = powerKW;
    }
  }, [vehicleSettings, screenState]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  // Simulation Logic
  const handlePlugIn = (settings: VehicleSettings) => {
    if (screenState === 'Idle') {
      setVehicleSettings(settings);
      addLog(`EV Plugged In (${settings.connector}, ${settings.type})`);
      setScreenState('Authorizing');
      
      // Check for Plug & Charge
      // In a real scenario, we'd check if the vehicle sends a certificate or idTag
      // For simulation, let's say if it's a specific vehicle type or we have a toggle
      // But for now, we wait for RFID swipe unless it's explicitly PnC
    }
  };

  const handleUpdate = (settings: VehicleSettings) => {
    setVehicleSettings(settings);
  };

  const startCharging = () => {
    setScreenState('Charging');
    setEnergy(0);
    setDuration(0);
    setCost(0);
    energyRef.current = 0;
    costRef.current = 0;
    
    addLog(`Charging Started`);

    // Start OCPP Transaction
    if (clientRef.current) {
      // Use a mock tag if we don't have one handy, or store the last authorized tag
      // For simplicity, let's assume the last authorized tag was "DEADBEEF" or similar
      // Ideally we should pass the tagId to startCharging
      clientRef.current.startTransaction("DEADBEEF", 1, 0, new Date().toISOString());
    }

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
      
      const energyDelta = (powerRef.current / 3600);
      const costDelta = (energyDelta * 0.35);

      setEnergy(prev => {
        const newVal = prev + energyDelta;
        energyRef.current = newVal;
        return newVal;
      }); 
      
      setCost(prev => {
        const newVal = prev + costDelta;
        costRef.current = newVal;
        return newVal;
      });

      // Send MeterValues every 10 seconds (Standard is usually 60s)
      const now = Date.now();
      if (clientRef.current && transactionIdRef.current && (now - lastMeterValueTimeRef.current > 10000)) {
        clientRef.current.meterValues(1, transactionIdRef.current, energyRef.current * 1000); // Wh
        lastMeterValueTimeRef.current = now;
      }

    }, 1000);
  };


  const stopCharging = () => {
    if (screenState === 'Charging') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setPower(0);
      setScreenState('Summary');
      addLog("Charging Stopped");

      // Stop OCPP Transaction
      if (clientRef.current && transactionIdRef.current) {
        clientRef.current.stopTransaction(
          transactionIdRef.current, 
          "DEADBEEF", 
          energyRef.current * 1000, // Wh
          new Date().toISOString()
        );
      }
    }
  };

  const handleUnplug = () => {
    setVehicleSettings(null);
    if (screenState === 'Summary') {
      setScreenState('Idle');
      addLog("EV Unplugged");
    } else if (screenState === 'Charging') {
      stopCharging();
      // If unplugged while charging, we might want to show summary briefly or go to idle
      // For now, let's assume unplugging ends the session and goes to idle after a moment or user interaction
      // But typically unplugging is the end.
    } else if (screenState === 'Authorizing') {
        setScreenState('Idle');
        addLog("EV Unplugged during authorization");
    }
  };

  const handleRFIDSwipe = (tagId: string) => {
    addLog(`RFID Card Swiped: ${tagId}`);
    if (screenState === 'Authorizing' || screenState === 'Idle') {
      if (client) {
        addLog("Authorizing...");
        
        // In a real scenario, the CSMS handles the OCPI auth check.
        // We just send the OCPP Authorize request.
        client.authorize(tagId);
      } else {
        addLog("Error: Client not connected");
      }
    } else if (screenState === 'Charging') {
      // In real world, swiping again might stop it if it's the same card
      // For now, let's just stop it
      stopCharging();
    }
  };


  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-950 text-white font-sans overflow-hidden">
      
      {/* Left Area: Charger & Terminal */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top: Simulation Screen (The "Kiosk") */}
        <ChargingStation 
          screenState={screenState}
          energy={energy}
          duration={duration}
          power={power}
          cost={cost}
          isConnected={!!client}
          onCloseSummary={() => setScreenState('Idle')}
        />

        {/* Bottom: Terminal Panel */}
        <TerminalPane logs={logs} trafficLogs={trafficLogs} csmsLogs={csmsLogs} />
      </div>

      {/* Right: Controls Sidebar */}
      <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col overflow-y-auto shrink-0">
        <div className="p-4 space-y-6">
          
          {/* Section: Vehicle */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vehicle Simulation</h3>
            <VehicleControls 
              onPlugIn={handlePlugIn}
              onUnplug={handleUnplug}
              onUpdate={handleUpdate}
              isPluggedIn={screenState !== 'Idle'}
              isCharging={screenState === 'Charging'}
              lockedConnector={initialSettings?.connector}
            />
          </div>

          {/* Section: Physical Inputs */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Physical Inputs</h3>
            <div className="space-y-3">
              <RFIDWallet onSwipe={handleRFIDSwipe} />
              
              <button 
                onClick={() => {
                  stopCharging();
                  addLog("Emergency Stop Pressed");
                }}
                className="w-full py-2 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 hover:text-red-400 border border-red-900/50 rounded flex items-center justify-center gap-2 transition text-sm font-medium"
              >
                E-STOP
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

