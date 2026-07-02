'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { MonoBadge } from '@/components/ui/MonoBadge';

type Visibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

type Props = {
  storyId: string;
  visibility: Visibility;
};

const visibilityLabel: Record<Visibility, string> = {
  PRIVATE: 'Черновик',
  UNLISTED: 'По ссылке',
  PUBLIC: 'Опубликовано',
};

export function PublishToggle({ storyId, visibility }: Props) {
  const router = useRouter();
  const isPublic = visibility === 'PUBLIC';

  async function handleToggle() {
    await apiFetch(`/api/write/story/${storyId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ publish: !isPublic }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <MonoBadge tone={isPublic ? 'amber' : 'default'}>{visibilityLabel[visibility]}</MonoBadge>

      <button
        onClick={handleToggle}
        className="rounded-full border border-chrome-1/40 bg-surface-raised px-5 py-2.5 font-mono text-mono-m tracking-caps uppercase text-chrome-1"
      >
        {isPublic ? 'Снять с публикации' : 'Опубликовать'}
      </button>

      {isPublic && (
        <Link
          href={`/reader/${storyId}/1` as Route}
          className="font-mono text-mono-s tracking-caps uppercase text-amber hover:underline"
        >
          Открыть в читалке
        </Link>
      )}
    </div>
  );
}
