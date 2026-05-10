// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { glob } from 'fs/promises';

describe('tracking events coverage (spec → code)', () => {
  it('every spec event name appears at least once in source', async () => {
    const required = [
      'feed_viewed',
      'feed_chip_tap',
      'feed_card_tap',
      'story_viewed',
      'story_save_toggle',
      'story_share',
      'story_chapter_tap',
      'story_continue_tap',
      'story_watch_tap',
      'reader_opened',
      'reader_progress_milestone',
      'reader_settings_changed',
      'reader_watch_chip_tap',
    ];

    const root = process.cwd();
    const files: string[] = [];
    for await (const f of glob('{app,components,lib}/**/*.{ts,tsx}', { cwd: root })) {
      if (f.includes('node_modules') || f.endsWith('.d.ts')) continue;
      files.push(resolve(root, f));
    }

    const haystack = files.map((p) => readFileSync(p, 'utf-8')).join('\n');
    const missing = required.filter(
      (e) => !haystack.includes(`'${e}'`) && !haystack.includes(`"${e}"`),
    );
    expect(missing).toEqual([]);
  });
});
