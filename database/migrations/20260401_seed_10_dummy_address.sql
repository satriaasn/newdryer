-- ============================================
-- SEED DATA: 10 DUMMY ADDRESS RECORDS
-- This inserts 1 dummy Kabupaten, 2 dummy Kecamatan, and 7 dummy Desa.
-- For UI testing & Frontend Integration validation.
-- ============================================

DO $$
DECLARE
    kab_id UUID := gen_random_uuid();
    kec1_id UUID := gen_random_uuid();
    kec2_id UUID := gen_random_uuid();
BEGIN
    -- 1. Insert 1 Dummy Kabupaten
    INSERT INTO public.kabupaten (id, name) 
    VALUES (kab_id, 'Kabupaten Nusantara (Dummy)');

    -- 2. Insert 2 Dummy Kecamatan under Kabupaten Nusantara
    INSERT INTO public.kecamatan (id, kabupaten_id, name) 
    VALUES 
    (kec1_id, kab_id, 'Kecamatan Alpha'),
    (kec2_id, kab_id, 'Kecamatan Beta');

    -- 3. Insert 7 Dummy Desa distributed between the 2 Kecamatan
    INSERT INTO public.desa (id, kecamatan_id, name) 
    VALUES 
    (gen_random_uuid(), kec1_id, 'Desa Alpha 01'),
    (gen_random_uuid(), kec1_id, 'Desa Alpha 02'),
    (gen_random_uuid(), kec1_id, 'Desa Alpha 03'),
    (gen_random_uuid(), kec1_id, 'Desa Alpha 04'),
    (gen_random_uuid(), kec2_id, 'Desa Beta 01'),
    (gen_random_uuid(), kec2_id, 'Desa Beta 02'),
    (gen_random_uuid(), kec2_id, 'Desa Beta 03');

END $$;
