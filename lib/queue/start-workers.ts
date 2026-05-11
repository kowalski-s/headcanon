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
    try { await handler({ data: j.data }); }
    catch (e) {
      console.error(`[${queueName}] job failed`, { ...j.data, jobId: j.id, error: e });
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }
  if (errors.length) throw new AggregateError(errors, `${errors.length}/${jobs.length} ${queueName} jobs failed`);
}

export async function startAllWorkers(): Promise<void> {
  const boss = await getBoss();
  await boss.createQueue('extract-bible', { retryLimit: 3, retryBackoff: true });
  await boss.createQueue('auto-tag', { retryLimit: 3, retryBackoff: true });
  await boss.work<ExtractBibleJob>('extract-bible', { localConcurrency: 2 }, (jobs) =>
    withBatchIsolation('extract-bible', jobs, handleExtractBible));
  await boss.work<AutoTagJob>('auto-tag', { localConcurrency: 2 }, (jobs) =>
    withBatchIsolation('auto-tag', jobs, handleAutoTag));
  console.log('[worker] queues registered + workers started');
}
