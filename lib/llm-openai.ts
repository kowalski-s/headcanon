import { streamText, generateObject, zodSchema } from 'ai';
import { openai } from '@ai-sdk/openai';
import { logLlmCall } from '@/lib/cost/log';
import type { LlmAdapter, LlmStreamOpts, LlmStructuredOpts } from './llm';

// Prose-generating calls need a stronger model than structured lookups.
// gpt-4o-mini hallucinated character names and canon facts in chapter prose, paragraph
// regens, and bible extraction. Structured suggest/tag calls (ship/trope/auto-tag) stay
// on mini — they're short, cached, and don't need the larger model.
const PROSE_CALL_TYPES = new Set(['chapter_stream', 'chapter_tweak', 'bible_extract']);
const PROSE_CALL_PREFIXES = ['paragraph_']; // paragraph_regen|continue|expand|compress
const PROSE_MODEL = process.env.LLM_MODEL_PROSE ?? 'gpt-4o';

const DEFAULT_MODEL = process.env.LLM_MODEL_DEFAULT ?? 'gpt-4o-mini';

function modelFor(callType: string, override?: string): string {
  if (override) return override;
  const envKey = `LLM_MODEL_${callType.toUpperCase()}`;
  if (process.env[envKey]) return process.env[envKey] as string;
  if (PROSE_CALL_TYPES.has(callType)) return PROSE_MODEL;
  if (PROSE_CALL_PREFIXES.some((p) => callType.startsWith(p))) return PROSE_MODEL;
  return DEFAULT_MODEL;
}

async function* streamImpl(opts: LlmStreamOpts): AsyncIterable<string> {
  const model = modelFor(opts.callType, opts.model);
  const started = Date.now();
  const result = streamText({
    model: openai(model),
    system: opts.system,
    prompt: opts.user,
    abortSignal: opts.abortSignal,
  });
  for await (const chunk of result.textStream) {
    yield chunk;
  }
  const usage = await result.usage;
  void logLlmCall({
    callType: opts.callType,
    templateId: opts.templateId,
    templateVersion: opts.templateVersion,
    model,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    latencyMs: Date.now() - started,
    storyId: opts.contextIds?.storyId,
    chapterId: opts.contextIds?.chapterId,
    userId: opts.contextIds?.userId,
  });
}

async function completeStructuredImpl<T>(opts: LlmStructuredOpts<T>): Promise<T> {
  const model = modelFor(opts.callType, opts.model);
  const started = Date.now();
  const result = await generateObject({
    model: openai(model),
    system: opts.system,
    prompt: opts.user,
    schema: zodSchema(opts.schema),
  });
  await logLlmCall({
    callType: opts.callType,
    templateId: opts.templateId,
    templateVersion: opts.templateVersion,
    model,
    inputTokens: result.usage.inputTokens ?? 0,
    outputTokens: result.usage.outputTokens ?? 0,
    latencyMs: Date.now() - started,
    storyId: opts.contextIds?.storyId,
    chapterId: opts.contextIds?.chapterId,
    userId: opts.contextIds?.userId,
  });
  return result.object;
}

export const openaiLlm: LlmAdapter = {
  stream: (o) => streamImpl(o),
  completeStructured: completeStructuredImpl,
};
