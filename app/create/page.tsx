import Link from 'next/link';
import type { Route } from 'next';
import { Ornament } from '@/components/ui/Ornament';

export default function CreateStub() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href={'/' as Route} aria-label="back" className="font-mono text-base">
          ←
        </Link>
        <span className="font-mono text-mono-m tracking-caps text-ink-dim uppercase">
          ship · soon
        </span>
        <span aria-hidden />
      </header>
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-24 text-center">
        <span className="text-5xl text-amber">✦</span>
        <h1 className="font-display text-display-l">ship режим скоро</h1>
        <p className="font-body text-body-l text-ink-dim">
          Создание истории по фандому, паре и тропам — это M2. OpenRouter и стрим текста уже на
          подходе. Пока — листай ленту.
        </p>
        <div className="my-2">
          <Ornament size="md" />
        </div>
        <Link
          href={'/' as Route}
          className="rounded-full bg-amber px-6 py-3 font-mono text-mono-m tracking-caps text-bg uppercase"
        >
          ★ в ленту
        </Link>
      </div>
    </div>
  );
}
