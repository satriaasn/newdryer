-- Migration: Add keterangan column to dryer_units table

ALTER TABLE public.dryer_units 
ADD COLUMN IF NOT EXISTS keterangan TEXT;

COMMENT ON COLUMN public.dryer_units.keterangan IS 'Penjelasan atau catatan mengenai status dryer (misal: rusak, perbaikan, dll)';
