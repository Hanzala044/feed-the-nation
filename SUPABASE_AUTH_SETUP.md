# Supabase Auth Setup Guide

## Email Configuration

### 1. Enable Google OAuth Provider

1. Go to your Supabase Dashboard: https://bbbxtrcvhrfvexxchwob.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials (Client ID & Secret)
5. Add redirect URL: `https://your-domain.com/auth`

### 2. Configure Email Templates

Go to **Authentication** → **Email Templates** and update the **Confirm Signup** template:

```html
<h2>Welcome to Food 4 U, {{ .Name }}!</h2>

<p>Thank you for choosing our platform to do social work and make a difference in your community!</p>

<p>We're thrilled to have you join as a <strong>{{ .Role }}</strong>.</p>

<p>Please confirm your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Activate Your Account</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Together, we can ensure no one goes hungry!</p>

<p>Best regards,<br>
The Food 4 U Team</p>

<hr>
<p style="font-size: 12px; color: #666;">If you didn't create an account, please ignore this email.</p>
```

### 3. Email Settings

In **Authentication** → **Settings**:

- ✅ Enable Email Confirmations
- ✅ Enable Email Change Confirmations
- ✅ Secure Email Change
- Set Redirect URL: `http://localhost:5173/auth` (for development)
- Production: `https://your-domain.com/auth`

### 4. SMTP Settings (Optional for Custom Email)

If you want to use your own email service instead of Supabase's:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP server details
3. Test the configuration

### 5. Update Site URL

In **Authentication** → **URL Configuration**:
- Site URL: `http://localhost:5173` (development)
- Redirect URLs:
  - `http://localhost:5173/auth`
  - `http://localhost:5173/**`
  - Add your production URLs here

## Database Schema

Make sure these tables exist in your main database (`abthtvwjkrpeyrptluza`):

### profiles table
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('donor', 'volunteer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone TEXT,
  address TEXT,
  city TEXT,
  bio TEXT
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## Testing

1. **Test Email Signup:**
   - Go to `/auth?mode=signup`
   - Fill in details
   - Select role (Donor or Volunteer)
   - Submit form
   - Check email for confirmation link
   - Click link to activate account

2. **Test Google OAuth:**
   - Click "Continue with Google"
   - Sign in with Google account
   - Select role in glassmorphism modal
   - Verify redirect to appropriate dashboard

3. **Test Login:**
   - Go to `/auth`
   - Enter credentials
   - Verify redirect based on role

## Troubleshooting

### Email not sending?
- Check SMTP settings
- Verify email templates are enabled
- Check spam folder
- Review Supabase logs

### Google OAuth not working?
- Verify OAuth credentials
- Check redirect URLs match
- Ensure Google provider is enabled
- Check browser console for errors

### Role not saving?
- Verify profiles table exists
- Check RLS policies
- Review database logs
- Ensure user_metadata is accessible

## Environment Variables

Make sure your `.env` file has:

```env
# Database credentials (existing)
VITE_SUPABASE_PROJECT_ID="abthtvwjkrpeyrptluza"
VITE_SUPABASE_PUBLISHABLE_KEY="your-key"
VITE_SUPABASE_URL="https://abthtvwjkrpeyrptluza.supabase.co"

# Auth credentials (new)
VITE_AUTH_SUPABASE_URL="https://bbbxtrcvhrfvexxchwob.supabase.co"
VITE_AUTH_SUPABASE_ANON_KEY="your-auth-key"
```

## Next Steps

1. Configure email templates in Supabase Dashboard
2. Enable Google OAuth provider
3. Test signup and login flows
4. Create profile edit pages (next task)
5. Deploy to production
