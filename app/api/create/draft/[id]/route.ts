import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const UpdateSchema = z.object({
  fandomId: z.string().uuid().nullable().optional(),
  shipId: z.string().nullable().optional(),
  tropes: z.array(z.string()).optional(),
  setting: z.string().nullable().optional(),
  tone: z.enum(['SLOW_BURN', 'SPICY', 'FLUFF', 'ANGST']).nullable().optional(),
  step: z.number().int().min(1).max(5).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdOrThrow(req);
  const { id } = await params;
  const body = UpdateSchema.parse(await req.json());
  const draft = await prisma.createDraft.findUnique({ where: { id } });
  if (!draft || draft.userId !== userId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const updated = await prisma.createDraft.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}
