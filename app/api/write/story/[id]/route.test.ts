import { describe, it, expect, beforeEach } from 'vitest';
import { PATCH, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

async function makeStory() {
  await createTestUser(USER_ID);
  return prisma.story.create({ data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' } });
}

describe('PATCH/DELETE /api/write/story/[id]', () => {
  beforeEach(async () => { await createTestUser(USER_ID); });

  it('PATCH updates title and premise', async () => {
    const s = await makeStory();
    const res = await PATCH(
      new NextRequest('http://x', { method: 'PATCH', headers: auth, body: JSON.stringify({ title: 'Новое', premise: 'завязка' }) }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.story.findUniqueOrThrow({ where: { id: s.id } });
    expect(after.title).toBe('Новое');
    expect(after.premise).toBe('завязка');
  }, 15_000);

  it('PATCH 404 for другого пользователя', async () => {
    const s = await makeStory();
    const res = await PATCH(
      new NextRequest('http://x', { method: 'PATCH', headers: { 'x-test-user-id': '00000000-0000-0000-0000-000000000002' }, body: JSON.stringify({ title: 'x' }) }),
      { params: Promise.resolve({ id: s.id }) },
    );
    expect(res.status).toBe(404);
  }, 15_000);

  it('DELETE removes the story', async () => {
    const s = await makeStory();
    const res = await DELETE(new NextRequest('http://x', { method: 'DELETE', headers: auth }), { params: Promise.resolve({ id: s.id }) });
    expect(res.status).toBe(200);
    expect(await prisma.story.findUnique({ where: { id: s.id } })).toBeNull();
  }, 15_000);
});
