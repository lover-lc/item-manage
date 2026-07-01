-- Allow items without a start usage date (e.g. purchased but not yet in use).
ALTER TABLE public.items
  ALTER COLUMN start_date DROP NOT NULL;
