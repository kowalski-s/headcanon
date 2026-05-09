export function GrainCover({
  from,
  to,
  className = '',
  children,
}: {
  from: string;
  to: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
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
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
