import { createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config/v5';

const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    standard: {
      ...(config.themes as Record<string, object>).light,
      background: '#ffffff',
      color: '#1a1a1a',
    },
    senior: {
      ...(config.themes as Record<string, object>).dark,
      background: '#000000',
      color: '#ffff00',
    },
    children: {
      ...(config.themes as Record<string, object>).light,
      background: '#fff9e6',
      color: '#333333',
    },
  },
});

export type AppConfig = typeof tamaguiConfig;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
