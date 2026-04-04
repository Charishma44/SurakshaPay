import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  name: string;
  location: string;
  platform: string;
  weekly_income: number;
  current_latitude: number;
  current_longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Policy {
  id: string;
  user_id: string;
  weekly_premium: number;
  coverage_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  user_id: string;
  location: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  factors: Record<string, unknown>;
  created_at: string;
}

export interface Claim {
  id: string;
  policy_id: string;
  user_id: string;
  trigger_type: string;
  trigger_value: number;
  claim_amount: number;
  status: string;
  triggered_at: string;
  processed_at?: string;
}

export interface WeatherEvent {
  id: string;
  location: string;
  rainfall_mm: number;
  temperature_c: number;
  aqi: number;
  timestamp: string;
  triggered_claim: boolean;
}
