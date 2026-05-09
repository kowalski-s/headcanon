// lib/reader/useReaderSettings.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

export type ReaderFont = 'bodoni' | 'garamond' | 'cormorant';
export type ReaderTheme = 'late-night' | 'sepia' | 'true-dark';

export type ReaderSettings = {
  font: ReaderFont;
  fontSize: number;
  theme: ReaderTheme;
  justify: boolean;
  hyphens: boolean;
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  font: 'garamond',
  fontSize: 16,
  theme: 'late-night',
  justify: true,
  hyphens: true,
};

const STORAGE_KEY = 'headcanon:reader-settings';

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore corrupt JSON
    }
  }, []);

  const setSetting = useCallback(
    <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore quota errors
        }
        return next;
      });
    },
    [],
  );

  return { settings, setSetting };
}
