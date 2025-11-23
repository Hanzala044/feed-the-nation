-- ═══════════════════════════════════════════════════════════════════════════════
-- 🚀 COMPLETE DATABASE SETUP - FEED THE NATION
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this ENTIRE script in: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/editor
-- This will create ALL tables with proper RLS policies from scratch
-- ═══════════════════════════════════════════════════════════════════════════════

-- ============================================
-- STEP 1: DROP EXISTING TABLES (FRESH START)
-- ============================================
-- ⚠️ WARNING: This will DELETE ALL DATA!
-- Comment out these lines if you want to keep existing data

DROP TABLE IF EXISTS delivery_proofs CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- STEP 2: CREATE PROFILES TABLE
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'volunteer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone TEXT,
  address TEXT,
  bio TEXT,
  avatar_url TEXT,
  notification_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE USING (true);

-- Indexes
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_created_at_idx ON profiles(created_at DESC);

-- ============================================
-- STEP 3: CREATE DONATIONS TABLE
-- ============================================

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  image_url TEXT,

  -- Location
  pickup_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,

  -- Dates & Times
  pickup_time TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('urgent', 'normal', 'flexible')),

  -- Privacy
  is_anonymous BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donations
CREATE POLICY "donations_insert_policy" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "donations_select_policy" ON donations FOR SELECT USING (true);
CREATE POLICY "donations_update_policy" ON donations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "donations_delete_policy" ON donations FOR DELETE USING (true);

-- Indexes
CREATE INDEX donations_donor_id_idx ON donations(donor_id);
CREATE INDEX donations_volunteer_id_idx ON donations(volunteer_id);
CREATE INDEX donations_status_idx ON donations(status);
CREATE INDEX donations_urgency_idx ON donations(urgency);
CREATE INDEX donations_pickup_city_idx ON donations(pickup_city);
CREATE INDEX donations_created_at_idx ON donations(created_at DESC);
CREATE INDEX donations_expiry_date_idx ON donations(expiry_date);

-- ============================================
-- STEP 4: CREATE MESSAGES TABLE
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "messages_insert_policy" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_select_policy" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_update_policy" ON messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "messages_delete_policy" ON messages FOR DELETE USING (true);

-- Indexes
CREATE INDEX messages_donation_id_idx ON messages(donation_id);
CREATE INDEX messages_sender_id_idx ON messages(sender_id);
CREATE INDEX messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX messages_created_at_idx ON messages(created_at DESC);

-- ============================================
-- STEP 5: CREATE RATINGS TABLE
-- ============================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  rated_user UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "ratings_insert_policy" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "ratings_select_policy" ON ratings FOR SELECT USING (true);
CREATE POLICY "ratings_update_policy" ON ratings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "ratings_delete_policy" ON ratings FOR DELETE USING (true);

-- Indexes
CREATE INDEX ratings_donation_id_idx ON ratings(donation_id);
CREATE INDEX ratings_rated_user_idx ON ratings(rated_user);
CREATE INDEX ratings_rated_by_idx ON ratings(rated_by);

-- ============================================
-- STEP 6: CREATE ACHIEVEMENTS TABLE
-- ============================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "achievements_insert_policy" ON achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "achievements_select_policy" ON achievements FOR SELECT USING (true);
CREATE POLICY "achievements_update_policy" ON achievements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "achievements_delete_policy" ON achievements FOR DELETE USING (true);

-- Indexes
CREATE INDEX achievements_user_id_idx ON achievements(user_id);
CREATE INDEX achievements_achievement_type_idx ON achievements(achievement_type);

-- ============================================
-- STEP 7: CREATE DELIVERY PROOFS TABLE
-- ============================================

CREATE TABLE delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  proof_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE delivery_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_proofs
CREATE POLICY "delivery_proofs_insert_policy" ON delivery_proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "delivery_proofs_select_policy" ON delivery_proofs FOR SELECT USING (true);
CREATE POLICY "delivery_proofs_update_policy" ON delivery_proofs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "delivery_proofs_delete_policy" ON delivery_proofs FOR DELETE USING (true);

-- Indexes
CREATE INDEX delivery_proofs_donation_id_idx ON delivery_proofs(donation_id);
CREATE INDEX delivery_proofs_uploaded_by_idx ON delivery_proofs(uploaded_by);

-- ============================================
-- STEP 8: CREATE UPDATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for donations
CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SUCCESS! DATABASE SETUP COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT
  '✅ SUCCESS: All tables created successfully!' as status,
  'Tables: profiles, donations, messages, ratings, achievements, delivery_proofs' as tables_created,
  'RLS enabled on all tables with public policies' as security,
  'Indexes and triggers created' as performance;
