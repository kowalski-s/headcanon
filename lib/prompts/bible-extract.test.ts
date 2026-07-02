import { describe, it, expect } from 'vitest';
import { build, BibleExtractSchema } from './bible-extract';

describe('bible-extract', () => {
  it('builds prompt', () => {
    const p = build({
      chapterText: 'Once...',
      priorWorldState: null,
      priorCharacterStates: [],
      characterRoster: ['A', 'B'],
    });
    expect(p.system).toMatch(/strict JSON/);
    expect(p.user).toMatch(/<user_input>Once/);
  });
  it('schema accepts valid', () => {
    const valid = {
      chapter_summary: 'sum',
      updated_world_state: {
        current_location: 'x',
        story_time: 'y',
        active_plot_threads: [],
        foreshadowing: [],
      },
      updated_character_states: [],
    };
    expect(BibleExtractSchema.parse(valid)).toEqual(valid);
  });
});
