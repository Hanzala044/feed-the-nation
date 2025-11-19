-- Add is_anonymous column to donations table if it doesn't exist
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN donations.is_anonymous IS 'Indicates whether the donation is anonymous';

-- Update existing NULL values to false
UPDATE donations
SET is_anonymous = false
WHERE is_anonymous IS NULL;
