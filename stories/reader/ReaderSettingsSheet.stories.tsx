import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReaderSettingsSheet } from '@/components/reader/ReaderSettingsSheet';
import { DEFAULT_SETTINGS } from '@/lib/reader/useReaderSettings';

const meta: Meta<typeof ReaderSettingsSheet> = {
  title: 'Reader/ReaderSettingsSheet',
  component: ReaderSettingsSheet,
};
export default meta;

type Story = StoryObj<typeof ReaderSettingsSheet>;

export const Open: Story = {
  args: {
    open: true,
    settings: DEFAULT_SETTINGS,
    onChange: () => {},
    onClose: () => {},
  },
};

export const LargeSize: Story = {
  args: {
    open: true,
    settings: { ...DEFAULT_SETTINGS, fontSize: 21, theme: 'sepia' },
    onChange: () => {},
    onClose: () => {},
  },
};
