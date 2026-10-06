# SECURITY & ACCESS CONTROL - WEDDING PLANNER PRO

## 1. Principles
- **No Client Secrets:** Service role keys and AI secret keys are strictly restricted to the server environment.
- **Row Level Security (RLS):** Every PostgreSQL table has RLS enabled. Users can only access wedding records if they are an active member in `wedding_members`.
- **Public RSVP Isolation:** Public guests can only access and update their own invitation via cryptographically secure tokens (`rsvp_token`). The full guest list is never disclosed publicly.
- **Published Website Control:** Wedding websites are accessible to the public only when `is_published = true`. Private drafts require workspace authorization.
- **Input Validation:** All client and server mutations are strictly validated using Zod schemas (`src/schemas/`).

## 2. Collaboration Roles & Permissions
- **`OWNER`**: Full administrative access, delete workspace, manage billing and members.
- **`PARTNER`**: Shared co-management with the owner (both bride and groom).
- **`PLANNER`**: Can edit tasks, budget, vendors, timeline, and table seating.
- **`FAMILY`**: Access to guest lists, seating, and wedding day rundown.
- **`VIEWER`**: Read-only observation.
