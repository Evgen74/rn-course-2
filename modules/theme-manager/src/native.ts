import { NitroModules } from 'react-native-nitro-modules';
import type { ThemeManager } from './ThemeManager.nitro';

export const ThemeManagerHybridObject =
  NitroModules.createHybridObject<ThemeManager>('ThemeManager');

export const initialTheme = `${ThemeManagerHybridObject.theme}${ThemeManagerHybridObject.palette}`;
