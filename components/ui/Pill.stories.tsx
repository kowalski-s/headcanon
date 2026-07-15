import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pill } from './Pill';

const meta: Meta<typeof Pill> = { component: Pill, title: 'ui/Pill' };
export default meta;
type S = StoryObj<typeof Pill>;

export const Primary: S = { args: { variant: 'primary', children: 'продолжить гл. 7' } };
export const Ghost: S = { args: { variant: 'ghost', children: '☾ просто читать' } };
export const Hero: S = {
  args: {
    variant: 'hero',
    children: <span className="font-display italic">за стол →</span>,
  },
};
