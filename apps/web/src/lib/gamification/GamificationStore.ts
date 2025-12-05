import { useState, useEffect } from 'react';

export interface Mission {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completionKey?: string;
  hint?: string;
}

class GamificationStore {
  private static instance: GamificationStore;
  private listeners: ((missions: Mission[]) => void)[] = [];
  private sessionId: string;
  
  private missions: Mission[] = [
    {
      id: 'fix_charger',
      title: 'System Failure Detected',
      description: 'Charger "EV-CRITICAL-001" in Amsterdam is offline. Locate it in the Installer App and perform a hard reboot.',
      completed: false,
      hint: 'Go to Installer App -> Search for ID'
    },
    {
      id: 'approve_expansion',
      title: 'Capacity Alert',
      description: 'Albert Heijn "Dam Square" is at 100% occupancy. Approve the pending infrastructure expansion quote.',
      completed: false,
      hint: 'Go to Partner Portal -> Orders & Quotes'
    },
    {
      id: 'audit_session',
      title: 'Revenue Audit',
      description: 'Verify the high-value session "SES-VIP-999". Find it in the session logs and mark it as audited.',
      completed: false,
      hint: 'Go to Partner Portal -> Charge Sessions'
    },
    {
      id: 'detect_theft',
      title: 'Forensic Analysis',
      description: 'Security Alert: A session with >100kWh was billed at €0.00. Find this anomaly and flag it.',
      completed: false,
      hint: 'Check Session List for high energy but zero cost.'
    },
    {
      id: 'unlock_protocol',
      title: 'Protocol Omega',
      description: 'Charger "EV-OMEGA-13" is in lockdown. Access its terminal and enter the root password.',
      completed: false,
      hint: 'Diagnostics -> EV-OMEGA-13. The password is hidden in the error code.'
    },
    {
      id: 'emergency_stop',
      title: 'Safety Override',
      description: 'Charger "EV-DANGER-HIGH" reports cable isolation fault. Perform emergency remote stop immediately.',
      completed: false,
      hint: 'Diagnostics -> EV-DANGER-HIGH -> Emergency Stop'
    },
    {
      id: 'submit_quote',
      title: 'Sales Pipeline',
      description: 'Customer "MegaCorp" needs a quote for "ExpressPlus 150kW DC". Submit the order.',
      completed: false,
      hint: 'New Order (CPQ) -> Select B2B Retail -> MegaCorp -> ExpressPlus 150kW'
    },
    {
      id: 'remote_control',
      title: 'Remote Operator',
      description: 'Charger "EV-REMOTE-001" is unresponsive to local commands. Force a remote start from the Network Map.',
      completed: false,
      hint: 'Partner Portal -> Network Map -> Click EV-REMOTE-001 -> Remote Start'
    },
    {
      id: 'test_drive',
      title: 'Quality Assurance',
      description: 'Perform a test charge simulation using a "Type 2" connector.',
      completed: false,
      hint: 'Connectors & Standards -> Type 2 -> Simulate'
    },
    {
      id: 'ddd_master',
      title: 'Domain Architect',
      description: 'Organize the EV charging ecosystem into its correct DDD bounded contexts.',
      completed: false,
      hint: 'Navigate to "Architecture" in the menu to access the DDD challenge.'
    },
    {
      id: 'hems_handshake',
      title: 'Grid Protection',
      description: 'Prevent blackout! Configure HEMS to throttle EV charging when the Heat Pump turns on.',
      completed: false,
      hint: 'Go to HEMS -> Connect -> Enable Load Balancing'
    },
    {
      id: 'peak_shaver',
      title: 'Peak Shaver',
      description: 'DSO Alert! The neighborhood transformer is overloaded. Reduce your grid import to 0A immediately using V2G.',
      completed: false,
      hint: 'HEMS -> Enable V2G -> Discharge to Home'
    }
  ];

  private constructor() {
    // Initialize Session ID
    let sid = localStorage.getItem('ev_game_session_id');
    if (!sid) {
        sid = Math.random().toString(36).substring(2, 10).toUpperCase();
        try {
            localStorage.setItem('ev_game_session_id', sid);
        } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.warn('LocalStorage full, clearing simulation data to make space...');
                localStorage.removeItem('sim_cdrs');
                localStorage.setItem('ev_game_session_id', sid);
            } else {
                throw e;
            }
        }
    }
    this.sessionId = sid;

    // Load persisted mission state
    const savedMissions = localStorage.getItem('ev_game_missions');
    if (savedMissions) {
        try {
            const parsed = JSON.parse(savedMissions) as Mission[];
            this.missions = this.missions.map(m => {
                const saved = parsed.find(pm => pm.id === m.id);
                if (saved && saved.completed) {
                    return { ...m, completed: true, completionKey: saved.completionKey };
                }
                return m;
            });
        } catch (e) {
            console.error('Failed to load mission state', e);
        }
    }
  }

  private saveState() {
      localStorage.setItem('ev_game_missions', JSON.stringify(this.missions));
  }

  public static getInstance(): GamificationStore {
    if (!GamificationStore.instance) {
      GamificationStore.instance = new GamificationStore();
    }
    return GamificationStore.instance;
  }

  public getMissions(): Mission[] {
    return this.missions;
  }

  public static calculateChecksum(data: string): string {
    let crc = 0;
    for (let i = 0; i < data.length; i++) {
        crc = (crc + data.charCodeAt(i)) % 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  public static verifyKey(key: string): { valid: boolean; data?: any; error?: string } {
    if (!key.startsWith('KEY-')) return { valid: false, error: 'Invalid format' };
    
    try {
        const decoded = atob(key.substring(4));
        const lastColonIndex = decoded.lastIndexOf(':');
        if (lastColonIndex === -1) return { valid: false, error: 'Malformed key' };
        
        const payload = decoded.substring(0, lastColonIndex);
        const checksum = decoded.substring(lastColonIndex + 1);
        
        const expectedChecksum = GamificationStore.calculateChecksum(payload);
        
        if (checksum !== expectedChecksum) {
            return { valid: false, error: 'Invalid checksum' };
        }

        // Parse payload
        // Format: MissionID:SessionID[:Metadata]
        const parts = payload.split(':');
        if (parts.length < 2) return { valid: false, error: 'Invalid payload structure' };

        const missionId = parts[0];
        const sessionId = parts[1];
        let metadata = null;

        if (parts.length > 2) {
            try {
                // Rejoin the rest in case metadata contained colons
                const metadataStr = parts.slice(2).join(':');
                metadata = JSON.parse(metadataStr);
            } catch (e) {
                // Metadata might not be JSON or might be simple string? 
                // In completeMission we do JSON.stringify(metadata)
            }
        }

        return { 
            valid: true, 
            data: {
                missionId,
                sessionId,
                metadata
            }
        };

    } catch (e) {
        return { valid: false, error: 'Decoding failed' };
    }
  }

  public completeMission(id: string, metadata?: Record<string, any>) {
    const mission = this.missions.find(m => m.id === id);
    if (mission && !mission.completed) {
      mission.completed = true;
      
      // Generate payload: MissionID + SessionID + Metadata
      let payload = `${id}:${this.sessionId}`;
      if (metadata) {
          payload += `:${JSON.stringify(metadata)}`;
      }

      const checksum = GamificationStore.calculateChecksum(payload);
      
      // Key Format: KEY-{Base64(Payload:Checksum)}
      mission.completionKey = `KEY-${btoa(`${payload}:${checksum}`)}`;
      
      this.saveState();
      this.notifyListeners();
    }
  }

  public resetSession() {
    localStorage.removeItem('ev_game_session_id');
    localStorage.removeItem('ev_game_missions');
    localStorage.removeItem('erp_quotes');
    localStorage.removeItem('erp_orders');
    localStorage.removeItem('sim_cdrs');
    window.location.reload();
  }

  public isAllCompleted(): boolean {
    return this.missions.every(m => m.completed);
  }

  public generateCompletionCode(): string {
    if (!this.isAllCompleted()) return '';
    
    const timestamp = Date.now().toString(36).toUpperCase();
    const payload = `AGENT-${this.sessionId}-COMPLETE-${timestamp}`;
    const checksum = GamificationStore.calculateChecksum(payload);
    
    return `${payload}-${checksum}`;
  }

  public subscribe(listener: (missions: Mission[]) => void) {
    this.listeners.push(listener);
    listener(this.missions);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const newMissions = [...this.missions];
    this.listeners.forEach(l => l(newMissions));
  }
}

export const useGamification = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const store = GamificationStore.getInstance();

  useEffect(() => {
    return store.subscribe(setMissions);
  }, []);

  return {
    missions,
    completeMission: (id: string, metadata?: Record<string, any>) => store.completeMission(id, metadata),
    resetSession: () => store.resetSession(),
    isComplete: store.isAllCompleted(),
    completionCode: store.generateCompletionCode()
  };
};

export { GamificationStore };
