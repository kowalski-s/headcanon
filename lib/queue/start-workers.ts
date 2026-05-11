import { getBoss } from './boss';
import { handleExtractBible, type ExtractBibleJob } from './jobs/extract-bible';

export async function startAllWorkers(): Promise<void> {
  const boss = await getBoss();
  await boss.createQueue('extract-bible', { retryLimit: 3, retryBackoff: true });
  await boss.createQueue('auto-tag', { retryLimit: 3, retryBackoff: true });
  await boss.work<ExtractBibleJob>('extract-bible', { localConcurrency: 2 }, async (jobs) => {
    const errors: Error[] = [];
    for (const j of jobs) {
      try {
        await handleExtractBible({ data: j.data });
      } catch (e) {
        console.error('[extract-bible] job failed', { chapterId: j.data.chapterId, jobId: j.id, error: e });
        errors.push(e instanceof Error ? e : new Error(String(e)));
      }
    }
    if (errors.length) throw new AggregateError(errors, `${errors.length}/${jobs.length} extract-bible jobs failed`);
  });
  console.log('[worker] queues registered + workers started');
}
