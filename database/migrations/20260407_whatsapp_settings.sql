-- Create whatsapp_settings table
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    api_key TEXT,
    target_number TEXT,
    is_active BOOLEAN DEFAULT false,
    send_on_input BOOLEAN DEFAULT true,
    send_daily_summary BOOLEAN DEFAULT false,
    daily_summary_time TIME DEFAULT '18:00',
    message_template TEXT DEFAULT 'Laporan Produksi: {{gapoktan}} baru saja mengolah {{qty}} Ton {{komoditas}}. [Catatan: {{notes}}]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row_wa CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated read access
CREATE POLICY "Allow authenticated read"
ON public.whatsapp_settings
FOR SELECT
TO authenticated
USING (true);

-- Create policy for authenticated update access
CREATE POLICY "Allow authenticated update_wa"
ON public.whatsapp_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial default settings if not exists
INSERT INTO public.whatsapp_settings (id, is_active, send_on_input, send_daily_summary, daily_summary_time)
VALUES (1, false, true, false, '18:00')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.whatsapp_settings TO authenticated;
GRANT UPDATE ON public.whatsapp_settings TO authenticated;
