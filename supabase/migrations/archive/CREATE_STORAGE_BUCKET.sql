-- ═══════════════════════════════════════════════════════════════════════════════
-- 🚀 CREATE STORAGE BUCKET FOR PROFILE PHOTOS - DASHBOARD METHOD
-- ═══════════════════════════════════════════════════════════════════════════════
-- ⚠️ RECOMMENDED: Use Supabase Dashboard UI (easier and no permission issues)
-- ═══════════════════════════════════════════════════════════════════════════════

-- STEP 1: Create Bucket via Dashboard UI (RECOMMENDED)
-- --------------------------------------------------------
-- 1. Go to: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/storage/buckets
-- 2. Click "New bucket"
-- 3. Fill in:
--    - Name: profile-photos
--    - Public bucket: YES (checked)
--    - File size limit: 2 MB
--    - Allowed MIME types: image/*
-- 4. Click "Create bucket"

-- STEP 2: Bucket is ready!
-- --------------------------------------------------------
-- The profile photo upload feature will now work automatically.
-- No SQL needed when using the Dashboard UI method.

-- ═══════════════════════════════════════════════════════════════════════════════
-- ALTERNATIVE: SQL Method (if you prefer SQL)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Only use this if Dashboard UI doesn't work for you
-- This requires superuser permissions

-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/*']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/*']::text[];

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════════
-- After creating the bucket, verify it exists:
SELECT * FROM storage.buckets WHERE id = 'profile-photos';

-- You should see:
-- id: profile-photos
-- name: profile-photos
-- public: true
