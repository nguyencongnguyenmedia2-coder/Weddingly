# VERCEL DEPLOYMENT GUIDE - WEDDING PLANNER PRO

## 1. Prerequisites
- GitHub repository connected to your Vercel team/account.
- Configured Supabase project with migration script applied.

## 2. Configuration Settings
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## 3. Environment Variables in Vercel
Add the following keys in Project Settings -> Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
GEMINI_API_KEY=AIzaSy... (Optional for Emma AI)
OPENAI_API_KEY=sk-... (Optional for Emma AI)
```
Do NOT hardcode `localhost:3000` for production redirects.
