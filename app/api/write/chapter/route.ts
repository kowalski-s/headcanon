import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ storyId: z.string().uuid() });

export async function POST(req: NextRequest) {
  let userId: string;
  try { userId = await getUserIdOrThrow(req); } catch { return NextResponse.json({ error: 'unauthenticated' }, { status: 401 }); }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const story = await prisma.story.findUnique({ where: { id: parsed.data.storyId } });
  if (!story || story.authorId !== userId) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const last = await prisma.chapter.findFirst({ where: { storyId: story.id }, orderBy: { ordinal: 'desc' } });
  const chapter = await prisma.chapter.create({
    data: { storyId: story.id, ordinal: (last?.ordinal ?? 0) + 1, status: 'DRAFT', text: '' },
  });
  return NextResponse.json({ chapterId: chapter.id, ordinal: chapter.ordinal });
}
