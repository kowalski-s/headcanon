import type { z } from 'zod';

export interface LlmStreamOpts {
  callType: string;
  templateId: string;
  templateVersion: number;
  system: string;
  user: string;
  model?: string;
  abortSignal?: AbortSignal;
  contextIds?: { storyId?: string; chapterId?: string; userId?: string };
}

export interface LlmStructuredOpts<T> {
  callType: string;
  templateId: string;
  templateVersion: number;
  system: string;
  user: string;
  schema: z.ZodSchema<T>;
  model?: string;
  contextIds?: { storyId?: string; chapterId?: string; userId?: string };
}

export interface LlmAdapter {
  stream(opts: LlmStreamOpts): AsyncIterable<string>;
  completeStructured<T>(opts: LlmStructuredOpts<T>): Promise<T>;
}
