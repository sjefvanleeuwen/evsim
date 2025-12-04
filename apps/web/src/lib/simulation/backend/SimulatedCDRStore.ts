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
    this.storage.setItem('sim_cdrs', this.cdrs);
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
