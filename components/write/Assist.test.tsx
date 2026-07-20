// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssistPanel, AssistSheet } from './Assist';
import type { ChatMessage } from './useAssist';

function mockChat(messages: ChatMessage[] = []) {
  return {
    messages,
    draft: '',
    setDraft: vi.fn(),
    busy: false,
    send: vi.fn(),
    expand: vi.fn(),
    retry: vi.fn(),
    accept: vi.fn(),
    dismiss: vi.fn(),
  };
}

const READY: ChatMessage = {
  id: 's1',
  kind: 'suggestion',
  teaser: 'Драко заговаривает первым',
  passage: 'Он обернулся медленно.',
  status: 'ready',
};

describe('AssistPanel (desktop)', () => {
  it('reflects open state via data-open / aria-hidden', () => {
    const chat = mockChat();
    const { rerender } = render(
      <AssistPanel open={false} onClose={() => {}} chat={chat} subtitle="видит гл. 7" />,
    );
    const panel = screen.getByRole('complementary', { hidden: true });
    expect(panel.getAttribute('data-open')).toBe('false');
    expect(panel.getAttribute('aria-hidden')).toBe('true');

    rerender(<AssistPanel open onClose={() => {}} chat={chat} subtitle="видит гл. 7" />);
    expect(screen.getByRole('complementary').getAttribute('data-open')).toBe('true');
  });

  it('calls onClose when collapse button clicked', () => {
    const onClose = vi.fn();
    render(<AssistPanel open onClose={onClose} chat={mockChat()} subtitle="видит гл. 7" />);
    fireEvent.click(screen.getByRole('button', { name: /Свернуть соавтора/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it('quick chips and expand affordance dispatch to the hook', () => {
    const chat = mockChat();
    render(<AssistPanel open onClose={() => {}} chat={chat} subtitle="видит гл. 7" />);
    fireEvent.click(screen.getByRole('button', { name: 'что дальше?' }));
    expect(chat.send).toHaveBeenCalledWith('что дальше?');
    fireEvent.click(screen.getByRole('button', { name: /развернуть в текст/ }));
    expect(chat.expand).toHaveBeenCalled();
  });

  it('Enter in the input sends the draft', () => {
    const chat = mockChat();
    render(<AssistPanel open onClose={() => {}} chat={chat} subtitle="видит гл. 7" />);
    fireEvent.keyDown(screen.getByLabelText('Сообщение соавтору'), { key: 'Enter' });
    expect(chat.send).toHaveBeenCalled();
  });
});

describe('AssistSheet (mobile) + suggestion card', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <AssistSheet open={false} onClose={() => {}} chat={mockChat()} subtitle="видит гл. 7" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('suggestion card wires в текст / иначе / мимо to the hook', () => {
    const chat = mockChat([READY]);
    render(<AssistSheet open onClose={() => {}} chat={chat} subtitle="видит гл. 7" />);
    expect(screen.getByText(/Драко заговаривает первым/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'в текст ✓' }));
    expect(chat.accept).toHaveBeenCalledWith('s1');
    fireEvent.click(screen.getByRole('button', { name: /иначе/ }));
    expect(chat.retry).toHaveBeenCalledWith('s1');
    fireEvent.click(screen.getByRole('button', { name: 'мимо' }));
    expect(chat.dismiss).toHaveBeenCalledWith('s1');
  });

  it('backdrop click closes the sheet', () => {
    const onClose = vi.fn();
    render(<AssistSheet open onClose={onClose} chat={mockChat()} subtitle="видит гл. 7" />);
    fireEvent.click(screen.getByRole('dialog').firstChild as Element);
    expect(onClose).toHaveBeenCalled();
  });
});
