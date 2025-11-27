import { makeAutoObservable } from 'mobx';
import { themeManager } from 'theme-manager';

export type PaletteType = 'Default' | 'Green' | 'SkyBlue';
export type ThemeMode = 'light' | 'dark' | 'auto';

export class ThemeStore {
  themeMode: ThemeMode = themeManager.fullTheme;
  palette: PaletteType = themeManager.palette;

  constructor() {
    makeAutoObservable(this);
  }

  setThemeMode(mode: ThemeMode) {
    this.themeMode = mode;
    themeManager.setTheme(mode);
  }

  setPalette(palette: PaletteType) {
    this.palette = palette;
    themeManager.setPalette(palette);
  }

  get currentTheme() {
    return {
      mode: this.themeMode,
      palette: this.palette,
      name: `${this.themeMode}${this.palette}`,
    };
  }
}

export const themeStore = new ThemeStore();

