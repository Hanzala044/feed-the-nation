-- ⚠️ FIX MISSING COLUMNS IN EXISTING TABLES
-- Run this SQL in: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/editor

-- ============================================
-- FIX DONATIONS TABLE - Add missing columns
-- ============================================

-- Add urgency column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='urgency') THEN
        ALTER TABLE donations ADD COLUMN urgency TEXT DEFAULT 'normal'
        CHECK (urgency IN ('urgent', 'normal', 'flexible'));
    END IF;
END $$;

-- Add expiry_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='expiry_date') THEN
        ALTER TABLE donations ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add pickup_time column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='pickup_time') THEN
        ALTER TABLE donations ADD COLUMN pickup_time TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add is_anonymous column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='is_anonymous') THEN
        ALTER TABLE donations ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add pickup_latitude column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='pickup_latitude') THEN
        ALTER TABLE donations ADD COLUMN pickup_latitude DOUBLE PRECISION;
    END IF;
END $$;

-- Add pickup_longitude column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='pickup_longitude') THEN
        ALTER TABLE donations ADD COLUMN pickup_longitude DOUBLE PRECISION;
    END IF;
END $$;

-- Add pickup_address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='pickup_address') THEN
        ALTER TABLE donations ADD COLUMN pickup_address TEXT;
    END IF;
END $$;

-- Add pickup_city column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='donations' AND column_name='pickup_city') THEN
        ALTER TABLE donations ADD COLUMN pickup_city TEXT;
    END IF;
END $$;

-- ============================================
-- FIX MESSAGES TABLE - Add receiver_id column
-- ============================================

-- Add receiver_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='messages' AND column_name='receiver_id') THEN
        ALTER TABLE messages ADD COLUMN receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- CREATE PROFILES TABLE if it doesn't exist
-- ============================================

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

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for profiles
DROP POLICY IF EXISTS "Allow public profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow public profile reads" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile deletes" ON profiles;

CREATE POLICY "Allow public profile creation" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public profile reads" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow profile updates" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow profile deletes" ON profiles FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS donations_urgency_idx ON donations(urgency);
CREATE INDEX IF NOT EXISTS donations_expiry_date_idx ON donations(expiry_date);

-- Success message
SELECT 'SUCCESS: All missing columns have been added!' AS result;
