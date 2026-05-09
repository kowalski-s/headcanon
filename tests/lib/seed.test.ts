// @vitest-environment node
import { describe, it, expect, afterAll } from 'vitest';
import { config } from 'dotenv';
import { prisma } from '@/lib/prisma';

config();

afterAll(async () => {
  await prisma.$disconnect();
});

describe('seed: fandom tags', () => {
  it('has 4+ fandom tags', async () => {
    const fandoms = await prisma.tag.findMany({ where: { type: 'FANDOM' } });
    expect(fandoms.length).toBeGreaterThanOrEqual(4);
    const slugs = fandoms.map((f) => f.slug);
    expect(slugs).toEqual(
      expect.arrayContaining(['all-for-the-game', 'harry-potter', 'naruto', 'jjk']),
    );
  });
});

describe('seed: AftG canon bible', () => {
  it('has 6 character bibles', async () => {
    const aftg = await prisma.tag.findUnique({
      where: { type_slug: { type: 'FANDOM', slug: 'all-for-the-game' } },
    });
    expect(aftg).not.toBeNull();
    const bibles = await prisma.fandomCanonSeed.findMany({
      where: { fandomTagId: aftg!.id },
    });
    expect(bibles.length).toBe(6);
    const names = bibles.map((b) => b.characterName);
    expect(names).toEqual(
      expect.arrayContaining([
        'Neil Josten',
        'Andrew Minyard',
        'Kevin Day',
        'Aaron Minyard',
        'Nicky Hemmick',
        'Matt Boyd',
      ]),
    );
  });

  it('every bible has placeholder structure', async () => {
    const aftg = await prisma.tag.findUnique({
      where: { type_slug: { type: 'FANDOM', slug: 'all-for-the-game' } },
    });
    expect(aftg).not.toBeNull();
    const bibles = await prisma.fandomCanonSeed.findMany({
      where: { fandomTagId: aftg!.id },
    });
    for (const b of bibles) {
      const bible = b.bibleJson as Record<string, unknown>;
      expect(bible).toHaveProperty('physical');
      expect(bible).toHaveProperty('voice');
      expect(bible).toHaveProperty('core_traits');
      expect(bible).toHaveProperty('speech_patterns');
      expect(bible).toHaveProperty('do_not');
    }
  });
});
