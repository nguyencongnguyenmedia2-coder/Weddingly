-- ============================================================
-- WEDDINGLY - MASTER DATABASE SCHEMA (CLEAN - NO DEMO DATA)
-- URL: https://dspatvqqeqyajexbgxbl.supabase.co
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào Supabase SQL Editor và nhấn "RUN"
-- ============================================================

-- Bật các extensions cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'PLANNER', 'ADMIN')),
    locale TEXT DEFAULT 'vi',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. WEDDINGS (Workspaces)
CREATE TABLE IF NOT EXISTS public.weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    bride_name TEXT NOT NULL,
    groom_name TEXT NOT NULL,
    wedding_date DATE NOT NULL,
    venue TEXT,
    estimated_budget NUMERIC(15, 2) DEFAULT 0 CHECK (estimated_budget >= 0),
    expected_guests INTEGER DEFAULT 0 CHECK (expected_guests >= 0),
    style TEXT DEFAULT 'Modern' CHECK (style IN ('Luxury', 'Modern', 'Minimal', 'Garden', 'Beach', 'Rustic', 'Traditional', 'Korean', 'European')),
    status TEXT DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    owner_id UUID DEFAULT gen_random_uuid(),
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 3. WEDDING MEMBERS
CREATE TABLE IF NOT EXISTS public.wedding_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'PARTNER', 'PLANNER', 'FAMILY', 'VIEWER')),
    invited_email TEXT,
    invitation_status TEXT DEFAULT 'ACCEPTED' CHECK (invitation_status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(wedding_id, user_id)
);

-- 4. SETTINGS
CREATE TABLE IF NOT EXISTS public.wedding_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE UNIQUE NOT NULL,
    currency TEXT DEFAULT 'VND',
    timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    notification_preferences JSONB DEFAULT '{"email": true, "task_reminder": true, "budget_alert": true, "rsvp_alert": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. BUDGET CATEGORIES
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    allocated_amount NUMERIC(15, 2) DEFAULT 0 CHECK (allocated_amount >= 0),
    percentage NUMERIC(5, 2) DEFAULT 0,
    color TEXT DEFAULT '#D6BE91',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.budget_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    title TEXT NOT NULL,
    vendor_name TEXT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE DEFAULT CURRENT_DATE NOT NULL,
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
    receipt_url TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
    vendor_name TEXT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0),
    deposit_amount NUMERIC(15, 2) DEFAULT 0 CHECK (deposit_amount >= 0),
    paid_amount NUMERIC(15, 2) DEFAULT 0 CHECK (paid_amount >= 0),
    remaining_amount NUMERIC(15, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    due_date DATE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 8. TABLES (SEATING PLANNER)
CREATE TABLE IF NOT EXISTS public.wedding_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0),
    table_type TEXT DEFAULT 'ROUND' CHECK (table_type IN ('ROUND', 'RECTANGLE', 'VIP', 'LONG')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. GUESTS
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    group_name TEXT DEFAULT 'Bạn bè' CHECK (group_name IN ('Gia đình', 'Bạn bè', 'Đồng nghiệp', 'VIP', 'Nhà gái', 'Nhà trai')),
    side TEXT DEFAULT 'BOTH' CHECK (side IN ('BRIDE', 'GROOM', 'BOTH')),
    plus_one BOOLEAN DEFAULT false,
    children INTEGER DEFAULT 0 CHECK (children >= 0),
    rsvp_status TEXT DEFAULT 'PENDING' CHECK (rsvp_status IN ('PENDING', 'CONFIRMED', 'DECLINED')),
    rsvp_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    meal_preference TEXT,
    table_id UUID REFERENCES public.wedding_tables(id) ON DELETE SET NULL,
    gift_amount NUMERIC(15, 2) DEFAULT 0 CHECK (gift_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 10. GUEST RSVPS (ONLINE)
CREATE TABLE IF NOT EXISTS public.guest_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
    attending BOOLEAN NOT NULL,
    guest_count INTEGER DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    meal_choice TEXT,
    wishes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Chung',
    status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date DATE,
    assignee_id UUID,
    estimated_cost NUMERIC(15, 2) DEFAULT 0 CHECK (estimated_cost >= 0),
    sort_order INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 12. TIMELINE EVENTS
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location TEXT,
    assignee_name TEXT,
    contact_phone TEXT,
    description TEXT,
    status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. VENDORS
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    price NUMERIC(15, 2) DEFAULT 0 CHECK (price >= 0),
    rating NUMERIC(2, 1) DEFAULT 5.0,
    status TEXT DEFAULT 'INQUIRY' CHECK (status IN ('INQUIRY', 'CONTACTED', 'QUOTED', 'BOOKED', 'DECLINED')),
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 14. NOTES
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'Planning' CHECK (category IN ('Planning', 'Budget', 'Vendor', 'Family', 'Wedding day', 'Personal')),
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 15. WEBSITES
CREATE TABLE IF NOT EXISTS public.wedding_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    template TEXT DEFAULT 'Luxury',
    our_story TEXT,
    cover_photo TEXT,
    is_published BOOLEAN DEFAULT false,
    theme_config JSONB DEFAULT '{"font": "Playfair Display", "primaryColor": "#8B5E5A"}'::jsonb,
    guestbook_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 16. INVITATIONS
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    template TEXT DEFAULT 'Luxury',
    parents_info JSONB DEFAULT '{}'::jsonb,
    dress_code TEXT DEFAULT 'Trang nhã, thanh lịch',
    gift_info JSONB DEFAULT '{}'::jsonb,
    share_slug TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(10), 'hex'),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- BẬT ROW LEVEL SECURITY (RLS) & CẤP QUYỀN TRUY CẬP CHO CLIENT
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- CẤP QUYỀN ĐỌC GHI CHO ANON VÀ AUTHENTICATED THÔNG QUA PUBLISHABLE KEY
DROP POLICY IF EXISTS "Allow public all access on weddings" ON public.weddings;
CREATE POLICY "Allow public all access on weddings" ON public.weddings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on wedding_members" ON public.wedding_members;
CREATE POLICY "Allow public all access on wedding_members" ON public.wedding_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on wedding_settings" ON public.wedding_settings;
CREATE POLICY "Allow public all access on wedding_settings" ON public.wedding_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on budget_categories" ON public.budget_categories;
CREATE POLICY "Allow public all access on budget_categories" ON public.budget_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on expenses" ON public.expenses;
CREATE POLICY "Allow public all access on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on payments" ON public.payments;
CREATE POLICY "Allow public all access on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on wedding_tables" ON public.wedding_tables;
CREATE POLICY "Allow public all access on wedding_tables" ON public.wedding_tables FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on guests" ON public.guests;
CREATE POLICY "Allow public all access on guests" ON public.guests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on guest_rsvps" ON public.guest_rsvps;
CREATE POLICY "Allow public all access on guest_rsvps" ON public.guest_rsvps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on tasks" ON public.tasks;
CREATE POLICY "Allow public all access on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on timeline_events" ON public.timeline_events;
CREATE POLICY "Allow public all access on timeline_events" ON public.timeline_events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on vendors" ON public.vendors;
CREATE POLICY "Allow public all access on vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on notes" ON public.notes;
CREATE POLICY "Allow public all access on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on wedding_websites" ON public.wedding_websites;
CREATE POLICY "Allow public all access on wedding_websites" ON public.wedding_websites FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on invitations" ON public.invitations;
CREATE POLICY "Allow public all access on invitations" ON public.invitations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on notifications" ON public.notifications;
CREATE POLICY "Allow public all access on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
