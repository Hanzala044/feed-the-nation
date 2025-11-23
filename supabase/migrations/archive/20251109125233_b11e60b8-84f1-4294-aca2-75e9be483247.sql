-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'donor', 'volunteer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (true);

-- Update profiles table to add avatar and bio
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Make profiles viewable by everyone for public profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Update handle_new_user function to create role entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from metadata, default to 'donor'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'donor');
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    user_role
  );
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role::app_role);
  
  RETURN NEW;
END;
$$;

-- Admin access policies for donations
CREATE POLICY "Admins can view all donations"
ON public.donations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all donations"
ON public.donations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all donations"
ON public.donations
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin access policies for profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create analytics view for admin
CREATE OR REPLACE VIEW public.donation_analytics AS
SELECT 
  d.pickup_city as area,
  COUNT(*) as total_donations,
  COUNT(CASE WHEN d.status = 'completed' THEN 1 END) as completed_donations,
  COUNT(CASE WHEN d.status = 'in_transit' THEN 1 END) as in_transit_donations,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_donations,
  COUNT(DISTINCT d.donor_id) as unique_donors,
  COUNT(DISTINCT d.volunteer_id) as unique_volunteers
FROM public.donations d
GROUP BY d.pickup_city;

-- Grant access to analytics view
GRANT SELECT ON public.donation_analytics TO authenticated;