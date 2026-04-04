import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useAutomation() {
  const { profile, user } = useAuth();

  useEffect(() => {
    if (!profile || !user) return;

    const simulateWeather = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulate-weather`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              location: profile.location,
            }),
          }
        );

        if (!response.ok) {
          console.error('Weather simulation failed');
        }
      } catch (error) {
        console.error('Error simulating weather:', error);
      }
    };

    const calculateRisk = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-risk`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await import('../lib/supabase')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error('Risk calculation failed');
        }
      } catch (error) {
        console.error('Error calculating risk:', error);
      }
    };

    simulateWeather();
    calculateRisk();

    const weatherInterval = setInterval(simulateWeather, 20000);
    const riskInterval = setInterval(calculateRisk, 30000);

    return () => {
      clearInterval(weatherInterval);
      clearInterval(riskInterval);
    };
  }, [profile, user]);
}
