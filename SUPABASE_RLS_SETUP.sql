-- Run this SQL in your AUTH Supabase instance (bbbxtrcvhrfvexxchwob.supabase.co)
-- Go to SQL Editor in your Supabase Dashboard and run this

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Policy: Users can insert their own profile during signup
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can view their own profile
CREATE POLICY "Enable read access for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
