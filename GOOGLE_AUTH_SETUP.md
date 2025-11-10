# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your FOOD 4 U app using Supabase.

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Add authorized JavaScript origins:
     - `http://localhost:8080` (for local development)
     - `https://your-domain.com` (for production)
   - Add authorized redirect URIs:
     - `http://localhost:8080/auth/callback` (for local development)
     - `https://your-supabase-project.supabase.co/auth/v1/callback` (Supabase callback)
     - `https://your-domain.com/auth/callback` (for production)
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these for Supabase)

## Step 2: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list and click on it
5. Enable Google provider by toggling it on
6. Enter your Google OAuth credentials:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
7. Click "Save"

## Step 3: Update Redirect URL in Supabase

1. In Supabase Dashboard, go to "Authentication" > "URL Configuration"
2. Add your redirect URLs:
   - Site URL: `http://localhost:8080` (for development) or your production URL
   - Redirect URLs: 
     - `http://localhost:8080/auth/callback`
     - `https://your-domain.com/auth/callback`

## Step 4: Environment Variables (Optional)

If you want to customize the redirect URL, you can add it to your `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

**Note:** The Google API keys are NOT stored in your code or environment variables. They are securely stored in Supabase's dashboard.

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the auth page: `http://localhost:8080/auth`

3. Click "Continue with Google"

4. You should be redirected to Google's sign-in page

5. After signing in, you'll be redirected back to your app

## Troubleshooting

### Issue: "redirect_uri_mismatch" error
**Solution:** Make sure you've added the correct redirect URIs in both:
- Google Cloud Console (authorized redirect URIs)
- Supabase Dashboard (URL Configuration)

### Issue: Google sign-in not working
**Solution:** 
1. Verify Google OAuth is enabled in Supabase
2. Check that Client ID and Client Secret are correct
3. Ensure the redirect URLs match exactly in both Google Console and Supabase

### Issue: User profile not created
**Solution:** The app automatically creates a profile when a user signs in with Google. If it's not working, check:
1. The database trigger `on_auth_user_created` is set up correctly
2. The `profiles` table exists and has the correct structure
3. Check the browser console for any errors

## Important Notes

- **Never commit Google OAuth credentials to your repository**
- Google OAuth credentials are stored securely in Supabase Dashboard
- The redirect URL must match exactly in both Google Console and Supabase
- For production, update all URLs to use your production domain
- Make sure to enable the Google+ API in Google Cloud Console

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)



