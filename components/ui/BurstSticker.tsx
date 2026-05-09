const STAR_CLIP_PATH =
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

export function BurstSticker({
  label,
  rotate = -8,
  className = '',
}: {
  label: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex size-20 items-center justify-center bg-amber ${className}`}
      style={{
        clipPath: STAR_CLIP_PATH,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <span className="font-mono text-mono-m tracking-caps text-bg uppercase">{label}</span>
    </span>
  );
}
