import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { countWords } from '@/lib/write/word-count';

const Patch = z.object({
  text: z.string().optional(),
  title: z.string().max(200).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

async function ownChapterOr404(req: NextRequest, id: string) {
  const userId = await getUserIdOrThrow(req);
  const ch = await prisma.chapter.findUnique({ where: { id }, include: { story: true } });
  if (!ch || ch.story.authorId !== userId) return null;
  return ch;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let ch;
  try {
    ch = await ownChapterOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!ch) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.text !== undefined) data.userEdited = true;
  await prisma.chapter.update({ where: { id }, data });
  if (parsed.data.text !== undefined) {
    const delta = countWords(parsed.data.text) - countWords(ch.text ?? '');
    if (delta > 0) {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      // WritingStat — вторичная метрика; её сбой не должен валить успешный autosave текста.
      try {
        await prisma.writingStat.upsert({
          where: { userId_date: { userId: ch.story.authorId, date } },
          create: { userId: ch.story.authorId, date, wordsAdded: delta },
          update: { wordsAdded: { increment: delta } },
        });
      } catch (e) {
        console.error('[write/chapter PATCH] writingStat upsert failed', {
          chapterId: id,
          userId: ch.story.authorId,
          error: e,
        });
      }
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let ch;
  try {
    ch = await ownChapterOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!ch) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await prisma.chapter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
