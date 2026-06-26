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
