import { describe, it, expect } from 'vitest';
import { build } from './chapter';

describe('build chapter prompt', () => {
  it('builds first-chapter prompt with short length', () => {
    const out = build({
      fandomName: 'Harry Potter',
      ship: 'Drarry',
      tropes: ['enemies-to-lovers', 'slow-burn'],
      setting: 'year 7',
      tone: 'SLOW_BURN',
      premise: 'Letter arrives from unknown sender',
      chapterLength: 'short',
      chapterOrdinal: 1,
    });
    expect(out.system).toMatch(/Harry Potter/);
    expect(out.system).toMatch(/around 1500 words/i);
    expect(out.user).toMatch(/<user_input>Letter arrives/);
  });

  it('includes prior state for N>1', () => {
    const out = build({
      fandomName: 'HP', ship: 'Drarry', tropes: [], chapterLength: 'medium',
      chapterOrdinal: 3,
      priorState: {
        worldState: { current_location: 'library', story_time: 'Sept', active_plot_threads: ['letters'], foreshadowing: [] },
        characterStates: [{ character_name: 'Draco', emotional_state: 'guarded', recent_events: ['confronted X'], relationships: {}, arc_progress: 0.3, voice_traits_drift: [] }],
        summaries: ['Ch 1 summary.'],
        recentChapters: ['Full text ch 2 here.'],
      },
    });
    expect(out.system).toMatch(/guarded/);
    expect(out.system).toMatch(/Ch 1 summary/);
  });
});
