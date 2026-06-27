import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const Patch = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  premise: z.string().max(2000).optional(),
  visibility: z.enum(['PRIVATE', 'UNLISTED', 'PUBLIC']).optional(),
});

async function ownStoryOr404(req: NextRequest, id: string) {
  const userId = await getUserIdOrThrow(req);
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story || story.authorId !== userId) return null;
  return story;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let story;
  try {
    story = await ownStoryOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!story) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  await prisma.story.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let story;
  try {
    story = await ownStoryOr404(req, id);
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!story) return NextResponse.json({ error: 'not found' }, { status: 404 });
  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
