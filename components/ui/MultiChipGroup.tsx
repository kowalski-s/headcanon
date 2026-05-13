'use client';

interface ChipOption<V extends string> {
  value: V;
  label: string;
  description?: string;
}

interface MultiChipGroupProps<V extends string> {
  options: ChipOption<V>[];
  values: V[];
  onChange: (next: V[]) => void;
  max?: number;
  testIdPrefix?: string;
}

export function MultiChipGroup<V extends string>({
  options,
  values,
  onChange,
  max,
  testIdPrefix,
}: MultiChipGroupProps<V>) {
  const toggle = (v: V) => {
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v));
      return;
    }
    if (max !== undefined && values.length >= max) return;
    onChange([...values, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt.value);
        return (
          <button
            type="button"
            key={opt.value}
            aria-pressed={active}
            data-testid={testIdPrefix ? `${testIdPrefix}-${opt.value}` : undefined}
            onClick={() => toggle(opt.value)}
            className={`rounded-full border px-3 py-1.5 font-mono text-mono-s tracking-caps uppercase transition-colors ${
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
