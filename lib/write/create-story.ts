import { apiFetch } from '@/lib/api/client';

/**
 * Создаёт новую историю с дефолтным заголовком.
 * Возвращает id созданной истории или null при ошибке (silent-fail,
 * как в исходных call-sites — DeskShelf и StoryList).
 * Навигация — ответственность вызывающего компонента.
 */
export async function createStory(): Promise<string | null> {
  const res = await apiFetch('/api/write/story', {
    method: 'POST',
    body: JSON.stringify({ title: 'Без названия' }),
  });
  if (!res.ok) return null;
  const { storyId } = (await res.json()) as { storyId: string };
  return storyId;
}
