export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[640px] px-6 py-12 text-ink">
      <span
        aria-hidden
        className="font-mono mb-3 block text-mono-m tracking-caps text-amber uppercase"
      >
        ✦ M0 · foundation
      </span>
      <h1 className="text-display-l">Headcanon</h1>
      <p className="font-body mt-4 text-body-l text-ink-dim">
        Скелет проекта поднят. Дизайн-токены работают, шрифты с кириллицей загружены, основной фон —
        глубокий баклажан, текст — кремовый. Дальше — данные и UI-примитивы.
      </p>

      <div className="mt-10 border-t border-border pt-6">
        <h2 className="text-display-m text-amber italic">★ типографика</h2>
        <p className="font-body mt-3 text-body-l">
          Тогда снег падал крупными хлопьями. Драко стоял у окна, не оборачиваясь.{' '}
          <em className="text-amber">«Я не хочу говорить об этом»</em> — сказал он негромко.
        </p>
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <h2 className="text-display-m">палитра</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="aspect-square rounded-md bg-amber" title="amber" />
          <div className="aspect-square rounded-md bg-rose" title="rose" />
          <div className="aspect-square rounded-md bg-surface" title="surface" />
          <div
            className="aspect-square rounded-md border border-border-strong bg-bg-alt"
            title="bg-alt"
          />
        </div>
      </div>
    </main>
  );
}
