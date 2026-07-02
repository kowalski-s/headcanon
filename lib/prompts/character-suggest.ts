import { z } from 'zod';
import type { FocusType } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'character_suggest';
export const TEMPLATE_VERSION = 1;

export const CharacterSuggestSchema = z.object({
  suggestions: z
    .array(
      z.object({
        names: z.array(z.string()).min(1).max(4),
        label_ru: z.string(),
        popularity: z.number().min(0).max(1),
        avatar_prompt: z.string(),
        rarity: z.enum(['top', 'rare']),
        focus_compatible: z
          .array(z.enum(['romance', 'gen', 'character_study', 'friendship']))
          .min(1),
      }),
    )
    .min(5)
    .max(12),
});
export type CharacterSuggestOutput = z.infer<typeof CharacterSuggestSchema>;

const FOCUS_INSTRUCTIONS: Record<FocusType, string> = {
  ROMANCE:
    'Return 7 popular ship pairings on AO3 + 2 rare-but-beloved pairings. Each suggestion: 2 names (or 3 for poly), label_ru as written in Russian fandom (e.g. «Гарри × Драко», «Снейп/Гермиона»).',
  GEN: 'Return main characters or groups for gen stories (adventure, mystery, no romance). Mix solo protagonists and well-known groups (e.g. «Мародёры», «Золотое трио»). label_ru is the Russian fandom name of the character or group.',
  CHARACTER_STUDY:
    'Return solo protagonists for character study fanfic. label_ru is the Russian fandom spelling of the character name.',
  FRIENDSHIP:
    'Return friendship pairs or trios (no romance). label_ru in Russian fandom slang (e.g. «Гарри & Рон», «Мародёры»).',
};

export function build(args: { fandomName: string; focus: FocusType }): {
  system: string;
  user: string;
} {
  return {
    system: [
      'You suggest characters or pairings for a fanfic in a given fandom and focus mode.',
      FOCUS_INSTRUCTIONS[args.focus],
      'Use idiomatic Russian fandom slang in label_ru — never literal English. Names go in `names` field as their canonical Russian-fandom spelling.',
      'avatar_prompt: 1 sentence visual essence.',
      'focus_compatible: list which focus modes (romance, gen, character_study, friendship) this suggestion suits.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: `Fandom: <user_input>${args.fandomName}</user_input>\nFocus: ${args.focus}`,
  };
}
