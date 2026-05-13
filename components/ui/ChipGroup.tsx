'use client';

interface ChipOption<V extends string> {
  value: V;
  label: string;
  description?: string;
}

interface ChipGroupProps<V extends string> {
  options: ChipOption<V>[];
  value: V | null;
  onChange: (next: V) => void;
  testIdPrefix?: string;
}

export function ChipGroup<V extends string>({ options, value, onChange, testIdPrefix }: ChipGroupProps<V>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            aria-pressed={active}
            data-testid={testIdPrefix ? `${testIdPrefix}-${opt.value}` : undefined}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
              active
                ? 'border-amber/60 bg-amber-soft text-amber'
                : 'border-ink-faint/30 text-ink-dim hover:text-ink'
            }`}
            title={opt.description}
          >
            {active ? '★ ' : ''}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
