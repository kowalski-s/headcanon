import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PublishToggle } from './PublishToggle';

const meta: Meta<typeof PublishToggle> = {
  title: 'Write/PublishToggle',
  component: PublishToggle,
};
export default meta;

export const Private: StoryObj<typeof PublishToggle> = {
  args: { storyId: 'story-1', visibility: 'PRIVATE' },
};

export const Public: StoryObj<typeof PublishToggle> = {
  args: { storyId: 'story-2', visibility: 'PUBLIC' },
};
