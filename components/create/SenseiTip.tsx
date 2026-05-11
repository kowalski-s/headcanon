import { BurstSticker } from '@/components/ui/BurstSticker';

export function SenseiTip({ children }: { children: string }) {
  return (
    <div className="relative max-w-md">
      <BurstSticker label="ai sensei" rotate={-6} className="absolute -left-2 -top-3 z-10" />
      <p className="rounded-2xl bg-surface-raised px-5 py-4 font-body text-body-l italic text-ink">
        {children}
      </p>
    </div>
  );
}
