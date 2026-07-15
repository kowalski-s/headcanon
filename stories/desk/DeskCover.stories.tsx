import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DeskCover } from '@/components/desk/DeskCover';

const meta: Meta<typeof DeskCover> = {
  title: 'Desk/DeskCover',
  component: DeskCover,
  parameters: { layout: 'centered', nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DeskCover>;

export const Typographic: Story = {
  args: {
    story: {
      id: 's1',
      title: 'Пепел и мята',
      ordinalCount: 7,
      words: 12480,
      isPublished: false,
    },
  },
};

export const Gradient: Story = {
  args: {
    story: {
      id: 's2',
      title: 'Соль на рёбрах',
      ordinalCount: 12,
      words: 48210,
      isPublished: true,
      gradientClass: 'bg-gradient-to-br from-[#160B22] to-[#3D2A1C]',
    },
  },
};
