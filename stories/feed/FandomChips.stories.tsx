import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FandomChips } from '@/components/feed/FandomChips';
import { fandomChips } from '@/lib/fixtures/stories';

const meta: Meta<typeof FandomChips> = {
  title: 'Feed/FandomChips',
  component: FandomChips,
};
export default meta;

type Story = StoryObj<typeof FandomChips>;

export const Default: Story = {
  args: { chips: fandomChips, onSelect: () => {} },
};

export const NoActive: Story = {
  args: {
    chips: fandomChips.map((c) => ({ ...c, active: false })),
    onSelect: () => {},
  },
};
