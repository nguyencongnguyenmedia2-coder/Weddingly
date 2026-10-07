-- MIGRATION: Subscription Orders & Payment Approvals
-- Description: Supports SaaS subscription upgrade requests, VietQR payments, and Admin approval workflow

-- 1. SUBSCRIPTION ORDERS
CREATE TABLE IF NOT EXISTS public.subscription_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE SET NULL,
    wedding_title TEXT,
    plan TEXT NOT NULL CHECK (plan IN ('PRO', 'VIP')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    payment_method TEXT DEFAULT 'VIETQR' CHECK (payment_method IN ('VIETQR', 'BANK_TRANSFER')),
    transfer_content TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    proof_image_url TEXT,
    notes TEXT,
    rejection_reason TEXT,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    reviewed_at TIMESTAMPTZ
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON public.subscription_orders(status);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_id ON public.subscription_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_code ON public.subscription_orders(code);

-- 2. ADMIN BANK SETTINGS
CREATE TABLE IF NOT EXISTS public.admin_bank_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    bank_name TEXT NOT NULL DEFAULT 'MB Bank (Ngân hàng TMCP Quân Đội)',
    bank_code TEXT NOT NULL DEFAULT 'MB',
    account_number TEXT NOT NULL DEFAULT '0988888888',
    account_name TEXT NOT NULL DEFAULT 'CONG TY CP WEDDINGLY VIET NAM',
    branch TEXT DEFAULT 'Hà Nội',
    hotline TEXT DEFAULT '1900 6868',
    pro_price NUMERIC(15, 2) DEFAULT 499000,
    vip_price NUMERIC(15, 2) DEFAULT 999000,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. RLS Policies
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_bank_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view & create their own orders
CREATE POLICY "Users can create own subscription orders"
    ON public.subscription_orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own subscription orders"
    ON public.subscription_orders FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Allow all users to read bank settings for payment QR
CREATE POLICY "Anyone can view bank settings"
    ON public.admin_bank_settings FOR SELECT
    USING (true);
