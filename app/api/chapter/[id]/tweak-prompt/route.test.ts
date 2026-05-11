import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@/lib/llm-openai', () => ({
  openaiLlm: { stream: async function* () { yield 'fresh '; yield 'chapter.'; } },
}));

import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTestStoryWithChapter } from '@/lib/test-fixtures';

function makeReq(userId: string, body: object) {
  return new NextRequest('http://x', {
    method: 'POST',
    headers: { 'x-test-user-id': userId, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chapter/[id]/tweak-prompt', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('streams regenerated chapter and debits promptTweaks', { timeout: 15_000 }, async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    const res = await POST(makeReq(user.id, { hint: 'больше внутреннего монолога' }), {
      params: Promise.resolve({ id: chapter.id }),
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('fresh chapter.');
    const usage = await prisma.chapterUsage.findUniqueOrThrow({ where: { chapterId: chapter.id } });
    expect(usage.promptTweaks).toBe(1);
  });

  it('returns 429 when promptTweaks quota exhausted', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    await prisma.chapterUsage.update({ where: { chapterId: chapter.id }, data: { promptTweaks: 2 } });
    const res = await POST(makeReq(user.id, { hint: 'no quota' }), {
      params: Promise.resolve({ id: chapter.id }),
    });
    expect(res.status).toBe(429);
  });

  it('returns 404 when not owner', async () => {
    const { chapter } = await createTestStoryWithChapter();
    const res = await POST(
      makeReq('00000000-0000-0000-0000-000000000999', { hint: 'x' }),
      { params: Promise.resolve({ id: chapter.id }) },
    );
    expect(res.status).toBe(404);
  });

  it('rejects empty hint with 400 (zod)', async () => {
    const { user, chapter } = await createTestStoryWithChapter();
    await expect(
      POST(makeReq(user.id, { hint: '' }), { params: Promise.resolve({ id: chapter.id }) }),
    ).rejects.toThrow();
  });
});
