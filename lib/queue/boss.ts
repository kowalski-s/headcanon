import { PgBoss } from 'pg-boss';

let bossPromise: Promise<PgBoss> | null = null;

export function getBoss(): Promise<PgBoss> {
  if (bossPromise) return bossPromise;
  const conn = process.env.DATABASE_URL;
  if (!conn) throw new Error('DATABASE_URL required for pg-boss');
  bossPromise = (async () => {
    const boss = new PgBoss({
      connectionString: conn,
      schema: 'pgboss',
    });
    await boss.start();
    return boss;
  })();
  return bossPromise;
}

export async function enqueue(
  queue: string,
  payload: object,
  opts?: { singletonKey?: string },
): Promise<string | null> {
  const boss = await getBoss();
  return boss.send(queue, payload, opts ?? {});
}
