-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 FINAL TRIGGER FIX - Complete Reset and Verification
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Check what table exists for donations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations') THEN
    RAISE NOTICE 'Table public.donations exists';
  ELSE
    RAISE NOTICE 'Table public.donations DOES NOT exist';
  END IF;
END $$;

-- Step 2: Drop ALL existing triggers completely
DROP TRIGGER IF EXISTS on_donation_created ON public.donations CASCADE;
DROP TRIGGER IF EXISTS on_delivery_completed ON public.donations CASCADE;
DROP TRIGGER IF EXISTS on_user_stats_updated ON public.user_stats CASCADE;

-- Step 3: Drop all trigger functions
DROP FUNCTION IF EXISTS update_donor_stats_on_donation() CASCADE;
DROP FUNCTION IF EXISTS update_volunteer_stats_on_delivery() CASCADE;
DROP FUNCTION IF EXISTS update_user_streak() CASCADE;

-- Step 4: Create the donor stats function with explicit logging
CREATE OR REPLACE FUNCTION update_donor_stats_on_donation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE '🔥 TRIGGER FIRED! Donation created: ID=%, Donor=%', NEW.id, NEW.donor_id;

  -- Only proceed if donor_id exists
  IF NEW.donor_id IS NULL THEN
    RAISE NOTICE '⚠️  Donor ID is NULL, exiting';
    RETURN NEW;
  END IF;

  -- Check if user exists in auth
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.donor_id) THEN
    RAISE NOTICE '⚠️  Donor % not in auth.users', NEW.donor_id;
    RETURN NEW;
  END IF;

  RAISE NOTICE '✅ Updating stats for donor %', NEW.donor_id;

  -- Insert or update user stats
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
  ON CONFLICT (user_id) DO UPDATE SET
    donations_completed = user_stats.donations_completed + 1,
    total_points = user_stats.total_points + 10,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();

  RAISE NOTICE '✅ Stats updated! Checking achievements...';

  -- Check achievements
  PERFORM check_and_unlock_achievements(NEW.donor_id);

  RAISE NOTICE '✅ Achievements checked for donor %', NEW.donor_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '❌ ERROR in donor trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the volunteer stats function with explicit logging
CREATE OR REPLACE FUNCTION update_volunteer_stats_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE '🔥 UPDATE TRIGGER FIRED! Donation: ID=%, Status: % → %', NEW.id, OLD.status, NEW.status;

  -- Check if this is a status change to delivered
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') AND NEW.volunteer_id IS NOT NULL THEN
    RAISE NOTICE '✅ Delivery completed by volunteer %', NEW.volunteer_id;

    -- Check if volunteer exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.volunteer_id) THEN
      RAISE NOTICE '⚠️  Volunteer % not in auth.users', NEW.volunteer_id;
      RETURN NEW;
    END IF;

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
    ON CONFLICT (user_id) DO UPDATE SET
      deliveries_completed = user_stats.deliveries_completed + 1,
      total_points = user_stats.total_points + 15,
      lives_impacted = user_stats.lives_impacted + CASE WHEN NEW.quantity IS NOT NULL THEN GREATEST(1, FLOOR(NEW.quantity / 5)) ELSE 0 END,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();

    RAISE NOTICE '✅ Volunteer stats updated!';

    -- Update donor food donated
    IF NEW.quantity IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.donor_id) THEN
      UPDATE public.user_stats
      SET total_food_donated_kg = total_food_donated_kg + NEW.quantity,
          updated_at = NOW()
      WHERE user_id = NEW.donor_id;
    END IF;

    -- Check achievements
    PERFORM check_and_unlock_achievements(NEW.volunteer_id);
    PERFORM check_and_unlock_achievements(NEW.donor_id);

    RAISE NOTICE '✅ Achievements checked!';
  ELSE
    RAISE NOTICE '⚠️  Skipping - not a delivery completion';
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '❌ ERROR in volunteer trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create triggers with verification
DO $$
BEGIN
  -- Create donation trigger
  EXECUTE 'CREATE TRIGGER on_donation_created
    AFTER INSERT ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION update_donor_stats_on_donation()';

  RAISE NOTICE '✅ Created trigger: on_donation_created';

  -- Create delivery trigger
  EXECUTE 'CREATE TRIGGER on_delivery_completed
    AFTER UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION update_volunteer_stats_on_delivery()';

  RAISE NOTICE '✅ Created trigger: on_delivery_completed';
END $$;

-- Step 7: Verify triggers were created
DO $$
DECLARE
  v_trigger_count INTEGER;
  v_trigger_name TEXT;
BEGIN
  SELECT COUNT(*) INTO v_trigger_count
  FROM information_schema.triggers
  WHERE event_object_table = 'donations'
    AND trigger_schema = 'public';

  RAISE NOTICE '📊 Total triggers on donations table: %', v_trigger_count;

  -- List all triggers
  FOR v_trigger_name IN
    SELECT trigger_name FROM information_schema.triggers
    WHERE event_object_table = 'donations' AND trigger_schema = 'public'
  LOOP
    RAISE NOTICE '  - Trigger: %', v_trigger_name;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ TRIGGERS CREATED
-- ═══════════════════════════════════════════════════════════════════════════════
-- Now test by:
-- 1. Creating a new donation
-- 2. Check Postgres logs for 🔥 TRIGGER FIRED! message
-- 3. If no message appears, triggers are not working
-- ═══════════════════════════════════════════════════════════════════════════════
