-- COMPREHENSIVE SEED DATA: Lampung Province (Regencies & Sub-districts)
-- This populates the address management system with actual data for Lampung.

-- 1. Insert Regencies (Kabupaten/Kota)
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

-- 2. Insert Sub-districts (Kecamatan)
DO $$
DECLARE
    kb_id UUID;
BEGIN
    -- Bandar Lampung
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Kota Bandar Lampung';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Kedaton'), (kb_id, 'Sukabumi'), (kb_id, 'Rajabasa'), (kb_id, 'Tanjung Karang'), (kb_id, 'Way Halim'), (kb_id, 'Teluk Betung'), (kb_id, 'Kemiling'), (kb_id, 'Labuhan Ratu')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Lampung Selatan
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Lampung Selatan';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Kalianda'), (kb_id, 'Natar'), (kb_id, 'Jati Agung'), (kb_id, 'Sidomulyo'), (kb_id, 'Bakauheni'), (kb_id, 'Palas'), (kb_id, 'Zatun')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Lampung Tengah
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Lampung Tengah';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Gunung Sugih'), (kb_id, 'Terbanggi Besar'), (kb_id, 'Terusan Nunyai'), (kb_id, 'Kalirejo'), (kb_id, 'Padang Ratu'), (kb_id, 'Seputih Banyak')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Pringsewu
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Pringsewu';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Pringsewu'), (kb_id, 'Pagelaran'), (kb_id, 'Gading Rejo'), (kb_id, 'Sukoharjo'), (kb_id, 'Ambarawa')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Metro
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Kota Metro';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Metro Pusat'), (kb_id, 'Metro Utara'), (kb_id, 'Metro Timur'), (kb_id, 'Metro Barat'), (kb_id, 'Metro Selatan')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Tanggamus
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Tanggamus';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Kota Agung'), (kb_id, 'Gisting'), (kb_id, 'Talang Padang'), (kb_id, 'Ulubelu'), (kb_id, 'Pulau Panggung')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Lampung Timur
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Lampung Timur';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Sukadana'), (kb_id, 'Way Jepara'), (kb_id, 'Labuhan Maringgai'), (kb_id, 'Pekalongan'), (kb_id, 'Sekampung')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Lampung Utara
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Lampung Utara';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Kotabumi'), (kb_id, 'Bukit Kemuning'), (kb_id, 'Abung Selatan'), (kb_id, 'Sungkai Utara')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Pesawaran
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Pesawaran';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Gedong Tataan'), (kb_id, 'Padang Cermin'), (kb_id, 'Kedondong'), (kb_id, 'Negeri Katon')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Tulang Bawang
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Tulang Bawang';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Menggala'), (kb_id, 'Banjar Agung'), (kb_id, 'Dente Teladas')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Tulang Bawang Barat
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Tulang Bawang Barat';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Tulang Bawang Tengah'), (kb_id, 'Tumijajar'), (kb_id, 'Lambu Kibang')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Way Kanan
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Way Kanan';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Blambangan Umpu'), (kb_id, 'Baradatu'), (kb_id, 'Kasui'), (kb_id, 'Rebang Tangkas')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Mesuji
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Mesuji';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Mesuji'), (kb_id, 'Simpang Pematang'), (kb_id, 'Tanjung Raya')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Lampung Barat
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Lampung Barat';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Liwa'), (kb_id, 'Balik Bukit'), (kb_id, 'Sumber Jaya'), (kb_id, 'Belalau')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Pesisir Barat
    SELECT id INTO kb_id FROM public.kabupaten WHERE name = 'Pesisir Barat';
    IF kb_id IS NOT NULL THEN
        INSERT INTO public.kecamatan (kabupaten_id, name) VALUES 
        (kb_id, 'Pesisir Tengah'), (kb_id, 'Pesisir Utara'), (kb_id, 'Pesisir Selatan'), (kb_id, 'Ngambur'), (kb_id, 'Lemong')
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
