import { z } from 'zod';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'auto_tag';
export const TEMPLATE_VERSION = 1;

const RATINGS = ['G', 'T', 'M', 'E'] as const;
const WARNINGS = [
  'major_character_death', 'graphic_violence', 'rape_non_con',
  'underage', 'choose_not_to_use', 'no_archive_warnings_apply',
] as const;
const CATEGORIES = ['Gen', 'F/F', 'F/M', 'M/M', 'Multi', 'Other'] as const;

export const AutoTagSchema = z.object({
  rating_suggestion: z.enum(RATINGS),
  warnings_suggestion: z.array(z.enum(WARNINGS)),
  category: z.enum(CATEGORIES),
  freeform_tags: z.array(z.string()).max(10),
  confidence: z.number().min(0).max(1),
});
export type AutoTagOutput = z.infer<typeof AutoTagSchema>;

export function build(input: { storyText: string; existingTags: string[] }): { system: string; user: string } {
  return {
    system: [
      'You suggest AO3-style tags for a fanfic.',
      'Be conservative on rating (G/T/M/E) and on warnings — they affect legal compliance.',
      'Freeform tags should be popular and findable (slow-burn, enemies-to-lovers, hurt/comfort, etc).',
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: [
      input.existingTags.length ? `Existing tags: ${input.existingTags.join(', ')}` : '',
      `Story text:\n<user_input>${input.storyText}</user_input>`,
    ].join('\n\n'),
  };
}
