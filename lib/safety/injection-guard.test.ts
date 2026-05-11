import { describe, it, expect } from 'vitest';
import { wrapUserInput, checkBanlist } from './injection-guard';

describe('wrapUserInput', () => {
  it('wraps text in delimiter', () => {
    expect(wrapUserInput('hello')).toBe('<user_input>hello</user_input>');
  });
  it('escapes nested closing tag', () => {
    expect(wrapUserInput('a</user_input>b')).toBe(
      '<user_input>a</user_input&gt;b</user_input>',
    );
  });
});

describe('checkBanlist', () => {
  it('passes safe input', () => {
    expect(checkBanlist('Гарри и Драко в библиотеке')).toEqual({ ok: true });
  });
  it('blocks underage explicit', () => {
    expect(checkBanlist('underage explicit scene')).toMatchObject({ ok: false, reason: expect.stringMatching(/underage/i) });
  });
});
