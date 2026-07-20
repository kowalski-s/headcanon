'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { createStory } from '@/lib/write/create-story';

/**
 * Общий хук создания истории для writer-поверхностей (шапка, полка, пустой стол).
 * pendingRef гасит двойной клик синхронно — иначе POST /api/write/story уходит
 * дважды и создаются две «Без названия». `pending` — для дизейбла кнопки в UI.
 * Навигация в редактор — здесь же, чтобы call-sites не дублировали логику.
 */
export function useCreateStory() {
  const router = useRouter();
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);

  async function create() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    const storyId = await createStory();
    if (!storyId) {
      pendingRef.current = false;
      setPending(false);
      return;
    }
    router.push(('/write/' + storyId) as Route);
  }

  return { create, pending };
}
