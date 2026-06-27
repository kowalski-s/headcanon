import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';

function makeReq() {
  return new NextRequest('http://x/api/quota/check', {
    method: 'GET',
    headers: { 'x-test-user-id': USER_ID },
  });
}

describe('GET /api/quota/check', () => {
  beforeEach(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId: USER_ID } });
    await prisma.user.upsert({
      where: { id: USER_ID },
      update: {},
      create: { id: USER_ID, email: 'qa@hc.test', handle: 'qa' },
    });
  });

  afterAll(async () => {
    await prisma.dailyUsage.deleteMany({ where: { userId: USER_ID } });
  });

  it('no usage row → used:0, limit:3, remaining:3', async () => {
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.stories).toEqual({ used: 0, limit: 3, remaining: 3 });
  });

  it('stories:2 → used:2, remaining:1', async () => {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    await prisma.dailyUsage.create({ data: { userId: USER_ID, day, stories: 2 } });
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.stories).toEqual({ used: 2, limit: 3, remaining: 1 });
  });

  it('stories:3 → used:3, remaining:0', async () => {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    await prisma.dailyUsage.create({ data: { userId: USER_ID, day, stories: 3 } });
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.stories).toEqual({ used: 3, limit: 3, remaining: 0 });
  });
});
