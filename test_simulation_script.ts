
import { SimulatedAssetStore } from './apps/web/src/lib/simulation/backend/SimulatedAssetStore';
import { SimulationClock } from './apps/web/src/lib/simulation/SimulationClock';

// Mock the AssetGenerator to avoid dependency issues if running in node without full environment
// Actually, let's try to run it with ts-node if possible, or just rely on the fact that I can read the code.
// But running it is better.

async function runTest() {
    const store = SimulatedAssetStore.getInstance();
    const clock = SimulationClock.getInstance();
    
    console.log("Starting simulation test...");
    
    // Subscribe to monitor changes
    store.subscribe((assets) => {
        const chargingCount = assets.filter(a => a.status === 'CHARGING').length;
        const time = clock.getCurrentTime();
        console.log(`[${time.toLocaleTimeString()}] Charging: ${chargingCount} / ${assets.length} (${(chargingCount/assets.length*100).toFixed(2)}%)`);
    });

    // Fast forward time?
    // The clock runs automatically.
    // We can manually tick the store's simulateTraffic if we want to test logic without waiting.
    // But SimulatedAssetStore's simulateTraffic is private.
    
    // Let's just wait for a few seconds of real time (which is x10 virtual time)
    // Actually, the user said "10x faster".
    
    // Let's just let it run for 5 seconds.
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    process.exit(0);
}

// runTest();
