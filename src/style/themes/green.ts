import { lightGreen } from './colors/green';
import { darkGreen } from './colors/green';
import { common } from './common';

export const lightGreenTheme = {
  ...common,
  colors: lightGreen,
} as const;

export const darkGreenTheme = {
  ...common,
  colors: darkGreen,
} as const;

