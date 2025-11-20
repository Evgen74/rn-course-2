import { lightSkyBlue } from './colors/skyBlue';
import { darkSkyBlue } from './colors/skyBlue';
import { common } from './common';

export const lightSkyBlueTheme = {
  ...common,
  colors: lightSkyBlue,
} as const;

export const darkSkyBlueTheme = {
  ...common,
  colors: darkSkyBlue,
} as const;

