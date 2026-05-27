import { describe, it, expect, beforeEach } from 'vitest';
import { POST as createChapter } from './route';
import { PATCH as patchChapter, DELETE as deleteChapter } from './[id]/route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

async function story() {
  await createTestUser(USER_ID);
  return prisma.story.create({ data: { authorId: USER_ID, title: 't', source: 'WRITTEN', visibility: 'PRIVATE' } });
}

describe('write chapter API', () => {
  beforeEach(async () => { await createTestUser(USER_ID); });

  it('POST appends chapter with next ordinal', async () => {
    const s = await story();
    await prisma.chapter.create({ data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' } });
    const res = await createChapter(new NextRequest('http://x', { method: 'POST', headers: auth, body: JSON.stringify({ storyId: s.id }) }));
    expect(res.status).toBe(200);
    const { chapterId } = await res.json();
    const ch = await prisma.chapter.findUniqueOrThrow({ where: { id: chapterId } });
    expect(ch.ordinal).toBe(2);
  }, 15_000);

  it('PATCH autosaves text + sets userEdited', async () => {
    const s = await story();
    const ch = await prisma.chapter.create({ data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' } });
    const res = await patchChapter(
      new NextRequest('http://x', { method: 'PATCH', headers: auth, body: JSON.stringify({ text: 'Первый абзац.\n\nВторой.', title: 'Глава 1' }) }),
      { params: Promise.resolve({ id: ch.id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.chapter.findUniqueOrThrow({ where: { id: ch.id } });
    expect(after.text).toBe('Первый абзац.\n\nВторой.');
    expect(after.title).toBe('Глава 1');
    expect(after.userEdited).toBe(true);
  }, 15_000);

  it('PATCH 404 для чужой главы', async () => {
    const s = await story();
    const ch = await prisma.chapter.create({ data: { storyId: s.id, ordinal: 1, status: 'DRAFT', text: '' } });
    const res = await patchChapter(
      new NextRequest('http://x', { method: 'PATCH', headers: { 'x-test-user-id': '00000000-0000-0000-0000-000000000002' }, body: JSON.stringify({ text: 'x' }) }),
      { params: Promise.resolve({ id: ch.id }) },
    );
    expect(res.status).toBe(404);
  }, 15_000);

  it('DELETE removes chapter', async () => {
    const s = await story();
    const ch = await prisma.chapter.create({ data: { storyId: s.id, ordinal: 2, status: 'DRAFT', text: '' } });
    const res = await deleteChapter(new NextRequest('http://x', { method: 'DELETE', headers: auth }), { params: Promise.resolve({ id: ch.id }) });
    expect(res.status).toBe(200);
    expect(await prisma.chapter.findUnique({ where: { id: ch.id } })).toBeNull();
  }, 15_000);
});
