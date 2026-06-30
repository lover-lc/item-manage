-- Everything module - containers table and items extension
-- Created: 2026-06-30

CREATE TABLE IF NOT EXISTS public.containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid,
  name text NOT NULL,
  area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
  position_3d jsonb NOT NULL,
  model_ref text NOT NULL,
  model_type text DEFAULT 'builtin',
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS containers_scene_id_idx ON public.containers(scene_id);
CREATE INDEX IF NOT EXISTS containers_area_id_idx ON public.containers(area_id);

DROP TRIGGER IF EXISTS containers_set_updated_at ON public.containers;

CREATE TRIGGER containers_set_updated_at
  BEFORE UPDATE ON public.containers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS container_id uuid REFERENCES public.containers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS items_container_id_idx ON public.items(container_id);

ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'containers' AND policyname = 'containers_anon_all'
  ) THEN
    CREATE POLICY containers_anon_all ON public.containers
      FOR ALL TO anon, authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.containers TO anon, authenticated;
