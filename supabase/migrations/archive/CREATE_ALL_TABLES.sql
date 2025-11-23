-- ⚠️ COMPLETE DATABASE SETUP
-- Run this SQL in: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/editor
-- This creates ALL tables needed for your app

-- ============================================
-- 1. PROFILES TABLE
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow public profile reads" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile deletes" ON profiles;

CREATE POLICY "Allow public profile creation" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public profile reads" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow profile updates" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow profile deletes" ON profiles FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- ============================================
-- 2. DONATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  image_url TEXT,

  pickup_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  pickup_time TIMESTAMP WITH TIME ZONE,

  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('urgent', 'normal', 'flexible')),
  is_anonymous BOOLEAN DEFAULT false
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public donation creation" ON donations;
DROP POLICY IF EXISTS "Allow public donation reads" ON donations;
DROP POLICY IF EXISTS "Allow donation updates" ON donations;
DROP POLICY IF EXISTS "Allow donation deletes" ON donations;

CREATE POLICY "Allow public donation creation" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public donation reads" ON donations FOR SELECT USING (true);
CREATE POLICY "Allow donation updates" ON donations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow donation deletes" ON donations FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS donations_donor_id_idx ON donations(donor_id);
CREATE INDEX IF NOT EXISTS donations_volunteer_id_idx ON donations(volunteer_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations(created_at DESC);

-- ============================================
-- 3. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow message creation" ON messages;
DROP POLICY IF EXISTS "Allow message reads" ON messages;
DROP POLICY IF EXISTS "Allow message updates" ON messages;

CREATE POLICY "Allow message creation" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow message reads" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow message updates" ON messages FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS messages_donation_id_idx ON messages(donation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);

-- ============================================
-- 4. RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  rated_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rated_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow rating creation" ON ratings;
DROP POLICY IF EXISTS "Allow rating reads" ON ratings;

CREATE POLICY "Allow rating creation" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow rating reads" ON ratings FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS ratings_donation_id_idx ON ratings(donation_id);
CREATE INDEX IF NOT EXISTS ratings_rated_user_idx ON ratings(rated_user);

-- ============================================
-- 5. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow achievement creation" ON achievements;
DROP POLICY IF EXISTS "Allow achievement reads" ON achievements;

CREATE POLICY "Allow achievement creation" ON achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow achievement reads" ON achievements FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON achievements(user_id);

-- ============================================
-- 6. DELIVERY PROOFS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  proof_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE delivery_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow proof creation" ON delivery_proofs;
DROP POLICY IF EXISTS "Allow proof reads" ON delivery_proofs;

CREATE POLICY "Allow proof creation" ON delivery_proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow proof reads" ON delivery_proofs FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS delivery_proofs_donation_id_idx ON delivery_proofs(donation_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'SUCCESS: All tables created successfully!' AS result;
