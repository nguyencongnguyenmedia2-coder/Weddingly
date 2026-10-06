# Architecture Documentation - Wedding Planner Pro

## 1. High-Level Architectural Flow

```
[ User Browser / Mobile Device / PWA ]
               │
               ▼
[ Next.js App Router (Client Components / Server Components) ]
               │
      ┌────────┴────────┐
      ▼                 ▼
[ Server Actions ] [ Route Handlers (API / Webhooks / AI / Export) ]
      │                 │
      └────────┬────────┘
               ▼
      [ Service Layer ] (src/services/*.service.ts)
               │ (Zod Validation & Business Logic)
               ▼
    [ Supabase Client Layer ]
   - @supabase/ssr (Server Component & Action Session Context)
   - @supabase/supabase-js (Browser Client with Realtime)
               │
               ▼
   [ PostgreSQL + Row Level Security (RLS) ]
   - 30+ Relational Tables
   - Auth Provider (Supabase Auth)
   - Realtime Publication Channels
   - Storage Buckets (Public / Private with Signed URLs)
```

## 2. Directory Structure

```
src/
├── app/                  # Next.js App Router routes & layouts
│   ├── (auth)/           # /login, /register, /forgot-password, /reset-password
│   ├── (dashboard)/      # Protected workspace: /dashboard, /tasks, /budget, etc.
│   ├── (public)/         # Landing page, /rsvp/[token], /w/[slug]
│   ├── onboarding/       # Wedding creation wizard
│   └── api/              # Route handlers (AI, export, webhooks)
├── components/           # Reusable UI primitives & shared components
│   ├── ui/               # Buttons, Inputs, Cards, Dialogs, Drawers, Badges
│   ├── layout/           # Sidebar, MobileNav, Header, WeddingSwitcher
│   └── shared/           # Countdown, StatusBadges, EmptyStates, Skeletons
├── features/             # Feature-specific components
│   ├── dashboard/        # Metrics, Recent Activity, Quick Actions
│   ├── tasks/            # Kanban, List, Calendar views
│   ├── budget/           # Category breakdowns, charts, expense dialog
│   ├── guests/           # Guest list, RSVP table, seating planner
│   ├── vendors/          # Vendor cards, comparison, contracts
│   ├── timeline/         # Wedding schedule & wedding-day mode
│   └── ai/               # Emma AI Assistant floating widget
├── services/             # Pure business logic & Supabase query wrappers
├── schemas/              # Zod validation schemas
├── types/                # Domain & Supabase database TypeScript definitions
├── lib/                  # Utilities, Supabase clients (server/client), currency, formatting
├── hooks/                # Custom React hooks (useRealtime, useWedding, etc.)
└── config/               # Navigation, site metadata, theme presets
```

## 3. Design Principles
- **No Direct DB queries from Components:** All database interactions funnel through typed services in `src/services/`.
- **Zero Raw Secrets in Client:** Sensitive tokens like service keys or AI keys stay exclusively on the server.
- **Strict Typing:** All data structures conform to Zod schemas and TypeScript interfaces.
- **Soft Deletion & Auditability:** Critical operational records support `deleted_at` and audit logging.
