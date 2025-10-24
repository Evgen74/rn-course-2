import { StyleSheet } from 'react-native-unistyles';
import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';
import { breakpoints } from './themes/breakpoints';

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
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
    adaptiveThemes: true,
  },
});
