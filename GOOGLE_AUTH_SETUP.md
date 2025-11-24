# 🔐 Google Authentication Setup Guide

## Problem
Google sign-in is failing on the deployed Netlify site with the error showing in browser console.

## Root Cause
The redirect URLs are not properly configured in Supabase for your deployed Netlify site.

---

## ✅ Solution: Configure Supabase OAuth Settings

### Step 1: Get Your Netlify Site URL

1. Go to your Netlify dashboard
2. Find your site URL (e.g., `https://foood4u.netlify.app`)
3. Copy the full URL

### Step 2: Configure Auth Supabase Project (bbbxtrcvhrfvexxchwob)

This is your **AUTH** Supabase instance that handles Google OAuth.

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/bbbxtrcvhrfvexxchwob

2. **Navigate to Authentication Settings:**
   - Click **Authentication** in left sidebar
   - Click **URL Configuration**

3. **Add Site URL:**
   ```
   Site URL: https://foood4u.netlify.app
   ```

4. **Add Redirect URLs:**
   In the "Redirect URLs" section, add BOTH of these:
   ```
   https://foood4u.netlify.app/auth
   https://foood4u.netlify.app/auth/callback
   http://localhost:8080/auth
   http://localhost:8080/auth/callback
   ```

   ⚠️ **Important:** Replace `foood4u.netlify.app` with your actual Netlify domain!

5. **Click "Save"**

### Step 3: Enable Google OAuth Provider

1. **In the same Supabase project (bbbxtrcvhrfvexxchwob):**
   - Go to **Authentication** → **Providers**
   - Find **Google** provider
   - Toggle it to **Enabled**

2. **Configure Google Provider:**
   - You'll need to create a Google Cloud Console project if you haven't already
   - Get your **Client ID** and **Client Secret** from Google Cloud Console
   - Paste them into Supabase

### Step 4: Google Cloud Console Setup

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Create or Select Project:**
   - Create a new project or select existing one

3. **Enable Google+ API:**
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. **Create OAuth 2.0 Credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth Client ID**
   - Application type: **Web application**
   - Name: "FOOD 4 U - Netlify"

5. **Configure Authorized Redirect URIs:**
   Add these URLs:
   ```
   https://bbbxtrcvhrfvexxchwob.supabase.co/auth/v1/callback
   http://localhost:8080/auth/callback
   ```

6. **Copy Client ID and Client Secret:**
   - Save these values

7. **Add to Supabase:**
   - Go back to Supabase → Authentication → Providers → Google
   - Paste **Client ID** and **Client Secret**
   - Click **Save**

---

## 🧪 Testing

### Test Locally:
1. Run `npm run dev`
2. Go to http://localhost:8080/auth
3. Click "Continue with Google"
4. Should redirect to Google sign-in
5. After signing in, should redirect back to your app

### Test on Netlify:
1. Go to https://foood4u.netlify.app/auth (your domain)
2. Click "Continue with Google"
3. Should redirect to Google sign-in
4. After signing in, should redirect back and show role selection modal

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause:** The redirect URL in Google Cloud Console doesn't match Supabase callback URL.

**Fix:**
- Make sure you added the Supabase callback URL exactly as shown above
- Format: `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`

### Error: "Access blocked: This app's request is invalid"
**Cause:** Google OAuth consent screen not configured.

**Fix:**
1. Go to Google Cloud Console → **OAuth consent screen**
2. Fill in required information:
   - App name: "FOOD 4 U"
   - User support email: Your email
   - Developer contact: Your email
3. Add scopes: `email`, `profile`, `openid`
4. Save and continue

### Sign-in works but redirects to wrong page
**Cause:** Site URL in Supabase is incorrect.

**Fix:**
- Update Site URL in Supabase to match your Netlify domain exactly
- No trailing slash!

### "Failed to create profile" error
**Cause:** Database migration not run (user_stats foreign key issue).

**Fix:**
- Run the SQL migration: `supabase/migrations/05_fix_user_stats_constraint.sql`
- See DEPLOYMENT.md for instructions

---

## 📋 Quick Checklist

Before deploying, ensure:

- [ ] Supabase Auth project redirect URLs include your Netlify domain
- [ ] Google Cloud Console OAuth redirect includes Supabase callback URL
- [ ] Google provider is enabled in Supabase
- [ ] Client ID and Secret are configured in Supabase
- [ ] Site URL in Supabase matches your Netlify domain
- [ ] Database migration has been run (05_fix_user_stats_constraint.sql)
- [ ] All 4 environment variables are set in Netlify:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_AUTH_SUPABASE_URL`
  - `VITE_AUTH_SUPABASE_ANON_KEY`

---

## 🆘 Still Having Issues?

Check browser console for specific error messages:
1. Open DevTools (F12)
2. Go to **Console** tab
3. Try signing in with Google
4. Look for error messages
5. Common errors and fixes are listed in Troubleshooting section above

**Database Migration Required:**
If you see "insert or update on table user_stats violates foreign key constraint", run:
```sql
-- In Supabase SQL Editor (https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/sql)
-- Copy and run: supabase/migrations/05_fix_user_stats_constraint.sql
```

---

**Your Google authentication should now work! 🎉**
