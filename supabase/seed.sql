-- ============================================================
-- WEDDING PLANNER PRO - DEVELOPMENT SEED DATA
-- Section 70 Specification
-- ============================================================

-- Reference IDs
DO $$
DECLARE
    dev_user_id UUID := '00000000-0000-0000-0000-000000000001';
    wedding_seed_id UUID := '11111111-1111-1111-1111-111111111111';
    t1_id UUID := '22222222-2222-2222-2222-222222222201';
    t2_id UUID := '22222222-2222-2222-2222-222222222202';
    t3_id UUID := '22222222-2222-2222-2222-222222222203';
BEGIN
    -- 1. Insert Profile
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (dev_user_id, 'dev@weddingplannerpro.vn', 'Nguyễn Minh Anh', '0901234567', 'USER')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Wedding Workspace
    INSERT INTO public.weddings (
        id, name, slug, bride_name, groom_name, wedding_date, 
        venue, estimated_budget, expected_guests, style, status, owner_id
    ) VALUES (
        wedding_seed_id,
        'Đám cưới Minh Anh & Quốc Minh',
        'minh-anh-quoc-minh-2027',
        'Nguyễn Minh Anh',
        'Trần Quốc Minh',
        '2027-05-15',
        'Trung tâm Tiệc cưới & Hội nghị Riverside Palace, TP.HCM',
        300000000,
        250,
        'Luxury',
        'PLANNING',
        dev_user_id
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Wedding Member
    INSERT INTO public.wedding_members (wedding_id, user_id, role, invitation_status)
    VALUES (wedding_seed_id, dev_user_id, 'OWNER', 'ACCEPTED')
    ON CONFLICT (wedding_id, user_id) DO NOTHING;

    -- 4. Budget Categories (Smart Recommendations)
    INSERT INTO public.budget_categories (wedding_id, name, allocated_amount, percentage, color) VALUES
    (wedding_seed_id, 'Địa điểm & Tiệc (Venue & Catering)', 165000000, 55.0, '#8B5E5A'),
    (wedding_seed_id, 'Trang trí tiệc cưới (Decoration)', 30000000, 10.0, '#D6BE91'),
    (wedding_seed_id, 'Chụp ảnh & Quay phim (Photo & Video)', 39000000, 13.0, '#B89E6C'),
    (wedding_seed_id, 'Trang phục & Makeup (Dress & Beauty)', 24000000, 8.0, '#B48B87'),
    (wedding_seed_id, 'Thiệp cưới & Quà tặng (Invitations & Gifts)', 12000000, 4.0, '#3F7D5A'),
    (wedding_seed_id, 'Âm thanh & MC (Sound & Host)', 9000000, 3.0, '#C68A27'),
    (wedding_seed_id, 'Dự phòng & Khác (Contingency)', 21000000, 7.0, '#6B5E5B')
    ON CONFLICT DO NOTHING;

    -- 5. Seating Tables (3 Tables)
    INSERT INTO public.wedding_tables (id, wedding_id, name, capacity, table_type) VALUES
    (t1_id, wedding_seed_id, 'Bàn VIP 01 - Gia Đình Hai Bên', 10, 'VIP'),
    (t2_id, wedding_seed_id, 'Bàn 02 - Bạn Đại Học', 10, 'ROUND'),
    (t3_id, wedding_seed_id, 'Bàn 03 - Đồng Nghiệp Công Ty', 10, 'ROUND')
    ON CONFLICT DO NOTHING;

END $$;
