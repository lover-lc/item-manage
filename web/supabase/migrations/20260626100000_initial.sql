-- Item Manage initial schema (areas, categories, items + RLS).
-- Run in the Supabase SQL editor on the same project as desktop-pet-cc.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  is_system_reserved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  is_system_reserved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS items_user_id_idx ON public.items (user_id);
CREATE INDEX IF NOT EXISTS items_area_id_idx ON public.items (area_id);
CREATE INDEX IF NOT EXISTS items_category_id_idx ON public.items (category_id);
CREATE INDEX IF NOT EXISTS items_start_date_idx ON public.items (start_date);
CREATE INDEX IF NOT EXISTS items_end_date_idx ON public.items (end_date);
CREATE INDEX IF NOT EXISTS items_expiry_date_idx ON public.items (expiry_date);

CREATE INDEX IF NOT EXISTS areas_user_id_idx ON public.areas (user_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories (user_id);

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
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- areas policies

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'areas' AND policyname = 'areas_select_own'
  ) THEN
    CREATE POLICY areas_select_own ON public.areas
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'areas' AND policyname = 'areas_insert_own'
  ) THEN
    CREATE POLICY areas_insert_own ON public.areas
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'areas' AND policyname = 'areas_update_own'
  ) THEN
    CREATE POLICY areas_update_own ON public.areas
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'areas' AND policyname = 'areas_delete_own'
  ) THEN
    CREATE POLICY areas_delete_own ON public.areas
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- categories policies

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_select_own'
  ) THEN
    CREATE POLICY categories_select_own ON public.categories
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_insert_own'
  ) THEN
    CREATE POLICY categories_insert_own ON public.categories
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_update_own'
  ) THEN
    CREATE POLICY categories_update_own ON public.categories
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'categories_delete_own'
  ) THEN
    CREATE POLICY categories_delete_own ON public.categories
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- items policies

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'items_select_own'
  ) THEN
    CREATE POLICY items_select_own ON public.items
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'items_insert_own'
  ) THEN
    CREATE POLICY items_insert_own ON public.items
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'items_update_own'
  ) THEN
    CREATE POLICY items_update_own ON public.items
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'items_delete_own'
  ) THEN
    CREATE POLICY items_delete_own ON public.items
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
