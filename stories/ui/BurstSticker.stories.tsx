import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BurstSticker } from '@/components/ui/BurstSticker';

const meta: Meta<typeof BurstSticker> = {
  title: 'UI/BurstSticker',
  component: BurstSticker,
};

export default meta;
type Story = StoryObj<typeof BurstSticker>;

export const Hit: Story = { args: { label: '★ хит', rotate: -8 } };
export const NewLabel: Story = { args: { label: '✦ новое', rotate: 6 } };
