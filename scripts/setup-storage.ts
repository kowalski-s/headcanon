import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/prisma';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
}

const supabase = createClient(url, key);

const buckets = [
  {
    id: 'covers',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    id: 'audio',
    public: true,
    fileSizeLimit: 50 * 1024 * 1024, // 50 MB
    allowedMimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/ogg'],
  },
  {
    id: 'avatars',
    public: true,
    fileSizeLimit: 2 * 1024 * 1024, // 2 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
];

async function applyPolicies() {
  const sql = readFileSync(join(process.cwd(), 'supabase/storage-policies.sql'), 'utf-8');

  // Extract DO $$ ... END $$ blocks
  const blockRegex = /DO \$\$[\s\S]*?END \$\$/g;
  const blocks = sql.match(blockRegex) ?? [];

  if (blocks.length === 0) {
    console.log('⚠ no policy blocks found in storage-policies.sql — skipping');
    return;
  }

  for (const block of blocks) {
    try {
      await prisma.$executeRawUnsafe(block);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Duplicate policy errors are expected on re-runs
      if (msg.includes('duplicate_object') || msg.includes('already exists')) {
        console.log('  (policy already exists — ok)');
      } else {
        console.error('✗ policy error:', msg);
        console.log(
          '  → Run supabase/storage-policies.sql manually via Supabase Studio SQL Editor',
        );
        return;
      }
    }
  }

  console.log('✓ policies applied');
}

async function main() {
  // --- buckets ---
  const { data: existing, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('✗ failed to list buckets:', listErr.message);
    process.exit(1);
  }
  const existingIds = new Set((existing ?? []).map((b) => b.id));

  for (const b of buckets) {
    if (existingIds.has(b.id)) {
      console.log(`✓ bucket "${b.id}" already exists — skipping`);
      continue;
    }
    const { error } = await supabase.storage.createBucket(b.id, {
      public: b.public,
      fileSizeLimit: b.fileSizeLimit,
      allowedMimeTypes: b.allowedMimeTypes,
    });
    if (error) {
      console.error(`✗ failed to create "${b.id}":`, error.message);
      process.exit(1);
    }
    console.log(`✓ created bucket "${b.id}"`);
  }

  // --- RLS policies ---
  await applyPolicies();

  await prisma.$disconnect();
  console.log('storage setup complete');
}

main();
