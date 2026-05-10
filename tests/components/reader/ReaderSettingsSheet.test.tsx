// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReaderSettingsSheet } from '@/components/reader/ReaderSettingsSheet';
import { DEFAULT_SETTINGS } from '@/lib/reader/useReaderSettings';

describe('ReaderSettingsSheet', () => {
  it('renders font, size, theme controls when open', () => {
    render(
      <ReaderSettingsSheet
        open
        settings={DEFAULT_SETTINGS}
        onChange={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText(/шрифт/i)).toBeInTheDocument();
    expect(screen.getByText(/размер/i)).toBeInTheDocument();
    expect(screen.getByText(/тема/i)).toBeInTheDocument();
  });

  it('calls onChange when font button clicked', () => {
    const onChange = vi.fn();
    render(
      <ReaderSettingsSheet
        open
        settings={DEFAULT_SETTINGS}
        onChange={onChange}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /bodoni/i }));
    expect(onChange).toHaveBeenCalledWith('font', 'bodoni');
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ReaderSettingsSheet
        open={false}
        settings={DEFAULT_SETTINGS}
        onChange={() => {}}
        onClose={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
