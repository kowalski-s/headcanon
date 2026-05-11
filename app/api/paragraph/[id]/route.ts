import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';
import { enqueue } from '@/lib/queue/boss';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await ctx.params;
  const para = await prisma.paragraph.findUnique({
    where: { id },
    include: { chapter: { include: { story: true } } },
  });
  if (!para || para.chapter.story.authorId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  await prisma.paragraph.delete({ where: { id } });
  await enqueue('extract-bible', { chapterId: para.chapter.id }, { singletonKey: para.chapter.id });
  return NextResponse.json({ ok: true });
}
