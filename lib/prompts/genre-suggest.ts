import { z } from 'zod';
import type { FocusType } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'genre_suggest';
export const TEMPLATE_VERSION = 1;

export const GenreSuggestSchema = z.object({
  genres: z
    .array(
      z.object({
        slug: z.string(),
        label_ru: z.string(),
        popularity: z.number().min(0).max(1),
      }),
    )
    .min(8)
    .max(14),
});
export type GenreSuggestOutput = z.infer<typeof GenreSuggestSchema>;

export function build(args: { fandomName: string; focus: FocusType }): { system: string; user: string } {
  return {
    system: [
      'You suggest AU/genre tags for fanfic in a given fandom and focus mode.',
      'Return 8–14 popular AU or genre tags. Mix mainstream («современная AU», «школьная AU», «coffee shop», «омегаверс», «соулмейты») with fandom-specific subgenres.',
      'label_ru must be in idiomatic Russian fanfic community slang. Never literal English translation.',
      'slug stays lowercase-hyphenated Latin.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: `Fandom: <user_input>${args.fandomName}</user_input>\nFocus: ${args.focus}`,
  };
}
