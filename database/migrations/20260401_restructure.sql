-- ============================================
-- RESTRUCTURE: Dryer Production System
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop old tables if they exist
DROP TABLE IF EXISTS productions CASCADE;
DROP TABLE IF EXISTS gapoktan_komoditas CASCADE;
DROP TABLE IF EXISTS dryer_units CASCADE;
DROP TABLE IF EXISTS gapoktan CASCADE;
DROP TABLE IF EXISTS komoditas CASCADE;
DROP TABLE IF EXISTS desa CASCADE;
DROP TABLE IF EXISTS kecamatan CASCADE;
DROP TABLE IF EXISTS kabupaten CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS production_logs CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'admin', 'gapoktan')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. ADDRESS HIERARCHY
-- ============================================
CREATE TABLE kabupaten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE kecamatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kabupaten_id UUID NOT NULL REFERENCES kabupaten(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE desa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kecamatan_id UUID NOT NULL REFERENCES kecamatan(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- ============================================
-- 3. GAPOKTAN (with GIS coordinates)
-- ============================================
CREATE TABLE gapoktan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  desa_id UUID NOT NULL REFERENCES desa(id) ON DELETE CASCADE,
  ketua TEXT,
  phone TEXT,
  user_id UUID REFERENCES users(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. DRYER UNITS (owned by gapoktan)
-- ============================================
CREATE TABLE dryer_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gapoktan_id UUID NOT NULL REFERENCES gapoktan(id) ON DELETE CASCADE,
  capacity_kg NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. KOMODITAS
-- ============================================
CREATE TABLE komoditas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- ============================================
-- 6. GAPOKTAN <-> KOMODITAS (many-to-many)
-- ============================================
CREATE TABLE gapoktan_komoditas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gapoktan_id UUID NOT NULL REFERENCES gapoktan(id) ON DELETE CASCADE,
  komoditas_id UUID NOT NULL REFERENCES komoditas(id) ON DELETE CASCADE,
  UNIQUE(gapoktan_id, komoditas_id)
);

-- ============================================
-- 7. PRODUCTIONS
-- ============================================
CREATE TABLE productions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dryer_id UUID NOT NULL REFERENCES dryer_units(id) ON DELETE CASCADE,
  gapoktan_id UUID NOT NULL REFERENCES gapoktan(id) ON DELETE CASCADE,
  komoditas_id UUID NOT NULL REFERENCES komoditas(id) ON DELETE CASCADE,
  qty_before NUMERIC NOT NULL,
  price_before NUMERIC NOT NULL,
  qty_after NUMERIC NOT NULL,
  price_after NUMERIC NOT NULL,
  qty_diff_pct NUMERIC GENERATED ALWAYS AS (
    CASE WHEN qty_before > 0 THEN ROUND(((qty_after - qty_before) / qty_before) * 100, 2) ELSE 0 END
  ) STORED,
  price_diff_pct NUMERIC GENERATED ALWAYS AS (
    CASE WHEN price_before > 0 THEN ROUND(((price_after - price_before) / price_before) * 100, 2) ELSE 0 END
  ) STORED,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_kecamatan_kab ON kecamatan(kabupaten_id);
CREATE INDEX idx_desa_kec ON desa(kecamatan_id);
CREATE INDEX idx_gapoktan_desa ON gapoktan(desa_id);
CREATE INDEX idx_dryer_gapoktan ON dryer_units(gapoktan_id);
CREATE INDEX idx_prod_gapoktan ON productions(gapoktan_id);
CREATE INDEX idx_prod_dryer ON productions(dryer_id);
CREATE INDEX idx_prod_date ON productions(production_date);

-- ============================================
-- SEED DATA (all UUIDs use valid hex only)
-- ============================================

-- Kabupaten
INSERT INTO kabupaten (id, name) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Kabupaten Bandung'),
  ('a1000000-0000-0000-0000-000000000002', 'Kabupaten Garut'),
  ('a1000000-0000-0000-0000-000000000003', 'Kabupaten Cianjur');

-- Kecamatan
INSERT INTO kecamatan (id, kabupaten_id, name) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Kecamatan Pangalengan'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Kecamatan Ciwidey'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Kecamatan Bayongbong'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Kecamatan Cikajang'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Kecamatan Cipanas'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'Kecamatan Pacet');

-- Desa
INSERT INTO desa (id, kecamatan_id, name) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Desa Margamulya'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Desa Pulosari'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Desa Ciwidey'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'Desa Bayongbong'),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'Desa Sukakarya'),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'Desa Cikajang'),
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', 'Desa Cipanas'),
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000005', 'Desa Sindanglaya'),
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000006', 'Desa Ciherang'),
  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000006', 'Desa Sukanagara'),
  ('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000002', 'Desa Rawabogo'),
  ('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000004', 'Desa Mekarjaya');

-- Users (e0 prefix for user UUIDs)
INSERT INTO users (id, email, full_name, role) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'superadmin@dryer.app', 'Budi Santoso', 'administrator'),
  ('e0000000-0000-0000-0000-000000000002', 'admin@dryer.app', 'Siti Rahayu', 'admin'),
  ('e0000000-0000-0000-0000-000000000003', 'gapoktan1@dryer.app', 'Haji Ahmad', 'gapoktan'),
  ('e0000000-0000-0000-0000-000000000004', 'gapoktan2@dryer.app', 'Pak Dedi', 'gapoktan'),
  ('e0000000-0000-0000-0000-000000000005', 'gapoktan3@dryer.app', 'Ibu Wati', 'gapoktan');

-- Gapoktan (with real West Java coordinates for GIS, f0 prefix)
INSERT INTO gapoktan (id, name, desa_id, ketua, phone, user_id, latitude, longitude) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Gapoktan Maju Tani',     'c1000000-0000-0000-0000-000000000001', 'Haji Ahmad', '081234567890', 'e0000000-0000-0000-0000-000000000003', -7.2080, 107.5850),
  ('f0000000-0000-0000-0000-000000000002', 'Gapoktan Sejahtera',     'c1000000-0000-0000-0000-000000000004', 'Pak Dedi',   '081234567891', 'e0000000-0000-0000-0000-000000000004', -7.2870, 107.9970),
  ('f0000000-0000-0000-0000-000000000003', 'Gapoktan Harapan Baru',  'c1000000-0000-0000-0000-000000000007', 'Ibu Wati',   '081234567892', 'e0000000-0000-0000-0000-000000000005', -6.7510, 107.0540),
  ('f0000000-0000-0000-0000-000000000004', 'Gapoktan Mekar Jaya',    'c1000000-0000-0000-0000-000000000003', 'Pak Asep',   '081234567893', NULL,                                   -7.1290, 107.4220),
  ('f0000000-0000-0000-0000-000000000005', 'Gapoktan Sumber Rezeki', 'c1000000-0000-0000-0000-000000000009', 'Pak Udin',   '081234567894', NULL,                                   -6.7610, 107.1050);

-- Komoditas (aa prefix)
INSERT INTO komoditas (id, name) VALUES
  ('aa000000-0000-0000-0000-000000000001', 'Padi'),
  ('aa000000-0000-0000-0000-000000000002', 'Jagung'),
  ('aa000000-0000-0000-0000-000000000003', 'Kedelai'),
  ('aa000000-0000-0000-0000-000000000004', 'Kopi'),
  ('aa000000-0000-0000-0000-000000000005', 'Kakao'),
  ('aa000000-0000-0000-0000-000000000006', 'Cengkeh');

-- Gapoktan-Komoditas links
INSERT INTO gapoktan_komoditas (gapoktan_id, komoditas_id) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004'),
  ('f0000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000004'),
  ('f0000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000005'),
  ('f0000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000006'),
  ('f0000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005');

-- Dryer Units (d1 prefix, valid hex)
INSERT INTO dryer_units (id, name, gapoktan_id, capacity_kg, status) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Dryer Unit A1', 'f0000000-0000-0000-0000-000000000001', 5000, 'active'),
  ('d1000000-0000-0000-0000-000000000002', 'Dryer Unit A2', 'f0000000-0000-0000-0000-000000000001', 3000, 'active'),
  ('d1000000-0000-0000-0000-000000000003', 'Dryer Unit B1', 'f0000000-0000-0000-0000-000000000002', 4000, 'active'),
  ('d1000000-0000-0000-0000-000000000004', 'Dryer Unit B2', 'f0000000-0000-0000-0000-000000000002', 4000, 'maintenance'),
  ('d1000000-0000-0000-0000-000000000005', 'Dryer Unit C1', 'f0000000-0000-0000-0000-000000000003', 6000, 'active'),
  ('d1000000-0000-0000-0000-000000000006', 'Dryer Unit D1', 'f0000000-0000-0000-0000-000000000004', 3500, 'active'),
  ('d1000000-0000-0000-0000-000000000007', 'Dryer Unit D2', 'f0000000-0000-0000-0000-000000000004', 3500, 'inactive'),
  ('d1000000-0000-0000-0000-000000000008', 'Dryer Unit E1', 'f0000000-0000-0000-0000-000000000005', 5000, 'active');

-- Productions (sample data)
INSERT INTO productions (dryer_id, gapoktan_id, komoditas_id, qty_before, price_before, qty_after, price_after, production_date, notes) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 1000, 5000, 850, 7500, '2026-03-15', 'Batch padi musim hujan'),
  ('d1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 800, 4000, 720, 6000, '2026-03-16', 'Jagung kualitas A'),
  ('d1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 500, 35000, 420, 55000, '2026-03-18', 'Kopi Arabika'),
  ('d1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000001', 1200, 5000, 1020, 7200, '2026-03-20', 'Padi varietas unggul'),
  ('d1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 600, 8000, 540, 12000, '2026-03-22', 'Kedelai lokal'),
  ('d1000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000005', 400, 25000, 350, 40000, '2026-03-25', 'Kakao fermentasi'),
  ('d1000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000006', 300, 80000, 270, 120000, '2026-03-26', 'Cengkeh kering'),
  ('d1000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000001', 900, 5000, 765, 7800, '2026-03-27', 'Padi IR64'),
  ('d1000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000001', 1100, 5200, 935, 7600, '2026-03-28', 'Padi Ciherang'),
  ('d1000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 350, 26000, 300, 42000, '2026-03-30', 'Kakao grade A');

-- ============================================
-- ROW LEVEL SECURITY (public access for MVP)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kabupaten ENABLE ROW LEVEL SECURITY;
ALTER TABLE kecamatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE gapoktan ENABLE ROW LEVEL SECURITY;
ALTER TABLE dryer_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE komoditas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gapoktan_komoditas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON kabupaten FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON kecamatan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON desa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON gapoktan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON dryer_units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON komoditas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON gapoktan_komoditas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON productions FOR ALL USING (true) WITH CHECK (true);
