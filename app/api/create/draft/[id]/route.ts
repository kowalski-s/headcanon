import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

const UpdateSchema = z.object({
  fandomId: z.string().uuid().nullable().optional(),
  focusType: z.enum(['ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP']).nullable().optional(),
  characters: z.array(z.string().min(1)).max(8).optional(),
  tropes: z.array(z.string().min(1)).max(10).optional(),
  rating: z.enum(['GENERAL', 'TEEN', 'MATURE', 'EXPLICIT']).nullable().optional(),
  category: z.enum(['SLASH', 'FEMSLASH', 'HET', 'GEN', 'MULTI', 'OTHER']).nullable().optional(),
  warnings: z.array(z.enum(['death', 'violence', 'non_con', 'cntw'])).optional(),
  pov: z.enum(['FIRST', 'CLOSE_THIRD', 'OMNISCIENT']).nullable().optional(),
  tense: z.enum(['PAST', 'PRESENT']).nullable().optional(),
  tones: z.array(z.enum(['SLOW_BURN', 'SPICY', 'FLUFF', 'ANGST', 'HURT_COMFORT', 'CRACK', 'DARK'])).optional(),
  timeline: z.string().nullable().optional(),
  timelineNote: z.string().max(500).nullable().optional(),
  genres: z.array(z.string().min(1)).max(10).optional(),
  setting: z.string().max(500).nullable().optional(),
  premise: z.string().max(2000).nullable().optional(),
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
