import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChapterListItem } from '@/components/story/ChapterListItem';

const meta: Meta<typeof ChapterListItem> = {
  title: 'Story/ChapterListItem',
  component: ChapterListItem,
};
export default meta;

type Story = StoryObj<typeof ChapterListItem>;

export const Read: Story = {
  args: {
    storyId: 's1',
    chapter: { n: 1, title: 'первый матч', minutes: 4, state: 'read' },
  },
};

export const Reading: Story = {
  args: {
    storyId: 's1',
    chapter: { n: 7, title: 'полночное чтиво', minutes: 4, state: 'reading' },
  },
};

export const Unread: Story = {
  args: {
    storyId: 's1',
    chapter: { n: 8, title: 'утро воскресенья', minutes: 5, state: 'unread' },
  },
};

export const Locked: Story = {
  args: {
    storyId: 's1',
    chapter: { n: 14, title: 'финал сезона', minutes: 8, state: 'locked' },
  },
};

export const Generating: Story = {
  args: {
    storyId: 's1',
    chapter: { n: 9, title: 'пишется', minutes: 5, state: 'generating' },
  },
};
