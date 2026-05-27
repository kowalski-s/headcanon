import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderInline } from './markdown-inline';

describe('renderInline', () => {
  it('renders bold and italic', () => {
    const { container } = render(<p>{renderInline('обычный **жирный** и *курсив*')}</p>);
    expect(container.querySelector('strong')?.textContent).toBe('жирный');
    expect(container.querySelector('em')?.textContent).toBe('курсив');
  });
  it('plain text без маркеров — без тегов', () => {
    const { container } = render(<p>{renderInline('просто текст')}</p>);
    expect(container.querySelector('strong')).toBeNull();
    expect(container.querySelector('em')).toBeNull();
    expect(container.textContent).toBe('просто текст');
  });
});
