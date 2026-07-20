import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MomentumPanel } from '@/components/desk/MomentumPanel';

const meta: Meta<typeof MomentumPanel> = {
  title: 'Desk/MomentumPanel',
  component: MomentumPanel,
  parameters: { layout: 'padded', nextjs: { appDirectory: true } },
};

export default meta;
type Story = StoryObj<typeof MomentumPanel>;

export const Filled: Story = {
  args: {
    streak: 9,
    sparkline: [0, 0, 120, 300, 0, 45, 0, 0, 500, 200, 0, 80, 150, 220],
    series: { title: 'Пепел и мята', chapters: 7, targetChapters: 10 },
  },
};

export const Empty: Story = {
  args: {
    streak: 0,
    sparkline: new Array(14).fill(0),
    series: null,
  },
};
