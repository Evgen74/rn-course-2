import { StyleSheet } from 'react-native-unistyles';
import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';
import { lightGreenTheme, darkGreenTheme } from './themes/green';
import { lightSkyBlueTheme, darkSkyBlueTheme } from './themes/skyBlue';
import { breakpoints } from './themes/breakpoints';
import { initialTheme } from '../../modules/theme-manager/src/native';

const appThemes = {
  lightDefault: lightTheme,
  darkDefault: darkTheme,
  lightGreen: lightGreenTheme,
  darkGreen: darkGreenTheme,
  lightSkyBlue: lightSkyBlueTheme,
  darkSkyBlue: darkSkyBlueTheme,
};

export type AppTheme = keyof typeof appThemes;

export type AppThemes = typeof appThemes;
type AppBreakpoints = typeof breakpoints;

// для правильной работы с типами
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// без этого ничего не будет работать
StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    adaptiveThemes: false,
    initialTheme: initialTheme as keyof AppThemes,
  },
});
