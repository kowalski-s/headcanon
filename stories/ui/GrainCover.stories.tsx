import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentPropsWithoutRef } from 'react';
import { GrainCover } from '@/components/ui/GrainCover';

const meta: Meta<typeof GrainCover> = {
  title: 'UI/GrainCover',
  component: GrainCover,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof GrainCover>;

export const Poster: Story = {
  args: { from: '#160B22', to: '#E5A95A' },
  render: (args: ComponentPropsWithoutRef<typeof GrainCover>) => (
    <GrainCover {...args} className="aspect-[2/3] w-64 rounded-md">
      <span className="absolute inset-0 flex items-center justify-center font-display text-display-l text-ink">
        обложка
      </span>
    </GrainCover>
  ),
};
