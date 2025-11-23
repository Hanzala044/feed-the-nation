-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎯 ACHIEVEMENT AUTO-UNLOCK TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration adds triggers to automatically update user_stats and unlock
-- achievements when users create donations or complete deliveries.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to update donor stats when a donation is created
CREATE OR REPLACE FUNCTION update_donor_stats_on_donation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if donor_id exists and is valid
  IF NEW.donor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ensure user_stats exists for this user first (only if user exists in auth.users)
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.donor_id) THEN
    -- Try to insert or update
    INSERT INTO public.user_stats (
      user_id,
      donations_completed,
      total_points,
      last_activity_date,
      updated_at
    )
    VALUES (
      NEW.donor_id,
      1,
      10,
      CURRENT_DATE,
      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      donations_completed = public.user_stats.donations_completed + 1,
      total_points = public.user_stats.total_points + 10,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();

    -- Check and unlock achievements for the donor
    PERFORM check_and_unlock_achievements(NEW.donor_id);
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Silently handle any errors to prevent blocking donation creation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update volunteer stats when a delivery is completed
CREATE OR REPLACE FUNCTION update_volunteer_stats_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to 'delivered' and volunteer_id exists
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') AND NEW.volunteer_id IS NOT NULL THEN
    -- Update volunteer stats (only if user exists in auth.users)
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.volunteer_id) THEN
      INSERT INTO public.user_stats (
        user_id,
        deliveries_completed,
        total_points,
        lives_impacted,
        last_activity_date,
        updated_at
      )
      VALUES (
        NEW.volunteer_id,
        1,
        15,
        CASE WHEN NEW.quantity IS NOT NULL THEN GREATEST(1, FLOOR(NEW.quantity / 5)) ELSE 0 END,
        CURRENT_DATE,
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        deliveries_completed = public.user_stats.deliveries_completed + 1,
        total_points = public.user_stats.total_points + 15,
        lives_impacted = public.user_stats.lives_impacted + CASE WHEN NEW.quantity IS NOT NULL THEN GREATEST(1, FLOOR(NEW.quantity / 5)) ELSE 0 END,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW();

      -- Check and unlock achievements for the volunteer
      PERFORM check_and_unlock_achievements(NEW.volunteer_id);
    END IF;

    -- Update donor's food donated (only if user exists in auth.users)
    IF NEW.quantity IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.donor_id) THEN
      INSERT INTO public.user_stats (
        user_id,
        total_food_donated_kg,
        updated_at
      )
      VALUES (
        NEW.donor_id,
        NEW.quantity,
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        total_food_donated_kg = public.user_stats.total_food_donated_kg + NEW.quantity,
        updated_at = NOW();

      -- Also check donor achievements (for impact-based achievements)
      PERFORM check_and_unlock_achievements(NEW.donor_id);
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Silently handle any errors to prevent blocking delivery completion
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak on activity
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get current stats
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM public.user_stats
  WHERE user_id = NEW.user_id;

  -- If no previous activity, start streak at 1
  IF v_last_activity IS NULL THEN
    UPDATE public.user_stats
    SET current_streak = 1,
        longest_streak = GREATEST(1, v_longest_streak)
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- If activity is on consecutive day, increment streak
  IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE public.user_stats
    SET current_streak = v_current_streak + 1,
        longest_streak = GREATEST(v_current_streak + 1, v_longest_streak)
    WHERE user_id = NEW.user_id;
  -- If activity is on same day, no change
  ELSIF v_last_activity = CURRENT_DATE THEN
    -- Do nothing
    NULL;
  -- If gap is more than 1 day, reset streak
  ELSE
    UPDATE public.user_stats
    SET current_streak = 1
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_donation_created ON public.donations;
DROP TRIGGER IF EXISTS on_delivery_completed ON public.donations;
DROP TRIGGER IF EXISTS on_user_stats_updated ON public.user_stats;

-- Trigger: Update donor stats when donation is created
CREATE TRIGGER on_donation_created
  AFTER INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_donor_stats_on_donation();

-- Trigger: Update volunteer stats when delivery is completed
CREATE TRIGGER on_delivery_completed
  AFTER UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteer_stats_on_delivery();

-- Trigger: Update streak tracking when stats are updated
CREATE TRIGGER on_user_stats_updated
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  WHEN (NEW.last_activity_date IS DISTINCT FROM OLD.last_activity_date)
  EXECUTE FUNCTION update_user_streak();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 IMPROVED check_and_unlock_achievements FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Replace the existing function with an improved version
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_stats RECORD;
  v_achievement RECORD;
  v_user_role TEXT;
  v_donations_count INTEGER;
  v_deliveries_count INTEGER;
BEGIN
  -- Get user stats
  SELECT * INTO v_stats FROM public.user_stats WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Get user role
  SELECT role INTO v_user_role FROM public.profiles WHERE id = p_user_id;

  -- Get actual donation count
  SELECT COUNT(*) INTO v_donations_count
  FROM public.donations
  WHERE donor_id = p_user_id;

  -- Get actual delivery count
  SELECT COUNT(*) INTO v_deliveries_count
  FROM public.donations
  WHERE volunteer_id = p_user_id AND status = 'delivered';

  -- Check each achievement
  FOR v_achievement IN
    SELECT * FROM public.achievements
    WHERE user_type IN ('both', v_user_role)
  LOOP
    -- Check if already unlocked
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE user_id = p_user_id AND achievement_id = v_achievement.id
    ) THEN
      -- Check unlock conditions based on achievement code
      CASE
        -- Donation milestones
        WHEN v_achievement.code = 'first_donation' AND v_donations_count >= 1 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '5_donations' AND v_donations_count >= 5 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '10_donations' AND v_donations_count >= 10 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '25_donations' AND v_donations_count >= 25 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '50_donations' AND v_donations_count >= 50 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);

        -- Delivery milestones
        WHEN v_achievement.code = 'first_delivery' AND v_deliveries_count >= 1 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '5_deliveries' AND v_deliveries_count >= 5 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '10_deliveries' AND v_deliveries_count >= 10 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '25_deliveries' AND v_deliveries_count >= 25 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '50_deliveries' AND v_deliveries_count >= 50 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);

        -- Impact achievements (food donated)
        WHEN v_achievement.code = '100kg_donated' AND v_stats.total_food_donated_kg >= 100 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '500kg_donated' AND v_stats.total_food_donated_kg >= 500 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '1000kg_donated' AND v_stats.total_food_donated_kg >= 1000 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);

        -- Impact achievements (lives)
        WHEN v_achievement.code = '100_lives' AND v_stats.lives_impacted >= 100 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '500_lives' AND v_stats.lives_impacted >= 500 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);

        -- Streak achievements
        WHEN v_achievement.code = '7_day_streak' AND v_stats.current_streak >= 7 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '30_day_streak' AND v_stats.current_streak >= 30 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = '365_day_streak' AND v_stats.current_streak >= 365 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);

        -- Points-based achievements
        WHEN v_achievement.code = 'super_star' AND v_stats.total_points >= 1000 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);
        WHEN v_achievement.code = 'legend' AND v_stats.total_points >= 5000 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, progress)
          VALUES (p_user_id, v_achievement.id, 100);

        ELSE
          -- Achievement not yet unlocked
          NULL;
      END CASE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Achievements will now auto-unlock when users:
-- - Create donations (donors get points & achievements)
-- - Complete deliveries (volunteers get points & achievements)
-- - Reach milestones (both get impact & streak achievements)
-- ═══════════════════════════════════════════════════════════════════════════════
