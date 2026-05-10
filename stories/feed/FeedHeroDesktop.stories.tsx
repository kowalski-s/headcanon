import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FeedHeroDesktop } from '@/components/feed/FeedHeroDesktop';
import { heroStory } from '@/lib/fixtures/stories';

const meta: Meta<typeof FeedHeroDesktop> = {
  title: 'Feed/FeedHeroDesktop',
  component: FeedHeroDesktop,
  parameters: { viewport: { defaultViewport: 'desktop' } },
};
export default meta;

type Story = StoryObj<typeof FeedHeroDesktop>;

export const Default: Story = { args: { story: heroStory } };

export const NoWatch: Story = {
  args: { story: { ...heroStory, hasWatch: false, watchEpisodes: undefined } },
};
