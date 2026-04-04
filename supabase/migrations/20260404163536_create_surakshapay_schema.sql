/*
  # SurakshaPay Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `location` (text)
      - `platform` (text) - gig platform (Uber, Zomato, etc.)
      - `weekly_income` (numeric)
      - `current_latitude` (numeric)
      - `current_longitude` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `policies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `weekly_premium` (numeric)
      - `coverage_amount` (numeric)
      - `status` (text) - active, expired, claimed
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_at` (timestamptz)
    
    - `risk_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `location` (text)
      - `risk_level` (text) - low, medium, high
      - `risk_score` (numeric) - 0-100
      - `factors` (jsonb) - weather, location, income data
      - `created_at` (timestamptz)
    
    - `weather_events`
      - `id` (uuid, primary key)
      - `location` (text)
      - `rainfall_mm` (numeric)
      - `temperature_c` (numeric)
      - `aqi` (numeric)
      - `timestamp` (timestamptz)
      - `triggered_claim` (boolean)
    
    - `claims`
      - `id` (uuid, primary key)
      - `policy_id` (uuid, references policies)
      - `user_id` (uuid, references user_profiles)
      - `trigger_type` (text) - rainfall, temperature, aqi
      - `trigger_value` (numeric)
      - `claim_amount` (numeric)
      - `status` (text) - pending, approved, paid
      - `triggered_at` (timestamptz)
      - `processed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  platform text NOT NULL,
  weekly_income numeric NOT NULL,
  current_latitude numeric DEFAULT 0,
  current_longitude numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  weekly_premium numeric NOT NULL,
  coverage_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own policies"
  ON policies FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Risk Assessments Table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  location text NOT NULL,
  risk_level text NOT NULL,
  risk_score numeric NOT NULL,
  factors jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own risk assessments"
  ON risk_assessments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own risk assessments"
  ON risk_assessments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Weather Events Table
CREATE TABLE IF NOT EXISTS weather_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  rainfall_mm numeric DEFAULT 0,
  temperature_c numeric DEFAULT 0,
  aqi numeric DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  triggered_claim boolean DEFAULT false
);

ALTER TABLE weather_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view weather events"
  ON weather_events FOR SELECT
  TO authenticated
  USING (true);

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trigger_type text NOT NULL,
  trigger_value numeric NOT NULL,
  claim_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  triggered_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_policies_user_id ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_events_location ON weather_events(location);
CREATE INDEX IF NOT EXISTS idx_weather_events_timestamp ON weather_events(timestamp);