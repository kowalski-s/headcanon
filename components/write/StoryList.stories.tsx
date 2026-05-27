import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StoryList } from './StoryList';

const meta: Meta<typeof StoryList> = {
  title: 'Write/StoryList',
  component: StoryList,
};
export default meta;

export const WithStories: StoryObj<typeof StoryList> = {
  args: {
    stories: [
      { id: 'story-1', title: 'Где-то между нами', visibility: 'PRIVATE' },
      { id: 'story-2', title: 'Тень и Пепел', visibility: 'PUBLIC' },
    ],
  },
};

export const Empty: StoryObj<typeof StoryList> = {
  args: { stories: [] },
};
