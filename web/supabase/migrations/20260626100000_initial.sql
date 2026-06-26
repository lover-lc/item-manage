-- Item Manage initial schema (areas, categories, items + RLS).
-- Project: item-manage (liedowqqnzrklygdaqkw) — family shared, no auth.
-- Run via: web/scripts/setup-supabase.mjs or Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Tables (no user_id — single household shared data)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_system_reserved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_system_reserved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purchase_price numeric(10, 2) NOT NULL CHECK (purchase_price >= 0),
  start_date date NOT NULL,
  end_date date,
  expiry_date date,
  area_id uuid NOT NULL REFERENCES public.areas (id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,
  specific_location text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS items_area_id_idx ON public.items (area_id);
CREATE INDEX IF NOT EXISTS items_category_id_idx ON public.items (category_id);
CREATE INDEX IF NOT EXISTS items_start_date_idx ON public.items (start_date);
CREATE INDEX IF NOT EXISTS items_end_date_idx ON public.items (end_date);
CREATE INDEX IF NOT EXISTS items_expiry_date_idx ON public.items (expiry_date);

-- ---------------------------------------------------------------------------
-- updated_at trigger for items
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS items_set_updated_at ON public.items;

CREATE TRIGGER items_set_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — anon read/write (family app, URL not publicized)
-- ---------------------------------------------------------------------------

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'areas' AND policyname = 'areas_anon_all'
  ) THEN
    CREATE POLICY areas_anon_all ON public.areas
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_anon_all'
  ) THEN
    CREATE POLICY categories_anon_all ON public.categories
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'items_anon_all'
  ) THEN
    CREATE POLICY items_anon_all ON public.items
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Grant table access to anon role (required for PostgREST)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO anon, authenticated;
