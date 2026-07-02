import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000042';

describe('POST /api/me/confirm-age', () => {
  it('sets ageConfirmedAt for the user', async () => {
    const user = await prisma.user.upsert({
      where: { id: TEST_USER_ID },
      update: { ageConfirmedAt: null },
      create: {
        id: TEST_USER_ID,
        email: 'confirm-age-test@hc.test',
        handle: 'confirm-age',
        ageConfirmedAt: null,
      },
    });

    const req = new NextRequest('http://x', {
      method: 'POST',
      headers: { 'x-test-user-id': user.id },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.ageConfirmedAt).not.toBeNull();
  });
});
