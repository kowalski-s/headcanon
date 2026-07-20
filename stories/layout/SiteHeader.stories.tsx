import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { NewStoryButton } from '@/components/layout/NewStoryButton';

const meta: Meta<typeof SiteHeader> = {
  title: 'Layout/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
};

export default meta;
type Story = StoryObj<typeof SiteHeader>;

export const Desk: Story = {
  args: {
    active: 'desk',
    primaryAction: <NewStoryButton />,
  },
};

export const Feed: Story = {
  args: {
    active: 'feed',
  },
};
