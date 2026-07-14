-- Migration to add target_monthly column to komoditas table
ALTER TABLE komoditas ADD COLUMN target_monthly NUMERIC DEFAULT 0;
