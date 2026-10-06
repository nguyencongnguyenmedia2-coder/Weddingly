# SUPABASE SETUP GUIDE - WEDDING PLANNER PRO

## 1. Local or Cloud Project Creation
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. In Project Settings -> API, copy:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` -> `SUPABASE_SERVICE_ROLE_KEY`
3. Add these to your `.env.local` or Vercel Environment Variables.

## 2. Running Schema Migrations
1. Open SQL Editor in your Supabase Dashboard.
2. Run the migration script located at:
   `supabase/migrations/20261005000001_initial_schema.sql`
3. Optional: To populate development seed records, execute:
   `supabase/seed.sql`

## 3. Storage Buckets
Create the following buckets in Storage:
- `wedding-media` (Public for published galleries, private for drafts)
- `contracts` (Private, accessible only via signed URLs)
- `avatars` (Public)
