import { lightDefault } from './colors/default';
import { common } from './common';

export const lightTheme = {
  ...common,
  colors: lightDefault,
} as const;
