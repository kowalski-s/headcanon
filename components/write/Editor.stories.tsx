import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Editor } from './Editor';

const meta: Meta<typeof Editor> = {
  title: 'Write/Editor',
  component: Editor,
  args: { initialMarkdown: 'Первый абзац истории.\n\nВторой абзац.', onSave: () => {} },
};
export default meta;
export const Default: StoryObj<typeof Editor> = {};
