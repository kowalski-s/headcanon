import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MonoBadge } from '@/components/ui/MonoBadge';

const meta: Meta<typeof MonoBadge> = {
  title: 'UI/MonoBadge',
  component: MonoBadge,
};

export default meta;
type Story = StoryObj<typeof MonoBadge>;

export const Default: Story = { args: { children: 'EP 02 / 04' } };
export const Amber: Story = { args: { children: 'WATCH MODE', tone: 'amber' } };
export const Rose: Story = { args: { children: '♡ 142', tone: 'rose' } };
