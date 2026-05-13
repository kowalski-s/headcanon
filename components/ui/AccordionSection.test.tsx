// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccordionSection } from './AccordionSection';

describe('AccordionSection', () => {
  it('hides body by default and reveals on header click', () => {
    render(
      <AccordionSection title="маркировка" subtitle="рейтинг · категория">
        <span data-testid="body-content">body</span>
      </AccordionSection>,
    );
    expect(screen.queryByTestId('body-content')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /маркировка/ }));
    expect(screen.getByTestId('body-content')).toBeTruthy();
  });

  it('starts open if defaultOpen=true', () => {
    render(
      <AccordionSection title="x" defaultOpen>
        <span data-testid="body-content">body</span>
      </AccordionSection>,
    );
    expect(screen.getByTestId('body-content')).toBeTruthy();
  });
});
