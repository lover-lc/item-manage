-- Negotiation (awaiting_member_id), private/shared lists, per-member list placement.

DO $$ BEGIN
  CREATE TYPE public.todo_list_visibility AS ENUM ('private', 'shared');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.todo_lists
  ADD COLUMN IF NOT EXISTS visibility public.todo_list_visibility NOT NULL DEFAULT 'private';

ALTER TABLE public.todo_items
  ADD COLUMN IF NOT EXISTS awaiting_member_id uuid
    REFERENCES public.todo_family_members (id) ON DELETE SET NULL;

-- Backfill awaiting for open negotiations
UPDATE public.todo_items
SET awaiting_member_id = assignee_id
WHERE status = 'pending_accept' AND awaiting_member_id IS NULL;

UPDATE public.todo_items
SET awaiting_member_id = assignee_id
WHERE status = 'returned' AND awaiting_member_id IS NULL;

CREATE TABLE IF NOT EXISTS public.todo_item_member_lists (
  todo_item_id uuid NOT NULL REFERENCES public.todo_items (id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.todo_family_members (id) ON DELETE CASCADE,
  list_id uuid NOT NULL REFERENCES public.todo_lists (id) ON DELETE CASCADE,
  PRIMARY KEY (todo_item_id, member_id)
);

CREATE INDEX IF NOT EXISTS todo_item_member_lists_list_id_idx
  ON public.todo_item_member_lists (list_id);

CREATE TABLE IF NOT EXISTS public.todo_item_shared_lists (
  todo_item_id uuid NOT NULL REFERENCES public.todo_items (id) ON DELETE CASCADE,
  list_id uuid NOT NULL REFERENCES public.todo_lists (id) ON DELETE CASCADE,
  PRIMARY KEY (todo_item_id, list_id)
);

-- Migrate creator list_id into per-member placement
INSERT INTO public.todo_item_member_lists (todo_item_id, member_id, list_id)
SELECT id, creator_id, list_id
FROM public.todo_items
ON CONFLICT (todo_item_id, member_id) DO NOTHING;

DO $$ BEGIN
  ALTER TYPE public.todo_notification_type ADD VALUE IF NOT EXISTS 'proposal_updated';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- RLS: shared lists visible to whole household; mapping tables via item access
-- ---------------------------------------------------------------------------

ALTER TABLE public.todo_item_member_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_item_shared_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS todo_lists_family ON public.todo_lists;

CREATE POLICY todo_lists_family ON public.todo_lists
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.todo_family_members m
      WHERE m.user_id = auth.uid()
        AND (todo_lists.visibility = 'shared' OR m.id = todo_lists.owner_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.todo_family_members m
      WHERE m.user_id = auth.uid()
        AND (todo_lists.visibility = 'shared' OR m.id = todo_lists.owner_id)
    )
  );

DROP POLICY IF EXISTS todo_items_family ON public.todo_items;

CREATE POLICY todo_items_family ON public.todo_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.todo_family_members m
      WHERE m.user_id = auth.uid()
        AND (m.id = todo_items.creator_id OR m.id = todo_items.assignee_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.todo_family_members m
      WHERE m.user_id = auth.uid()
        AND (m.id = todo_items.creator_id OR m.id = todo_items.assignee_id)
    )
  );

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'todo_item_member_lists' AND policyname = 'todo_item_member_lists_family'
  ) THEN
    CREATE POLICY todo_item_member_lists_family ON public.todo_item_member_lists
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.todo_items ti
          JOIN public.todo_family_members m ON m.user_id = auth.uid()
          WHERE ti.id = todo_item_member_lists.todo_item_id
            AND (m.id = ti.creator_id OR m.id = ti.assignee_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.todo_items ti
          JOIN public.todo_family_members m ON m.user_id = auth.uid()
          WHERE ti.id = todo_item_member_lists.todo_item_id
            AND (m.id = ti.creator_id OR m.id = ti.assignee_id)
            AND m.id = todo_item_member_lists.member_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'todo_item_shared_lists' AND policyname = 'todo_item_shared_lists_family'
  ) THEN
    CREATE POLICY todo_item_shared_lists_family ON public.todo_item_shared_lists
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.todo_items ti
          JOIN public.todo_family_members m ON m.user_id = auth.uid()
          WHERE ti.id = todo_item_shared_lists.todo_item_id
            AND (m.id = ti.creator_id OR m.id = ti.assignee_id)
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.todo_items ti
          JOIN public.todo_family_members m ON m.user_id = auth.uid()
          WHERE ti.id = todo_item_shared_lists.todo_item_id
            AND (m.id = ti.creator_id OR m.id = ti.assignee_id)
        )
      );
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.todo_item_member_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todo_item_shared_lists TO authenticated;
