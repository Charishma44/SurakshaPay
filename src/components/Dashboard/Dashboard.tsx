import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import GPSTracker from './GPSTracker';
import RiskAssessment from './RiskAssessment';
import PolicyCard from './PolicyCard';
import ClaimsList from './ClaimsList';
import WeatherDisplay from './WeatherDisplay';
import PaymentSimulator from './PaymentSimulator';
import { useAutomation } from '../../hooks/useAutomation';

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  useAutomation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SurakshaPay</h1>
              <p className="text-sm text-gray-600">Parametric Insurance Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="font-medium text-gray-900">{profile?.name}</p>
                </div>
                <p className="text-xs text-gray-500">{profile?.platform}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PolicyCard />
          </div>
          <div>
            <PaymentSimulator />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RiskAssessment />
          <GPSTracker />
        </div>

        <div className="mb-6">
          <WeatherDisplay />
        </div>

        <div>
          <ClaimsList />
        </div>
      </main>
    </div>
  );
}
