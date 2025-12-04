import { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { ConnectorsPage } from './components/ConnectorsPage'
import { CPQWizard } from './components/cpq/CPQWizard'
import { QuoteList } from './components/portal/QuoteList'
import { InstallerApp } from './components/installer/InstallerApp'
import { Navbar } from './components/Navbar'
import type { VehicleSettings } from './components/VehicleControls'

function App() {
  const [view, setView] = useState<'dashboard' | 'connectors' | 'cpq' | 'portal' | 'installer'>('dashboard');
  const [simSettings, setSimSettings] = useState<VehicleSettings | null>(null);

  const handleSimulate = (settings: VehicleSettings) => {
    setSimSettings(settings);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar currentView={view} onNavigate={setView} />
      <main>
        {view === 'dashboard' ? (
          <Dashboard initialSettings={simSettings} />
        ) : view === 'connectors' ? (
          <ConnectorsPage onSelectConnector={handleSimulate} />
        ) : view === 'cpq' ? (
          <CPQWizard />
        ) : view === 'portal' ? (
          <QuoteList />
        ) : (
          <InstallerApp />
        )}
      </main>
    </div>
  )

}

export default App



