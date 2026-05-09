/** headcanon — Tailwind preset
 *
 * Использование (tailwind.config.ts в репо):
 *
 *   import headcanonPreset from './handoff/tailwind.preset';
 *   export default {
 *     presets: [headcanonPreset],
 *     content: ['./app/**\/*.{ts,tsx}', './components/**\/*.{ts,tsx}'],
 *   };
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--hc-bg)',
          alt: 'var(--hc-bg-alt)',
          deep: 'var(--hc-bg-deep)',
        },
        surface: {
          DEFAULT: 'var(--hc-surface)',
          raised: 'var(--hc-surface-raised)',
        },
        ink: {
          DEFAULT: 'var(--hc-ink)',
          dim: 'var(--hc-ink-dim)',
          faint: 'var(--hc-ink-faint)',
        },
        amber: {
          DEFAULT: 'var(--hc-amber)',
          soft: 'var(--hc-amber-soft)',
        },
        rose: 'var(--hc-rose)',
        chrome: {
          1: 'var(--hc-chrome-1)',
          2: 'var(--hc-chrome-2)',
          3: 'var(--hc-chrome-3)',
        },
        border: {
          DEFAULT: 'var(--hc-border)',
          strong: 'var(--hc-border-strong)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bodoni Moda', 'serif'],
        body: ['var(--font-body)', 'EB Garamond', 'Georgia', 'serif'],
        ui: ['var(--font-ui)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xxl': ['78px', { lineHeight: '0.92', letterSpacing: '-0.01em' }],
        'display-xl':  ['56px', { lineHeight: '0.96' }],
        'display-l':   ['32px', { lineHeight: '1.0' }],
        'display-m':   ['22px', { lineHeight: '1.1' }],
        'display-s':   ['16px', { lineHeight: '1.15' }],
        'display-xs':  ['14px', { lineHeight: '1.2' }],
        'body-l':      ['16px', { lineHeight: '1.6' }],
        'body-m':      ['13px', { lineHeight: '1.5' }],
        'body-s':      ['12px', { lineHeight: '1.45' }],
        'ui-l':        ['14px', { lineHeight: '1.4' }],
        'ui-m':        ['12px', { lineHeight: '1.4' }],
        'mono-m':      ['11px', { lineHeight: '1.2' }],
        'mono-s':      ['9.5px', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        caps: '0.18em',
        tight: '0.01em',
      },
      borderRadius: {
        sm: 'var(--hc-radius-sm)',
        md: 'var(--hc-radius-md)',
        lg: 'var(--hc-radius-lg)',
        xl: 'var(--hc-radius-xl)',
        full: 'var(--hc-radius-full)',
      },
      boxShadow: {
        poster: 'var(--hc-shadow-poster)',
        'amber-glow': 'var(--hc-shadow-amber-glow)',
        'chrome-cta': 'var(--hc-shadow-chrome-cta)',
      },
      backgroundImage: {
        'chrome-gradient': 'var(--hc-chrome-gradient)',
        candle: 'var(--hc-candle)',
        vignette: 'var(--hc-vignette)',
      },
      transitionTimingFunction: {
        cinematic: 'var(--hc-ease-cinematic)',
      },
      transitionDuration: {
        cinematic: 'var(--hc-duration-base)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'candle-breath': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        'candle-breath': 'candle-breath 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
