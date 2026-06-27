import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';

function hashKey(input: unknown): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export async function getSuggestion<T>(scope: string, keyInput: unknown): Promise<T | null> {
  const keyHash = hashKey(keyInput);
  const row = await prisma.aiSuggestion.findUnique({
    where: { scope_keyHash: { scope, keyHash } },
  });
  if (!row) return null;
  if (row.expiresAt <= new Date()) return null;
  return row.valueJson as T;
}

export async function setSuggestion(
  scope: string,
  keyInput: unknown,
  value: unknown,
  model: string,
  ttlSec: number,
): Promise<void> {
  const keyHash = hashKey(keyInput);
  const expiresAt = new Date(Date.now() + ttlSec * 1000);
  await prisma.aiSuggestion.upsert({
    where: { scope_keyHash: { scope, keyHash } },
    create: { scope, keyHash, valueJson: value as object, model, expiresAt },
    update: { valueJson: value as object, model, expiresAt },
  });
}
