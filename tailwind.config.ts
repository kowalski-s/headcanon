import type { Config } from 'tailwindcss';
// @ts-expect-error — JS preset without declaration file
import headcanonPreset from './handoff/tailwind.preset.js';

const config: Config = {
  presets: [headcanonPreset as Partial<Config>],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './stories/**/*.{ts,tsx}'],
};

export default config;
