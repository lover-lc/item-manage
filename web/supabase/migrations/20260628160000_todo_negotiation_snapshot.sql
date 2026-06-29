-- Negotiation snapshot and per-party agreement timestamps.

ALTER TABLE public.todo_items
  ADD COLUMN IF NOT EXISTS negotiation_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS creator_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS assignee_agreed_at timestamptz;

-- Creator implicitly agrees with initial content when dispatching.
UPDATE public.todo_items
SET creator_agreed_at = created_at
WHERE status = 'pending_accept'
  AND creator_agreed_at IS NULL
  AND creator_id <> assignee_id;
