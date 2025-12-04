import React, { useEffect, useState } from 'react';
import { SimulatedAssetStore } from '../../lib/simulation/backend/SimulatedAssetStore';
import { type Asset } from '../../lib/simulation/data/AssetGenerator';

interface CityOccupancy {
  city: string;
  total: number;
  occupied: number;
  percentage: number;
}

export const OccupancyView: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const store = SimulatedAssetStore.getInstance();
    const unsubscribe = store.subscribe(setAssets);
    return unsubscribe;
  }, []);

  // Filter for Albert Heijn stores
  const ahAssets = assets.filter(a => a.locationType === 'AH_STORE');
  
  // Calculate Global Stats
  const totalAh = ahAssets.length;
  const occupiedAh = ahAssets.filter(a => a.status === 'CHARGING').length;
  const globalOccupancy = totalAh > 0 ? (occupiedAh / totalAh) * 100 : 0;

  // Group by City
  const cityStats: CityOccupancy[] = Object.values(ahAssets.reduce((acc, asset) => {
    if (!acc[asset.city]) {
      acc[asset.city] = { city: asset.city, total: 0, occupied: 0, percentage: 0 };
    }
    acc[asset.city].total++;
    if (asset.status === 'CHARGING') {
      acc[asset.city].occupied++;
    }
    return acc;
  }, {} as Record<string, CityOccupancy>))
  .map(stat => ({
    ...stat,
    percentage: (stat.occupied / stat.total) * 100
  }))
  .sort((a, b) => b.percentage - a.percentage); // Sort by highest occupancy

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary Card */}
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-[10px] font-medium uppercase">Total AH Locations</h3>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-bold text-white">{totalAh}</span>
            <span className="ml-2 text-[10px] text-gray-500">chargers</span>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-[10px] font-medium uppercase">Currently Occupied</h3>
          <div className="mt-1 flex items-baseline">
            <span className="text-xl font-bold text-blue-400">{occupiedAh}</span>
            <span className="ml-2 text-[10px] text-gray-500">sessions active</span>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-[10px] font-medium uppercase">Average Occupancy</h3>
          <div className="mt-1 flex items-baseline">
            <span className={`text-xl font-bold ${globalOccupancy > 80 ? 'text-red-400' : 'text-green-400'}`}>
              {globalOccupancy.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full ${globalOccupancy > 80 ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${globalOccupancy}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* City Breakdown */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col h-[500px]">
        <div className="px-4 py-2 border-b border-gray-800 shrink-0">
          <h3 className="text-sm font-medium text-white">Occupancy by City</h3>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-[11px] text-gray-400">
            <thead className="bg-gray-800 text-gray-200 uppercase font-medium sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Total Chargers</th>
                <th className="px-3 py-2">Occupied</th>
                <th className="px-3 py-2">Occupancy Rate</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {cityStats.map((stat) => (
                <tr key={stat.city} className="hover:bg-gray-800/50 transition">
                  <td className="px-3 py-1.5 font-medium text-white">{stat.city}</td>
                  <td className="px-3 py-1.5">{stat.total}</td>
                  <td className="px-3 py-1.5">{stat.occupied}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center">
                      <span className="w-8 text-right mr-2">{stat.percentage.toFixed(1)}%</span>
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            stat.percentage > 80 ? 'bg-red-500' : 
                            stat.percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    {stat.percentage > 90 ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-900/30 text-red-400 rounded border border-red-800">FULL</span>
                    ) : stat.percentage > 70 ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-900/30 text-yellow-400 rounded border border-yellow-800">BUSY</span>
                    ) : (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-900/30 text-green-400 rounded border border-green-800">AVAILABLE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
