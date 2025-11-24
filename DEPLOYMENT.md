# 🚀 Deployment Guide - FOOD 4 U

## Netlify Deployment Instructions

### Step 1: Connect Repository
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your repository: `Hanzala044/feed-the-nation`

### Step 2: Configure Build Settings
```
Branch to deploy: main
Base directory: (leave empty)
Build command: npm run build
Publish directory: dist
```

**Important:** The repository already includes `public/_redirects` file for SPA routing.
This ensures React Router works correctly with direct URL navigation.

### Step 3: Add Environment Variables

Go to: **Site settings → Environment variables → Add a variable**

Add these **4 environment variables** (ONLY these - do NOT add service role keys):

```env
VITE_SUPABASE_URL
Value: https://uhuctkswxybirvzwhehb.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodWN0a3N3eHliaXJ2endoZWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDE4ODYsImV4cCI6MjA3ODExNzg4Nn0.RJVhjHTa_-8U7n9YJvXpXTqG8Onwd6Da_7TeLizaJas

VITE_AUTH_SUPABASE_URL
Value: https://bbbxtrcvhrfvexxchwob.supabase.co

VITE_AUTH_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYnh0cmN2aHJmdmV4eGNod29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzUwNjYsImV4cCI6MjA3OTIxMTA2Nn0.J2rXvb_nvSAk-jWhfgX8Dv6OHwiJ0r9bUW6Ky6rMqS8
```

⚠️ **SECURITY NOTE:** Never add `VITE_SUPABASE_SERVICE_ROLE_KEY` or `VITE_SUPABASE_PROJECT_ID` to Netlify!
Service role keys bypass Row Level Security and must never be exposed to clients.

### Step 4: Deploy
Click "Deploy site" - Your site will be live in ~2 minutes!

---

## Vercel Deployment Instructions

### Step 1: Import Project
1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import from GitHub: `Hanzala044/feed-the-nation`

### Step 2: Configure Project
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

### Step 3: Add Environment Variables

In the deployment configuration, add these **4 variables** (ONLY these):

```env
VITE_SUPABASE_URL = https://uhuctkswxybirvzwhehb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodWN0a3N3eHliaXJ2endoZWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDE4ODYsImV4cCI6MjA3ODExNzg4Nn0.RJVhjHTa_-8U7n9YJvXpXTqG8Onwd6Da_7TeLizaJas
VITE_AUTH_SUPABASE_URL = https://bbbxtrcvhrfvexxchwob.supabase.co
VITE_AUTH_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYnh0cmN2aHJmdmV4eGNod29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzUwNjYsImV4cCI6MjA3OTIxMTA2Nn0.J2rXvb_nvSAk-jWhfgX8Dv6OHwiJ0r9bUW6Ky6rMqS8
```

⚠️ **SECURITY NOTE:** Do NOT add service role keys to Vercel!

### Step 4: Deploy
Click "Deploy" - Your site will be live instantly!

---

## Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Site is accessible
- [ ] Authentication works (login/signup)
- [ ] Database connections working
- [ ] Images and assets loading
- [ ] Mobile responsive
- [ ] Dark/light mode toggle works

### ✅ Configure Domain (Optional)
1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS records as instructed

### ✅ Set up Continuous Deployment
- Automatic: Pushes to `main` branch trigger deployments
- Manual: Use "Trigger deploy" button in dashboard

---

## Troubleshooting

### Build Failed?
- Check build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node version (recommended: 18.x or higher)

### App Not Working?
- Verify all 6 environment variables are set correctly
- Check browser console for errors
- Ensure Supabase project is active

### Database Connection Issues?
- Verify Supabase URLs are correct
- Check if Supabase project has Row Level Security enabled
- Confirm API keys are valid

---

## Support

- **Netlify Docs**: https://docs.netlify.com/
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Your app is ready to deploy! 🚀**
