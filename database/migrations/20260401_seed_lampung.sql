-- SEED DATA: Kabupaten in Lampung Province
-- This helps populate the address management system for initial use.

INSERT INTO public.kabupaten (name) VALUES 
('Kota Bandar Lampung'),
('Kota Metro'),
('Lampung Selatan'),
('Lampung Tengah'),
('Lampung Utara'),
('Lampung Timur'),
('Lampung Barat'),
('Tulang Bawang'),
('Tanggamus'),
('Way Kanan'),
('Pesawaran'),
('Pringsewu'),
('Mesuji'),
('Tulang Bawang Barat'),
('Pesisir Barat')
ON CONFLICT (name) DO NOTHING;

-- Example Kecamatan for Bandar Lampung (Optional but helpful)
-- DO $$
-- DECLARE
--     bl_id UUID;
-- BEGIN
--     SELECT id INTO bl_id FROM public.kabupaten WHERE name = 'Kota Bandar Lampung';
--     IF bl_id IS NOT NULL THEN
--         INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
--         (bl_id, 'Kedaton'),
--         (bl_id, 'Sukabumi'),
--         (bl_id, 'Rajabasa'),
--         (bl_id, 'Tanjung Karang Pusat')
--         ON CONFLICT DO NOTHING;
--     END IF;
-- END $$;
