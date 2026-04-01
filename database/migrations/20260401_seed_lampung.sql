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

-- 3. Insert Villages (Desa/Kelurahan) for some prominent sub-districts
DO $$
DECLARE
    kc_id UUID;
    desa_id_1 UUID;
    desa_id_2 UUID;
    desa_id_3 UUID;
    desa_id_4 UUID;
    desa_id_5 UUID;
    g1_id UUID := gen_random_uuid();
    g2_id UUID := gen_random_uuid();
    g3_id UUID := gen_random_uuid();
    g4_id UUID := gen_random_uuid();
    g5_id UUID := gen_random_uuid();
    d1_id UUID := gen_random_uuid();
    d2_id UUID := gen_random_uuid();
    d3_id UUID := gen_random_uuid();
    komo_padi UUID;
    komo_jagung UUID;
    komo_kopi UUID;
BEGIN
    -- Kemiling, Bandar Lampung
    SELECT id INTO kc_id FROM public.kecamatan WHERE name = 'Kemiling' LIMIT 1;
    IF kc_id IS NOT NULL THEN
        INSERT INTO public.desa (id, kecamatan_id, name) VALUES 
        (gen_random_uuid(), kc_id, 'Beringin Jaya'),
        (gen_random_uuid(), kc_id, 'Kedaung'),
        (gen_random_uuid(), kc_id, 'Sumber Agung') RETURNING id INTO desa_id_1;
    END IF;

    -- Natar, Lampung Selatan
    SELECT id INTO kc_id FROM public.kecamatan WHERE name = 'Natar' LIMIT 1;
    IF kc_id IS NOT NULL THEN
        INSERT INTO public.desa (id, kecamatan_id, name) VALUES 
        (gen_random_uuid(), kc_id, 'Natar'),
        (gen_random_uuid(), kc_id, 'Merak Batin'),
        (gen_random_uuid(), kc_id, 'Hajimena') RETURNING id INTO desa_id_2;
    END IF;

    -- Terbanggi Besar, Lampung Tengah
    SELECT id INTO kc_id FROM public.kecamatan WHERE name = 'Terbanggi Besar' LIMIT 1;
    IF kc_id IS NOT NULL THEN
        INSERT INTO public.desa (id, kecamatan_id, name) VALUES 
        (gen_random_uuid(), kc_id, 'Terbanggi Besar'),
        (gen_random_uuid(), kc_id, 'Bandar Jaya Barat'),
        (gen_random_uuid(), kc_id, 'Poncowati') RETURNING id INTO desa_id_3;
    END IF;

    -- Gisting, Tanggamus
    SELECT id INTO kc_id FROM public.kecamatan WHERE name = 'Gisting' LIMIT 1;
    IF kc_id IS NOT NULL THEN
        INSERT INTO public.desa (id, kecamatan_id, name) VALUES 
        (gen_random_uuid(), kc_id, 'Gisting Bawah'),
        (gen_random_uuid(), kc_id, 'Gisting Atas'),
        (gen_random_uuid(), kc_id, 'Campang') RETURNING id INTO desa_id_4;
    END IF;

    -- Pesisir Tengah, Pesisir Barat
    SELECT id INTO kc_id FROM public.kecamatan WHERE name = 'Pesisir Tengah' LIMIT 1;
    IF kc_id IS NOT NULL THEN
        INSERT INTO public.desa (id, kecamatan_id, name) VALUES 
        (gen_random_uuid(), kc_id, 'Pasar Krui'),
        (gen_random_uuid(), kc_id, 'Pusur'),
        (gen_random_uuid(), kc_id, 'Way Redak') RETURNING id INTO desa_id_5;
    END IF;

    -- 4. INSERT GAPOKTAN (Linked to newly created desas + Coordinates in Lampung)
    IF desa_id_1 IS NOT NULL THEN
        INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude) VALUES 
        (g1_id, 'Gapoktan Beringin Jaya', desa_id_1, 'Pak Suryo', '08123451111', -5.39, 105.21);
    END IF;

    IF desa_id_2 IS NOT NULL THEN
        INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude) VALUES 
        (g2_id, 'Gapoktan Natar Mandiri', desa_id_2, 'Pak Handoko', '08123452222', -5.32, 105.19);
    END IF;

    IF desa_id_3 IS NOT NULL THEN
        INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude) VALUES 
        (g3_id, 'Gapoktan Poncowati Makmur', desa_id_3, 'Pak Budi', '08123453333', -4.83, 105.22);
    END IF;

    IF desa_id_4 IS NOT NULL THEN
        INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude) VALUES 
        (g4_id, 'Gapoktan Gisting Asri', desa_id_4, 'Ibu Siti', '08123454444', -5.44, 104.72);
    END IF;

    IF desa_id_5 IS NOT NULL THEN
        INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude) VALUES 
        (g5_id, 'Gapoktan Krui Pesisir', desa_id_5, 'Pak Andi', '08123455555', -5.19, 103.93);
    END IF;

    -- Get Komoditas IDs
    SELECT id INTO komo_padi FROM public.komoditas WHERE name = 'Padi' LIMIT 1;
    SELECT id INTO komo_jagung FROM public.komoditas WHERE name = 'Jagung' LIMIT 1;
    SELECT id INTO komo_kopi FROM public.komoditas WHERE name = 'Kopi' LIMIT 1;

    -- 5. Link Gapoktan to Komoditas
    IF komo_padi IS NOT NULL THEN
        INSERT INTO public.gapoktan_komoditas (gapoktan_id, komoditas_id) VALUES 
        (g1_id, komo_padi), (g2_id, komo_padi), (g3_id, komo_padi), (g5_id, komo_padi) ON CONFLICT DO NOTHING;
    END IF;
    IF komo_jagung IS NOT NULL THEN
        INSERT INTO public.gapoktan_komoditas (gapoktan_id, komoditas_id) VALUES 
        (g2_id, komo_jagung), (g3_id, komo_jagung) ON CONFLICT DO NOTHING;
    END IF;
    IF komo_kopi IS NOT NULL THEN
        INSERT INTO public.gapoktan_komoditas (gapoktan_id, komoditas_id) VALUES 
        (g4_id, komo_kopi) ON CONFLICT DO NOTHING;
    END IF;

    -- 6. Insert Dryer Units
    INSERT INTO public.dryer_units (id, name, gapoktan_id, capacity_kg, status) VALUES 
    (d1_id, 'Dryer Padi Kemiling', g1_id, 4000, 'active'),
    (gen_random_uuid(), 'Dryer Jagung Natar', g2_id, 5000, 'active'),
    (d2_id, 'Dryer Padi Poncowati', g3_id, 8000, 'active'),
    (d3_id, 'Dryer Kopi Gisting', g4_id, 3000, 'active'),
    (gen_random_uuid(), 'Dryer Padi Krui', g5_id, 4000, 'maintenance');

    -- 7. Insert Dummy Productions
    IF komo_padi IS NOT NULL THEN
        INSERT INTO public.productions (dryer_id, gapoktan_id, komoditas_id, qty_before, price_before, qty_after, price_after, production_date, notes) VALUES 
        (d1_id, g1_id, komo_padi, 1500, 5000, 1200, 7500, CURRENT_DATE - INTERVAL '1 day', 'Hasil panen raya Kemiling'),
        (d2_id, g3_id, komo_padi, 2000, 4800, 1650, 7200, CURRENT_DATE - INTERVAL '2 days', 'Padi Poncowati');
    END IF;

    IF komo_kopi IS NOT NULL THEN
        INSERT INTO public.productions (dryer_id, gapoktan_id, komoditas_id, qty_before, price_before, qty_after, price_after, production_date, notes) VALUES 
        (d3_id, g4_id, komo_kopi, 800, 35000, 680, 56000, CURRENT_DATE, 'Kopi Robusta Gisting');
    END IF;

END $$;
