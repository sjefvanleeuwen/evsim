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
    
    // Generate historical CDRs if we don't have enough
    if (this.cdrs.length < 1000) {
        this.generateHistoricalCDRs(10000);
    }
    
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
    // Limit storage to 500 CDRs to prevent QuotaExceededError
    // BUT preserve gamification sessions
    // Note: We keep 10K in memory, only save 500 to localStorage
    const limit = 500;
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

  private generateHistoricalCDRs(count: number) {
    console.log(`[SimulatedCDRStore] Generating ${count} historical CDRs...`);
    
    const cities = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen', 'Maastricht', 'Nijmegen'];
    const locations = ['Central Station', 'Shopping Mall', 'Office Park', 'Residential', 'Albert Heijn', 'Sports Complex', 'Hospital', 'University'];
    const authTypes = ['RFID', 'APP', 'PLUG_AND_CHARGE', 'CREDIT_CARD'];
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < count; i++) {
        // Random time in the past 30 days
        const daysAgo = Math.random() * 30;
        const startTime = new Date(now - daysAgo * oneDay);
        
        // Session duration: 15 min to 8 hours
        const durationMs = (15 + Math.random() * 465) * 60 * 1000;
        const stopTime = new Date(startTime.getTime() + durationMs);
        
        // Energy: 5 kWh to 80 kWh based on duration
        const durationHours = durationMs / (60 * 60 * 1000);
        const avgPower = 7 + Math.random() * 15; // 7-22 kW
        const energy = Math.round(avgPower * durationHours * 10) / 10;
        
        // Cost: €0.35/kWh average
        const rate = 0.30 + Math.random() * 0.15;
        const cost = Math.round(energy * rate * 100) / 100;
        
        const city = cities[Math.floor(Math.random() * cities.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const authType = authTypes[Math.floor(Math.random() * authTypes.length)];
        
        this.cdrs.push({
            id: `CDR-HIST-${i.toString().padStart(5, '0')}`,
            sessionId: `SES-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            locationId: `${city} - ${location}`,
            evseId: `EV-${city.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            authId: `${authType}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            startTime: startTime.toISOString(),
            stopTime: stopTime.toISOString(),
            totalEnergy: energy,
            totalCost: cost,
            currency: 'EUR',
            meterStart: Math.floor(Math.random() * 10000),
            meterStop: Math.floor(Math.random() * 10000) + energy,
            status: Math.random() > 0.02 ? 'COMPLETED' : 'REJECTED'
        });
    }
    
    // Sort by start time (newest first)
    this.cdrs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    // Don't save to localStorage - keep in memory only to avoid quota issues
    console.log(`[SimulatedCDRStore] Generated ${count} historical CDRs`);
  }
}
