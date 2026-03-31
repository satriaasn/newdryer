-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'viewer');
CREATE TYPE dryer_status AS ENUM ('active', 'inactive', 'maintenance', 'offline');

-- 3. TABLES

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Dryer Units
CREATE TABLE public.dryer_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    capacity_ton NUMERIC(6,2),
    location TEXT,
    status dryer_status DEFAULT 'offline',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Batches
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dryer_id UUID REFERENCES public.dryer_units(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    total_output_kg NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Production Logs (Main sensor data)
CREATE TABLE public.production_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dryer_id UUID REFERENCES public.dryer_units(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    temperature_c NUMERIC(5,2),
    moisture_p NUMERIC(5,2),
    humidity_p NUMERIC(5,2),
    airflow_speed NUMERIC(5,2),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit Logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dryer_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Dryer Units: All authenticated users can view; only admins can modify
CREATE POLICY "Dryer units are viewable by authenticated users" ON public.dryer_units
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can modify dryer units" ON public.dryer_units
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Batches: All authenticated users can view; admins and operators can modify
CREATE POLICY "Batches are viewable by authenticated users" ON public.batches
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and Operators can modify batches" ON public.batches
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
    );

-- Production Logs: Read-only for everyone; system inserts only (handled by edge functions/service role)
CREATE POLICY "Production logs are viewable by authenticated users" ON public.production_logs
    FOR SELECT TO authenticated USING (true);

-- 6. INDEXES
CREATE INDEX idx_production_logs_dryer_id ON public.production_logs(dryer_id);
CREATE INDEX idx_production_logs_batch_id ON public.production_logs(batch_id);
CREATE INDEX idx_production_logs_logged_at ON public.production_logs(logged_at);
CREATE INDEX idx_batches_dryer_id ON public.batches(dryer_id);
CREATE INDEX idx_batches_is_active ON public.batches(is_active);

-- 7. FUNCTIONS & TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dryer_units_updated_at BEFORE UPDATE ON public.dryer_units FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. REALTIME CONFIGURATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.dryer_units;
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
