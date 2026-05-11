import { getBoss } from './boss';
import { handleExtractBible, type ExtractBibleJob } from './jobs/extract-bible';

export async function startAllWorkers(): Promise<void> {
  const boss = await getBoss();
  await boss.createQueue('extract-bible', { retryLimit: 3, retryBackoff: true });
  await boss.createQueue('auto-tag', { retryLimit: 3, retryBackoff: true });
  await boss.work<ExtractBibleJob>('extract-bible', { localConcurrency: 2 }, async (jobs) => {
    for (const j of jobs) await handleExtractBible({ data: j.data });
  });
  console.log('[worker] queues registered + workers started');
}
