
import { AssetGenerator, type Asset } from '../data/AssetGenerator';

// Simplified Clock for Worker
class WorkerClock {
  private speedFactor: number = 100;
  private virtualTime: number;

  private onTick: (time: Date) => void;

  constructor(onTick: (time: Date) => void) {
    this.onTick = onTick;
    
    // Start at 04:00 AM local time
    const start = new Date();
    start.setHours(4, 0, 0, 0);
    this.virtualTime = start.getTime();
    
    this.start();
  }

  start() {
    setInterval(() => {
      // Advance time
      // 1 real second = 100 virtual seconds
      this.virtualTime += 1000 * this.speedFactor;
      this.onTick(new Date(this.virtualTime));
    }, 1000);
  }
}

// Simulation Logic (Copied/Adapted from SimulatedAssetStore)
class SimulationEngine {
  private assets: Asset[] = [];

  constructor() {
    console.log("Worker: Generating 15,000 assets...");
    this.assets = AssetGenerator.generateAssets(15000);
    console.log("Worker: Assets generated.");

    // Send initial state
    self.postMessage({ type: 'INIT', assets: this.assets });

    new WorkerClock((time) => {
      this.simulateTraffic(time);
    });
  }

  private getChargingProbability(asset: Asset, hour: number): number {
    const HOME_PROFILE = [
      0.02, 0.01, 0.005, 0.005, 0.005, 0.01, 
      0.02, 0.05, 0.02, 0.01, 0.01, 0.01,    
      0.01, 0.01, 0.01, 0.02, 0.05, 0.15,    
      0.20, 0.15, 0.10, 0.08, 0.05, 0.03     
    ];

    const FAST_PROFILE = [
      0.005, 0.005, 0.005, 0.005, 0.01, 0.02, 
      0.05, 0.10, 0.15, 0.12, 0.10, 0.12,     
      0.15, 0.12, 0.10, 0.10, 0.15, 0.15,     
      0.10, 0.05, 0.02, 0.01, 0.01, 0.005     
    ];

    const AH_PROFILE = [
      0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 
      0.01, 0.05, 0.10, 0.12, 0.12, 0.12, 
      0.15, 0.15, 0.15, 0.15, 0.20, 0.20, 
      0.15, 0.10, 0.05, 0.01, 0.00, 0.00  
    ];

    let profile = FAST_PROFILE;
    if (asset.locationType === 'HOME') profile = HOME_PROFILE;
    else if (asset.locationType === 'AH_STORE') profile = AH_PROFILE;

    return profile[hour] * 0.05; // Increased from 0.01 for more activity
  }

  private simulateTraffic(time: Date) {
    const hour = time.getHours();
    let changedAssets: Asset[] = [];
    let newCdrs: any[] = [];
    
    const updatesPerTick = 3000; // Increased from 1500 to check 20% of fleet 

    for (let i = 0; i < updatesPerTick; i++) {
      const index = Math.floor(Math.random() * this.assets.length);
      const asset = this.assets[index];
      const probability = this.getChargingProbability(asset, hour);
      let assetChanged = false;

      if (asset.status === 'AVAILABLE') {
        if (Math.random() < probability) {
          asset.status = 'CHARGING';
          asset.currentSessionStartTime = time.getTime();
          asset.currentSessionId = `SES-${Math.floor(Math.random() * 10000000)}`;
          assetChanged = true;
        }
      } else if (asset.status === 'CHARGING') {
        let stopProb = 0.05; // Base stop probability increased
        
        if (asset.locationType === 'AH_STORE' || asset.model.includes('Express')) {
            stopProb = Math.random() > 0.5 ? 0.25 : 0.10; 
        } else {
            if (hour >= 7 && hour <= 9) {
                stopProb = 0.3;
            } else {
                stopProb = Math.random() > 0.7 ? 0.1 : 0.02;
            }
        }

        if (Math.random() < stopProb) {
          if (asset.currentSessionStartTime) {
             const durationHours = (time.getTime() - asset.currentSessionStartTime) / (1000 * 60 * 60);
             const power = asset.model.includes('Express') ? 100 : 9; 
             const energy = durationHours * power;
             const price = asset.model.includes('Express') ? 0.60 : 0.30;
             
             const cdr = {
                 id: `CDR-${Math.floor(Math.random() * 10000000)}`,
                 sessionId: asset.currentSessionId || 'UNKNOWN',
                 locationId: asset.city, 
                 evseId: asset.id,
                 authId: 'RFID-12345',
                 startTime: new Date(asset.currentSessionStartTime).toISOString(),
                 stopTime: time.toISOString(),
                 totalEnergy: parseFloat(energy.toFixed(2)),
                 totalCost: parseFloat((energy * price).toFixed(2)),
                 currency: 'EUR',
                 meterStart: 0,
                 meterStop: parseFloat(energy.toFixed(2)),
                 status: 'COMPLETED'
             };
             console.log('[Worker] Generated CDR:', cdr.id);
             newCdrs.push(cdr);
          }

          asset.status = 'AVAILABLE';
          asset.currentSessionStartTime = undefined;
          asset.currentSessionId = undefined;
          assetChanged = true;
        }
      }

      if (assetChanged) {
        changedAssets.push(asset);
      }
    }

    // Send updates
    self.postMessage({ 
        type: 'TICK', 
        time: time.getTime(),
        updatedAssets: changedAssets,
        newCdrs: newCdrs
    });
  }
}

new SimulationEngine();
