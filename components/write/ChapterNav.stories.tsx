import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChapterNav } from './ChapterNav';

const meta: Meta<typeof ChapterNav> = {
  title: 'Write/ChapterNav',
  component: ChapterNav,
};
export default meta;

const chapters = [
  { id: 'ch-1', ordinal: 1, title: 'Пролог' },
  { id: 'ch-2', ordinal: 2, title: null },
  { id: 'ch-3', ordinal: 3, title: 'Встреча у моря' },
];

export const Default: StoryObj<typeof ChapterNav> = {
  args: {
    storyId: 'story-1',
    chapters,
    activeOrdinal: 1,
  },
};
