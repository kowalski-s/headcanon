import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Ornament } from '@/components/ui/Ornament';

const meta: Meta<typeof Ornament> = {
  title: 'UI/Ornament',
  component: Ornament,
};

export default meta;
type Story = StoryObj<typeof Ornament>;

export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
