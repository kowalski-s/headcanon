import { z } from 'zod';
import type { FocusType } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'trope_suggest';
export const TEMPLATE_VERSION = 2;

export const TropeSuggestSchema = z.object({
  tropes: z
    .array(
      z.object({
        slug: z.string(),
        label_ru: z.string(),
        description_ru: z.string().max(140),
        popularity: z.number().min(0).max(1),
      }),
    )
    .min(8)
    .max(15),
  sensei_tip: z.string().max(220),
});
export type TropeSuggestOutput = z.infer<typeof TropeSuggestSchema>;

export function build(args: {
  fandomName: string;
  focus: FocusType;
  characters: string[];
}): { system: string; user: string } {
  return {
    system: [
      'You suggest fanfic tropes for a given fandom, focus mode, and main characters.',
      'Return 8–15 tropes popular on AO3 for this combination. Mix well-loved classics with a couple of niche ones.',
      'CRITICAL: label_ru and description_ru must be in idiomatic Russian fandom slang. Mix transliterated terms (слоуберн, ангст, флафф, омегаверс) with established idiomatic Russian phrases (от врагов к возлюбленным, школьная AU, фэйк-релейшеншип). NEVER literal word-for-word translation from English.',
      'slug stays lowercase-hyphenated Latin (for tag dedup).',
      'Also write a short sensei_tip (≤220 chars) in Russian: a playful "AI Sensei" hint about writing this combination.',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: [
      `Fandom: <user_input>${args.fandomName}</user_input>`,
      `Focus: ${args.focus}`,
      `Characters: <user_input>${args.characters.join(', ')}</user_input>`,
    ].join('\n'),
  };
}
