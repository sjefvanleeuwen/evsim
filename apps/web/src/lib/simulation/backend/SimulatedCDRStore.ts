import { BrowserStorage } from '../../storage/BrowserStorage';
import type { IStorage } from '../../interfaces/IStorage';

export interface CDR {
  id: string;
  sessionId: string;
  locationId: string;
  evseId: string;
  authId: string;
  startTime: string;
  stopTime: string;
  totalEnergy: number; // kWh
  totalCost: number;
  currency: string;
  meterStart: number;
  meterStop: number;
  status: 'COMPLETED' | 'REJECTED';
}

export class SimulatedCDRStore {
  private static instance: SimulatedCDRStore;
  private cdrs: CDR[] = [];
  private storage: IStorage;
  private listeners: ((cdrs: CDR[]) => void)[] = [];

  private constructor() {
    this.storage = BrowserStorage.getInstance();
    this.loadFromStorage();
    
    // GAMIFICATION: Inject VIP Session
    if (!this.cdrs.some(c => c.sessionId === 'SES-VIP-999')) {
        this.cdrs.unshift({
            id: 'CDR-VIP-999',
            sessionId: 'SES-VIP-999',
            locationId: 'Amsterdam - Central',
            evseId: 'EV-VIP-001',
            authId: 'RFID-GOLD-MEMBER',
            startTime: new Date(Date.now() - 3600000).toISOString(),
            stopTime: new Date().toISOString(),
            totalEnergy: 85.5,
            totalCost: 125.00,
            currency: 'EUR',
            meterStart: 1000,
            meterStop: 1085.5,
            status: 'COMPLETED'
        });
        this.saveToStorage();
    }

    // GAMIFICATION: Inject Hacked Session (Theft)
    if (!this.cdrs.some(c => c.sessionId === 'SES-HACK-007')) {
        this.cdrs.unshift({
            id: 'CDR-HACK-007',
            sessionId: 'SES-HACK-007',
            locationId: 'Rotterdam - Port',
            evseId: 'EV-PORT-99',
            authId: 'UNKNOWN',
            startTime: new Date(Date.now() - 7200000).toISOString(),
            stopTime: new Date().toISOString(),
            totalEnergy: 150.0, // High energy
            totalCost: 0.00,    // Zero cost (Theft)
            currency: 'EUR',
            meterStart: 5000,
            meterStop: 5150,
            status: 'COMPLETED'
        });
        this.saveToStorage();
    }
  }

  public static getInstance(): SimulatedCDRStore {
    if (!SimulatedCDRStore.instance) {
      SimulatedCDRStore.instance = new SimulatedCDRStore();
    }
    return SimulatedCDRStore.instance;
  }

  private loadFromStorage() {
    const stored = this.storage.getItem<CDR[]>('sim_cdrs');
    if (stored) {
      this.cdrs = stored;
    }
  }

  private saveToStorage() {
    // Limit to last 200 CDRs to prevent QuotaExceededError
    // BUT preserve gamification sessions
    const limit = 200;
    const criticalIds = ['SES-VIP-999', 'SES-HACK-007'];
    
    let toSave = this.cdrs.slice(0, limit);
    
    // Ensure critical sessions are preserved even if they fall out of the limit
    const criticalCdrs = this.cdrs.filter(c => criticalIds.includes(c.sessionId));
    criticalCdrs.forEach(critical => {
        if (!toSave.some(c => c.sessionId === critical.sessionId)) {
            toSave.push(critical);
        }
    });

    this.storage.setItem('sim_cdrs', toSave);
  }

  public addCDR(cdr: CDR) {
    console.log('[SimulatedCDRStore] addCDR called', cdr.id);
    this.cdrs.unshift(cdr); // Add to top
    this.saveToStorage();
    this.notifyListeners();
  }

  public getCDRs(): CDR[] {
    return this.cdrs;
  }

  public subscribe(listener: (cdrs: CDR[]) => void) {
    this.listeners.push(listener);
    listener(this.cdrs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.cdrs));
  }
}
