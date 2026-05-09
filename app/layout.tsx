import type { Metadata } from 'next';
import { Bodoni_Moda, EB_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Bodoni Moda: display headlines — latin only (Google Fonts has no cyrillic subset for Bodoni)
const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

// EB Garamond: body prose — has cyrillic, used for Russian fanfic text
const body = EB_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

// DM Sans: UI chrome — latin + latin-ext only (Google Fonts has no cyrillic subset for DM Sans;
// Cyrillic UI copy falls back to system sans-serif via the fontFamily stack)
const ui = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

// JetBrains Mono: metadata strings (episode, chapter counters) — latin only per spec
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Headcanon',
  description: 'AI-фанфик платформа с режимом просмотра историй как мини-сериалов',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${body.variable} ${ui.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
