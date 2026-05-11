import { describe, it, expect, vi } from 'vitest';

vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    textStream: (async function* () {
      yield 'Hello, ';
      yield 'world.';
    })(),
    usage: Promise.resolve({ inputTokens: 5, outputTokens: 3 }),
  })),
  generateObject: vi.fn(),
  zodSchema: vi.fn((s) => s),
}));
vi.mock('@ai-sdk/openai', () => ({ openai: (id: string) => ({ id }) }));
vi.mock('@/lib/cost/log', () => ({ logLlmCall: vi.fn() }));

import { openaiLlm } from './llm-openai';
import { logLlmCall } from '@/lib/cost/log';

describe('openaiLlm.stream', () => {
  it('yields tokens and logs cost', async () => {
    const chunks: string[] = [];
    for await (const c of openaiLlm.stream({
      callType: 'test', templateId: 't', templateVersion: 1,
      system: 'sys', user: 'usr', model: 'gpt-4o-mini',
    })) chunks.push(c);
    expect(chunks.join('')).toBe('Hello, world.');
    await new Promise((r) => setTimeout(r, 0));
    expect(logLlmCall).toHaveBeenCalledOnce();
  });
});
