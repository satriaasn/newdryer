-- Migration: Menambahkan fleksibilitas komponen biaya dan nilai tambah pada komoditas dan produksi
-- Tanggal: 2026-10-13

-- 1. Tambahkan kolom tarif biaya pada tabel komoditas
ALTER TABLE public.komoditas 
ADD COLUMN IF NOT EXISTS cost_operational NUMERIC DEFAULT 75,
ADD COLUMN IF NOT EXISTS cost_labor NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS cost_management NUMERIC DEFAULT 100;

COMMENT ON COLUMN public.komoditas.cost_operational IS 'Biaya operasional default per kg (Rp/kg)';
COMMENT ON COLUMN public.komoditas.cost_labor IS 'Biaya tenaga kerja default per kg (Rp/kg)';
COMMENT ON COLUMN public.komoditas.cost_management IS 'Biaya kas pengelola default per kg (Rp/kg)';

-- 2. Atur tarif default sesuai ketentuan komoditas:
-- Singkong: Operasional = 100, Tenaga Kerja = 100, Kas Pengelola = 100
UPDATE public.komoditas 
SET cost_operational = 100, cost_labor = 100, cost_management = 100 
WHERE LOWER(name) LIKE '%singkong%';

-- Jagung, Padi, Gabah: Operasional = 75, Tenaga Kerja = 100, Kas Pengelola = 100
UPDATE public.komoditas 
SET cost_operational = 75, cost_labor = 100, cost_management = 100 
WHERE LOWER(name) LIKE '%jagung%' OR LOWER(name) LIKE '%padi%' OR LOWER(name) LIKE '%gabah%';

-- Komoditas lainnya default:
UPDATE public.komoditas 
SET cost_operational = 75, cost_labor = 100, cost_management = 100 
WHERE cost_operational IS NULL;

-- 3. Tambahkan kolom rincian biaya dan nilai tambah pada tabel productions
ALTER TABLE public.productions
ADD COLUMN IF NOT EXISTS cost_operational_rate NUMERIC DEFAULT 75,
ADD COLUMN IF NOT EXISTS cost_labor_rate NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS cost_management_rate NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS total_cost_operational NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost_labor NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost_management NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gross_value_diff NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gross_value_diff_per_kg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS commodity_value_added_per_kg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS business_value_added NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_value_added NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_value_added_per_kg NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.productions.cost_operational_rate IS 'Tarif operasional per kg saat produksi (Rp/kg)';
COMMENT ON COLUMN public.productions.cost_labor_rate IS 'Tarif tenaga kerja per kg saat produksi (Rp/kg)';
COMMENT ON COLUMN public.productions.cost_management_rate IS 'Tarif kas pengelola per kg saat produksi (Rp/kg)';
COMMENT ON COLUMN public.productions.total_cost_operational IS 'Total biaya operasional (Rp)';
COMMENT ON COLUMN public.productions.total_cost_labor IS 'Total biaya tenaga kerja (Rp)';
COMMENT ON COLUMN public.productions.total_cost_management IS 'Total kas pengelola (Rp)';
COMMENT ON COLUMN public.productions.total_cost IS 'Total seluruh biaya nilai tambah (Rp)';
COMMENT ON COLUMN public.productions.gross_value_diff IS 'Selisih nilai basah ke kering: (qty_after*price_after) - (qty_before*price_before) (Rp)';
COMMENT ON COLUMN public.productions.gross_value_diff_per_kg IS 'Nilai selisih dibagi tonase basah (Rp/kg)';
COMMENT ON COLUMN public.productions.commodity_value_added_per_kg IS 'Nilai tambah komoditas per kg: (gross_diff / qty_before) - biaya operasional per kg';
COMMENT ON COLUMN public.productions.business_value_added IS 'Nilai tambah sisa unit usaha: commodity_value_added_per_kg * tonase basah';
COMMENT ON COLUMN public.productions.net_value_added IS 'Laba bersih akhir unit usaha setelah dikurangi naker & kas pengelola (Rp)';
COMMENT ON COLUMN public.productions.net_value_added_per_kg IS 'Laba bersih akhir per kg (Rp/kg)';
