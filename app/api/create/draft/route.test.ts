import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { POST as createDraft } from './route';
import { PATCH as updateDraft } from './[id]/route';
import { NextRequest } from 'next/server';
import { createTestUser } from '@/lib/test-fixtures';
import { prisma } from '@/lib/prisma';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const auth = { 'x-test-user-id': USER_ID };

describe('CreateDraft', () => {
  beforeEach(async () => {
    await prisma.createDraft.deleteMany();
    await createTestUser(USER_ID);
  });

  afterAll(async () => {
    await prisma.createDraft.deleteMany();
    // Do not delete users — other test files share USER_ID and may have FK refs
  });

  it('POST creates an empty draft', async () => {
    const res = await createDraft(new NextRequest('http://x', { method: 'POST', headers: auth }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeTruthy();
    expect(json.step).toBe(1);
  });

  it('PATCH updates step', async () => {
    const c = await createDraft(new NextRequest('http://x', { method: 'POST', headers: auth }));
    const { id } = await c.json();
    const res = await updateDraft(
      new NextRequest('http://x', { method: 'PATCH', headers: auth, body: JSON.stringify({ characters: ['Гарри', 'Драко'], step: 3 }) }),
      { params: Promise.resolve({ id }) },
    );
    expect(res.status).toBe(200);
    const after = await prisma.createDraft.findUniqueOrThrow({ where: { id } });
    expect(after.step).toBe(3);
    expect(after.characters).toEqual(['Гарри', 'Драко']);
  });

  it('PATCH returns 404 for draft belonging to a different user', async () => {
    const c = await createDraft(new NextRequest('http://x', { method: 'POST', headers: auth }));
    const { id } = await c.json();
    const OTHER_USER = '00000000-0000-0000-0000-000000000002';
    await prisma.user.upsert({
      where: { id: OTHER_USER },
      update: {},
      create: { id: OTHER_USER, email: `${OTHER_USER}@hc.test`, handle: 'testuser2' },
    });
    const res = await updateDraft(
      new NextRequest('http://x', { method: 'PATCH', headers: { 'x-test-user-id': OTHER_USER }, body: JSON.stringify({ step: 2 }) }),
      { params: Promise.resolve({ id }) },
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('not found');
  });

  it('PATCH returns 404 for nonexistent draft', async () => {
    const res = await updateDraft(
      new NextRequest('http://x', { method: 'PATCH', headers: auth, body: JSON.stringify({ step: 2 }) }),
      { params: Promise.resolve({ id: '00000000-0000-0000-0000-000000009999' }) },
    );
    expect(res.status).toBe(404);
  });
});
