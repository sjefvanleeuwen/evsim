import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SimulatedAssetStore } from '../../lib/simulation/backend/SimulatedAssetStore';
import type { Asset } from '../../lib/simulation/data/AssetGenerator';
import { SimulationClock } from '../../lib/simulation/SimulationClock';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AssetsLayer: React.FC<{ assets: Asset[]; showAvailable: boolean }> = ({ assets, showAvailable }) => {
  const map = useMap();
  const canvasRef = useRef<L.Canvas | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Create a canvas renderer
    if (!canvasRef.current) {
      canvasRef.current = L.canvas({ padding: 0.5 });
    }

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const renderer = canvasRef.current;

    assets.forEach(asset => {
      // Visibility Logic
      // 1. Always show CHARGING
      // 2. Always show AH_STORE (Blue dots request)
      // 3. Only show other AVAILABLE if showAvailable is true
      const isAH = asset.locationType === 'AH_STORE';
      const isCharging = asset.status === 'CHARGING';
      
      if (!isCharging && !isAH && !showAvailable) return;

      // Color Logic
      let color = '#10b981'; // Green (Default Available)
      let radius = 2;
      let opacity = 0.4;

      if (isCharging) {
          color = '#ef4444'; // Red (Charging)
          radius = 4;
          opacity = 0.9;
      } else if (isAH) {
          color = '#3b82f6'; // Blue (Albert Heijn Available)
          radius = 3; // Slightly larger than green
          opacity = 0.8;
      }

      // Render
      const marker = L.circleMarker([asset.lat, asset.lon], {
          renderer: renderer,
          radius: radius,
          fillColor: color,
          color: undefined,
          weight: 0,
          fillOpacity: opacity
      }).addTo(map);
        
      if (isCharging || isAH) {
            marker.bindPopup(`
                <b>${asset.id}</b><br/>
                ${asset.city}<br/>
                ${asset.address}<br/>
                Type: ${isAH ? 'Albert Heijn (Fast)' : (asset.locationType || 'Public')}<br/>
                Status: ${asset.status}
            `);
      }
        
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [assets, map, showAvailable]);

  return null;
};

export const NetworkMap: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [virtualTime, setVirtualTime] = useState<Date>(new Date());
  const [showAvailable, setShowAvailable] = useState(false);

  useEffect(() => {
    const store = SimulatedAssetStore.getInstance();
    setAssets(store.getAssets()); // Initial load
    const unsubscribe = store.subscribe(setAssets);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const clock = SimulationClock.getInstance();
    const unsubscribe = clock.subscribe(setVirtualTime);
    return unsubscribe;
  }, []);

  return (
    <div className="h-[600px] w-full relative rounded-lg overflow-hidden border border-gray-700">
      <div className="absolute top-4 right-4 z-[1000] bg-gray-900/90 p-4 rounded border border-gray-700 text-white shadow-xl backdrop-blur">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Simulation Time (100x)</div>
        <div className="text-2xl font-mono font-bold text-green-400">
          {virtualTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-sm font-mono text-gray-300 mb-2">
          {virtualTime.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Active Chargers: <span className="text-white font-bold">{assets.filter(a => a.status === 'CHARGING').length}</span>
        </div>
        <div className="text-xs text-gray-500">
          Total Assets: <span className="text-white font-bold">{assets.length}</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={showAvailable} 
                    onChange={(e) => setShowAvailable(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-green-500 rounded border-gray-600 bg-gray-800 focus:ring-green-500 focus:ring-offset-gray-900"
                />
                <span className="text-sm text-gray-300">Show Available</span>
            </label>
        </div>
      </div>

      <MapContainer 
        center={[52.1326, 5.2913]} // Center of Netherlands
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
        className="bg-gray-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <AssetsLayer assets={assets} showAvailable={showAvailable} />
      </MapContainer>
    </div>
  );
};
