-- ⚠️ CRITICAL: Run this SQL in your Supabase Dashboard NOW!
-- Go to: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/editor
-- Click: SQL Editor → New Query
-- Paste this entire script and click RUN

-- Drop the existing donations table if it exists (CAUTION: This deletes all data!)
-- Comment out the next line if you want to keep existing data
-- DROP TABLE IF EXISTS donations CASCADE;

-- Create donations table with ALL required columns
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Basic Information
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,

  -- Image
  image_url TEXT,

  -- Location Information
  pickup_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  pickup_time TIMESTAMP WITH TIME ZONE,

  -- Dates
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Status and Urgency
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('urgent', 'normal', 'flexible')),

  -- Privacy
  is_anonymous BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public donation creation" ON donations;
DROP POLICY IF EXISTS "Allow public donation reads" ON donations;
DROP POLICY IF EXISTS "Allow donation updates" ON donations;
DROP POLICY IF EXISTS "Allow donation deletes" ON donations;

-- Allow anyone to insert donations
CREATE POLICY "Allow public donation creation"
  ON donations FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read donations
CREATE POLICY "Allow public donation reads"
  ON donations FOR SELECT
  USING (true);

-- Allow anyone to update donations
CREATE POLICY "Allow donation updates"
  ON donations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow donation deletes (for donors and admins)
CREATE POLICY "Allow donation deletes"
  ON donations FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS donations_donor_id_idx ON donations(donor_id);
CREATE INDEX IF NOT EXISTS donations_volunteer_id_idx ON donations(volunteer_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);
CREATE INDEX IF NOT EXISTS donations_urgency_idx ON donations(urgency);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS donations_expiry_date_idx ON donations(expiry_date);
CREATE INDEX IF NOT EXISTS donations_pickup_city_idx ON donations(pickup_city);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;

CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'SUCCESS: donations table created with all columns!' AS result;
