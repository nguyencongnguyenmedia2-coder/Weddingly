-- ============================================================
-- WEDDING PLANNER PRO - COMPLETE DATABASE SCHEMA (PostgreSQL)
-- Master Migration: 20261005000001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES & USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'PLANNER', 'ADMIN')),
    locale TEXT DEFAULT 'vi',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 2. WEDDINGS (Workspaces)
-- ============================================================
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
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- ============================================================
-- 3. WEDDING MEMBERS & PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wedding_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('OWNER', 'PARTNER', 'PLANNER', 'FAMILY', 'VIEWER')),
    invited_email TEXT,
    invitation_status TEXT DEFAULT 'ACCEPTED' CHECK (invitation_status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(wedding_id, user_id)
);

-- ============================================================
-- 4. WEDDING SETTINGS
-- ============================================================
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

-- ============================================================
-- 5. TASK CATEGORIES & TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8B5E5A',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Chung',
    status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date DATE,
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    estimated_cost NUMERIC(15, 2) DEFAULT 0 CHECK (estimated_cost >= 0),
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- ============================================================
-- 6. CHECKLISTS & ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    months_before_wedding INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 7. TIMELINE & WEDDING DAY
-- ============================================================
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

-- ============================================================
-- 8. BUDGET & EXPENSES & PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    allocated_amount NUMERIC(15, 2) DEFAULT 0 CHECK (allocated_amount >= 0),
    percentage NUMERIC(5, 2) DEFAULT 0,
    color TEXT DEFAULT '#D6BE91',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

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
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

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

-- ============================================================
-- 9. GUESTS & RSVP & SEATING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guest_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8B5E5A',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wedding_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0),
    table_type TEXT DEFAULT 'ROUND' CHECK (table_type IN ('ROUND', 'RECTANGLE', 'VIP', 'LONG')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

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

-- ============================================================
-- 10. VENDORS & VENUES & CONTRACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    capacity INTEGER,
    rental_price NUMERIC(15, 2) DEFAULT 0,
    deposit_price NUMERIC(15, 2) DEFAULT 0,
    parking_info TEXT,
    decoration_rules TEXT,
    menu_notes TEXT,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    map_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Địa điểm', 'Tiệc cưới', 'Chụp ảnh', 'Quay phim', 'Trang trí', 'Hoa cưới', 'Makeup', 'Làm tóc', 'Váy cưới', 'Vest cưới', 'MC', 'Âm nhạc', 'Xe hoa', 'Bánh cưới', 'Thiệp cưới', 'Khác')),
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

CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    contract_number TEXT,
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    deposit NUMERIC(15, 2) DEFAULT 0 CHECK (deposit >= 0),
    start_date DATE,
    end_date DATE,
    payment_schedule JSONB DEFAULT '[]'::jsonb,
    file_url TEXT,
    file_type TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 11. NOTES & GALLERY & WEBSITES & INVITATIONS
-- ============================================================
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

CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Pre-wedding' CHECK (category IN ('Pre-wedding', 'Engagement', 'Wedding', 'Family', 'Friends', 'Honeymoon')),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    mime_type TEXT,
    is_favorite BOOLEAN DEFAULT false,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wedding_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    template TEXT DEFAULT 'Luxury' CHECK (template IN ('Luxury', 'Elegant', 'Minimal', 'Garden', 'Modern', 'Traditional')),
    our_story TEXT,
    cover_photo TEXT,
    is_published BOOLEAN DEFAULT false,
    theme_config JSONB DEFAULT '{"font": "Playfair Display", "primaryColor": "#8B5E5A"}'::jsonb,
    guestbook_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    template TEXT DEFAULT 'Luxury' CHECK (template IN ('Luxury', 'Floral', 'Classic', 'Modern', 'Minimal')),
    parents_info JSONB DEFAULT '{"brideParents": "", "groomParents": ""}'::jsonb,
    dress_code TEXT DEFAULT 'Trang phục trang nhã, lịch sự',
    gift_info JSONB DEFAULT '{"bankName": "", "accountNumber": "", "accountName": ""}'::jsonb,
    share_slug TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(10), 'hex'),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 12. NOTIFICATIONS & AI & AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('TASK_DUE', 'TASK_OVERDUE', 'PAYMENT_DUE', 'RSVP', 'BUDGET_ALERT', 'VENDOR', 'TIMELINE', 'MILESTONE')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'Trò chuyện cùng Emma AI',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 13. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_weddings_owner ON public.weddings(owner_id);
CREATE INDEX IF NOT EXISTS idx_weddings_slug ON public.weddings(slug);
CREATE INDEX IF NOT EXISTS idx_members_wedding ON public.wedding_members(wedding_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.wedding_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding ON public.tasks(wedding_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_wedding ON public.expenses(wedding_id);
CREATE INDEX IF NOT EXISTS idx_payments_wedding ON public.payments(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding ON public.guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_token ON public.guests(rsvp_token);
CREATE INDEX IF NOT EXISTS idx_timeline_wedding ON public.timeline_events(wedding_id);
CREATE INDEX IF NOT EXISTS idx_vendors_wedding ON public.vendors(wedding_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_wedding ON public.audit_logs(wedding_id);

-- ============================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is an active member of wedding
CREATE OR REPLACE FUNCTION public.is_wedding_member(lookup_wedding_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.wedding_members 
        WHERE wedding_id = lookup_wedding_id 
          AND user_id = auth.uid()
          AND invitation_status = 'ACCEPTED'
    );
$$;

-- Helper function: Check if current user is owner or partner
CREATE OR REPLACE FUNCTION public.is_wedding_admin(lookup_wedding_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.wedding_members 
        WHERE wedding_id = lookup_wedding_id 
          AND user_id = auth.uid()
          AND role IN ('OWNER', 'PARTNER')
          AND invitation_status = 'ACCEPTED'
    );
$$;

-- RLS: Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- RLS: Weddings
CREATE POLICY "Members can view weddings" ON public.weddings FOR SELECT 
USING (owner_id = auth.uid() OR public.is_wedding_member(id));

CREATE POLICY "Authenticated users can create weddings" ON public.weddings FOR INSERT 
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can update wedding" ON public.weddings FOR UPDATE 
USING (owner_id = auth.uid() OR public.is_wedding_admin(id));

-- Generic macro for wedding-scoped tables
DO $$
DECLARE
    tbl text;
    wedding_tables text[] := ARRAY[
        'wedding_settings', 'tasks', 'task_categories', 'checklists', 
        'checklist_items', 'timeline_events', 'budget_categories', 'expenses', 
        'payments', 'guest_groups', 'wedding_tables', 'venues', 
        'vendors', 'contracts', 'notes', 'albums', 'media_assets', 'notifications',
        'ai_conversations'
    ];
BEGIN
    FOREACH tbl IN ARRAY wedding_tables LOOP
        EXECUTE format('
            CREATE POLICY "%1$s_select" ON public.%1$s FOR SELECT USING (public.is_wedding_member(wedding_id));
            CREATE POLICY "%1$s_insert" ON public.%1$s FOR INSERT WITH CHECK (public.is_wedding_member(wedding_id));
            CREATE POLICY "%1$s_update" ON public.%1$s FOR UPDATE USING (public.is_wedding_member(wedding_id));
            CREATE POLICY "%1$s_delete" ON public.%1$s FOR DELETE USING (public.is_wedding_member(wedding_id));
        ', tbl);
    END LOOP;
END $$;

-- Public Guest RSVP Policies (token based)
CREATE POLICY "Allow public RSVP lookup by token" ON public.guests FOR SELECT 
USING (rsvp_token IS NOT NULL);

CREATE POLICY "Allow public RSVP submission" ON public.guest_rsvps FOR INSERT 
WITH CHECK (true);

-- Public Wedding Website Policies (published only)
CREATE POLICY "Allow public website view" ON public.wedding_websites FOR SELECT 
USING (is_published = true OR public.is_wedding_member(wedding_id));
