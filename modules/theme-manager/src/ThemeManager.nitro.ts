import type { HybridObject } from 'react-native-nitro-modules';

export type Theme = 'light' | 'dark';
export type FullTheme = 'light' | 'dark' | 'auto';
export type Palette = 'Default' | 'Green' | 'SkyBlue';

export type ThemeManagerPayload = {
  theme: Theme;
  palette: Palette;
  fullTheme: FullTheme;
};

export interface ThemeManager
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  setTheme(theme: FullTheme): void;
  setPalette(palette: Palette): void;

  listen(callback: (payload: ThemeManagerPayload) => void): void;

  readonly theme: Theme;
  readonly palette: Palette;
  readonly fullTheme: FullTheme;
}
