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

-- 2. Insert Sub-districts (Kecamatan) using declarative inserts combining Kabupaten ID
INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Kedaton'), ('Sukabumi'), ('Rajabasa'), ('Tanjung Karang'), ('Way Halim'), ('Teluk Betung'), ('Kemiling'), ('Labuhan Ratu')
) AS t(name) WHERE k.name = 'Kota Bandar Lampung'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Kalianda'), ('Natar'), ('Jati Agung'), ('Sidomulyo'), ('Bakauheni'), ('Palas'), ('Zatun')
) AS t(name) WHERE k.name = 'Lampung Selatan'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Gunung Sugih'), ('Terbanggi Besar'), ('Terusan Nunyai'), ('Kalirejo'), ('Padang Ratu'), ('Seputih Banyak')
) AS t(name) WHERE k.name = 'Lampung Tengah'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Pringsewu'), ('Pagelaran'), ('Gading Rejo'), ('Sukoharjo'), ('Ambarawa')
) AS t(name) WHERE k.name = 'Pringsewu'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Metro Pusat'), ('Metro Utara'), ('Metro Timur'), ('Metro Barat'), ('Metro Selatan')
) AS t(name) WHERE k.name = 'Kota Metro'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Kota Agung'), ('Gisting'), ('Talang Padang'), ('Ulubelu'), ('Pulau Panggung')
) AS t(name) WHERE k.name = 'Tanggamus'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Sukadana'), ('Way Jepara'), ('Labuhan Maringgai'), ('Pekalongan'), ('Sekampung')
) AS t(name) WHERE k.name = 'Lampung Timur'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Kotabumi'), ('Bukit Kemuning'), ('Abung Selatan'), ('Sungkai Utara')
) AS t(name) WHERE k.name = 'Lampung Utara'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Gedong Tataan'), ('Padang Cermin'), ('Kedondong'), ('Negeri Katon')
) AS t(name) WHERE k.name = 'Pesawaran'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Menggala'), ('Banjar Agung'), ('Dente Teladas')
) AS t(name) WHERE k.name = 'Tulang Bawang'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Tulang Bawang Tengah'), ('Tumijajar'), ('Lambu Kibang')
) AS t(name) WHERE k.name = 'Tulang Bawang Barat'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Blambangan Umpu'), ('Baradatu'), ('Kasui'), ('Rebang Tangkas')
) AS t(name) WHERE k.name = 'Way Kanan'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Mesuji'), ('Simpang Pematang'), ('Tanjung Raya')
) AS t(name) WHERE k.name = 'Mesuji'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Liwa'), ('Balik Bukit'), ('Sumber Jaya'), ('Belalau')
) AS t(name) WHERE k.name = 'Lampung Barat'
ON CONFLICT DO NOTHING;

INSERT INTO public.kecamatan (kabupaten_id, name)
SELECT k.id, t.name FROM public.kabupaten k CROSS JOIN (
  VALUES ('Pesisir Tengah'), ('Pesisir Utara'), ('Pesisir Selatan'), ('Ngambur'), ('Lemong')
) AS t(name) WHERE k.name = 'Pesisir Barat'
ON CONFLICT DO NOTHING;


-- 3. Insert Villages (Desa/Kelurahan) for some prominent sub-districts
INSERT INTO public.desa (kecamatan_id, name)
SELECT k.id, t.name FROM public.kecamatan k CROSS JOIN (
  VALUES ('Beringin Jaya'), ('Kedaung'), ('Sumber Agung')
) AS t(name) WHERE k.name = 'Kemiling'
ON CONFLICT DO NOTHING;

INSERT INTO public.desa (kecamatan_id, name)
SELECT k.id, t.name FROM public.kecamatan k CROSS JOIN (
  VALUES ('Natar'), ('Merak Batin'), ('Hajimena')
) AS t(name) WHERE k.name = 'Natar'
ON CONFLICT DO NOTHING;

INSERT INTO public.desa (kecamatan_id, name)
SELECT k.id, t.name FROM public.kecamatan k CROSS JOIN (
  VALUES ('Terbanggi Besar'), ('Bandar Jaya Barat'), ('Poncowati')
) AS t(name) WHERE k.name = 'Terbanggi Besar'
ON CONFLICT DO NOTHING;

INSERT INTO public.desa (kecamatan_id, name)
SELECT k.id, t.name FROM public.kecamatan k CROSS JOIN (
  VALUES ('Gisting Bawah'), ('Gisting Atas'), ('Campang')
) AS t(name) WHERE k.name = 'Gisting'
ON CONFLICT DO NOTHING;

INSERT INTO public.desa (kecamatan_id, name)
SELECT k.id, t.name FROM public.kecamatan k CROSS JOIN (
  VALUES ('Pasar Krui'), ('Pusur'), ('Way Redak')
) AS t(name) WHERE k.name = 'Pesisir Tengah'
ON CONFLICT DO NOTHING;


-- 4. INSERT GAPOKTAN 
-- To avoid complex UUID tracking without PL/pgSQL, we use predefined UUIDs for Gapoktans 
-- so we can link them easily in subsequent inserts.
INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude)
SELECT 'a0000000-0000-0000-0000-000000000001', 'Gapoktan Beringin Jaya', d.id, 'Pak Suryo', '08123451111', -5.39, 105.21
FROM public.desa d WHERE d.name = 'Beringin Jaya' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude)
SELECT 'a0000000-0000-0000-0000-000000000002', 'Gapoktan Natar Mandiri', d.id, 'Pak Handoko', '08123452222', -5.32, 105.19
FROM public.desa d WHERE d.name = 'Natar' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude)
SELECT 'a0000000-0000-0000-0000-000000000003', 'Gapoktan Poncowati Makmur', d.id, 'Pak Budi', '08123453333', -4.83, 105.22
FROM public.desa d WHERE d.name = 'Poncowati' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude)
SELECT 'a0000000-0000-0000-0000-000000000004', 'Gapoktan Gisting Asri', d.id, 'Ibu Siti', '08123454444', -5.44, 104.72
FROM public.desa d WHERE d.name = 'Gisting Bawah' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude)
SELECT 'a0000000-0000-0000-0000-000000000005', 'Gapoktan Krui Pesisir', d.id, 'Pak Andi', '08123455555', -5.19, 103.93
FROM public.desa d WHERE d.name = 'Pasar Krui' LIMIT 1
ON CONFLICT DO NOTHING;


-- 5. Link Gapoktan to Komoditas
INSERT INTO public.gapoktan_komoditas (gapoktan_id, komoditas_id)
SELECT 'a0000000-0000-0000-0000-000000000001', k.id FROM public.komoditas k WHERE k.name = 'Padi'
UNION ALL SELECT 'a0000000-0000-0000-0000-000000000002', k.id FROM public.komoditas k WHERE k.name = 'Padi'
UNION ALL SELECT 'a0000000-0000-0000-0000-000000000003', k.id FROM public.komoditas k WHERE k.name = 'Padi'
UNION ALL SELECT 'a0000000-0000-0000-0000-000000000005', k.id FROM public.komoditas k WHERE k.name = 'Padi'
ON CONFLICT DO NOTHING;

INSERT INTO public.gapoktan_komoditas (gapoktan_id, komoditas_id)
SELECT 'a0000000-0000-0000-0000-000000000002', k.id FROM public.komoditas k WHERE k.name = 'Jagung'
UNION ALL SELECT 'a0000000-0000-0000-0000-000000000003', k.id FROM public.komoditas k WHERE k.name = 'Jagung'
ON CONFLICT DO NOTHING;

INSERT INTO public.gapoktan_komoditas (gapoktan_id, komoditas_id)
SELECT 'a0000000-0000-0000-0000-000000000004', k.id FROM public.komoditas k WHERE k.name = 'Kopi'
ON CONFLICT DO NOTHING;


-- 6. Insert Dryer Units (with predefined UUIDs for Productions references)
INSERT INTO public.dryer_units (id, name, gapoktan_id, capacity_kg, status) VALUES 
('b0000000-0000-0000-0000-000000000001', 'Dryer Padi Kemiling', 'a0000000-0000-0000-0000-000000000001', 4000, 'active'),
(gen_random_uuid(), 'Dryer Jagung Natar', 'a0000000-0000-0000-0000-000000000002', 5000, 'active'),
('b0000000-0000-0000-0000-000000000002', 'Dryer Padi Poncowati', 'a0000000-0000-0000-0000-000000000003', 8000, 'active'),
('b0000000-0000-0000-0000-000000000003', 'Dryer Kopi Gisting', 'a0000000-0000-0000-0000-000000000004', 3000, 'active'),
(gen_random_uuid(), 'Dryer Padi Krui', 'a0000000-0000-0000-0000-000000000005', 4000, 'maintenance')
ON CONFLICT DO NOTHING;


-- 7. Insert Dummy Productions
INSERT INTO public.productions (dryer_id, gapoktan_id, komoditas_id, qty_before, price_before, qty_after, price_after, production_date, notes)
SELECT 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', k.id, 1500, 5000, 1200, 7500, CURRENT_DATE - INTERVAL '1 day', 'Hasil panen raya Kemiling'
FROM public.komoditas k WHERE k.name = 'Padi' LIMIT 1;

INSERT INTO public.productions (dryer_id, gapoktan_id, komoditas_id, qty_before, price_before, qty_after, price_after, production_date, notes)
SELECT 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', k.id, 2000, 4800, 1650, 7200, CURRENT_DATE - INTERVAL '2 days', 'Padi Poncowati'
FROM public.komoditas k WHERE k.name = 'Padi' LIMIT 1;

INSERT INTO public.productions (dryer_id, gapoktan_id, komoditas_id, qty_before, price_before, qty_after, price_after, production_date, notes)
SELECT 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', k.id, 800, 35000, 680, 56000, CURRENT_DATE, 'Kopi Robusta Gisting'
FROM public.komoditas k WHERE k.name = 'Kopi' LIMIT 1;
