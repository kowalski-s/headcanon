// @vitest-environment node
import { config } from 'dotenv';
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load .env so this test works when run without --env-file
config();

let supabase: SupabaseClient;

beforeAll(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
  }
  supabase = createClient(url, key);
});

describe('storage buckets', () => {
  it('lists 3 expected buckets', async () => {
    const { data, error } = await supabase.storage.listBuckets();
    expect(error).toBeNull();
    const names = data?.map((b) => b.name) ?? [];
    expect(names).toEqual(expect.arrayContaining(['covers', 'audio', 'avatars']));
  });
});
