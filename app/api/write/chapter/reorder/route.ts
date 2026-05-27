import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ storyId: z.string().uuid(), order: z.array(z.string().uuid()).min(1) });

export async function PATCH(req: NextRequest) {
  let userId: string;
  try { userId = await getUserIdOrThrow(req); } catch { return NextResponse.json({ error: 'unauthenticated' }, { status: 401 }); }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { storyId, order } = parsed.data;

  const story = await prisma.story.findUnique({ where: { id: storyId }, include: { chapters: { select: { id: true } } } });
  if (!story || story.authorId !== userId) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const existing = new Set(story.chapters.map((c) => c.id));
  if (order.length !== existing.size || !order.every((id) => existing.has(id))) {
    return NextResponse.json({ error: 'bad_request', reason: 'order_mismatch' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    // Phase 1: shift to negative range — avoids conflicts with existing 1..N positives
    await Promise.all(order.map((id, i) => tx.chapter.update({ where: { id }, data: { ordinal: -(i + 1) } })));
    // Phase 2: assign final 1..N
    await Promise.all(order.map((id, i) => tx.chapter.update({ where: { id }, data: { ordinal: i + 1 } })));
  });
  return NextResponse.json({ ok: true });
}
