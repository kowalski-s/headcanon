import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScotchTag } from '@/components/ui/ScotchTag';

const meta: Meta<typeof ScotchTag> = {
  title: 'UI/ScotchTag',
  component: ScotchTag,
};

export default meta;
type Story = StoryObj<typeof ScotchTag>;

export const SlowBurn: Story = { args: { children: '★ slow burn' } };
export const EnemiesToLovers: Story = {
  args: { children: 'enemies → lovers', rotate: 4 },
};
