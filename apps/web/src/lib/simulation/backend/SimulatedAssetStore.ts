import { type Asset } from '../data/AssetGenerator';
import { SimulationClock } from '../SimulationClock';
import { SimulatedCDRStore, type CDR } from './SimulatedCDRStore';

export class SimulatedAssetStore {
  private static instance: SimulatedAssetStore;
  private assets: Asset[] = [];
  private listeners: ((assets: Asset[]) => void)[] = [];
  private clock: SimulationClock;
  private worker: Worker;
  private assetMap: Map<string, Asset> | null = null;

  private constructor() {
    this.clock = SimulationClock.getInstance();
    
    // Initialize Worker
    this.worker = new Worker(new URL('../worker/simulation.worker.ts', import.meta.url), { type: 'module' });
    
    this.worker.onmessage = (e) => {
        const { type, assets, updatedAssets, time, newCdrs } = e.data;

        if (type === 'INIT') {
            this.assets = assets;
            this.notifyListeners();
        } else if (type === 'TICK') {
            // Update Time
            this.clock.setTime(new Date(time));

            // Update Assets
            if (updatedAssets && updatedAssets.length > 0) {
                if (!this.assetMap) {
                    this.assetMap = new Map();
                    this.assets.forEach(a => this.assetMap!.set(a.id, a));
                }

                updatedAssets.forEach((updated: Asset) => {
                    const existing = this.assetMap!.get(updated.id);
                    if (existing) {
                        Object.assign(existing, updated);
                    }
                });
                
                this.notifyListeners();
            }

            // Handle New CDRs
            if (newCdrs && newCdrs.length > 0) {
                console.log(`[SimulatedAssetStore] Received ${newCdrs.length} new CDRs from worker`);
                const cdrStore = SimulatedCDRStore.getInstance();
                newCdrs.forEach((cdr: CDR) => {
                    console.log('[SimulatedAssetStore] Adding CDR:', cdr.id);
                    cdrStore.addCDR(cdr);
                });
            }
        }
    };
  }

  public static getInstance(): SimulatedAssetStore {
    if (!SimulatedAssetStore.instance) {
      SimulatedAssetStore.instance = new SimulatedAssetStore();
    }
    return SimulatedAssetStore.instance;
  }

  public getAssets(): Asset[] {
    return this.assets;
  }

  public subscribe(listener: (assets: Asset[]) => void) {
    this.listeners.push(listener);
    // Don't send initial data immediately if it's huge, let the component pull it or send a slice
    // But for now, we'll just register.
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }





  private notifyListeners() {
    // Create a shallow copy to trigger React state update
    const newAssets = [...this.assets];
    this.listeners.forEach(l => l(newAssets));
  }
}
