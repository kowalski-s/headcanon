import type { FocusType, Rating, Category, Pov, Tense, Tone } from '@prisma/client';
import { SYSTEM_INJECTION_NOTICE, wrapUserInput } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'chapter';
export const TEMPLATE_VERSION = 2;

export type ChapterLength = 'short' | 'medium' | 'long';
const TARGET_WORDS: Record<ChapterLength, number> = { short: 1500, medium: 3000, long: 4500 };

const TIMELINE_DESCR: Record<string, string> = {
  canon: 'canon',
  pre: 'pre-canon',
  post: 'post-canon',
  au: 'AU (not bound by canon)',
};

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
  summaries: string[];
  recentChapters: string[];
}

export interface ChapterInput {
  fandomName: string;
  focusType: FocusType;
  characters: string[];
  tropes: string[];
  rating?: Rating;
  category?: Category;
  warnings?: string[];
  pov?: Pov;
  tense?: Tense;
  tones?: Tone[];
  timeline?: string;
  timelineNote?: string;
  genres?: string[];
  setting?: string;
  premise?: string;
  chapterLength: ChapterLength;
  chapterOrdinal: number;
  priorState?: PriorState;
}

function toneFmt(t: Tone): string {
  return t.toLowerCase().replace(/_/g, ' ');
}
function povFmt(p: Pov): string {
  return p === 'FIRST' ? '1st person' : p === 'OMNISCIENT' ? 'omniscient' : 'close 3rd';
}
function tenseFmt(t: Tense): string {
  return t === 'PRESENT' ? 'present' : 'past';
}

export function build(input: ChapterInput): { system: string; user: string } {
  const target = TARGET_WORDS[input.chapterLength];
  const lines: string[] = [
    `You are a fanfic writer. Write in Russian, idiomatic Russian fanfic prose. Lyrical, literary, Bodoni-Garamond aesthetic.`,
    `Fandom: ${input.fandomName}. Focus: ${input.focusType}.`,
    input.characters.length ? `Main characters: ${input.characters.join(', ')}.` : '',
    input.tropes.length ? `Tropes: ${input.tropes.join(', ')}.` : '',
    input.rating ? `Rating: ${input.rating}.` : '',
    input.category ? `Category: ${input.category}.` : '',
    input.warnings?.length ? `Warnings: ${input.warnings.join(', ')}.` : '',
    input.pov ? `POV: ${povFmt(input.pov)}.` : 'POV: close 3rd.',
    input.tense ? `Tense: ${tenseFmt(input.tense)}.` : 'Tense: past.',
    input.tones?.length ? `Tones: ${input.tones.map(toneFmt).join(', ')}.` : '',
    input.genres?.length ? `Genres: ${input.genres.join(', ')}.` : '',
    input.timeline
      ? `Timeline: ${TIMELINE_DESCR[input.timeline] ?? input.timeline}${input.timelineNote ? ' — ' + input.timelineNote : ''}.`
      : '',
    input.setting ? `Setting: ${input.setting}.` : '',
    `Target length: around ${target} words. Use blank lines between paragraphs (paragraphs of 2-4 sentences each).`,
    SYSTEM_INJECTION_NOTICE,
  ].filter(Boolean);

  if (input.priorState) {
    lines.push('--- STORY STATE ---');
    lines.push(`World: ${JSON.stringify(input.priorState.worldState)}`);
    lines.push(`Characters: ${JSON.stringify(input.priorState.characterStates)}`);
    lines.push(`Summaries (earlier chapters): ${input.priorState.summaries.join('\n---\n')}`);
    lines.push(`Recent full chapters: ${input.priorState.recentChapters.join('\n---\n')}`);
  }

  const user =
    input.chapterOrdinal === 1
      ? input.premise
        ? `Write chapter 1 from this premise: ${wrapUserInput(input.premise)}`
        : 'Write chapter 1 from scratch, drawing on the configured fandom/focus/characters/tropes.'
      : `Continue the story with chapter ${input.chapterOrdinal}. Honor existing state.`;

  return { system: lines.join('\n\n'), user };
}
