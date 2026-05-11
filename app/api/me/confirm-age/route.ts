import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdOrThrow } from '@/lib/auth/server';

export async function POST(req: NextRequest) {
  const userId = await getUserIdOrThrow(req);
  await prisma.user.update({ where: { id: userId }, data: { ageConfirmedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
