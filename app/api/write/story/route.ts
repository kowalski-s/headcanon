import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ title: z.string().trim().min(1).max(200).default('Без названия') });

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getUserIdOrThrow(req);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  const title = parsed.success ? parsed.data.title : 'Без названия';

  const story = await prisma.$transaction(async (tx) => {
    const s = await tx.story.create({
      data: { authorId: userId, title, source: 'WRITTEN', visibility: 'PRIVATE' },
    });
    await tx.chapter.create({ data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' } });
    return s;
  });
  return NextResponse.json({ storyId: story.id });
}
