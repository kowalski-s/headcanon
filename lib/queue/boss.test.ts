import { describe, it, expect, beforeAll } from 'vitest';
import { getBoss, enqueue } from './boss';

const skip = process.env.SKIP_PG_BOSS === '1';

describe.skipIf(skip)('pg-boss', () => {
  beforeAll(async () => {
    const boss = await getBoss();
    await boss.createQueue('test-queue');
  });

  it('starts and accepts send', async () => {
    const boss = await getBoss();
    expect(boss).toBeTruthy();
    const id = await enqueue('test-queue', { hello: 'world' });
    expect(id).toBeTruthy();
  });
});
