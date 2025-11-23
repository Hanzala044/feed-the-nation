-- Create referral system tables and functions

-- Add referral_code and referred_by to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES public.profiles(referral_code),
ADD COLUMN IF NOT EXISTS referral_points INTEGER DEFAULT 0;

-- Create referrals table to track referral history
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  points_awarded INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for referrals table
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID, user_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  -- Create base code from user name (first 4 chars uppercase) + random 4 chars
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(user_name, '[^a-zA-Z]', '', 'g'), 1, 4));

  -- If name is too short, pad with random chars
  IF LENGTH(base_code) < 4 THEN
    base_code := base_code || SUBSTRING(MD5(user_id::TEXT), 1, 4 - LENGTH(base_code));
  END IF;

  -- Add random suffix
  final_code := base_code || UPPER(SUBSTRING(MD5(user_id::TEXT || NOW()::TEXT), 1, 4));

  -- Check if code exists, if yes, generate a new one
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = final_code) INTO code_exists;

    IF NOT code_exists THEN
      EXIT;
    END IF;

    counter := counter + 1;
    final_code := base_code || UPPER(SUBSTRING(MD5(user_id::TEXT || counter::TEXT), 1, 4));

    -- Safety break after 100 attempts
    IF counter > 100 THEN
      final_code := 'USER' || UPPER(SUBSTRING(MD5(user_id::TEXT || NOW()::TEXT), 1, 8));
      EXIT;
    END IF;
  END LOOP;

  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup with referral
CREATE OR REPLACE FUNCTION handle_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
  referrer_user_id UUID;
  referral_points_reward INTEGER := 50;
BEGIN
  -- Generate referral code for new user if not exists
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code(NEW.id, COALESCE(NEW.full_name, 'User'));
  END IF;

  -- If user was referred by someone, award points to referrer
  IF NEW.referred_by IS NOT NULL THEN
    -- Get referrer's user ID
    SELECT id INTO referrer_user_id
    FROM public.profiles
    WHERE referral_code = NEW.referred_by;

    IF referrer_user_id IS NOT NULL THEN
      -- Award points to referrer
      UPDATE public.profiles
      SET referral_points = COALESCE(referral_points, 0) + referral_points_reward
      WHERE id = referrer_user_id;

      -- Record the referral
      INSERT INTO public.referrals (referrer_id, referred_id, referral_code, points_awarded)
      VALUES (referrer_user_id, NEW.id, NEW.referred_by, referral_points_reward)
      ON CONFLICT (referrer_id, referred_id) DO NOTHING;

      -- Update referred user's points as welcome bonus
      NEW.referral_points := COALESCE(NEW.referral_points, 0) + 25;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for referral signup
DROP TRIGGER IF EXISTS on_referral_signup ON public.profiles;
CREATE TRIGGER on_referral_signup
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_signup();

-- Function to update existing users with referral codes
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN
    SELECT id, full_name
    FROM public.profiles
    WHERE referral_code IS NULL
  LOOP
    UPDATE public.profiles
    SET referral_code = generate_referral_code(profile_record.id, COALESCE(profile_record.full_name, 'User'))
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Create index for faster referral code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

-- Grant permissions
GRANT SELECT ON public.referrals TO authenticated;
GRANT INSERT ON public.referrals TO authenticated;

COMMENT ON TABLE public.referrals IS 'Tracks referral relationships and points awarded';
COMMENT ON COLUMN public.profiles.referral_code IS 'Unique referral code for each user';
COMMENT ON COLUMN public.profiles.referred_by IS 'Referral code of the user who referred this user';
COMMENT ON COLUMN public.profiles.referral_points IS 'Points earned from referrals';
