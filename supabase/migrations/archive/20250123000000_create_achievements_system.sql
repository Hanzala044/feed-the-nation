-- ═══════════════════════════════════════════════════════════════════════════════
-- 🏆 ACHIEVEMENT SYSTEM - Database Schema
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration creates the achievement and badge system for donors and volunteers
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- Unique identifier like "first_donation", "10_donations", etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  icon TEXT NOT NULL, -- Icon name from lucide-react
  points_required INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('donation', 'delivery', 'streak', 'impact', 'special')),
  user_type TEXT NOT NULL CHECK (user_type IN ('donor', 'volunteer', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_achievements junction table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Create user_stats table for tracking points and progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0 NOT NULL,
  donations_completed INTEGER DEFAULT 0 NOT NULL,
  deliveries_completed INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  total_food_donated_kg DECIMAL DEFAULT 0 NOT NULL,
  lives_impacted INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (everyone can read)
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎖️ SEED ACHIEVEMENT DATA
-- ═══════════════════════════════════════════════════════════════════════════════

-- DONOR ACHIEVEMENTS
INSERT INTO public.achievements (code, name, description, tier, icon, points_required, category, user_type) VALUES
  -- Donation Milestones
  ('first_donation', 'First Step', 'Create your first donation', 'bronze', 'Award', 10, 'donation', 'donor'),
  ('5_donations', 'Generous Giver', 'Create 5 donations', 'silver', 'Gift', 50, 'donation', 'donor'),
  ('10_donations', 'Donation Hero', 'Create 10 donations', 'gold', 'Heart', 120, 'donation', 'donor'),
  ('25_donations', 'Food Champion', 'Create 25 donations', 'platinum', 'Medal', 300, 'donation', 'donor'),
  ('50_donations', 'Legendary Donor', 'Create 50 donations', 'diamond', 'Crown', 600, 'donation', 'donor'),

  -- Impact Achievements
  ('100kg_donated', 'Hundred Strong', 'Donate 100kg of food', 'silver', 'Scale', 80, 'impact', 'donor'),
  ('500kg_donated', 'Half Ton Hero', 'Donate 500kg of food', 'gold', 'TrendingUp', 200, 'impact', 'donor'),
  ('1000kg_donated', 'Ton of Kindness', 'Donate 1000kg of food', 'platinum', 'Mountain', 450, 'impact', 'donor'),
  ('100_lives', 'Century of Hope', 'Impact 100 lives', 'gold', 'Users', 180, 'impact', 'donor'),
  ('500_lives', 'Community Guardian', 'Impact 500 lives', 'diamond', 'Shield', 700, 'impact', 'donor'),

  -- Streak Achievements
  ('7_day_streak', 'Week Warrior', '7 day donation streak', 'silver', 'Flame', 70, 'streak', 'donor'),
  ('30_day_streak', 'Monthly Master', '30 day donation streak', 'platinum', 'Zap', 400, 'streak', 'donor'),
  ('365_day_streak', 'Year of Giving', '365 day donation streak', 'diamond', 'Star', 1500, 'streak', 'donor')
ON CONFLICT (code) DO NOTHING;

-- VOLUNTEER ACHIEVEMENTS
INSERT INTO public.achievements (code, name, description, tier, icon, points_required, category, user_type) VALUES
  -- Delivery Milestones
  ('first_delivery', 'First Pickup', 'Complete your first delivery', 'bronze', 'Package', 10, 'delivery', 'volunteer'),
  ('5_deliveries', 'Reliable Runner', 'Complete 5 deliveries', 'silver', 'Truck', 50, 'delivery', 'volunteer'),
  ('10_deliveries', 'Delivery Pro', 'Complete 10 deliveries', 'gold', 'CheckCircle', 120, 'delivery', 'volunteer'),
  ('25_deliveries', 'Logistics Legend', 'Complete 25 deliveries', 'platinum', 'Target', 300, 'delivery', 'volunteer'),
  ('50_deliveries', 'Master Volunteer', 'Complete 50 deliveries', 'diamond', 'Trophy', 600, 'delivery', 'volunteer'),

  -- Speed Achievements
  ('fast_responder', 'Quick Responder', 'Accept donation within 5 minutes', 'silver', 'Rocket', 60, 'special', 'volunteer'),
  ('fastest_delivery', 'Speed Demon', 'Complete a delivery in under 30 minutes', 'gold', 'Zap', 140, 'special', 'volunteer'),
  ('same_day_delivery', 'Same Day Hero', 'Complete delivery on same day', 'gold', 'Clock', 150, 'special', 'volunteer'),
  ('10_urgent', 'Emergency Expert', 'Complete 10 urgent deliveries', 'platinum', 'AlertTriangle', 350, 'special', 'volunteer'),
  ('speed_master', 'Lightning Fast', 'Complete 5 deliveries in under 30 minutes each', 'platinum', 'Timer', 380, 'special', 'volunteer'),

  -- Impact Achievements
  ('100_meals', 'Hundred Meals', 'Deliver 100 meals worth', 'silver', 'Utensils', 90, 'impact', 'volunteer'),
  ('500_meals', 'Food Angel', 'Deliver 500 meals worth', 'gold', 'Heart', 250, 'impact', 'volunteer'),
  ('1000_meals', 'Community Savior', 'Deliver 1000 meals worth', 'diamond', 'Sparkles', 800, 'impact', 'volunteer')
ON CONFLICT (code) DO NOTHING;

-- SHARED ACHIEVEMENTS (Both donors and volunteers)
INSERT INTO public.achievements (code, name, description, tier, icon, points_required, category, user_type) VALUES
  ('early_adopter', 'Early Adopter', 'Join in the first month', 'gold', 'Gem', 100, 'special', 'both'),
  ('verified_profile', 'Verified Member', 'Complete profile verification', 'bronze', 'BadgeCheck', 20, 'special', 'both'),
  ('community_helper', 'Community Helper', 'Help 10 different people', 'silver', 'Handshake', 80, 'special', 'both'),
  ('super_star', 'Super Star', 'Earn 1000 total points', 'platinum', 'Star', 1000, 'special', 'both'),
  ('legend', 'Living Legend', 'Earn 5000 total points', 'diamond', 'Sparkles', 5000, 'special', 'both')
ON CONFLICT (code) DO NOTHING;

-- MONTHLY & SPECIAL RECOGNITION ACHIEVEMENTS
INSERT INTO public.achievements (code, name, description, tier, icon, points_required, category, user_type) VALUES
  -- Volunteer of the Month
  ('volunteer_of_month', 'Volunteer of the Month', 'Highest deliveries in a calendar month', 'platinum', 'Award', 500, 'special', 'volunteer'),
  ('donor_of_month', 'Donor of the Month', 'Highest donations in a calendar month', 'platinum', 'Medal', 500, 'special', 'donor'),

  -- Consistency Awards
  ('perfect_week', 'Perfect Week', 'Complete activity every day for 7 days', 'silver', 'Calendar', 75, 'streak', 'both'),
  ('weekend_warrior', 'Weekend Warrior', 'Complete 10 weekend activities', 'gold', 'Sun', 130, 'special', 'both'),
  ('night_owl', 'Night Owl', 'Complete 5 activities after 8 PM', 'silver', 'Moon', 65, 'special', 'both'),

  -- Community Impact
  ('neighborhood_hero', 'Neighborhood Hero', 'Help 25 people in your local area', 'gold', 'MapPin', 180, 'impact', 'both'),
  ('city_champion', 'City Champion', 'Help 100 people across the city', 'platinum', 'Building', 400, 'impact', 'both'),

  -- Efficiency Awards (Volunteer)
  ('route_master', 'Route Master', 'Complete 3 deliveries in one trip', 'gold', 'Route', 160, 'special', 'volunteer'),
  ('multi_tasker', 'Multi-Tasker', 'Handle 5 deliveries in one day', 'platinum', 'Layers', 320, 'special', 'volunteer'),

  -- Quality Awards (Donor)
  ('quality_donor', 'Quality Donor', 'Maintain 5-star rating for 20 donations', 'gold', 'Star', 200, 'special', 'donor'),
  ('premium_provider', 'Premium Provider', 'Donate fresh produce 10 times', 'silver', 'Leaf', 85, 'special', 'donor'),
  ('bulk_benefactor', 'Bulk Benefactor', 'Create 5 donations over 50kg each', 'platinum', 'Package2', 340, 'special', 'donor')
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📊 FUNCTIONS FOR ACHIEVEMENT SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user_stats when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_stats();

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_stats RECORD;
  v_achievement RECORD;
  v_donations_count INTEGER;
  v_deliveries_count INTEGER;
BEGIN
  -- Get user stats
  SELECT * INTO v_stats FROM public.user_stats WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Get donation count for donors
  SELECT COUNT(*) INTO v_donations_count
  FROM public.donations
  WHERE donor_id = p_user_id;

  -- Get delivery count for volunteers
  SELECT COUNT(*) INTO v_deliveries_count
  FROM public.donations
  WHERE volunteer_id = p_user_id AND status = 'delivered';

  -- Check each achievement
  FOR v_achievement IN
    SELECT * FROM public.achievements
    WHERE user_type IN ('both', (SELECT role FROM public.profiles WHERE id = p_user_id))
  LOOP
    -- Check if already unlocked
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE user_id = p_user_id AND achievement_id = v_achievement.id
    ) THEN
      -- Check unlock conditions based on category
      CASE v_achievement.category
        WHEN 'donation' THEN
          IF v_donations_count >= v_achievement.points_required / 10 THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, progress)
            VALUES (p_user_id, v_achievement.id, 100);
          END IF;
        WHEN 'delivery' THEN
          IF v_deliveries_count >= v_achievement.points_required / 10 THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, progress)
            VALUES (p_user_id, v_achievement.id, 100);
          END IF;
        WHEN 'special' THEN
          IF v_stats.total_points >= v_achievement.points_required THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, progress)
            VALUES (p_user_id, v_achievement.id, 100);
          END IF;
      END CASE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_user_type ON public.achievements(user_type);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎉 MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
