import { z } from 'zod';
import { SYSTEM_INJECTION_NOTICE } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'bible_extract';
export const TEMPLATE_VERSION = 1;

export const BibleExtractSchema = z.object({
  chapter_summary: z.string().max(800),
  updated_world_state: z.object({
    current_location: z.string(),
    story_time: z.string(),
    active_plot_threads: z.array(z.string()),
    foreshadowing: z.array(z.string()),
  }),
  updated_character_states: z.array(
    z.object({
      character_name: z.string(),
      emotional_state: z.string(),
      recent_events: z.array(z.string()).max(5),
      relationships: z.record(
        z.string(),
        z.object({
          closeness: z.number().min(-1).max(1),
          tension: z.number().min(0).max(1),
          last_interaction: z.string(),
        }),
      ),
      arc_progress: z.number().min(0).max(1),
      voice_traits_drift: z.array(z.string()),
    }),
  ),
});
export type BibleExtractOutput = z.infer<typeof BibleExtractSchema>;

export interface BibleExtractInput {
  chapterText: string;
  priorWorldState: object | null;
  priorCharacterStates: object[];
  characterRoster: string[]; // names known to the story
}

export function build(input: BibleExtractInput): { system: string; user: string } {
  return {
    system: [
      'You analyse a fanfic chapter and update structured story state.',
      'Return strict JSON per the provided schema. Be concise; max 200 words for chapter_summary.',
      'Update arc_progress monotonically (never decrease).',
      `Known characters in this story: ${input.characterRoster.join(', ')}.`,
      SYSTEM_INJECTION_NOTICE,
    ].join('\n\n'),
    user: [
      `Prior world_state: ${JSON.stringify(input.priorWorldState ?? {})}`,
      `Prior character_states: ${JSON.stringify(input.priorCharacterStates ?? [])}`,
      `Chapter text:\n<user_input>${input.chapterText}</user_input>`,
    ].join('\n\n'),
  };
}
