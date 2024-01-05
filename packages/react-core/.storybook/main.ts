import path from 'path';

import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import runtime from '@open-data-capture/vite-plugin-runtime';

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
    'storybook-react-i18next'
  ],
  docs: {
    autodocs: 'tag'
  },
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  viteFinal(config) {
    return mergeConfig(config, {
      plugins: [runtime()]
    });
  }
};

export default config;
