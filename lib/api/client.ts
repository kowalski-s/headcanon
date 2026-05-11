import { DEV_USER_ID } from '@/lib/auth/dev-user';

/**
 * Thin fetch wrapper that attaches the dev auth header to every request.
 * TODO(M3): replace with real Supabase session token.
 */
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-test-user-id': DEV_USER_ID,
      ...init.headers,
    },
  });
}
