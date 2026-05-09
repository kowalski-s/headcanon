import type { Preview } from '@storybook/nextjs-vite';
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'bg',
      values: [
        { name: 'bg', value: '#160B22' },
        { name: 'bg-alt', value: '#1F1230' },
        { name: 'bg-deep', value: '#06030C' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
