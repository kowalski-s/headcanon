export function Marquee({
  items,
  separator = ' ✦ ',
  className = '',
}: {
  items: string[];
  separator?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden bg-amber py-2 ${className}`}>
      <div data-track className="flex w-max animate-marquee gap-8 motion-reduce:animate-none">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="font-mono text-mono-m tracking-caps text-bg uppercase whitespace-nowrap"
          >
            {items.map((item, idx) => (
              <span key={idx}>
                {item}
                {idx < items.length - 1 && separator}
              </span>
            ))}
            <span aria-hidden>{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
