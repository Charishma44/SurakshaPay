import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WeatherData {
  rainfall_mm: number;
  temperature_c: number;
  aqi: number;
}

function calculateRiskScore(
  location: string,
  weeklyIncome: number,
  weather: WeatherData
): { score: number; level: 'low' | 'medium' | 'high'; factors: Record<string, unknown> } {
  let score = 0;
  const factors: Record<string, unknown> = {};

  if (weather.rainfall_mm > 50) {
    score += 35;
    factors.heavy_rainfall = 'High risk';
  } else if (weather.rainfall_mm > 30) {
    score += 20;
    factors.moderate_rainfall = 'Medium risk';
  } else {
    factors.rainfall = 'Normal';
  }

  if (weather.temperature_c > 42) {
    score += 30;
    factors.extreme_heat = 'Very high';
  } else if (weather.temperature_c > 38) {
    score += 15;
    factors.high_temperature = 'Elevated';
  } else {
    factors.temperature = 'Normal';
  }

  if (weather.aqi > 300) {
    score += 25;
    factors.severe_pollution = 'Hazardous';
  } else if (weather.aqi > 200) {
    score += 15;
    factors.high_pollution = 'Unhealthy';
  } else {
    factors.air_quality = 'Acceptable';
  }

  if (weeklyIncome < 3000) {
    score += 10;
    factors.income_vulnerability = 'Low income';
  }

  const highRiskCities = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'];
  if (highRiskCities.some(city => location.toLowerCase().includes(city.toLowerCase()))) {
    score += 5;
    factors.location_risk = 'High-risk metro';
  }

  let level: 'low' | 'medium' | 'high';
  if (score >= 60) {
    level = 'high';
  } else if (score >= 30) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { score: Math.min(score, 100), level, factors };
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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    const { data: weather, error: weatherError } = await supabase
      .from('weather_events')
      .select('*')
      .eq('location', profile.location)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (weatherError) {
      throw new Error('Error fetching weather data');
    }

    const weatherData: WeatherData = weather || {
      rainfall_mm: 0,
      temperature_c: 30,
      aqi: 100,
    };

    const riskAssessment = calculateRiskScore(
      profile.location,
      profile.weekly_income,
      weatherData
    );

    const { error: insertError } = await supabase
      .from('risk_assessments')
      .insert({
        user_id: user.id,
        location: profile.location,
        risk_level: riskAssessment.level,
        risk_score: riskAssessment.score,
        factors: riskAssessment.factors,
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        risk: riskAssessment,
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
