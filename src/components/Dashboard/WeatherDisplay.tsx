import { useEffect, useState } from 'react';
import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react';
import { supabase, WeatherEvent } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function WeatherDisplay() {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<WeatherEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadWeather();
      const interval = setInterval(loadWeather, 15000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const loadWeather = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('weather_events')
        .select('*')
        .eq('location', profile.location)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setWeather(data);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTrigger = (value: number, threshold: number, type: 'above' | 'below' = 'above') => {
    if (type === 'above') {
      return value > threshold;
    }
    return value < threshold;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Weather Conditions</h3>
      </div>

      {weather ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-4 rounded-lg border-2 ${checkTrigger(weather.rainfall_mm, 50) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <Droplets className={`w-5 h-5 mb-2 ${checkTrigger(weather.rainfall_mm, 50) ? 'text-red-600' : 'text-blue-600'}`} />
              <p className="text-xs text-gray-600 mb-1">Rainfall</p>
              <p className="text-xl font-bold text-gray-900">{weather.rainfall_mm}mm</p>
              {checkTrigger(weather.rainfall_mm, 50) && (
                <p className="text-xs text-red-600 mt-1 font-medium">Trigger: &gt;50mm</p>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${checkTrigger(weather.temperature_c, 42) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <Thermometer className={`w-5 h-5 mb-2 ${checkTrigger(weather.temperature_c, 42) ? 'text-red-600' : 'text-orange-600'}`} />
              <p className="text-xs text-gray-600 mb-1">Temperature</p>
              <p className="text-xl font-bold text-gray-900">{weather.temperature_c}°C</p>
              {checkTrigger(weather.temperature_c, 42) && (
                <p className="text-xs text-red-600 mt-1 font-medium">Trigger: &gt;42°C</p>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${checkTrigger(weather.aqi, 300) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <Wind className={`w-5 h-5 mb-2 ${checkTrigger(weather.aqi, 300) ? 'text-red-600' : 'text-gray-600'}`} />
              <p className="text-xs text-gray-600 mb-1">AQI</p>
              <p className="text-xl font-bold text-gray-900">{weather.aqi}</p>
              {checkTrigger(weather.aqi, 300) && (
                <p className="text-xs text-red-600 mt-1 font-medium">Trigger: &gt;300</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Parametric Triggers</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Heavy Rainfall</span>
                <span className={checkTrigger(weather.rainfall_mm, 50) ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                  &gt; 50mm {checkTrigger(weather.rainfall_mm, 50) && '✓'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Extreme Heat</span>
                <span className={checkTrigger(weather.temperature_c, 42) ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                  &gt; 42°C {checkTrigger(weather.temperature_c, 42) && '✓'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Poor Air Quality</span>
                <span className={checkTrigger(weather.aqi, 300) ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                  &gt; 300 {checkTrigger(weather.aqi, 300) && '✓'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(weather.timestamp).toLocaleTimeString('en-IN')}
            </p>
            {weather.triggered_claim && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                Claim Triggered
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Cloud className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No weather data available</p>
        </div>
      )}
    </div>
  );
}
