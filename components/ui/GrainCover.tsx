export function GrainCover({
  from,
  to,
  glow = true,
  className = '',
  children,
}: {
  from: string;
  to: string;
  glow?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      // Caller passes `absolute inset-0` to size the cover; we add `overflow-hidden` and a
      // gradient background. We do NOT add `relative` here — Tailwind's `.relative` is
      // declared after `.absolute` in the cascade, so combining both makes `inset-0` a no-op
      // and the cover collapses (all internal layers are absolute).
      className={`overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {glow ? (
        <div
          data-layer="amber-glow"
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(229,169,90,0.28), transparent 70%)',
          }}
        />
      ) : null}
      <div
        data-layer="grain"
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-[0.18]"
        style={{
          backgroundImage: "url('/textures/grain.png')",
          backgroundSize: '256px 256px',
          backgroundRepeat: 'repeat',
        }}
      />
      <div
        data-layer="vignette"
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div className="absolute inset-0 z-10">{children}</div>
    </div>
  );
}
