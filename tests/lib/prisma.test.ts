// @vitest-environment node
import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('prisma client', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('can execute a trivial raw query', async () => {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    expect(result[0].ok).toBe(1);
  });

  it('has all expected tables', async () => {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const names = rows.map((r) => r.table_name);
    expect(names).toEqual(
      expect.arrayContaining([
        'User',
        'Story',
        'Chapter',
        'ChapterSummary',
        'Character',
        'CharacterState',
        'WorldState',
        'Tag',
        'StoryTag',
        'FandomCanonSeed',
        'Invite',
      ]),
    );
  });
});
