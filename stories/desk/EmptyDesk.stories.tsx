import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmptyDesk } from '@/components/desk/EmptyDesk';

const meta: Meta<typeof EmptyDesk> = {
  title: 'Desk/EmptyDesk',
  component: EmptyDesk,
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
};

export default meta;
type Story = StoryObj<typeof EmptyDesk>;

export const GuidedStart: Story = {};
