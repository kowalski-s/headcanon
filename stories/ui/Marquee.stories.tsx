import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Marquee } from '@/components/ui/Marquee';

const meta: Meta<typeof Marquee> = {
  title: 'UI/Marquee',
  component: Marquee,
};

export default meta;
type Story = StoryObj<typeof Marquee>;

export const FeedTopTicker: Story = {
  args: {
    items: [
      'полночное чтиво',
      'новые главы каждый вечер',
      '★ для тех, кто не спит',
      'эфемерные shipsы',
    ],
  },
};
