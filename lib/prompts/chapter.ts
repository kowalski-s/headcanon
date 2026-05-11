import { SYSTEM_INJECTION_NOTICE, wrapUserInput } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'chapter';
export const TEMPLATE_VERSION = 1;

export type ChapterLength = 'short' | 'medium' | 'long';
const TARGET_WORDS: Record<ChapterLength, number> = { short: 1500, medium: 3000, long: 4500 };

export interface PriorState {
  worldState: {
    current_location: string;
    story_time: string;
    active_plot_threads: string[];
    foreshadowing: string[];
  };
  characterStates: Array<{
    character_name: string;
    emotional_state: string;
    recent_events: string[];
    relationships: Record<string, unknown>;
    arc_progress: number;
    voice_traits_drift: string[];
  }>;
  summaries: string[];        // chapters 1..N-3
  recentChapters: string[];   // full text of N-2 and N-1
}

export interface ChapterInput {
  fandomName: string;
  ship: string;
  tropes: string[];
  setting?: string;
  tone?: 'SLOW_BURN' | 'SPICY' | 'FLUFF' | 'ANGST';
  premise?: string;
  chapterLength: ChapterLength;
  chapterOrdinal: number;
  priorState?: PriorState;
}

export function build(input: ChapterInput): { system: string; user: string } {
  const target = TARGET_WORDS[input.chapterLength];
  const systemLines = [
    `You are a fanfic writer. Fandom: ${input.fandomName}. Ship: ${input.ship}.`,
    input.tropes.length ? `Tropes: ${input.tropes.join(', ')}.` : '',
    input.setting ? `Setting: ${input.setting}.` : '',
    input.tone ? `Tone: ${input.tone.toLowerCase().replace('_', ' ')}.` : '',
    `Target length: around ${target} words. Use blank lines between paragraphs (paragraphs of 2-4 sentences each).`,
    `Write in Russian. Lyrical, literary, Bodoni-Garamond aesthetic — close 3rd-person POV.`,
    SYSTEM_INJECTION_NOTICE,
  ].filter(Boolean);

  if (input.priorState) {
    systemLines.push('--- STORY STATE ---');
    systemLines.push(`World: ${JSON.stringify(input.priorState.worldState)}`);
    systemLines.push(`Characters: ${JSON.stringify(input.priorState.characterStates)}`);
    systemLines.push(`Summaries (earlier chapters): ${input.priorState.summaries.join('\n---\n')}`);
    systemLines.push(`Recent full chapters: ${input.priorState.recentChapters.join('\n---\n')}`);
  }

  const userPrompt = input.chapterOrdinal === 1
    ? input.premise
      ? `Write chapter 1 from this premise: ${wrapUserInput(input.premise)}`
      : 'Write chapter 1 from scratch, drawing on the configured fandom/ship/tropes.'
    : `Continue the story with chapter ${input.chapterOrdinal}. Honor existing state.`;

  return { system: systemLines.join('\n\n'), user: userPrompt };
}
