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

  private calculateChecksum(data: string): string {
    let crc = 0;
    for (let i = 0; i < data.length; i++) {
        crc = (crc + data.charCodeAt(i)) % 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  public completeMission(id: string) {
    const mission = this.missions.find(m => m.id === id);
    if (mission && !mission.completed) {
      mission.completed = true;
      
      // Generate payload: MissionID + SessionID
      const payload = `${id}:${this.sessionId}`;
      const checksum = this.calculateChecksum(payload);
      
      // Key Format: KEY-{Base64(Payload:Checksum)}
      mission.completionKey = `KEY-${btoa(`${payload}:${checksum}`)}`;
      
      this.notifyListeners();
    }
  }

  public isAllCompleted(): boolean {
    return this.missions.every(m => m.completed);
  }

  public generateCompletionCode(): string {
    if (!this.isAllCompleted()) return '';
    
    const timestamp = Date.now().toString(36).toUpperCase();
    const payload = `AGENT-${this.sessionId}-COMPLETE-${timestamp}`;
    const checksum = this.calculateChecksum(payload);
    
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
    completeMission: (id: string) => store.completeMission(id),
    isComplete: store.isAllCompleted(),
    completionCode: store.generateCompletionCode()
  };
};

export { GamificationStore };
