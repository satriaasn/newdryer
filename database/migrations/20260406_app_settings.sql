-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    app_name TEXT NOT NULL DEFAULT 'Dashboard Monitoring Hibah Dryer',
    app_slogan TEXT NOT NULL DEFAULT 'Real-time oversight of national agricultural drying infrastructure',
    copyright TEXT NOT NULL DEFAULT '© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access"
ON public.app_settings
FOR SELECT
TO public
USING (true);

-- Create policy for authenticated update access (admin only)
CREATE POLICY "Allow authenticated update"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial default settings if not exists
INSERT INTO public.app_settings (id, app_name, app_slogan, copyright)
VALUES (1, 'Dashboard Monitoring Hibah Dryer', 'Real-time oversight of national agricultural drying infrastructure', '© 2026 Kementerian Pertanian Republik Indonesia. All rights reserved.')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT UPDATE ON public.app_settings TO authenticated;
