-- Items module: schema, units, purchase_date, auth RLS
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
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_system_reserved boolean DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
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

-- ---------------------------------------------------------------------------
-- Units
-- ---------------------------------------------------------------------------
-- Add measurement units and item quantity fields.

CREATE TABLE IF NOT EXISTS public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_system_reserved boolean DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
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

-- ---------------------------------------------------------------------------
-- Purchase date
-- ---------------------------------------------------------------------------
-- Add purchase_date (购入时间) to items.
-- Existing rows default purchase_date to start_date.

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS purchase_date date;

UPDATE public.items
SET purchase_date = start_date
WHERE purchase_date IS NULL;

ALTER TABLE public.items
  ALTER COLUMN purchase_date SET NOT NULL;

CREATE INDEX IF NOT EXISTS items_purchase_date_idx ON public.items (purchase_date);

-- ---------------------------------------------------------------------------
-- Auth RLS
-- ---------------------------------------------------------------------------
-- Restrict data access to authenticated users; revoke anon table access.
-- Run after creating household user in Supabase Dashboard (Auth).

-- ---------------------------------------------------------------------------
-- Drop open anon policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS areas_anon_all ON public.areas;
DROP POLICY IF EXISTS categories_anon_all ON public.categories;
DROP POLICY IF EXISTS items_anon_all ON public.items;
DROP POLICY IF EXISTS units_anon_all ON public.units;

-- ---------------------------------------------------------------------------
-- Authenticated-only policies (household shared data, no user_id)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'areas' AND policyname = 'areas_auth_all'
  ) THEN
    CREATE POLICY areas_auth_all ON public.areas
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_auth_all'
  ) THEN
    CREATE POLICY categories_auth_all ON public.categories
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'items_auth_all'
  ) THEN
    CREATE POLICY items_auth_all ON public.items
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'units' AND policyname = 'units_auth_all'
  ) THEN
    CREATE POLICY units_auth_all ON public.units
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Revoke anon direct table access
-- ---------------------------------------------------------------------------

REVOKE ALL ON public.areas FROM anon;
REVOKE ALL ON public.categories FROM anon;
REVOKE ALL ON public.items FROM anon;
REVOKE ALL ON public.units FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;

-- ---------------------------------------------------------------------------
-- Protect system-reserved rows at DB level
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.block_system_reserved_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.is_system_reserved THEN
    RAISE EXCEPTION 'system_reserved_delete_blocked';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_system_reserved THEN
    IF NEW.name IS DISTINCT FROM OLD.name
      OR NEW.is_system_reserved IS DISTINCT FROM OLD.is_system_reserved THEN
      RAISE EXCEPTION 'system_reserved_update_blocked';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS areas_block_system_reserved ON public.areas;
CREATE TRIGGER areas_block_system_reserved
  BEFORE UPDATE OR DELETE ON public.areas
  FOR EACH ROW
  EXECUTE FUNCTION public.block_system_reserved_mutation();

DROP TRIGGER IF EXISTS categories_block_system_reserved ON public.categories;
CREATE TRIGGER categories_block_system_reserved
  BEFORE UPDATE OR DELETE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.block_system_reserved_mutation();

DROP TRIGGER IF EXISTS units_block_system_reserved ON public.units;
CREATE TRIGGER units_block_system_reserved
  BEFORE UPDATE OR DELETE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.block_system_reserved_mutation();

-- ---------------------------------------------------------------------------
-- Sort order (manage list drag ordering)
-- ---------------------------------------------------------------------------

ALTER TABLE public.areas
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.areas WHERE sort_order <> 0) = 0
     AND (SELECT COUNT(*) FROM public.areas) > 0 THEN
    WITH ranked AS (
      SELECT id, (row_number() OVER (ORDER BY name)) - 1 AS rn
      FROM public.areas
    )
    UPDATE public.areas a
    SET sort_order = ranked.rn
    FROM ranked
    WHERE a.id = ranked.id;
  END IF;

  IF (SELECT COUNT(*) FROM public.categories WHERE sort_order <> 0) = 0
     AND (SELECT COUNT(*) FROM public.categories) > 0 THEN
    WITH ranked AS (
      SELECT id, (row_number() OVER (ORDER BY name)) - 1 AS rn
      FROM public.categories
    )
    UPDATE public.categories c
    SET sort_order = ranked.rn
    FROM ranked
    WHERE c.id = ranked.id;
  END IF;

  IF (SELECT COUNT(*) FROM public.units WHERE sort_order <> 0) = 0
     AND (SELECT COUNT(*) FROM public.units) > 0 THEN
    WITH ranked AS (
      SELECT id, (row_number() OVER (ORDER BY name)) - 1 AS rn
      FROM public.units
    )
    UPDATE public.units u
    SET sort_order = ranked.rn
    FROM ranked
    WHERE u.id = ranked.id;
  END IF;
END $$;
