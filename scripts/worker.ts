import 'dotenv/config';
import { startAllWorkers } from '@/lib/queue/start-workers';

async function main() {
  await startAllWorkers();
  // pg-boss держит соединение само; процесс висит
  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
  console.log('[worker] running. Ctrl-C to exit.');
}

void main().catch((e) => {
  console.error('[worker] fatal:', e);
  process.exit(1);
});
