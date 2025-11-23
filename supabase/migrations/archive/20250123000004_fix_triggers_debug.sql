-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 FIX ACHIEVEMENT TRIGGERS WITH DEBUGGING
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration fixes the triggers and adds better error handling
-- ═══════════════════════════════════════════════════════════════════════════════

-- First, drop all existing triggers to start fresh
DROP TRIGGER IF EXISTS on_donation_created ON public.donations;
DROP TRIGGER IF EXISTS on_delivery_completed ON public.donations;
DROP TRIGGER IF EXISTS on_user_stats_updated ON public.user_stats;

-- Drop old functions
DROP FUNCTION IF EXISTS update_donor_stats_on_donation();
DROP FUNCTION IF EXISTS update_volunteer_stats_on_delivery();
DROP FUNCTION IF EXISTS update_user_streak();

-- Create improved function for donor stats
CREATE OR REPLACE FUNCTION update_donor_stats_on_donation()
RETURNS TRIGGER AS $$
DECLARE
  v_error_message TEXT;
BEGIN
  -- Log trigger execution
  RAISE NOTICE 'Trigger fired for donation: %', NEW.id;

  -- Only proceed if donor_id exists and is valid
  IF NEW.donor_id IS NULL THEN
    RAISE NOTICE 'Donor ID is NULL, skipping';
    RETURN NEW;
  END IF;

  RAISE NOTICE 'Processing donor: %', NEW.donor_id;

  -- Check if user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.donor_id) THEN
    RAISE NOTICE 'Donor % not found in auth.users', NEW.donor_id;
    RETURN NEW;
  END IF;

  -- Try to insert or update user_stats
  BEGIN
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
      donations_completed = user_stats.donations_completed + 1,
      total_points = user_stats.total_points + 10,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();

    RAISE NOTICE 'Successfully updated stats for donor %', NEW.donor_id;

    -- Check and unlock achievements
    PERFORM check_and_unlock_achievements(NEW.donor_id);
    RAISE NOTICE 'Achievements checked for donor %', NEW.donor_id;

  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RAISE WARNING 'Error updating donor stats: %', v_error_message;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved function for volunteer stats
CREATE OR REPLACE FUNCTION update_volunteer_stats_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
  v_error_message TEXT;
BEGIN
  RAISE NOTICE 'Delivery trigger fired for donation: %, old status: %, new status: %',
    NEW.id, OLD.status, NEW.status;

  -- Only update if status changed to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') AND NEW.volunteer_id IS NOT NULL THEN
    RAISE NOTICE 'Processing volunteer delivery: %', NEW.volunteer_id;

    -- Check if volunteer exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.volunteer_id) THEN
      RAISE NOTICE 'Volunteer % not found in auth.users', NEW.volunteer_id;
      RETURN NEW;
    END IF;

    BEGIN
      -- Update volunteer stats
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
        deliveries_completed = user_stats.deliveries_completed + 1,
        total_points = user_stats.total_points + 15,
        lives_impacted = user_stats.lives_impacted + CASE WHEN NEW.quantity IS NOT NULL THEN GREATEST(1, FLOOR(NEW.quantity / 5)) ELSE 0 END,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW();

      RAISE NOTICE 'Successfully updated stats for volunteer %', NEW.volunteer_id;

      -- Check achievements
      PERFORM check_and_unlock_achievements(NEW.volunteer_id);

      -- Update donor's food donated
      IF NEW.quantity IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.donor_id) THEN
        UPDATE public.user_stats
        SET total_food_donated_kg = total_food_donated_kg + NEW.quantity,
            updated_at = NOW()
        WHERE user_id = NEW.donor_id;

        PERFORM check_and_unlock_achievements(NEW.donor_id);
      END IF;

    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      RAISE WARNING 'Error updating volunteer stats: %', v_error_message;
    END;
  ELSE
    RAISE NOTICE 'Skipping - status: %, volunteer_id: %', NEW.status, NEW.volunteer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
CREATE TRIGGER on_donation_created
  AFTER INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_donor_stats_on_donation();

CREATE TRIGGER on_delivery_completed
  AFTER UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_volunteer_stats_on_delivery();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ TRIGGERS RECREATED WITH DEBUGGING
-- ═══════════════════════════════════════════════════════════════════════════════
-- Now when you create a donation or mark it as delivered, you'll see NOTICE
-- messages in the Supabase logs showing what's happening.
--
-- To view logs: Supabase Dashboard → Logs → Postgres Logs
-- ═══════════════════════════════════════════════════════════════════════════════
