import { describe, it, expect } from 'vitest';
import { build } from './chapter';

describe('build chapter prompt', () => {
  it('builds chapter prompt with focus + characters + all new hints', () => {
    const out = build({
      fandomName: 'Harry Potter',
      focusType: 'ROMANCE',
      characters: ['Гарри Поттер', 'Драко Малфой'],
      tropes: ['от врагов к возлюбленным', 'слоуберн'],
      rating: 'MATURE',
      category: 'SLASH',
      warnings: ['cntw'],
      pov: 'CLOSE_THIRD',
      tense: 'PAST',
      tones: ['SLOW_BURN', 'ANGST'],
      timeline: 'post',
      timelineNote: 'через 5 лет после битвы',
      genres: ['современная AU'],
      setting: 'Лондон, осень',
      premise: 'Случайная встреча в баре',
      chapterLength: 'short',
      chapterOrdinal: 1,
    });
    expect(out.system).toMatch(/Harry Potter/);
    expect(out.system).toMatch(/Focus: ROMANCE/);
    expect(out.system).toMatch(/Main characters: Гарри Поттер, Драко Малфой/);
    expect(out.system).toMatch(/Rating: MATURE/);
    expect(out.system).toMatch(/Category: SLASH/);
    expect(out.system).toMatch(/POV: close 3rd/);
    expect(out.system).toMatch(/Tense: past/);
    expect(out.system).toMatch(/Tones: slow burn, angst/);
    expect(out.system).toMatch(/Genres: современная AU/);
    expect(out.system).toMatch(/Timeline: post-canon — через 5 лет/);
    expect(out.system).toMatch(/around 1500 words/i);
    expect(out.user).toMatch(/<user_input>Случайная встреча/);
  });

  it('focus=GEN with single character omits ship-y guidance', () => {
    const out = build({
      fandomName: 'JJK',
      focusType: 'GEN',
      characters: ['Юдзи Итадори'],
      tropes: ['приключение'],
      chapterLength: 'short',
      chapterOrdinal: 1,
    });
    expect(out.system).toMatch(/Focus: GEN/);
    expect(out.system).toMatch(/Main characters: Юдзи Итадори/);
    expect(out.system).not.toMatch(/Rating:/);
    expect(out.system).not.toMatch(/Category:/);
  });

  it('includes prior state for N>1', () => {
    const out = build({
      fandomName: 'HP',
      focusType: 'ROMANCE',
      characters: ['Гарри', 'Драко'],
      tropes: [],
      chapterLength: 'medium',
      chapterOrdinal: 3,
      priorState: {
        worldState: {
          current_location: 'library',
          story_time: 'Sept',
          active_plot_threads: ['letters'],
          foreshadowing: [],
        },
        characterStates: [
          {
            character_name: 'Draco',
            emotional_state: 'guarded',
            recent_events: [],
            relationships: {},
            arc_progress: 0.3,
            voice_traits_drift: [],
          },
        ],
        summaries: ['Ch 1 summary.'],
        recentChapters: ['Full ch 2.'],
      },
    });
    expect(out.system).toMatch(/guarded/);
    expect(out.system).toMatch(/Ch 1 summary/);
  });
});
