import React, { useEffect, useState } from 'react';
import { SimulatedCDRStore, type CDR } from '../../lib/simulation/backend/SimulatedCDRStore';
import { useGamification } from '../../lib/gamification/GamificationStore';

export const SessionList: React.FC = () => {
  const [cdrs, setCdrs] = useState<CDR[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { completeMission } = useGamification();

  useEffect(() => {
    const store = SimulatedCDRStore.getInstance();
    const unsubscribe = store.subscribe(setCdrs);
    return unsubscribe;
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(cdrs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCdrs = cdrs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const handleAudit = (sessionId: string, cost: number, energy: number) => {
    if (sessionId === 'SES-VIP-999') {
        completeMission('audit_session');
        alert('Session Audited. Revenue Verified.');
    } else if (cost === 0 && energy > 10) {
        completeMission('detect_theft');
        alert('SECURITY ALERT: Energy Theft Flagged! Investigation started.');
    } else {
        alert('Session Verified: No anomalies found.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-400 uppercase tracking-wider">Charge Sessions (CDRs)</h2>
        <div className="text-sm text-gray-500">
            Total: <span className="text-white font-bold">{cdrs.length}</span>
        </div>
      </div>

      {cdrs.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-lg border border-gray-800">
          No charge sessions recorded yet.
        </div>
      )}
      
      {cdrs.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                <tr>
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Energy</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">End Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900/50">
                {currentCdrs.map(cdr => (
                  <tr key={cdr.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 font-mono text-blue-400">{cdr.sessionId}</td>
                    <td className="px-4 py-3 text-white">{cdr.locationId}</td>
                    <td className="px-4 py-3">{cdr.totalEnergy.toFixed(2)} kWh</td>
                    <td className="px-4 py-3 text-green-400">€{cdr.totalCost.toFixed(2)}</td>
                    <td className="px-4 py-3">{new Date(cdr.stopTime).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-bold bg-green-900/30 text-green-400 rounded border border-green-800">
                        {cdr.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                        <button 
                            onClick={() => handleAudit(cdr.sessionId, cdr.totalCost, cdr.totalEnergy)}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                            Audit
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-800">
            <button 
                onClick={handlePrev} 
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="text-sm text-gray-400">
                Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
            </span>
            <button 
                onClick={handleNext} 
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
