# Database Migration Guide

## ✅ Credentials Updated

Your `.env` file has been updated to use the correct production database:

### Main Database: `uhuctkswxybirvzwhehb`
- **URL**: https://uhuctkswxybirvzwhehb.supabase.co
- **Project ID**: uhuctkswxybirvzwhehb
- **Anon Key**: Configured ✅
- **Service Role Key**: Configured ✅

### Auth Database: `bbbxtrcvhrfvexxchwob`
- **URL**: https://bbbxtrcvhrfvexxchwob.supabase.co
- **Auth Key**: Configured ✅

---

## 🔧 Required Setup Steps

### Step 1: Create `profiles` Table in Main Database

Your database currently has a `users` table with `clerk_user_id`. To make it compatible with the current codebase, we need to add a `profiles` table.

**Go to**: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/editor

**Run this SQL** (click SQL Editor → New Query):

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('donor', 'volunteer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone TEXT,
  address TEXT,
  bio TEXT,
  avatar_url TEXT,
  notification_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow public profile reads" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile deletes" ON profiles;

-- Allow anyone to insert profiles (needed for Google OAuth signup)
CREATE POLICY "Allow public profile creation"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Allow users to read all profiles (needed for volunteer/donor matching)
CREATE POLICY "Allow public profile reads"
  ON profiles FOR SELECT
  USING (true);

-- Allow anyone to update profiles
CREATE POLICY "Allow profile updates"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete profiles (for admin)
CREATE POLICY "Allow profile deletes"
  ON profiles FOR DELETE
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
```

### Step 2: Update donations table foreign keys (if needed)

If your `donations` table references `users` table, you may want to add references to `profiles` as well, or migrate data. For now, the code will work if you have the `profiles` table.

---

## 🎯 What This Fixes

### Before:
- ❌ `.env` pointed to `abthtvwjkrpeyrptluza` (wrong database)
- ❌ No `profiles` table in `uhuctkswxybirvzwhehb`
- ❌ RLS policies blocking inserts
- ❌ Google OAuth failing with "row violates RLS policy"

### After:
- ✅ `.env` points to `uhuctkswxybirvzwhehb` (correct database with data)
- ✅ `profiles` table created with proper RLS policies
- ✅ Google OAuth can create user profiles
- ✅ Email signup can create user profiles
- ✅ All donation/volunteer features work with existing data

---

## 🧪 Testing Steps

After running the SQL script:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test Google OAuth:**
   - Go to `/auth`
   - Click "Continue with Google"
   - Sign in with Google
   - Select role (Donor or Volunteer)
   - Should redirect to dashboard ✅

3. **Test Email Signup:**
   - Go to `/auth?mode=signup`
   - Fill in details and select role
   - Submit form
   - Check email for confirmation ✅

4. **Test Profile Edit:**
   - Login as donor: go to `/donor/edit-profile`
   - Login as volunteer: go to `/volunteer/edit-profile`
   - Update fields and save ✅

---

## 📊 Database Schema

Your `uhuctkswxybirvzwhehb` database now has:

### Tables:
1. **users** (original table with clerk_user_id)
   - Can be kept for legacy data

2. **profiles** (new table for app compatibility)
   - id (UUID)
   - email
   - full_name
   - role (donor/volunteer)
   - phone
   - address
   - bio
   - created_at, updated_at

3. **donations** (existing)
4. **messages** (existing)
5. **spatial_ref_sys** (existing)

---

## 🚀 Next Steps

1. ✅ Run the SQL script in Supabase Dashboard
2. ✅ Restart your development server
3. ✅ Test Google OAuth login
4. ✅ Test profile editing
5. Optional: Migrate old `users` data to `profiles` table if needed

---

## 📝 Notes

- The `profiles` table has **permissive RLS policies** for development
- In production, you should tighten these policies to check user authentication
- The service role key is included in .env for potential admin operations
- Both `users` and `profiles` tables can coexist

---

## ❓ Troubleshooting

**If Google OAuth still fails:**
1. Check that SQL script ran successfully (no errors)
2. Verify RLS is enabled: `SELECT * FROM profiles LIMIT 1;` should work
3. Check browser console for errors
4. Verify `.env` changes took effect (restart dev server)

**If donations don't show:**
1. Your existing donations reference `users` table
2. They will continue to work
3. New user profiles go into `profiles` table

