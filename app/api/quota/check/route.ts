import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const FREE_DAILY_STORIES = 3;

export async function GET(req: NextRequest) {
  const userId = await getUserIdOrThrow(req);
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const usage = await prisma.dailyUsage.findUnique({
    where: { userId_day: { userId, day } },
  });
  const used = usage?.stories ?? 0;
  return NextResponse.json({
    stories: { used, limit: FREE_DAILY_STORIES, remaining: Math.max(0, FREE_DAILY_STORIES - used) },
  });
}
