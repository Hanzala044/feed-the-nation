-- Run this SQL in your MAIN Supabase instance (uhuctkswxybirvzwhehb.supabase.co)
-- Go to SQL Editor in your Supabase Dashboard and run this

-- First, check if you have 'profiles' table or 'users' table
-- Based on your screenshot, you have 'users' table

-- Option 1: If you want to keep using 'users' table with clerk_user_id
-- We need to create a 'profiles' table for compatibility OR rename users to profiles

-- Option 2: Create profiles table alongside users table (RECOMMENDED)
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow public profile reads" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;

-- Policy: Allow anyone to insert profiles (needed for Google OAuth signup)
CREATE POLICY "Allow public profile creation"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Policy: Allow users to read all profiles (needed for volunteer/donor matching)
CREATE POLICY "Allow public profile reads"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Allow anyone to update profiles
CREATE POLICY "Allow profile updates"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anyone to delete profiles (for admin)
CREATE POLICY "Allow profile deletes"
  ON profiles FOR DELETE
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
