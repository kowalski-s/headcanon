import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GrainCover } from '@/components/ui/GrainCover';

describe('<GrainCover>', () => {
  it('renders gradient with two color stops via inline style', () => {
    const { container } = render(<GrainCover from="#160B22" to="#E5A95A" />);
    const root = container.firstChild as HTMLElement;
    // jsdom normalises hex to rgb in computed style; check either form
    const styleStr = root.getAttribute('style') ?? root.style.background;
    expect(styleStr).toMatch(/#160B22|rgb\(22,\s*11,\s*34\)/i);
    expect(styleStr).toMatch(/#E5A95A|rgb\(229,\s*169,\s*90\)/i);
  });

  it('renders grain overlay layer', () => {
    const { container } = render(<GrainCover from="#000" to="#fff" />);
    const overlay = container.querySelector('[data-layer="grain"]');
    expect(overlay).toBeInTheDocument();
  });

  it('renders vignette layer', () => {
    const { container } = render(<GrainCover from="#000" to="#fff" />);
    const vignette = container.querySelector('[data-layer="vignette"]');
    expect(vignette).toBeInTheDocument();
  });
});
