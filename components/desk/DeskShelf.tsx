'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { DeskCover, type DeskStory } from './DeskCover';

export function DeskShelf({ stories }: { stories: DeskStory[] }) {
  const router = useRouter();

  // Тот же экшен создания, что в StoryList: POST /api/write/story → редирект в редактор.
  async function handleCreate() {
    const res = await apiFetch('/api/write/story', {
      method: 'POST',
      body: JSON.stringify({ title: 'Без названия' }),
    });
    if (!res.ok) return;
    const { storyId } = (await res.json()) as { storyId: string };
    router.push(('/write/' + storyId) as Route);
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {stories.map((s) => (
        <DeskCover key={s.id} story={s} />
      ))}
      <button
        type="button"
        onClick={handleCreate}
        className="flex aspect-[2/3] items-center justify-center rounded-lg border border-dashed border-border-strong text-ink-dim transition-colors hover:border-amber hover:text-amber"
      >
        <span className="font-display italic">+ новая история</span>
      </button>
    </div>
  );
}
