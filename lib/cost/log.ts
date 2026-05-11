// lib/cost/log.ts
import { prisma } from '@/lib/prisma';
import { estimateCost } from './pricing';

export interface LogLlmCallInput {
  callType: string;
  templateId: string;
  templateVersion: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  storyId?: string;
  chapterId?: string;
  userId?: string;
}

export async function logLlmCall(input: LogLlmCallInput): Promise<void> {
  await prisma.llmCallLog.create({
    data: {
      callType: input.callType,
      templateId: input.templateId,
      templateVersion: input.templateVersion,
      model: input.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      costUsd: estimateCost(input.model, input.inputTokens, input.outputTokens),
      latencyMs: input.latencyMs,
      storyId: input.storyId ?? null,
      chapterId: input.chapterId ?? null,
      userId: input.userId ?? null,
    },
  });
}
