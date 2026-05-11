import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { debitDaily } from './check-and-debit';

const userId = '00000000-0000-0000-0000-000000000001';

describe('debitDaily(stories, 3/day)', () => {
  beforeEach(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId } });
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: 'qa@hc.test', handle: 'qa' },
    });
  });

  afterAll(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } }).catch(() => {
      // ignore if already deleted
    });
  });

  it('allows first 3, blocks 4th', async () => {
    expect((await debitDaily(userId, 'stories', 3)).allowed).toBe(true);
    expect((await debitDaily(userId, 'stories', 3)).allowed).toBe(true);
    expect((await debitDaily(userId, 'stories', 3)).allowed).toBe(true);
    const fourth = await debitDaily(userId, 'stories', 3);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it('survives concurrent debits without exceeding limit', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => debitDaily(userId, 'stories', 3)),
    );
    expect(results.filter((r) => r.allowed).length).toBe(3);
  });
});
