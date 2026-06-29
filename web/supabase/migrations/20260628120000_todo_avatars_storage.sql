-- Avatar storage for todo family members

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'todo-avatars',
  'todo-avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY todo_avatars_select ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'todo-avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY todo_avatars_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'todo-avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY todo_avatars_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'todo-avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'todo-avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY todo_avatars_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'todo-avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
