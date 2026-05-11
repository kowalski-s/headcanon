import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { story: true, paragraphs: { orderBy: { ordinal: 'asc' } } },
  });
  if (!chapter) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (chapter.story.visibility === 'PRIVATE' && chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return NextResponse.json({
    id: chapter.id,
    ordinal: chapter.ordinal,
    status: chapter.status,
    paragraphs: chapter.paragraphs.map((p) => ({ id: p.id, ordinal: Number(p.ordinal), text: p.text })),
  });
}
