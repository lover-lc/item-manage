-- Allow todos without an explicit priority.

ALTER TABLE public.todo_items ALTER COLUMN priority DROP DEFAULT;
ALTER TABLE public.todo_items ALTER COLUMN priority DROP NOT NULL;
