import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  const userId = await getUserIdOrThrow(req);
  const draft = await prisma.createDraft.create({ data: { userId } });
  return NextResponse.json(draft);
}
