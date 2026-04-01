-- ============================================
-- SEED DATA: 30 DUMMY DATA LENGKAP UNTUK SUPABASE
-- ============================================
-- Skrip ini menggunakan CTE (Common Table Expressions) untuk memasukkan 
-- 30 Gapoktan, menghubungkannya ke Komoditas (Padi), 
-- lalu membuat masing-masing 1 Unit Dryer dan Data Produksinya.
--
-- Sepenuhnya kompatibel dengan Editor SQL Supabase & Vercel Postgres (tanpa block DO $$).
-- ============================================

WITH inserted_g AS (
  -- 1. Insert 30 Gapoktan dengan lokasi tersebar
  INSERT INTO public.gapoktan (id, name, desa_id, ketua, phone, latitude, longitude)
  SELECT 
    gen_random_uuid(), 
    'Gapoktan Sejahtera ' || series, 
    (SELECT id FROM public.desa LIMIT 1), 
    'Bapak ' || series, 
    '0812' || lpad(series::text, 8, '0'), 
    -5.4 + (random() * 0.2 - 0.1), 
    105.2 + (random() * 0.2 - 0.1)
  FROM generate_series(1, 30) AS series
  RETURNING id
),
inserted_gk AS (
  -- 2. Relasikan 30 Gapoktan ke Komoditas Padi
  INSERT INTO public.gapoktan_komoditas (gapoktan_id, komoditas_id)
  SELECT ig.id, (SELECT id FROM public.komoditas WHERE name = 'Padi' LIMIT 1)
  FROM inserted_g ig
  RETURNING gapoktan_id
),
inserted_d AS (
  -- 3. Insert 30 Unit Dryer untuk Gapoktan yang baru dibuat
  INSERT INTO public.dryer_units (id, name, gapoktan_id, capacity_kg, status)
  SELECT 
    gen_random_uuid(), 
    'Dryer Padi Unit ' || row_number() over(), 
    id, 
    1000 + (random() * 9000)::int,   -- Kapasitas antara 1000kg - 10000kg
    'active'
  FROM inserted_g
  RETURNING id AS dryer_id, gapoktan_id
)
-- 4. Insert 30 Data Produksi Simulasi
INSERT INTO public.productions (
  dryer_id, gapoktan_id, komoditas_id, 
  qty_before, price_before, 
  qty_after, price_after, 
  production_date, notes
)
SELECT 
  d.dryer_id, 
  d.gapoktan_id, 
  (SELECT id FROM public.komoditas WHERE name = 'Padi' LIMIT 1), 
  (2000 + (random() * 1000))::numeric,  -- Raw qty
  5000,                                 -- Harga raw
  (1500 + (random() * 800))::numeric,   -- Final qty
  7500,                                 -- Harga final
  CURRENT_DATE - (random() * 30)::int,  -- Waktu produksi 1 bulan terakhir
  'Data simulasi dummy 30 item'
FROM inserted_d d;
