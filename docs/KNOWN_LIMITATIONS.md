# KNOWN LIMITATIONS & EXTENSION POINTS - WEDDING PLANNER PRO

## 1. Cloud Connectivity
- The local development environment operates on an in-memory/mock state provider when no external Supabase URL and Anon Key are supplied.
- To connect to live cloud PostgreSQL, input your credentials into `.env.local` or Vercel Environment Variables and execute `supabase/migrations/20261005000001_initial_schema.sql`.

## 2. Payment Gateway Integration
- The financial module records deposits, amounts due, and statuses (`PENDING`, `PARTIAL`, `PAID`, `OVERDUE`).
- Direct payment gateway checkout (VNPay, Momo, Stripe) is prepared via `PaymentService` architecture and can be enabled upon configuring merchant keys.

## 3. Emma AI Model Access
- Emma AI is architected with Gemini and OpenAI adapters. If API keys are omitted, Emma AI gracefully prompts the user with setup instructions without producing fabricated responses.
