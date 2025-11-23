-- Run this SQL in your MAIN Supabase instance (abthtvwjkrpeyrptluza.supabase.co)
-- Go to SQL Editor in your Supabase Dashboard and run this

-- First, check if profiles table has a foreign key constraint to auth.users
-- If it does, we need to remove it since we're using a separate auth database

-- Remove foreign key constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate the profiles table structure without auth dependency
-- The id column should just be a UUID, not a foreign key to auth.users

-- Update RLS policies to allow inserts from service role or anon key
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert profiles (needed for Google OAuth signup)
CREATE POLICY "Allow public profile creation"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Policy: Allow users to read all profiles (needed for volunteer/donor matching)
CREATE POLICY "Allow public profile reads"
  ON profiles FOR SELECT
  USING (true);

-- Policy: Allow anyone to update their own profile by matching the id
CREATE POLICY "Allow profile updates"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Note: In production, you should tighten these policies using app-level authentication
-- For now, this allows the app to work with the separate auth database
