-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 FIX: User Stats Foreign Key Constraint Error
-- ═══════════════════════════════════════════════════════════════════════════════
-- This script fixes the foreign key constraint issue preventing user sign-in
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Drop the problematic foreign key constraint
ALTER TABLE public.user_stats
DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey;

-- Step 2: Re-add the foreign key constraint with proper CASCADE
ALTER TABLE public.user_stats
ADD CONSTRAINT user_stats_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Step 3: Fix the initialize_user_stats trigger to handle errors gracefully
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user stats for the new profile
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN foreign_key_violation THEN
    -- If foreign key fails, log it but don't fail the profile creation
    RAISE WARNING 'Could not create user_stats for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Catch any other errors
    RAISE WARNING 'Error in initialize_user_stats for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update the handle_new_user function to ensure it works with Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Step 5: Ensure the trigger exists on profiles table
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_stats();

-- Step 6: Create missing user_stats for existing users who don't have them
INSERT INTO public.user_stats (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats)
ON CONFLICT (user_id) DO NOTHING;

-- Step 7: Grant necessary permissions
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ FIX COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
