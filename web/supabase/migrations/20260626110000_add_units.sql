-- Add measurement units and item quantity fields.

CREATE TABLE IF NOT EXISTS public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_system_reserved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS quantity numeric(10, 2),
  ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.units (id) ON DELETE SET NULL;

ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_quantity_positive;

ALTER TABLE public.items
  ADD CONSTRAINT items_quantity_positive
  CHECK (quantity IS NULL OR quantity > 0);

CREATE INDEX IF NOT EXISTS items_unit_id_idx ON public.items (unit_id);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'units' AND policyname = 'units_anon_all'
  ) THEN
    CREATE POLICY units_anon_all ON public.units
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO anon, authenticated;
