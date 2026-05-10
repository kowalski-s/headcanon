import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TabBarMobile } from '@/components/feed/TabBarMobile';

const meta: Meta<typeof TabBarMobile> = {
  title: 'Feed/TabBarMobile',
  component: TabBarMobile,
};
export default meta;

type Story = StoryObj<typeof TabBarMobile>;

export const Feed: Story = { args: { active: 'feed' } };
export const Saved: Story = { args: { active: 'saved' } };
