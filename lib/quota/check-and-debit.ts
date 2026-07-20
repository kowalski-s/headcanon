import { prisma } from '@/lib/prisma';

export type DailyResource = 'stories' | 'assists';

export type ChapterResource = 'regens' | 'continues' | 'promptTweaks';

const DAILY_RESOURCE_ALLOWLIST: DailyResource[] = ['stories', 'assists'];
const CHAPTER_RESOURCE_ALLOWLIST: ChapterResource[] = ['regens', 'continues', 'promptTweaks'];

// Dev-only bypass — set DISABLE_QUOTAS=1 in .env when iterating locally.
// MUST be removed/disabled before public launch (see handoff/TASKS.md).
// Ignored under vitest (VITEST=true is auto-set) so quota tests still hit the real path.
const QUOTAS_DISABLED = process.env.DISABLE_QUOTAS === '1' && process.env.VITEST !== 'true';

export async function debitChapter(
  chapterId: string,
  resource: ChapterResource,
  limit: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (QUOTAS_DISABLED) return { allowed: true, remaining: limit };
  if (!(CHAPTER_RESOURCE_ALLOWLIST as string[]).includes(resource)) {
    throw new Error(`Invalid ChapterResource: ${resource}`);
  }
  const col = `"${resource}"`;
  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `UPDATE "ChapterUsage"
       SET ${col} = ${col} + 1
       WHERE "chapterId" = $1::uuid AND ${col} < $2
       RETURNING ${col} AS count`,
    chapterId,
    limit,
  );
  if (rows.length === 0) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - rows[0].count };
}

function dailyColumn(resource: DailyResource): string {
  // Allowlist guard — column name никогда не берётся из пользовательского ввода,
  // только из фиксированного набора ресурсов (как в debitChapter).
  if (!(DAILY_RESOURCE_ALLOWLIST as string[]).includes(resource)) {
    throw new Error(`Invalid DailyResource: ${resource}`);
  }
  return `"${resource}"`;
}

export async function debitDaily(
  userId: string,
  resource: DailyResource,
  limit: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (QUOTAS_DISABLED) return { allowed: true, remaining: limit };
  const col = dailyColumn(resource);
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `INSERT INTO "DailyUsage" ("userId", "day", ${col})
       VALUES ($1::uuid, $2::date, 1)
       ON CONFLICT ("userId", "day") DO UPDATE
         SET ${col} = "DailyUsage".${col} + 1
         WHERE "DailyUsage".${col} < $3
       RETURNING ${col} AS count`,
    userId,
    day,
    limit,
  );
  if (rows.length === 0) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - rows[0].count };
}

export async function creditDaily(userId: string, resource: DailyResource): Promise<void> {
  const col = dailyColumn(resource);
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  await prisma.$executeRawUnsafe(
    `UPDATE "DailyUsage"
       SET ${col} = GREATEST(0, ${col} - 1)
       WHERE "userId" = $1::uuid AND "day" = $2::date`,
    userId,
    day,
  );
}
