# Видео 2: Пишем модуль на nitro-modules

## О чем это видео

В этом видео изучается создание нативного модуля с использованием **NitroModules** - напишу простой модуль для хранения и установки темы приложения.

## создан отдельная папка с модулем, структура

```
modules/
└── theme-manager/          # Модуль для управления темами
    ├── src/                # JS часть
    │   ├── index.ts
    │   ├── module.ts
    │   ├── native.ts
    │   └── ThemeManager.nitro.ts
    ├── ios/                # iOS реализация
    │   └── ThemeManager.swift
    ├── android/            # Android реализация
    │   └── src/main/java/com/margelo/nitro/thememanager/
    │       └── ThemeManager.kt
    ├── nitro.json
    ├── package.json
    └── ThemeManager.podspec
```

---

## 🔧 Основные концепции

### 1. Определение интерфейса модуля

**Файл:** `modules/theme-manager/src/ThemeManager.nitro.ts`

Первым делом нужно определить TypeScript интерфейс модуля, который описывает его API:

```typescript
import type { HybridObject } from 'react-native-nitro-modules';

export type Theme = 'light' | 'dark';
export type FullTheme = 'light' | 'dark' | 'auto';

export interface ThemeManager
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  setTheme(theme: FullTheme): void;

  ...
}
```

**Зачем это нужно:**
- Определяет контракт между JS и нативным кодом
- Автоматически генерирует типы для Swift и Kotlin
- Обеспечивает типобезопасность на всех уровнях

---

### 2. Создание HybridObject

**Файл:** `modules/theme-manager/src/native.ts`

HybridObject - это мост между JS и нативным кодом:

```typescript
import { NitroModules } from 'react-native-nitro-modules';
import type { ThemeManager } from './ThemeManager.nitro';

export const ThemeManagerHybridObject =
  NitroModules.createHybridObject<ThemeManager>('ThemeManager');

```

**Зачем:**
- Создает связь между JS и нативной реализацией
- Позволяет вызывать нативные методы из JS
- Обеспечивает синхронный доступ к свойствам

---

### 3. Конфигурация NitroModules

**Файл:** `modules/theme-manager/nitro.json`

Конфигурационный файл для генерации кода:

```json
{
  "cxxNamespace": ["thememanager"],
  "ios": {
    "iosModuleName": "ThemeManager"
  },
  "android": {
    "androidNamespace": ["thememanager"],
    "androidCxxLibName": "thememanager"
  },
  "autolinking": {
    "ThemeManager": {
      "swift": "ThemeManager",
      "kotlin": "ThemeManager"
    }
  },
  "ignorePaths": ["node_modules"]
}
```

**Зачем:**
- Настраивает пространства имен для C++ кода
- Определяет имена модулей для iOS и Android
- Настраивает автолинкинг

---

### 4. Интеграция с приложением

**Файл:** `src/settings/Settings.tsx`

Использование модуля в React компоненте:

```typescript
import { themeManager } from '../../modules/theme-manager/src/';

export const Settings = ({ navigate }: WithNav<{}>) => {
  const [selectedThemeMode, setSelectedThemeMode] = useState<ThemeMode>(
    themeManager.fullTheme
  );
  const [selectedPalette, setSelectedPalette] = useState<PaletteType>(
    themeManager.palette
  );

  const handleThemeModePress = useCallback((themeMode: ThemeMode) => {
    themeManager.setTheme(themeMode);
    setSelectedThemeMode(themeMode);
  }, []);

  const handlePalettePress = useCallback((palette: PaletteType) => {
    themeManager.setPalette(palette);
    setSelectedPalette(palette);
  }, []);

  // ...
};
```

---

### 5. Настройка Unistyles

**Файл:** `src/style/stylesheet.ts`


```typescript
import { initialTheme } from '../../modules/theme-manager/src/native'; // такой импорт чтобы не было циклических

StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    adaptiveThemes: false,
    initialTheme,
  },
});
```

---

## 🔗 Навигация по файлам

- **[ThemeManager.nitro.ts](modules/theme-manager/src/ThemeManager.nitro.ts)** - TypeScript интерфейс модуля
- **[module.ts](modules/theme-manager/src/module.ts)** - JS обертка
- **[native.ts](modules/theme-manager/src/native.ts)** - Создание HybridObject
- **[ThemeManager.swift](modules/theme-manager/ios/ThemeManager.swift)** - iOS реализация
- **[ThemeManager.kt](modules/theme-manager/android/src/main/java/com/margelo/nitro/thememanager/ThemeManager.kt)** - Android реализация
- **[nitro.json](modules/theme-manager/nitro.json)** - Конфигурация NitroModules
- **[Settings.tsx](src/settings/Settings.tsx)** - Использование модуля в приложении
- **[stylesheet.ts](src/style/stylesheet.ts)** - Настройка Unistyles

---

## 📚 Дополнительные ресурсы

- [Документация nitro](https://nitro.margelo.com/)

