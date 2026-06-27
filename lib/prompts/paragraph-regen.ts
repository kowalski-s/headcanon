import { SYSTEM_INJECTION_NOTICE, wrapUserInput } from '@/lib/safety/injection-guard';

export const TEMPLATE_ID = 'paragraph_regen';
export const TEMPLATE_VERSION = 1;

export type RegenMode = 'regen' | 'continue' | 'expand' | 'compress';
// delete не имеет LLM-вызова — обрабатывается в route без prompt'а

export interface RegenInput {
  mode: RegenMode;
  targetText: string;
  prevText: string | null;
  nextText: string | null;
  storyContext: { fandomName: string; ship: string; toneNote: string };
  hint?: string;
}

const COMMON = (input: RegenInput) =>
  [
    `Fandom: ${input.storyContext.fandomName}. Ship: ${input.storyContext.ship}.`,
    input.storyContext.toneNote ? `Tone: ${input.storyContext.toneNote}.` : '',
    'Match the surrounding prose voice. Use the same POV and tense.',
    SYSTEM_INJECTION_NOTICE,
  ]
    .filter(Boolean)
    .join('\n\n');

export function build(input: RegenInput): { system: string; user: string } {
  switch (input.mode) {
    case 'regen':
      return {
        system:
          COMMON(input) +
          '\n\nRewrite the target paragraph in the same length and rhythm. Output only the new paragraph text — no preamble, no markdown.',
        user: [
          input.prevText ? `Previous paragraph: ${input.prevText}` : '',
          `Target paragraph (rewrite this): ${wrapUserInput(input.targetText)}`,
          input.nextText ? `Following paragraph: ${input.nextText}` : '',
          input.hint ? `Author hint: ${wrapUserInput(input.hint)}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      };
    case 'continue':
      return {
        system:
          COMMON(input) +
          '\n\nWrite continuation paragraphs. Output ~3-5 new paragraphs separated by blank lines. No preamble.',
        user: [
          input.prevText ? `Previous paragraph: ${input.prevText}` : '',
          `Continue from here (this is the last paragraph): ${wrapUserInput(input.targetText)}`,
          input.hint ? `Direction hint: ${wrapUserInput(input.hint)}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      };
    case 'expand':
      return {
        system:
          COMMON(input) +
          '\n\nInsert 1-2 details paragraphs RIGHT AFTER the target, fleshing out atmosphere, sensory detail, or interior thought. Do NOT rewrite the target. Output only the new inserted paragraphs separated by blank lines.',
        user: [
          `Target paragraph (insert after this): ${wrapUserInput(input.targetText)}`,
          input.nextText ? `Following paragraph: ${input.nextText}` : '',
        ].join('\n\n'),
      };
    case 'compress':
      return {
        system:
          COMMON(input) +
          '\n\nMerge the target with its following paragraph into a single tighter paragraph. Output only the merged paragraph.',
        user: [
          `First paragraph: ${wrapUserInput(input.targetText)}`,
          `Second paragraph (merge in): ${wrapUserInput(input.nextText ?? '')}`,
        ].join('\n\n'),
      };
  }
}
