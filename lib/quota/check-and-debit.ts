import { prisma } from '@/lib/prisma';

export type DailyResource = 'stories';

export type ChapterResource = 'regens' | 'continues' | 'promptTweaks';

const CHAPTER_RESOURCE_ALLOWLIST: ChapterResource[] = ['regens', 'continues', 'promptTweaks'];

export async function debitChapter(
  chapterId: string,
  resource: ChapterResource,
  limit: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (!(CHAPTER_RESOURCE_ALLOWLIST as string[]).includes(resource)) {
    throw new Error(`Invalid ChapterResource: ${resource}`);
  }
  const col = `"${resource}"`;
  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `UPDATE "ChapterUsage"
       SET ${col} = ${col} + 1
       WHERE "chapterId" = $1::uuid AND ${col} < $2
       RETURNING ${col} AS count`,
    chapterId, limit,
  );
  if (rows.length === 0) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - rows[0].count };
}

export async function debitDaily(
  userId: string,
  resource: DailyResource,
  limit: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const rows = await prisma.$queryRaw<Array<{ stories: number }>>`
    INSERT INTO "DailyUsage" ("userId", "day", "stories")
    VALUES (${userId}::uuid, ${day}::date, 1)
    ON CONFLICT ("userId", "day") DO UPDATE
      SET "stories" = "DailyUsage"."stories" + 1
      WHERE "DailyUsage"."stories" < ${limit}
    RETURNING "stories"
  `;
  if (rows.length === 0) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - rows[0].stories };
}

export async function creditDaily(userId: string, resource: DailyResource): Promise<void> {
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  await prisma.$executeRaw`
    UPDATE "DailyUsage"
    SET "stories" = GREATEST(0, "stories" - 1)
    WHERE "userId" = ${userId}::uuid AND "day" = ${day}::date
  `;
}
