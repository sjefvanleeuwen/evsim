import { DUTCH_CITIES, STREET_NAMES } from './DutchCities';

export interface Asset {
  id: string;
  city: string;
  address: string;
  lat: number;
  lon: number;
  status: 'AVAILABLE' | 'CHARGING' | 'FAULTED';
  model: string;
  locationType: 'HOME' | 'PUBLIC' | 'AH_STORE';
  lastHeartbeat?: string;
  // Session tracking
  currentSessionStartTime?: number;
  currentSessionId?: string;
}

export class AssetGenerator {
  public static generateAssets(count: number): Asset[] {
    const assets: Asset[] = [];
    
    for (let i = 0; i < count; i++) {
      // Pick a random city from our expanded list (60+ cities)
      const city = this.weightedRandomCity();
      
      // Generate a point within a reasonable radius of the city center
      // This ensures the "City" label matches the physical location.
      // Radius: 2km to 8km (Suburbs included)
      const radius = 0.02 + Math.random() * 0.06; // ~2-8km in degrees approx
      const angle = Math.random() * 2 * Math.PI;
      
      // Adjust for latitude distortion
      const latOffset = radius * Math.cos(angle) * 0.6; 
      const lonOffset = radius * Math.sin(angle);

      // Determine Type
      // 5% Albert Heijn (Blue dots)
      // 75% Home (Residential)
      // 20% Public (Street/Parking)
      const rand = Math.random();
      let locationType: 'HOME' | 'PUBLIC' | 'AH_STORE' = 'HOME';
      let model = 'HomeFlex 11kW';

      if (rand < 0.05) {
          locationType = 'AH_STORE';
          model = 'ExpressPlus 350kW'; // Always fast
      } else if (rand < 0.25) {
          locationType = 'PUBLIC';
          model = Math.random() > 0.5 ? 'ExpressPlus 350kW' : 'CommercialLevel2';
      }

      assets.push({
        id: `CP-${100000 + i}`,
        city: city.name,
        address: `${this.randomStreet()} ${Math.floor(Math.random() * 200) + 1}`,
        lat: city.lat + latOffset,
        lon: city.lon + lonOffset,
        status: Math.random() < 0.005 ? 'CHARGING' : 'AVAILABLE', // Start with 0.5% active (4 AM)
        model: model,
        locationType: locationType
      });
    }

    return assets;
  }

  private static weightedRandomCity() {
    const totalWeight = DUTCH_CITIES.reduce((sum, city) => sum + city.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const city of DUTCH_CITIES) {
      random -= city.weight;
      if (random <= 0) return city;
    }
    return DUTCH_CITIES[0];
  }

  private static randomStreet() {
    return STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
  }
}
