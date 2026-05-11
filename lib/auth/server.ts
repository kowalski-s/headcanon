import { NextRequest } from 'next/server';

// MVP — full Supabase Auth comes in M0-NEW; for now header-based (test) + TODO prod
export async function getUserIdOrThrow(req: NextRequest): Promise<string> {
  const test = req.headers.get('x-test-user-id');
  if (test) return test;
  // TODO: integrate with Supabase Auth session (extract from JWT / cookie)
  throw new Error('unauthenticated');
}
