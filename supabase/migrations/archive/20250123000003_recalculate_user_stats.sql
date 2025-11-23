-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔄 RECALCULATE USER STATS FOR EXISTING DATA
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration recalculates stats for all existing users based on their donations
-- and deliveries, then unlocks appropriate achievements
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to recalculate all user stats from scratch
CREATE OR REPLACE FUNCTION recalculate_all_user_stats()
RETURNS void AS $$
DECLARE
  v_user RECORD;
  v_donations_count INTEGER;
  v_deliveries_count INTEGER;
  v_total_food DECIMAL;
BEGIN
  -- Loop through all users in profiles
  FOR v_user IN SELECT id, role FROM public.profiles
  LOOP
    -- Check if user exists in auth.users (required for foreign key)
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_user.id) THEN

      -- Count donations made by this user
      SELECT COUNT(*), COALESCE(SUM(quantity), 0)
      INTO v_donations_count, v_total_food
      FROM public.donations
      WHERE donor_id = v_user.id;

      -- Count deliveries completed by this user
      SELECT COUNT(*)
      INTO v_deliveries_count
      FROM public.donations
      WHERE volunteer_id = v_user.id AND status = 'delivered';

      -- Insert or update user_stats
      INSERT INTO public.user_stats (
        user_id,
        donations_completed,
        deliveries_completed,
        total_points,
        total_food_donated_kg,
        lives_impacted,
        last_activity_date,
        updated_at
      )
      VALUES (
        v_user.id,
        v_donations_count,
        v_deliveries_count,
        (v_donations_count * 10) + (v_deliveries_count * 15), -- 10 points per donation, 15 per delivery
        v_total_food,
        GREATEST(1, FLOOR(v_total_food / 5)), -- 1 person per 5kg
        CURRENT_DATE,
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        donations_completed = v_donations_count,
        deliveries_completed = v_deliveries_count,
        total_points = (v_donations_count * 10) + (v_deliveries_count * 15),
        total_food_donated_kg = v_total_food,
        lives_impacted = GREATEST(1, FLOOR(v_total_food / 5)),
        updated_at = NOW();

      -- Check and unlock achievements for this user
      PERFORM check_and_unlock_achievements(v_user.id);

    END IF;
  END LOOP;

  RAISE NOTICE 'User stats recalculated successfully for all users';
END;
$$ LANGUAGE plpgsql;

-- Execute the recalculation
SELECT recalculate_all_user_stats();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ RECALCULATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
-- All user stats have been recalculated based on existing donations and deliveries
-- Achievements have been unlocked where applicable
-- ═══════════════════════════════════════════════════════════════════════════════
