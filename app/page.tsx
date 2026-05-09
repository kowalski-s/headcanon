export default function Home() {
  return (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <h1 className="font-display text-display-l text-ink">Headcanon · tokens smoke test</h1>
      <p className="font-body mt-4 text-body-l text-ink-dim">
        Если этот параграф — серифный (EB Garamond placeholder), а заголовок — антикв-серифный
        (Bodoni Moda placeholder), и фон — глубокий баклажан, токены работают.
      </p>
      <div className="mt-6 flex gap-4">
        <span className="inline-block size-12 rounded-full bg-amber" title="amber" />
        <span className="inline-block size-12 rounded-full bg-rose" title="rose" />
        <span className="inline-block size-12 rounded-full bg-surface" title="surface" />
        <span className="inline-block size-12 rounded-full border border-border" title="border" />
      </div>
    </main>
  );
}
