-- ============================================
-- SEED DATA: 10 DUMMY ADDRESS RECORDS
-- This inserts 1 dummy Kabupaten, 2 dummy Kecamatan, and 7 dummy Desa.
-- For UI testing & Frontend Integration validation.
-- PL/pgSQL variables removed for Vercel Postgres compatibility.
-- ============================================

-- 1. Insert 1 Dummy Kabupaten (ID: 99999999-9999-9999-9999-999999999990)
INSERT INTO public.kabupaten (id, name) 
VALUES ('99999999-9999-9999-9999-999999999990', 'Kabupaten Nusantara (Dummy)')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 2 Dummy Kecamatan under Kabupaten Nusantara (IDs: ...9991 and ...9992)
INSERT INTO public.kecamatan (id, kabupaten_id, name) 
VALUES 
('99999999-9999-9999-9999-999999999991', '99999999-9999-9999-9999-999999999990', 'Kecamatan Alpha'),
('99999999-9999-9999-9999-999999999992', '99999999-9999-9999-9999-999999999990', 'Kecamatan Beta')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert 7 Dummy Desa distributed between the 2 Kecamatan (IDs: ...9993 to ...9999)
INSERT INTO public.desa (id, kecamatan_id, name) 
VALUES 
('99999999-9999-9999-9999-999999999993', '99999999-9999-9999-9999-999999999991', 'Desa Alpha 01'),
('99999999-9999-9999-9999-999999999994', '99999999-9999-9999-9999-999999999991', 'Desa Alpha 02'),
('99999999-9999-9999-9999-999999999995', '99999999-9999-9999-9999-999999999991', 'Desa Alpha 03'),
('99999999-9999-9999-9999-999999999996', '99999999-9999-9999-9999-999999999991', 'Desa Alpha 04'),
('99999999-9999-9999-9999-999999999997', '99999999-9999-9999-9999-999999999992', 'Desa Beta 01'),
('99999999-9999-9999-9999-999999999998', '99999999-9999-9999-9999-999999999992', 'Desa Beta 02'),
('99999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999992', 'Desa Beta 03')
ON CONFLICT (id) DO NOTHING;
