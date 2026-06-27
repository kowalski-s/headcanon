import { getBoss } from './boss';
import { handleExtractBible, type ExtractBibleJob } from './jobs/extract-bible';
import { handleAutoTag, type AutoTagJob } from './jobs/auto-tag';

type JobHandler<T> = (job: { data: T }) => Promise<void>;

async function withBatchIsolation<T>(
  queueName: string,
  jobs: Array<{ data: T; id: string }>,
  handler: JobHandler<T>,
): Promise<void> {
  const errors: Error[] = [];
  for (const j of jobs) {
    try {
      await handler({ data: j.data });
    } catch (e) {
      console.error(`[${queueName}] job failed`, { ...j.data, jobId: j.id, error: e });
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }
  if (errors.length)
    throw new AggregateError(errors, `${errors.length}/${jobs.length} ${queueName} jobs failed`);
}

export async function startAllWorkers(): Promise<void> {
  const boss = await getBoss();
  // policy 'stately' + singletonKey on send → at most one queued + one active job
  // per chapterId/storyId. Rapid double-save won't enqueue a duplicate.
  await boss.createQueue('extract-bible', { policy: 'stately', retryLimit: 3, retryBackoff: true });
  await boss.createQueue('auto-tag', { policy: 'stately', retryLimit: 3, retryBackoff: true });
  await boss.createQueue('ai-suggestion-sweeper');
  await boss.work<ExtractBibleJob>('extract-bible', { localConcurrency: 2 }, (jobs) =>
    withBatchIsolation('extract-bible', jobs, handleExtractBible),
  );
  await boss.work<AutoTagJob>('auto-tag', { localConcurrency: 2 }, (jobs) =>
    withBatchIsolation('auto-tag', jobs, handleAutoTag),
  );
  await boss.work('ai-suggestion-sweeper', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { count } = await prisma.aiSuggestion.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`[sweeper] cleaned ${count} expired AiSuggestion rows`);
  });
  await boss.schedule('ai-suggestion-sweeper', '0 3 * * *');
  console.log('[worker] queues registered + workers started');
}
