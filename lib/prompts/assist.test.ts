import { describe, it, expect } from 'vitest';
import { buildChat, buildExpand, AssistSuggestionSchema, TEMPLATE_ID } from './assist';

const meta = {
  storyTitle: 'Зимний свет в подземельях',
  fandomName: 'Harry Potter',
  characters: ['Драко', 'Гермиона'],
  tropes: ['слоуберн', 'ангст'],
  chapterOrdinal: 7,
};

describe('assist prompt', () => {
  it('buildChat wraps user message and chapter text as data, keeps voice', () => {
    const { system, user } = buildChat({
      meta,
      chapterText: 'Снег падал четвёртый час.',
      message: 'как закончить сцену?',
      history: [{ role: 'user', content: 'привет' }],
    });
    expect(system).toContain('соавтор');
    expect(user).toContain('<user_input>как закончить сцену?</user_input>');
    expect(user).toContain('<user_input>Снег падал четвёртый час.</user_input>');
    expect(user).toContain('в главе 7');
  });

  it('buildExpand asks for teaser + passage JSON', () => {
    const { system, user } = buildExpand({ meta, chapterText: '…', instruction: 'разверни' });
    expect(system).toContain('teaser');
    expect(system).toContain('passage');
    expect(user).toContain('<user_input>разверни</user_input>');
  });

  it('suggestion schema is a flat object (structured-output safe)', () => {
    const parsed = AssistSuggestionSchema.parse({ teaser: 'ход', passage: 'проза' });
    expect(parsed.teaser).toBe('ход');
    expect(TEMPLATE_ID).toBe('writer_assist');
  });
});
