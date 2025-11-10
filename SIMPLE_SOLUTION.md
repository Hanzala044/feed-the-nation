# Simple Solution: Get Google OAuth Working Now

## The Problem
Google doesn't allow `localhost` in App domain fields. You need a public URL.

## The Easiest Solution: Use ngrok (5 minutes)

### Step 1: Install ngrok
```bash
npm install -g ngrok
```
Or download from: https://ngrok.com/download

### Step 2: Start Your App
```bash
npm run dev
```
Your app should be running on `http://localhost:8080`

### Step 3: Create Public Tunnel
Open a new terminal and run:
```bash
ngrok http 8080
```

You'll see something like:
```
Forwarding  https://abc123-def456.ngrok.io -> http://localhost:8080
```

### Step 4: Copy the ngrok URL
Copy the `https://` URL (e.g., `https://abc123-def456.ngrok.io`)

### Step 5: Use in Google Cloud Console

Go to Google Cloud Console → Branding and fill in:

**Application Home Page:**
```
https://abc123-def456.ngrok.io
```
(Use your actual ngrok URL)

**Application Privacy Policy Link:**
```
https://abc123-def456.ngrok.io/privacy-policy
```

**Application Terms of Service Link:**
```
https://abc123-def456.ngrok.io/terms-of-service
```

### Step 6: Add Authorized Domains

Click "+ Add domain" and add:
- `ngrok.io` (this covers all ngrok URLs)
- `supabase.co`

### Step 7: Save and Test

1. Click **Save** in Google Cloud Console
2. Wait 2-3 minutes
3. Test Google sign-in in your app

## Important Notes

- **ngrok URL changes** each time you restart (unless paid plan)
- **Keep ngrok running** while testing
- For production, deploy to Vercel/Netlify and use that URL

## Alternative: Deploy to Vercel (10 minutes)

If you want a permanent URL:

1. **Install Vercel:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   Follow the prompts. It's free!

3. **Use the Vercel URL** in Google Cloud Console

## What About OAuth Redirect URIs?

For OAuth to work, you need:

**In Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs:**
```
https://your-supabase-project.supabase.co/auth/v1/callback
```

This is the important one! The App domain fields are just for the consent screen.

## Quick Decision Guide

- **Need it working NOW?** → Use ngrok (5 min)
- **Want permanent solution?** → Deploy to Vercel (10 min)
- **Just testing?** → ngrok is fine
- **Going to production?** → Deploy to Vercel first

## Next Steps After Setup

1. Complete Google Cloud Console setup
2. Copy Client ID and Client Secret
3. Add to Supabase Dashboard → Authentication → Providers → Google
4. Test Google sign-in!

That's it! 🎉



