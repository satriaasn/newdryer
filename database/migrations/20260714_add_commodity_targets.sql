-- Migration to add commodity_targets table for period-based monthly targets
CREATE TABLE commodity_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  komoditas_id UUID NOT NULL REFERENCES komoditas(id) ON DELETE CASCADE,
  period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  target_ton NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(komoditas_id, period)
);

-- Enable RLS
ALTER TABLE commodity_targets ENABLE ROW LEVEL SECURITY;

-- Enable Public Policy
CREATE POLICY "public_all" ON commodity_targets FOR ALL USING (true) WITH CHECK (true);
