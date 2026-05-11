import { PgBoss } from 'pg-boss';

let instance: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (instance) return instance;
  const conn = process.env.DATABASE_URL;
  if (!conn) throw new Error('DATABASE_URL required for pg-boss');
  instance = new PgBoss({
    connectionString: conn,
    schema: 'pgboss',
  });
  await instance.start();
  return instance;
}

export async function enqueue(
  queue: string,
  payload: object,
  opts?: { singletonKey?: string },
): Promise<string | null> {
  const boss = await getBoss();
  return boss.send(queue, payload, opts ?? {});
}
