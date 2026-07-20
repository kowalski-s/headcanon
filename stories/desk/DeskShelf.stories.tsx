import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DeskShelf } from '@/components/desk/DeskShelf';

const meta: Meta<typeof DeskShelf> = {
  title: 'Desk/DeskShelf',
  component: DeskShelf,
  parameters: { layout: 'padded', nextjs: { appDirectory: true } },
};

export default meta;
type Story = StoryObj<typeof DeskShelf>;

export const Shelf: Story = {
  args: {
    stories: [
      {
        id: 's1',
        title: 'Пепел и мята',
        ordinalCount: 7,
        words: 12480,
        visibility: 'PRIVATE',
        isActive: true,
      },
      {
        id: 's2',
        title: 'Соль на рёбрах',
        ordinalCount: 12,
        words: 48210,
        visibility: 'PUBLIC',
        gradientClass: 'bg-gradient-to-br from-[#160B22] to-[#3D2A1C]',
      },
      {
        id: 's3',
        title: 'Тихий берег',
        ordinalCount: 1,
        words: 940,
        visibility: 'UNLISTED',
      },
    ],
  },
};
