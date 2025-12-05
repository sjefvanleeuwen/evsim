import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SimulatedAssetStore } from '../../lib/simulation/backend/SimulatedAssetStore';
import type { Asset } from '../../lib/simulation/data/AssetGenerator';
import { SimulationClock } from '../../lib/simulation/SimulationClock';
import { useGamification } from '../../lib/gamification/GamificationStore';

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

const AssetsLayer: React.FC<{ assets: Asset[]; showAvailable: boolean; onAssetClick: (a: Asset) => void; searchTarget: Asset | null }> = ({ assets, showAvailable, onAssetClick, searchTarget }) => {
  const map = useMap();
  const canvasRef = useRef<L.Canvas | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [zoom, setZoom] = useState(map.getZoom());

  // Track Zoom Level
  useEffect(() => {
    const onZoomEnd = () => {
        setZoom(map.getZoom());
    };
    map.on('zoomend', onZoomEnd);
    return () => {
        map.off('zoomend', onZoomEnd);
    };
  }, [map]);

  // Update Radii on Zoom
  useEffect(() => {
    const baseRadius = zoom > 14 ? 10 : zoom > 12 ? 5 : 2;
    
    markersRef.current.forEach(marker => {
        const asset = (marker.options as any).data as Asset;
        if (!asset) return;

        let r = baseRadius;
        if (asset.status === 'CHARGING') r *= 1.5;
        else if (asset.locationType === 'AH_STORE') r *= 1.2;

        marker.setRadius(r);
    });
  }, [zoom]);

  useEffect(() => {
    if (searchTarget && map) {
        map.setView([searchTarget.lat, searchTarget.lon], 14);
        onAssetClick(searchTarget);

        // Add Beacon Marker
        const beaconIcon = L.divIcon({
            className: 'custom-beacon',
            html: `<div class="beacon-container"><div class="beacon-core"></div><div class="beacon-ripple"></div></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    
        const marker = L.marker([searchTarget.lat, searchTarget.lon], {
            icon: beaconIcon,
            zIndexOffset: 1000
        }).addTo(map);
    
        return () => {
            marker.remove();
        };
    }
  }, [searchTarget, map, onAssetClick]);

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
    const baseRadius = zoom > 14 ? 10 : zoom > 12 ? 5 : 2;

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
      let radius = baseRadius;
      let opacity = 0.6;

      if (isCharging) {
          color = '#ef4444'; // Red (Charging)
          radius *= 1.5;
          opacity = 0.9;
      } else if (isAH) {
          color = '#3b82f6'; // Blue (Albert Heijn Available)
          radius *= 1.2;
          opacity = 0.8;
      }

      // Render
      const marker = L.circleMarker([asset.lat, asset.lon], {
          renderer: renderer,
          radius: radius,
          fillColor: color,
          color: undefined,
          weight: 0,
          fillOpacity: opacity,
          data: asset // Attach data for zoom updates
      } as any).addTo(map);
        
      marker.on('click', () => {
          onAssetClick(asset);
          L.popup()
            .setLatLng([asset.lat, asset.lon])
            .setContent(`
                <div style="min-width: 200px; font-family: sans-serif;">
                    <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 16px;">${asset.id}</h3>
                    <p style="margin: 0; color: #4b5563; font-size: 14px;">${asset.address}</p>
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">${asset.city}</p>
                    <div style="margin-top: 8px; display: inline-block; padding: 2px 6px; background: #f3f4f6; border-radius: 4px; font-size: 12px; font-family: monospace; border: 1px solid #e5e7eb;">
                        ${asset.status}
                    </div>
                </div>
            `)
            .openOn(map);
      });
        
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [assets, map, showAvailable, onAssetClick]); // Removed zoom from dependency to avoid full redraw

  return null;
};

export const NetworkMap: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [virtualTime, setVirtualTime] = useState<Date>(new Date());
  const [showAvailable, setShowAvailable] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState<Asset | null>(null);
  const { completeMission } = useGamification();

  useEffect(() => {
    const store = SimulatedAssetStore.getInstance();
    const clock = SimulationClock.getInstance();
    
    // Initial load
    setAssets(store.getAssets());

    // Subscribe to updates
    const unsubscribe = store.subscribe((updatedAssets) => {
      setAssets(updatedAssets);
    });

    const clockUnsub = clock.subscribe((time) => {
        setVirtualTime(time);
    });

    return () => {
        unsubscribe();
        clockUnsub();
    };
  }, []);

  const handleSearch = () => {
      const target = assets.find(a => a.id.toLowerCase() === searchQuery.toLowerCase());
      if (target) {
          setSearchTarget(target);
          setSelectedAsset(target);
      } else {
          alert('Asset not found');
      }
  };

  const handleRemoteStart = () => {
      if (selectedAsset?.id === 'EV-REMOTE-001') {
          completeMission('remote_control');
          alert('Remote Start Command Sent. Session Initiated.');
      } else {
          alert('Command Sent.');
      }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative">
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
        <div>
            <h2 className="text-xl font-bold text-white">Network Operations Center</h2>
            <div className="text-sm text-gray-400 font-mono">
                System Time: {virtualTime.toLocaleTimeString()} | Active Assets: {assets.length}
            </div>
        </div>
        
        <div className="flex items-center space-x-2">
            <input 
                type="text" 
                placeholder="Search Asset ID..." 
                className="bg-gray-900 border border-gray-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                Find
            </button>
        </div>

        <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={showAvailable} 
                    onChange={(e) => setShowAvailable(e.target.checked)}
                    className="form-checkbox bg-gray-700 border-gray-600 text-green-500 rounded"
                />
                <span>Show Available Chargers</span>
            </label>
            <div className="flex space-x-2 text-xs">
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span> Charging</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span> Available</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span> AH Store</span>
            </div>
        </div>
      </div>
      
      <div className="flex-1 relative z-0">
        <MapContainer center={[52.1326, 5.2913]} zoom={8} style={{ height: '100%', width: '100%' }}>
            <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <AssetsLayer assets={assets} showAvailable={showAvailable} onAssetClick={setSelectedAsset} searchTarget={searchTarget} />
        </MapContainer>

        {selectedAsset && (
            <div className="absolute top-4 right-4 w-80 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-lg shadow-2xl p-6 z-[1000]">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">{selectedAsset.id}</h3>
                    <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-white">×</button>
                </div>
                
                <div className="space-y-3 text-sm text-gray-300 mb-6">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className={`font-bold ${selectedAsset.status === 'CHARGING' ? 'text-red-500' : 'text-green-500'}`}>
                            {selectedAsset.status}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="text-right">{selectedAsset.address}, {selectedAsset.city}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <span>{selectedAsset.locationType}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <button 
                        onClick={handleRemoteStart}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium transition-colors"
                    >
                        Remote Start Session
                    </button>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-medium transition-colors">
                        Reboot Device
                    </button>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-medium transition-colors">
                        View Logs
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};


