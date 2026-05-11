import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Body = z.object({ fullText: z.string().min(1) });

function splitParagraphs(text: string): string[] {
  return text.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const { fullText } = parsed.data;

  const chapter = await prisma.chapter.findUnique({
    where: { id }, include: { story: true },
  });
  if (!chapter || chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const paragraphs = splitParagraphs(fullText);
  await prisma.$transaction([
    prisma.paragraph.deleteMany({ where: { chapterId: id } }),
    prisma.paragraph.createMany({
      data: paragraphs.map((text, i) => ({ chapterId: id, ordinal: i + 1, text })),
    }),
    prisma.chapter.update({
      where: { id },
      data: { status: chapter.status === 'DRAFT' ? 'PUBLISHED' : chapter.status },
    }),
  ]);

  // Plan B: enqueue extract-bible + auto-tag here. Plan A — no-op stub.
  return NextResponse.json({ ok: true, paragraphCount: paragraphs.length });
}
