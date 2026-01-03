import { useState } from 'react';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import Layout from './components/Layout';
import GuestLayout from './components/GuestLayout';
import ProfileSetup from './components/attorney/ProfileSetup';
import ServicesManager from './components/attorney/ServicesManager';
import AvailabilityManager from './components/attorney/AvailabilityManager';
import AppointmentsDashboard from './components/attorney/AppointmentsDashboard';
import AttorneySearch from './components/client/AttorneySearch';
import BookingPage from './components/client/BookingPage';
import ClientDashboard from './components/client/ClientDashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, userProfile, loading, isGuest } = useAuth();
  const [currentView, setCurrentView] = useState('default');
  const [selectedAttorneyId, setSelectedAttorneyId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!user && !userProfile && !isGuest) {
    return <AuthPage />;
  }

  if (showAuth) {
    return <AuthPage />;
  }

  if (isGuest) {
    const handleSelectAttorney = (attorneyId: string) => {
      setShowAuth(true);
    };

    return (
      <GuestLayout onShowAuth={() => setShowAuth(true)}>
        <AttorneySearch onSelectAttorney={handleSelectAttorney} />
      </GuestLayout>
    );
  }

  const isAttorney = userProfile?.user_type === 'attorney';

  useEffect(() => {
    if (currentView === 'default' && userProfile) {
      setCurrentView(userProfile.user_type === 'attorney' ? 'profile' : 'search');
    }
  }, [currentView, userProfile]);
  

  const handleSelectAttorney = (attorneyId: string) => {
    setSelectedAttorneyId(attorneyId);
    setCurrentView('booking');
  };

  const handleBackToSearch = () => {
    setSelectedAttorneyId(null);
    setCurrentView('search');
  };

  const renderContent = () => {
    if (isAttorney) {
      switch (currentView) {
        case 'profile':
          return <ProfileSetup />;
        case 'services':
          return <ServicesManager />;
        case 'availability':
          return <AvailabilityManager />;
        case 'appointments':
          return <AppointmentsDashboard />;
        default:
          return <ProfileSetup />;
      }
    } else {
      switch (currentView) {
        case 'search':
          return <AttorneySearch onSelectAttorney={handleSelectAttorney} />;
        case 'booking':
          return selectedAttorneyId ? (
            <BookingPage attorneyId={selectedAttorneyId} onBack={handleBackToSearch} />
          ) : (
            <AttorneySearch onSelectAttorney={handleSelectAttorney} />
          );
        case 'appointments':
          return <ClientDashboard />;
        default:
          return <AttorneySearch onSelectAttorney={handleSelectAttorney} />;
      }
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
