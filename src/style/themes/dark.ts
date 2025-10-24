import { darkDefault } from './colors/default';
import { common } from './common';

export const darkTheme = {
  ...common,
  colors: darkDefault,
} as const;
