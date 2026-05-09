import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const headcanonPreset = require('./handoff/tailwind.preset') as Partial<Config>;

const config: Config = {
  presets: [headcanonPreset],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './stories/**/*.{ts,tsx}'],
};

export default config;
