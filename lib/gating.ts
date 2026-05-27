/** Story с подгруженными тегами (StoryTag[] → Tag.isCanonicalIp). */
export type StoryWithTagFlags = {
  tags: { tag: { isCanonicalIp: boolean } }[];
};

/**
 * true, если в тегах истории есть хотя бы один канонный фандом.
 * Видео-генерация (Phase 3) доступна ТОЛЬКО когда это false (оригинальный мир).
 */
export function storyHasCanonicalIp(story: StoryWithTagFlags): boolean {
  return story.tags.some((st) => st.tag.isCanonicalIp);
}
