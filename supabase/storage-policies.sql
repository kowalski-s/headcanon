-- Run once via Supabase Studio SQL editor (or psql) on a fresh deployment.
-- Safe to re-run: each policy block catches duplicate_object errors.

DO $$ BEGIN
  CREATE POLICY "headcanon_public_read" ON storage.objects
    FOR SELECT USING (bucket_id IN ('covers', 'audio', 'avatars'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "headcanon_authed_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('covers', 'audio', 'avatars'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "headcanon_authed_update_own" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id IN ('covers', 'audio', 'avatars') AND owner = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "headcanon_authed_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id IN ('covers', 'audio', 'avatars') AND owner = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
