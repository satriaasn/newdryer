-- COMPREHENSIVE MIGRATION: Tonnage Standardization, Address Management, & Location Features
-- Date: 2026-04-01

-- 1. TONNAGE STANDARDIZATION
-- Rename capacity_kg to capacity_ton in dryer_units table
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dryer_units' AND column_name='capacity_kg') THEN
        ALTER TABLE public.dryer_units RENAME COLUMN capacity_kg TO capacity_ton;
    END IF;
END $$;

COMMENT ON COLUMN public.dryer_units.capacity_ton IS 'Capacity of the dryer unit in Tons';

-- 2. GAPOKTAN ENHANCEMENTS
-- Add detailed address column to gapoktan table
ALTER TABLE public.gapoktan ADD COLUMN IF NOT EXISTS address TEXT;
COMMENT ON COLUMN public.gapoktan.address IS 'Detailed street address/location of the Gapoktan';

-- 3. ADDRESS MASTER TABLES (If not already present)
CREATE TABLE IF NOT EXISTS public.kabupaten (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kecamatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kabupaten_id UUID NOT NULL REFERENCES public.kabupaten(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(kabupaten_id, name)
);

CREATE TABLE IF NOT EXISTS public.desa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kecamatan_id UUID NOT NULL REFERENCES public.kecamatan(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(kecamatan_id, name)
);

-- 4. ENABLE RLS FOR PUBLIC READ
ALTER TABLE public.kabupaten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kecamatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read kabupaten" ON public.kabupaten;
CREATE POLICY "Public read kabupaten" ON public.kabupaten FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read kecamatan" ON public.kecamatan;
CREATE POLICY "Public read kecamatan" ON public.kecamatan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read desa" ON public.desa;
CREATE POLICY "Public read desa" ON public.desa FOR SELECT USING (true);

-- 5. SAMPLE DATA (Optional, common for West Java context)
INSERT INTO public.kabupaten (name) VALUES ('Majalengka'), ('Sumedang'), ('Subang') ON CONFLICT DO NOTHING;

-- Note: Use the "Detail Wilayah" menu in the dashboard to add more Specific Kecamatan and Desa.
