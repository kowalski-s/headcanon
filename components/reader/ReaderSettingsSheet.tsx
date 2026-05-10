'use client';

import type { ReaderSettings, ReaderFont, ReaderTheme } from '@/lib/reader/useReaderSettings';

type Props = {
  open: boolean;
  settings: ReaderSettings;
  onChange: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  onClose: () => void;
};

const fonts: { value: ReaderFont; label: string }[] = [
  { value: 'bodoni', label: 'Bodoni Moda' },
  { value: 'garamond', label: 'EB Garamond' },
  { value: 'cormorant', label: 'Cormorant' },
];

const themes: { value: ReaderTheme; label: string }[] = [
  { value: 'late-night', label: 'late night' },
  { value: 'sepia', label: 'sepia' },
  { value: 'true-dark', label: 'true dark' },
];

export function ReaderSettingsSheet({ open, settings, onChange, onClose }: Props) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        aria-label="close settings"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-bg-deep/60 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-label="настройки чтения"
        className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-5 rounded-t-2xl bg-bg-deep p-6 lg:left-1/2 lg:max-w-md lg:-translate-x-1/2"
      >
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim">
            шрифт
          </span>
          <div className="flex gap-2">
            {fonts.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => onChange('font', f.value)}
                className={`rounded-full border px-3 py-1.5 font-mono text-xs uppercase ${
                  settings.font === f.value
                    ? 'border-amber bg-amber text-bg-deep'
                    : 'border-ink-faint/30 text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim">
            размер: {settings.fontSize}px
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange('fontSize', Math.max(14, settings.fontSize - 1))}
              className="rounded-full border border-ink-faint/30 px-3 py-1 font-mono"
              aria-label="decrease size"
            >
              −
            </button>
            <input
              type="range"
              min={14}
              max={22}
              value={settings.fontSize}
              onChange={(e) => onChange('fontSize', Number(e.target.value))}
              className="flex-1"
              aria-label="font size"
            />
            <button
              type="button"
              onClick={() => onChange('fontSize', Math.min(22, settings.fontSize + 1))}
              className="rounded-full border border-ink-faint/30 px-3 py-1 font-mono"
              aria-label="increase size"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-dim">
            тема
          </span>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange('theme', t.value)}
                className={`rounded-full border px-3 py-1.5 font-mono text-xs uppercase ${
                  settings.theme === t.value
                    ? 'border-amber bg-amber text-bg-deep'
                    : 'border-ink-faint/30 text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between font-mono text-xs uppercase">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.justify}
              onChange={(e) => onChange('justify', e.target.checked)}
            />
            justify
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.hyphens}
              onChange={(e) => onChange('hyphens', e.target.checked)}
            />
            hyphens
          </label>
        </div>
      </section>
    </>
  );
}
