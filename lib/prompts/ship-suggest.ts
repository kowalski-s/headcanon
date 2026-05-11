import { z } from 'zod';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'ship_suggest';
export const TEMPLATE_VERSION = 1;

export const ShipSuggestSchema = z.object({
  ships: z
    .array(
      z.object({
        names: z.array(z.string()).min(2).max(3),
        popularity: z.number().min(0).max(1),
        avatar_prompt: z.string(),
        rarity: z.enum(['top', 'rare']),
      }),
    )
    .min(5)
    .max(12),
});
export type ShipSuggestOutput = z.infer<typeof ShipSuggestSchema>;

export function build(fandomName: string): { system: string; user: string } {
  return {
    system: [
      'You suggest fanfic ship pairings for a fandom.',
      'Return 7 most-popular ships on AO3 + 2 rare-but-beloved ones.',
      'For each ship, write a short avatar_prompt describing visual essence (1 sentence).',
      'Names: 2 main characters, optionally 1 more for poly ships.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: `Fandom: <user_input>${fandomName}</user_input>`,
  };
}
