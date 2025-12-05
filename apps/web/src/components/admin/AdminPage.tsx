import React, { useState, useEffect } from 'react';
import { GamificationStore } from '../../lib/gamification/GamificationStore';

export const AdminPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [missionMap, setMissionMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const missions = GamificationStore.getInstance().getMissions();
    const map: Record<string, string> = {};
    missions.forEach(m => {
      map[m.id] = m.title;
    });
    setMissionMap(map);
  }, []);

  const handleVerify = () => {
    if (!input.trim()) return;
    
    const lines = input.split('\n');
    const newResults = [];

    for (const line of lines) {
        if (!line.trim()) continue;

        // Extract key using regex, looking for KEY- followed by base64 chars
        const match = line.match(/(KEY-[A-Za-z0-9+/=]+)/);
        if (match) {
            const key = match[1];
            const verification = GamificationStore.verifyKey(key);
            newResults.push({
                originalLine: line,
                key,
                ...verification
            });
        } else {
             // Line with content but no key
             newResults.push({
                 originalLine: line,
                 valid: false,
                 error: 'No key found'
             });
        }
    }
    setResults(newResults);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-green-400">🔐 Mission Key Verification</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl h-fit">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    Paste Keys (One per line or bulk text)
                </label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`System Failure Detected: KEY-XYZ...\nCapacity Alert: KEY-ABC...`}
                    className="w-full h-64 bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-xs mb-4"
                />
                <button
                    onClick={handleVerify}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors"
                >
                    Verify All
                </button>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-4">
                {results.length > 0 && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-900 text-gray-400 uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-3">Mission</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Metadata</th>
                                    <th className="px-4 py-3">Session</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {results.map((res, idx) => (
                                    <tr key={idx} className={res.valid ? 'bg-green-900/10' : 'bg-red-900/10'}>
                                        <td className="px-4 py-3 font-medium">
                                            {res.valid && res.data ? (
                                                <div className="flex flex-col">
                                                    <span className="text-white">{missionMap[res.data.missionId] || res.data.missionId}</span>
                                                    <span className="text-xs text-gray-500 font-mono">{res.data.missionId}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 italic truncate max-w-[200px] block" title={res.originalLine}>
                                                    {res.originalLine}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {res.valid ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Valid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {res.error}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {res.valid && res.data?.metadata ? (
                                                <pre className="text-green-400">
                                                    {JSON.stringify(res.data.metadata)}
                                                </pre>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400">
                                            {res.valid && res.data ? res.data.sessionId : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {results.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        Paste keys on the left to verify them.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
