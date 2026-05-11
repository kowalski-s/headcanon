import { getBoss } from './boss';

export async function startAllWorkers(): Promise<void> {
  const boss = await getBoss();
  // Регистрируем queue'и; handlers подключим в Tasks 6 и 9.
  await boss.createQueue('extract-bible', { retryLimit: 3, retryBackoff: true });
  await boss.createQueue('auto-tag', { retryLimit: 3, retryBackoff: true });
  console.log('[worker] queues registered: extract-bible, auto-tag');
}
