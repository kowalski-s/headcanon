/**
 * Dev-stub user ID for header-based auth (x-test-user-id).
 *
 * Used by the Reader (and any client-side fetch) until real Supabase Auth
 * session cookies land in M3. The value can be overridden via the
 * NEXT_PUBLIC_TEST_USER_ID env var so CI seeds can use a consistent ID.
 *
 * TODO(M3): delete this file and replace all references with the Supabase
 * session user ID from `useSession()`.
 */
export const DEV_USER_ID =
  process.env.NEXT_PUBLIC_TEST_USER_ID ?? '00000000-0000-0000-0000-000000000001';
