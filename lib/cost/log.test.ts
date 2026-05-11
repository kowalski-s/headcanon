import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logLlmCall } from './log';

const create = vi.fn();
vi.mock('@/lib/prisma', () => ({ prisma: { llmCallLog: { create: (a: Parameters<typeof create>[0]) => create(a) } } }));

describe('logLlmCall', () => {
  beforeEach(() => create.mockReset());
  it('writes row with computed cost', async () => {
    await logLlmCall({
      callType: 'chapter_stream',
      templateId: 'chapter',
      templateVersion: 1,
      model: 'gpt-5o-mini',
      inputTokens: 1000,
      outputTokens: 500,
      latencyMs: 1234,
      storyId: 's1', chapterId: 'c1', userId: 'u1',
    });
    expect(create).toHaveBeenCalledOnce();
    const arg = create.mock.calls[0][0].data;
    expect(arg.callType).toBe('chapter_stream');
    expect(Number(arg.costUsd)).toBeGreaterThan(0);
    expect(arg.latencyMs).toBe(1234);
  });
});
