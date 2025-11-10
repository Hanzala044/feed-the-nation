# Google Cloud Console - Branding & Domain Setup Guide

This guide will help you complete the Google OAuth branding configuration shown in your Google Cloud Console.

## Step 1: Understanding the Acceptable Use Policy Warning

The orange alert banner about "Acceptable Use Policy violation" is usually a warning, not a blocking issue. It can appear if:
- Your app is in testing/development
- Domain verification is pending
- Some required fields are missing

**Solution:** Complete the branding setup below, and the warning should resolve automatically.

## Step 2: Fill in App Domain Information

### Application Home Page
- **What to enter:** Your app's main URL
- **For local development:** `http://localhost:8080`
- **For production:** `https://your-domain.com` or `https://your-supabase-project.supabase.co`
- **Example:** `https://your-app-name.vercel.app` or your custom domain

### Application Privacy Policy Link
- **What to enter:** A publicly accessible privacy policy URL
- **Required:** Yes (for production apps)
- **Options:**
  1. Create a simple privacy policy page in your app
  2. Use a free privacy policy generator
  3. Host it on GitHub Pages or similar
- **Example:** `https://your-domain.com/privacy-policy`
- **Note:** For development, you can use a placeholder, but production requires a real policy

### Application Terms of Service Link
- **What to enter:** A publicly accessible terms of service URL
- **Required:** Yes (for production apps)
- **Options:** Similar to privacy policy
- **Example:** `https://your-domain.com/terms-of-service`

## Step 3: Add Authorized Domains

### Why This is Important
Google requires you to register all domains that will be used in:
- OAuth redirect URIs
- Consent screen
- Any domain referenced in your OAuth configuration

### How to Add Domains

1. Click the **"+ Add domain"** button
2. Add these domains (one at a time):

#### For Development:
```
localhost
```

#### For Supabase (Required):
```
supabase.co
```
This is needed because Supabase handles the OAuth callback.

#### For Production:
```
your-domain.com
your-subdomain.vercel.app
```
Add all domains where your app will be hosted.

### Important Notes:
- **Don't include** `http://` or `https://` - just the domain name
- **Don't include** port numbers (like `:8080`)
- Add **each domain separately**
- Common domains to add:
  - `localhost` (for local development)
  - `supabase.co` (for Supabase OAuth)
  - Your production domain(s)

## Step 4: Complete the Setup

### Quick Setup for Development:

1. **Application home page:** `http://localhost:8080`
2. **Privacy policy link:** `http://localhost:8080/privacy` (or create a placeholder)
3. **Terms of service link:** `http://localhost:8080/terms` (or create a placeholder)
4. **Authorized domains:** 
   - `localhost`
   - `supabase.co`

### For Production:

1. **Application home page:** Your production URL
2. **Privacy policy link:** Your actual privacy policy URL
3. **Terms of service link:** Your actual terms of service URL
4. **Authorized domains:**
   - Your production domain
   - `supabase.co`
   - Any other domains you use

## Step 5: Create Privacy Policy and Terms Pages (Quick Solution)

If you don't have privacy policy and terms pages, you can quickly create them:

### Option 1: Add to Your App

Create these files in your app:
- `src/pages/PrivacyPolicy.tsx`
- `src/pages/TermsOfService.tsx`

### Option 2: Use External Services

- **Privacy Policy Generator:** https://www.freeprivacypolicy.com/
- **Terms of Service Generator:** https://www.termsofservicegenerator.net/
- Host the generated pages and use their URLs

### Option 3: GitHub Pages (Free)

1. Create a simple HTML page with your privacy policy
2. Host it on GitHub Pages
3. Use the GitHub Pages URL in Google Console

## Step 6: Verify Your Setup

After completing the branding setup:

1. **Save all changes** in Google Cloud Console
2. **Wait a few minutes** for changes to propagate
3. **Check the verification status** - it should show "Verification is not required" for development
4. **Test your OAuth flow** - the warning should disappear

## Step 7: OAuth Client Configuration

After completing branding, make sure your OAuth Client has:

### Authorized JavaScript origins:
```
http://localhost:8080
https://your-domain.com
```

### Authorized redirect URIs:
```
http://localhost:8080/auth/callback
https://your-supabase-project.supabase.co/auth/v1/callback
https://your-domain.com/auth/callback
```

## Troubleshooting

### Issue: "Acceptable Use Policy violation" warning persists
**Solution:**
1. Complete all required fields (home page, privacy policy, terms)
2. Add all necessary authorized domains
3. Wait 15-30 minutes for changes to propagate
4. If it persists, check if your app complies with Google's policies

### Issue: Domain not accepted
**Solution:**
1. Make sure you're adding just the domain (no http://, https://, or ports)
2. For `localhost`, add it as-is
3. For Supabase, add `supabase.co` (not your specific project URL)
4. Wait a few minutes and try again

### Issue: Privacy Policy/Terms links required
**Solution:**
1. Create simple pages in your app
2. Or use a free generator and host the pages
3. Make sure the URLs are publicly accessible (no authentication required)

## Quick Checklist

- [ ] Application home page filled in
- [ ] Privacy policy link provided (publicly accessible)
- [ ] Terms of service link provided (publicly accessible)
- [ ] `localhost` added to authorized domains
- [ ] `supabase.co` added to authorized domains
- [ ] Production domain(s) added to authorized domains
- [ ] All changes saved
- [ ] OAuth client redirect URIs configured
- [ ] Tested OAuth flow

## Next Steps

After completing the branding setup:

1. Go to **Clients** section in Google Cloud Console
2. Verify your OAuth 2.0 Client ID is configured correctly
3. Copy your Client ID and Client Secret
4. Add them to Supabase Dashboard (Authentication > Providers > Google)
5. Test the Google sign-in flow in your app

## Important Reminders

- **Development:** You can use placeholder URLs for privacy policy and terms
- **Production:** You MUST have real, publicly accessible privacy policy and terms pages
- **Authorized domains:** Add ALL domains you'll use (development and production)
- **Verification:** For development, verification is usually not required. For production with sensitive scopes, verification may be needed.



