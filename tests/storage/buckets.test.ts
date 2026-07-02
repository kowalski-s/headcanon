// @vitest-environment node
import { config } from 'dotenv';
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load .env so this test works when run without --env-file
config();

// Integration test against a live Supabase Storage project. It only runs when
// credentials are present (e.g. locally with a real .env); in CI, where Supabase
// secrets are intentionally absent, the suite is skipped rather than failing.
const hasSupabaseCreds = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY,
);

describe.skipIf(!hasSupabaseCreds)('storage buckets', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const key = process.env.SUPABASE_SECRET_KEY as string;
    supabase = createClient(url, key);
  });

  it('lists 3 expected buckets', async () => {
    const { data, error } = await supabase.storage.listBuckets();
    expect(error).toBeNull();
    const names = data?.map((b) => b.name) ?? [];
    expect(names).toEqual(expect.arrayContaining(['covers', 'audio', 'avatars']));
  });
});
