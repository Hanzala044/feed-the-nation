-- ⚠️ CRITICAL: Run this SQL in your Supabase Dashboard NOW!
-- Go to: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/editor
-- Click: SQL Editor → New Query
-- Paste this entire script and click RUN

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('donor', 'volunteer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone TEXT,
  address TEXT,
  bio TEXT,
  avatar_url TEXT,
  notification_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow public profile reads" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile deletes" ON profiles;

-- Allow anyone to insert profiles (for signup)
CREATE POLICY "Allow public profile creation"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read profiles (for donor/volunteer matching)
CREATE POLICY "Allow public profile reads"
  ON profiles FOR SELECT
  USING (true);

-- Allow anyone to update profiles
CREATE POLICY "Allow profile updates"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow profile deletes (for admin)
CREATE POLICY "Allow profile deletes"
  ON profiles FOR DELETE
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Success message
SELECT 'SUCCESS: profiles table created with RLS policies!' AS result;
