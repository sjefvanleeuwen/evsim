import React, { useState, useEffect, useRef } from 'react';

interface TerminalPaneProps {
  logs: string[];
  csmsLogs: string[];
  trafficLogs: { 
    dir: 'in' | 'out'; 
    msg: any; 
    time: string;
    protocol: string;
    standard: string;
  }[];
}

export const TerminalPane: React.FC<TerminalPaneProps> = ({ logs, trafficLogs, csmsLogs }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'network' | 'ocpi' | 'csms'>('system');
  const [height, setHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      // Clamp height between 100px and 80% of window height
      const maxHeight = window.innerHeight * 0.8;
      if (newHeight >= 100 && newHeight <= maxHeight) {
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={paneRef}
      style={{ height: `${height}px` }}
      className="bg-[#1e1e1e] border-t border-[#333] flex flex-col shrink-0 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]"
    >
      {/* Resizer Handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 -mt-0.5 hover:bg-blue-500 cursor-row-resize z-50 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      />

      {/* Terminal Tabs */}
      <div className="flex border-b border-[#2b2b2b] bg-[#252526] select-none h-8 shrink-0">
        <button 
          onClick={() => setActiveTab('system')}
          className={`px-3 h-full flex items-center text-[11px] uppercase tracking-wide border-r border-[#2b2b2b] transition-colors ${
            activeTab === 'system' 
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' 
              : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
          }`}
        >
          System Output
        </button>
        <button 
          onClick={() => setActiveTab('csms')}
          className={`px-3 h-full flex items-center text-[11px] uppercase tracking-wide border-r border-[#2b2b2b] transition-colors ${
            activeTab === 'csms' 
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-green-500' 
              : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
          }`}
        >
          CSMS Logs
        </button>
        <button 
          onClick={() => setActiveTab('network')}
          className={`px-3 h-full flex items-center text-[11px] uppercase tracking-wide border-r border-[#2b2b2b] transition-colors ${
            activeTab === 'network' 
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' 
              : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
          }`}
        >
          OCPP Traffic
        </button>
        <button 
          onClick={() => setActiveTab('ocpi')}
          className={`px-3 h-full flex items-center text-[11px] uppercase tracking-wide border-r border-[#2b2b2b] transition-colors ${
            activeTab === 'ocpi' 
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-purple-500' 
              : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
          }`}
        >
          OCPI Traffic
        </button>
      </div>
      
      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs bg-[#1e1e1e] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {activeTab === 'system' ? (
          <div className="space-y-0.5">
            {logs.map((log, i) => (
              <div key={i} className="text-gray-300 font-mono text-[11px] break-all leading-tight">
                <span className="text-blue-400 opacity-70">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
            {logs.length === 0 && <div className="text-gray-500 italic p-2">No system logs yet...</div>}
          </div>
        ) : activeTab === 'csms' ? (
          <div className="space-y-0.5">
            {csmsLogs.map((log, i) => (
              <div key={i} className="text-gray-300 font-mono text-[11px] break-all leading-tight">
                <span className="text-green-400 opacity-70">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
            {csmsLogs.length === 0 && <div className="text-gray-500 italic p-2">No CSMS logs yet...</div>}
          </div>
        ) : activeTab === 'network' ? (
          <div className="space-y-0.5">
            {trafficLogs.filter(l => l.standard.includes('OCPP')).map((log, i) => (
              <div key={i} className="border-b border-[#333] pb-1 mb-1 last:border-0">
                <div className="flex items-center gap-2 mb-0.5 opacity-80">
                  <span className="text-gray-500 text-[10px]">[{log.time}]</span>
                  
                  <span className="px-1 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300">
                    {log.protocol}
                  </span>
                  
                  <span className="px-1 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300">
                    {log.standard}
                  </span>

                  <span className={`px-1 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider ${
                    log.dir === 'out' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-200'
                  }`}>
                    {log.dir === 'out' ? 'OUT' : 'IN'}
                  </span>
                </div>
                <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap pl-3 border-l border-[#333] text-[10px] leading-tight font-mono">
                  {JSON.stringify(log.msg, null, 2)}
                </pre>
              </div>
            ))}
            {trafficLogs.filter(l => l.standard.includes('OCPP')).length === 0 && <div className="text-gray-500 italic p-2">No OCPP traffic...</div>}
          </div>
        ) : (
          <div className="space-y-0.5">
            {trafficLogs.filter(l => l.standard.includes('OCPI')).map((log, i) => (
              <div key={i} className="border-b border-[#333] pb-1 mb-1 last:border-0">
                <div className="flex items-center gap-2 mb-0.5 opacity-80">
                  <span className="text-gray-500 text-[10px]">[{log.time}]</span>
                  
                  <span className="px-1 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300">
                    {log.protocol}
                  </span>
                  
                  <span className="px-1 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-green-500/20 text-green-300">
                    {log.standard}
                  </span>

                  <span className={`px-1 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider ${
                    log.dir === 'out' ? 'bg-purple-500/20 text-purple-300' : 'bg-yellow-500/20 text-yellow-200'
                  }`}>
                    {log.dir === 'out' ? 'OUT' : 'IN'}
                  </span>
                </div>
                <pre className="text-gray-300 overflow-x-auto whitespace-pre-wrap pl-3 border-l border-[#333] text-[10px] leading-tight font-mono">
                  {typeof log.msg === 'string' ? log.msg : JSON.stringify(log.msg, null, 2)}
                </pre>
              </div>
            ))}
            {trafficLogs.filter(l => l.standard.includes('OCPI')).length === 0 && <div className="text-gray-500 italic p-2">No OCPI traffic...</div>}
          </div>
        )}
      </div>
    </div>
  );
};
