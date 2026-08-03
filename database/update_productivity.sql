-- 1. Create the enum type for productivity categories
DO $$ BEGIN
    CREATE TYPE productivity_status AS ENUM (
        'Belum Beroperasi', 
        'Beroperasi Optimal', 
        'Hanya Saat Panen Raya',
        'Proses Installasi'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add the productivity column to dryer_units table
ALTER TABLE dryer_units 
ADD COLUMN productivity productivity_status DEFAULT 'Belum Beroperasi';
