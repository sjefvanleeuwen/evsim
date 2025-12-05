import { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { ConnectorsPage } from './components/ConnectorsPage'
import { CPQWizard } from './components/cpq/CPQWizard'
import { QuoteList } from './components/portal/QuoteList'
import { InstallerApp } from './components/installer/InstallerApp'
import { Navbar } from './components/Navbar'
import { MissionControl } from './components/gamification/MissionControl'
import { WelcomeScreen } from './components/gamification/WelcomeScreen'
import { DDDChallenge } from './components/gamification/DDDChallenge'
import { AdminPage } from './components/admin/AdminPage'
import { HEMSSimulator } from './components/hems/HEMSSimulator'
import { AbbreviationsPage } from './components/AbbreviationsPage'
import type { VehicleSettings } from './components/VehicleControls'

function App() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<'dashboard' | 'connectors' | 'cpq' | 'portal' | 'installer' | 'architecture' | 'hems' | 'glossary'>('dashboard');
  const [simSettings, setSimSettings] = useState<VehicleSettings | null>(null);

  // Check for admin route (support /admin, /admin/, and subpaths)
  const isAdmin = window.location.pathname.includes('/admin');

  if (isAdmin) {
    return <AdminPage />;
  }

  const handleSimulate = (settings: VehicleSettings) => {
    setSimSettings(settings);
    setView('dashboard');
  };

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

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
        ) : view === 'architecture' ? (
          <DDDChallenge onComplete={() => {}} onBack={() => setView('dashboard')} />
        ) : view === 'hems' ? (
          <HEMSSimulator />
        ) : view === 'glossary' ? (
          <AbbreviationsPage />
        ) : (
          <InstallerApp />
        )}
      </main>
      <MissionControl />
    </div>
  )

}

export default App



