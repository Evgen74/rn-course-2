import { UnistylesRuntime } from 'react-native-unistyles';
import type {
  FullTheme,
  Palette,
  ThemeManagerPayload,
} from './ThemeManager.nitro';
import { ThemeManagerHybridObject } from './native';

class ThemeManager {
  theme = ThemeManagerHybridObject.theme;
  palette = ThemeManagerHybridObject.palette;
  fullTheme = ThemeManagerHybridObject.fullTheme;

  constructor() {
    this.initSubscriptions();
  }

  updateColors = () => {
    UnistylesRuntime.setTheme(`${this.theme}${this.palette}`);
  };

  initSubscriptions = () => {
    ThemeManagerHybridObject.listen(
      ({ theme, fullTheme, palette }: ThemeManagerPayload) => {
        this.fullTheme = fullTheme;
        this.theme = theme;
        this.palette = palette;

        this.updateColors();
      },
    );
  };

  setTheme = (theme: FullTheme) => {
    ThemeManagerHybridObject.setTheme(theme);
  };

  setPalette = (palette: Palette) => {
    ThemeManagerHybridObject.setPalette(palette);
  };
}

export const themeManager = new ThemeManager();
