import { z } from 'zod';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'trope_suggest';
export const TEMPLATE_VERSION = 1;

export const TropeSuggestSchema = z.object({
  tropes: z
    .array(
      z.object({
        slug: z.string(),
        label: z.string(),
        description: z.string().max(120),
        popularity: z.number().min(0).max(1),
      }),
    )
    .min(8)
    .max(15),
  sensei_tip: z.string().max(220),
});
export type TropeSuggestOutput = z.infer<typeof TropeSuggestSchema>;

export function build(fandomName: string, ship: string): { system: string; user: string } {
  return {
    system: [
      'You suggest fanfic tropes for a specific ship pairing in a fandom.',
      'Return 8–15 tropes popular on AO3 for this ship. Mix well-loved classics with a couple of niche ones.',
      'For each trope: a lowercase-hyphenated slug, a human-readable label, a ≤120-char description, and a popularity score 0–1.',
      'Also write a short sensei_tip (≤220 chars): a playful "AI Sensei" speech-bubble hint about writing this ship with these tropes.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: [
      `Fandom: <user_input>${fandomName}</user_input>`,
      `Ship: <user_input>${ship}</user_input>`,
    ].join('\n'),
  };
}
