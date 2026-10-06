# DATABASE DOCUMENTATION - WEDDING PLANNER PRO

## 1. Overview
The database engine is **PostgreSQL (via Supabase)** utilizing **Row Level Security (RLS)**, UUID primary keys, and typed schema tables.

## 2. Table Catalog
1. **`profiles`**: User profiles linked to `auth.users(id)`
2. **`weddings`**: Master wedding workspaces (Bride, Groom, Date, Venue, Budget, Guest Count, Style, Status)
3. **`wedding_members`**: Multi-user collaboration with roles (`OWNER`, `PARTNER`, `PLANNER`, `FAMILY`, `VIEWER`)
4. **`wedding_settings`**: Notification preferences, currency (`VND`), timezone (`Asia/Ho_Chi_Minh`), emergency contacts
5. **`task_categories` & `tasks`**: Kanban/List task tracking (`TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
6. **`checklists` & `checklist_items`**: Countdown milestone checklists (12M, 9M, 6M, 3M, 1M, 1W)
7. **`timeline_events`**: Chronological rundown for the wedding day
8. **`budget_categories`, `expenses`, `payments`**: Financial accounting, deposit tracking, remaining balance
9. **`guest_groups`, `guests`, `guest_rsvps`**: Guest list, RSVP tokens, dietary restrictions, party size
10. **`wedding_tables`**: Visual seating arrangement with capacity constraint enforcement
11. **`venues`, `vendors`, `contracts`**: Supplier directory, ratings, contract values, signed attachments
12. **`notes`, `albums`, `media_assets`**: High-resolution gallery and planning notes
13. **`wedding_websites`, `invitations`**: Public love story page (`/w/[slug]`) and digital invitation cards
14. **`notifications`, `ai_conversations`, `ai_messages`**: Emma AI context and activity alerts
15. **`audit_logs`**: Tamper-proof operation log for auditing user actions

## 3. Migration Files
- `supabase/migrations/20261005000001_initial_schema.sql`
- `supabase/seed.sql` (Seed data with 300,000,000 VND budget, 250 guests, tasks, timeline events, vendors)
