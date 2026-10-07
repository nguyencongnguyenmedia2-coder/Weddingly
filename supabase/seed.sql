-- ============================================================
-- WEDDINGLY - SEED DATA (Clean Production Baseline)
-- ============================================================

DO $$
BEGIN
    -- 1. Insert Super Admin Profile
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES ('00000000-0000-0000-0000-000000000099', 'admin@weddingly.vn', 'Super Administrator', '0988888888', 'ADMIN')
    ON CONFLICT (id) DO NOTHING;
END $$;
