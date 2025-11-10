# Quick Google OAuth Setup Solution

## ⚠️ IMPORTANT: Localhost Not Allowed

Google Cloud Console **does NOT accept localhost URLs** in the App domain fields. You need public URLs.

## Solution Options

### Option 1: Use ngrok (Quickest for Development) ⚡

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your app:**
   ```bash
   npm run dev
   ```

3. **In another terminal, create tunnel:**
   ```bash
   ngrok http 8080
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Use in Google Cloud Console:**
   - Application Home Page: `https://abc123.ngrok.io`
   - Privacy Policy: `https://abc123.ngrok.io/privacy-policy`
   - Terms of Service: `https://abc123.ngrok.io/terms-of-service`

### Option 2: Deploy to Vercel (Best Long-term) 🚀

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Use the Vercel URL** (e.g., `https://your-app.vercel.app`)

### Option 3: Use Supabase Project URL

If your app is accessible via Supabase:
- Application Home Page: `https://your-project-id.supabase.co`
- Privacy Policy: `https://your-project-id.supabase.co/privacy-policy`
- Terms: `https://your-project-id.supabase.co/terms-of-service`

## Step 2: Add Authorized Domains

Click **"+ Add domain"** and add these (one at a time):

1. **localhost** (for local development)
2. **supabase.co** (required for Supabase OAuth)

### For Production, also add:
3. Your production domain (e.g., `yourdomain.com`)
4. Your hosting domain (e.g., `vercel.app` if using Vercel)

## Step 3: Save and Wait

1. Click **Save** on the branding page
2. Wait 2-5 minutes for changes to propagate
3. The orange warning should disappear

## Step 4: Complete OAuth Client Setup

After branding is done, go to **Clients** section and make sure:

### Authorized JavaScript origins:
```
http://localhost:8080
```

### Authorized redirect URIs:
```
http://localhost:8080/auth/callback
https://your-supabase-project.supabase.co/auth/v1/callback
```

## Step 5: Copy Credentials to Supabase

1. Copy your **Client ID** and **Client Secret** from Google Cloud Console
2. Go to Supabase Dashboard → Authentication → Providers → Google
3. Paste the credentials and enable Google OAuth
4. Save

## That's It! 🎉

Your app now has:
- ✅ Privacy Policy page at `/privacy-policy`
- ✅ Terms of Service page at `/terms-of-service`
- ✅ Google OAuth ready to use

## Test It

1. Run: `npm run dev`
2. Go to: `http://localhost:8080/auth`
3. Click: "Continue with Google"
4. Sign in with Google

## Troubleshooting the Orange Warning

If the warning persists:
1. Make sure all three fields are filled (home page, privacy, terms)
2. Add `localhost` and `supabase.co` to authorized domains
3. Wait 10-15 minutes
4. Refresh the page

The warning usually clears once all required fields are completed and domains are added.

