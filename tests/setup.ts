import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Node 25 exposes a native localStorage that lacks .clear()/.setItem()/.getItem().
// Ensure the jsdom-compatible Storage is available globally when running in jsdom env.
if (typeof window !== 'undefined' && typeof window.localStorage.clear !== 'function') {
  const store: Record<string, string> = {};
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = String(v);
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
    } satisfies Storage,
  });
}

afterEach(() => {
  cleanup();
});
