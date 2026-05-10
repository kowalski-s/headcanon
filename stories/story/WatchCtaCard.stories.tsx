import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WatchCtaCard } from '@/components/story/WatchCtaCard';
import { heroStory } from '@/lib/fixtures/stories';

const meta: Meta<typeof WatchCtaCard> = {
  title: 'Story/WatchCtaCard',
  component: WatchCtaCard,
};
export default meta;

type Story = StoryObj<typeof WatchCtaCard>;

export const Default: Story = { args: { story: heroStory } };

export const NoWatch: Story = {
  args: { story: { ...heroStory, hasWatch: false } },
};
