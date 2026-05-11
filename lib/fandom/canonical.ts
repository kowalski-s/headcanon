/**
 * Maps DB fandom slug → canonical English title for LLM prompts.
 *
 * Founder uses Russian display names («Всё ради игры», «Магическая битва»),
 * which most LLMs don't recognize. We send the canonical English title +
 * author/franchise context to the model instead.
 */
const FANDOM_CANONICAL: Record<string, string> = {
  'all-for-the-game': 'All for the Game (Nora Sakavic — The Foxhole Court trilogy)',
  'harry-potter': 'Harry Potter (J.K. Rowling)',
  naruto: 'Naruto (Masashi Kishimoto)',
  jjk: 'Jujutsu Kaisen (呪術廻戦, Gege Akutami)',
};

export function canonicalFandom(slug: string, fallbackName: string): string {
  return FANDOM_CANONICAL[slug] ?? fallbackName;
}
