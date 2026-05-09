type OrnamentSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<OrnamentSize, string> = {
  sm: 'text-mono-s',
  md: 'text-mono-m',
  lg: 'text-display-s',
};

export function Ornament({ size = 'md' }: { size?: OrnamentSize }) {
  return (
    <span
      role="separator"
      aria-hidden="true"
      className={`block text-center text-amber ${sizeClasses[size]}`}
    >
      ─ ✦ ─
    </span>
  );
}
