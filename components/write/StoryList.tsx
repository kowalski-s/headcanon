'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { createStory } from '@/lib/write/create-story';
import { MonoBadge } from '@/components/ui/MonoBadge';

type Story = {
  id: string;
  title: string;
  visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLIC';
};

type Props = {
  stories: Story[];
};

const visibilityLabel: Record<Story['visibility'], string> = {
  PRIVATE: 'Черновик',
  UNLISTED: 'По ссылке',
  PUBLIC: 'Опубликовано',
};

export function StoryList({ stories }: Props) {
  const router = useRouter();
  const pendingRef = useRef(false);

  // pendingRef гасит двойной клик — иначе создаются две «Без названия».
  async function handleNew() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    const storyId = await createStory();
    if (!storyId) {
      pendingRef.current = false;
      return;
    }
    router.push(('/write/' + storyId) as Route);
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleNew}
        className="rounded-full bg-amber px-6 py-3 font-mono text-mono-m tracking-caps uppercase text-bg-deep"
      >
        + Новая история
      </button>

      {stories.length === 0 ? (
        <p className="font-mono text-mono-s tracking-caps uppercase text-ink-dim">
          У вас пока нет историй. Создайте первую!
        </p>
      ) : (
        <ul className="space-y-2">
          {stories.map((story) => (
            <li key={story.id}>
              <Link
                href={`/write/${story.id}` as Route}
                className="flex items-center justify-between rounded-lg bg-surface border border-DEFAULT px-4 py-3 hover:bg-surface-raised transition-colors"
              >
                <span className="font-display text-ink">{story.title}</span>
                <MonoBadge tone={story.visibility === 'PUBLIC' ? 'amber' : 'default'}>
                  {visibilityLabel[story.visibility]}
                </MonoBadge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
