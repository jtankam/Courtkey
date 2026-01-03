import { Scale, LogOut, User, Calendar, Search, Settings, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAttorney = userProfile?.user_type === 'attorney';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CourtKey</h1>
                <p className="text-xs text-slate-500">{userProfile?.full_name}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              {isAttorney ? (
                <>
                  <button
                    onClick={() => onNavigate('profile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'profile'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => onNavigate('services')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'services'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Services
                  </button>
                  <button
                    onClick={() => onNavigate('availability')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'availability'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Availability
                  </button>
                  <button
                    onClick={() => onNavigate('appointments')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'appointments'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Appointments
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('search')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'search' || currentView === 'booking'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Find Attorney
                  </button>
                  <button
                    onClick={() => onNavigate('appointments')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'appointments'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    My Appointments
                  </button>
                </>
              )}
            </nav>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

          <nav className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
            {isAttorney ? (
              <>
                <button
                  onClick={() => onNavigate('profile')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    currentView === 'profile'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => onNavigate('services')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    currentView === 'services'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Services
                </button>
                <button
                  onClick={() => onNavigate('availability')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    currentView === 'availability'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Availability
                </button>
                <button
                  onClick={() => onNavigate('appointments')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    currentView === 'appointments'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Appointments
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('search')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    currentView === 'search' || currentView === 'booking'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Find Attorney
                </button>
                <button
                  onClick={() => onNavigate('appointments')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    currentView === 'appointments'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  My Appointments
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
