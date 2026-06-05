-- Business registration system migration
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS business_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  session_token text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id text NOT NULL REFERENCES business_owners(business_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  xp_reward integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_owners_session ON business_owners(session_token);
CREATE INDEX IF NOT EXISTS idx_business_owners_email ON business_owners(email);
CREATE INDEX IF NOT EXISTS idx_business_challenges_business ON business_challenges(business_id);
