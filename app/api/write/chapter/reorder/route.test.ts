import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH as reorder } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

describe('PATCH /api/write/chapter/reorder', () => {
  beforeEach(async () => { await createTestUser(USER_ID); });

  it('reorders chapters by provided id sequence', async () => {
    const s = await prisma.story.create({ data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' } });
    const a = await prisma.chapter.create({ data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: 'A' } });
    const b = await prisma.chapter.create({ data: { storyId: s.id, ordinal: 2, status: 'DRAFT', text: 'B' } });
    const res = await reorder(new NextRequest('http://x', { method: 'PATCH', headers: auth, body: JSON.stringify({ storyId: s.id, order: [b.id, a.id] }) }));
    expect(res.status).toBe(200);
    const after = await prisma.chapter.findMany({ where: { storyId: s.id }, orderBy: { ordinal: 'asc' } });
    expect(after.map((c) => c.id)).toEqual([b.id, a.id]);
    expect(after.map((c) => c.ordinal)).toEqual([1, 2]);
  }, 15_000);
});
