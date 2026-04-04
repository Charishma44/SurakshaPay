import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function GPSTracker() {
  const { profile, updateProfile } = useAuth();
  const [tracking, setTracking] = useState(false);
  const [coordinates, setCoordinates] = useState({
    latitude: profile?.current_latitude || 0,
    longitude: profile?.current_longitude || 0,
  });

  useEffect(() => {
    let interval: number;

    if (tracking) {
      interval = setInterval(() => {
        const newLat = 28.6139 + (Math.random() - 0.5) * 0.1;
        const newLng = 77.2090 + (Math.random() - 0.5) * 0.1;

        setCoordinates({
          latitude: newLat,
          longitude: newLng,
        });

        updateProfile({
          current_latitude: newLat,
          current_longitude: newLng,
        }).catch(console.error);
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tracking, updateProfile]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">GPS Tracking</h3>
        </div>
        <button
          onClick={() => setTracking(!tracking)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tracking
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {tracking ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Navigation className={`w-4 h-4 ${tracking ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={tracking ? 'text-green-600 font-medium' : 'text-gray-500'}>
            {tracking ? 'Tracking Active' : 'Tracking Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Latitude</p>
            <p className="font-mono text-sm text-gray-900">
              {coordinates.latitude.toFixed(6)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Longitude</p>
            <p className="font-mono text-sm text-gray-900">
              {coordinates.longitude.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Mock GPS:</strong> Simulates movement around New Delhi area for demonstration
          </p>
        </div>
      </div>
    </div>
  );
}
