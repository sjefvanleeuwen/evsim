import React, { useEffect, useState } from 'react';
import { SimulatedCDRStore, type CDR } from '../../lib/simulation/backend/SimulatedCDRStore';
import { useGamification } from '../../lib/gamification/GamificationStore';
import { Modal } from '../common/Modal';

export const SessionList: React.FC = () => {
  const [cdrs, setCdrs] = useState<CDR[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CDR; direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 10;
  const { completeMission } = useGamification();
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    const store = SimulatedCDRStore.getInstance();
    const unsubscribe = store.subscribe(setCdrs);
    return unsubscribe;
  }, []);

  // Filter and Sort Logic
  const filteredCdrs = cdrs.filter(cdr => 
    cdr.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cdr.locationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCdrs = React.useMemo(() => {
    let sortableCdrs = [...filteredCdrs];
    if (sortConfig !== null) {
      sortableCdrs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCdrs;
  }, [filteredCdrs, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedCdrs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCdrs = sortedCdrs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const requestSort = (key: keyof CDR) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAudit = (sessionId: string, cost: number, energy: number) => {
    if (sessionId === 'SES-VIP-999') {
        completeMission('audit_session');
        setModal({
          isOpen: true,
          title: 'Audit Complete',
          message: 'Session Audited. Revenue Verified.',
          type: 'success'
        });
    } else if (cost === 0 && energy > 10) {
        completeMission('detect_theft');
        setModal({
          isOpen: true,
          title: 'Security Alert',
          message: 'Energy Theft Flagged! Investigation started.',
          type: 'warning'
        });
    } else {
        setModal({
          isOpen: true,
          title: 'Audit Complete',
          message: 'Session Verified: No anomalies found.',
          type: 'info'
        });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-400 uppercase tracking-wider">Charge Sessions (CDRs)</h2>
        <div className="flex items-center space-x-4">
            <input 
                type="text" 
                placeholder="Search Session or Location..." 
                className="bg-gray-900 border border-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="text-sm text-gray-500">
                Total: <span className="text-white font-bold">{filteredCdrs.length}</span>
            </div>
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
            <table className="w-full text-left text-xs text-gray-400">
              <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                <tr>
                  <th className="px-2 py-2 cursor-pointer hover:text-white" onClick={() => requestSort('sessionId')}>
                    Session ID {sortConfig?.key === 'sessionId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2 cursor-pointer hover:text-white" onClick={() => requestSort('locationId')}>
                    Location {sortConfig?.key === 'locationId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2 cursor-pointer hover:text-white" onClick={() => requestSort('totalEnergy')}>
                    Energy {sortConfig?.key === 'totalEnergy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2 cursor-pointer hover:text-white" onClick={() => requestSort('totalCost')}>
                    Cost {sortConfig?.key === 'totalCost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2 cursor-pointer hover:text-white" onClick={() => requestSort('stopTime')}>
                    End Time {sortConfig?.key === 'stopTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2 cursor-pointer hover:text-white" onClick={() => requestSort('status')}>
                    Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900/50">
                {currentCdrs.map(cdr => (
                  <tr key={cdr.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-2 py-1 font-mono text-blue-400">{cdr.sessionId}</td>
                    <td className="px-2 py-1 text-white">{cdr.locationId}</td>
                    <td className="px-2 py-1">{cdr.totalEnergy.toFixed(2)} kWh</td>
                    <td className="px-2 py-1 text-green-400">€{cdr.totalCost.toFixed(2)}</td>
                    <td className="px-2 py-1">{new Date(cdr.stopTime).toLocaleString()}</td>
                    <td className="px-2 py-1">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-900/30 text-green-400 rounded border border-green-800">
                        {cdr.status}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                        <button 
                            onClick={() => handleAudit(cdr.sessionId, cdr.totalCost, cdr.totalEnergy)}
                            className="text-[10px] bg-gray-700 hover:bg-gray-600 text-white px-2 py-0.5 rounded"
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
            <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
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

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        type={modal.type}
      >
        {modal.message}
      </Modal>
    </div>
  );
};
