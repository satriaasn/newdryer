-- Migration: Rename capacity_kg to capacity_ton in dryer_units table
-- And update production table references if necessary (labels/comments)

-- 1. Rename column in dryer_units
ALTER TABLE public.dryer_units 
RENAME COLUMN capacity_kg TO capacity_ton;

-- 2. Update comments to reflect the new unit
COMMENT ON COLUMN public.dryer_units.capacity_ton IS 'Capacity of the dryer unit in Tons (Standardized)';

-- 3. If there are production columns that were specifically kg, we should update their comments
-- Assuming production table has qty_before and qty_after
COMMENT ON COLUMN public.production.qty_before IS 'Quantity before drying in Tons';
COMMENT ON COLUMN public.production.qty_after IS 'Quantity after drying in Tons';

-- 4. Note: Data conversion might be needed if existing data is in kg.
-- To convert kg to Ton: value / 1000
-- UPDATE public.dryer_units SET capacity_ton = capacity_ton / 1000.0;
-- UPDATE public.production SET qty_before = qty_before / 1000.0, qty_after = qty_after / 1000.0;

-- WARNING: Only run the UPDATE statements above if your current data is in kg and you want to convert it to Tons.
-- If you are starting fresh or manual entry is preferred, just the column rename is sufficient.
