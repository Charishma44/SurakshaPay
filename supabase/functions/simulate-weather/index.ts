import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function generateWeatherData(location: string) {
  const baseTemp = 32;
  const baseRainfall = 0;
  const baseAQI = 150;

  const tempVariation = (Math.random() - 0.5) * 20;
  const rainfallChance = Math.random();
  const aqiVariation = (Math.random() - 0.5) * 100;

  let rainfall = 0;
  if (rainfallChance > 0.8) {
    rainfall = Math.random() * 80;
  } else if (rainfallChance > 0.6) {
    rainfall = Math.random() * 30;
  }

  const temperature = Math.max(20, Math.min(48, baseTemp + tempVariation));
  const aqi = Math.max(0, Math.min(500, baseAQI + aqiVariation));

  return {
    location,
    rainfall_mm: parseFloat(rainfall.toFixed(1)),
    temperature_c: parseFloat(temperature.toFixed(1)),
    aqi: Math.round(aqi),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { location } = await req.json();

    if (!location) {
      throw new Error('Location is required');
    }

    const weatherData = generateWeatherData(location);

    const { data: insertedWeather, error: insertError } = await supabase
      .from('weather_events')
      .insert(weatherData)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const triggersActivated =
      weatherData.rainfall_mm > 50 ||
      weatherData.temperature_c > 42 ||
      weatherData.aqi > 300;

    if (triggersActivated) {
      const { data: activePolicies, error: policiesError } = await supabase
        .from('policies')
        .select('*, user_profiles!inner(location)')
        .eq('status', 'active')
        .eq('user_profiles.location', location);

      if (policiesError) {
        console.error('Error fetching policies:', policiesError);
      } else if (activePolicies && activePolicies.length > 0) {
        const claims = activePolicies.map(policy => {
          let triggerType = '';
          let triggerValue = 0;

          if (weatherData.rainfall_mm > 50) {
            triggerType = 'rainfall';
            triggerValue = weatherData.rainfall_mm;
          } else if (weatherData.temperature_c > 42) {
            triggerType = 'temperature';
            triggerValue = weatherData.temperature_c;
          } else if (weatherData.aqi > 300) {
            triggerType = 'aqi';
            triggerValue = weatherData.aqi;
          }

          return {
            policy_id: policy.id,
            user_id: policy.user_id,
            trigger_type: triggerType,
            trigger_value: triggerValue,
            claim_amount: policy.coverage_amount * 0.1,
            status: 'approved',
          };
        });

        const { error: claimsError } = await supabase
          .from('claims')
          .insert(claims);

        if (claimsError) {
          console.error('Error creating claims:', claimsError);
        }

        await supabase
          .from('weather_events')
          .update({ triggered_claim: true })
          .eq('id', insertedWeather.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        weather: weatherData,
        triggered: triggersActivated,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
