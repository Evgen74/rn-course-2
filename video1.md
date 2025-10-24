# Видео 1: Знакомство с Unistyles

## О чем это видео

В этом видео изучаются основы работы с **Unistyles** - современной библиотекой для стилизации React Native приложений. Unistyles предоставляет мощную систему тем, responsive дизайн и улучшенную TypeScript поддержку.

## Структура проекта

```
src/
├── ui/              # Переиспользуемые UI компоненты
│   ├── Button.tsx   # Кнопка с вариантами стилей
│   ├── Card.tsx     # Карточка с изображением
│   ├── Header.tsx   # Заголовок экрана
│   └── LineItem.tsx # Элемент списка
├── style/           # Система стилей
│   ├── stylesheet.ts       # Конфигурация Unistyles
│   └── themes/             # Темы приложения
│       ├── light.ts         # Светлая тема
│       ├── dark.ts          # Темная тема
│       ├── breakpoints.ts   # Что-то типо медиа запросов в css
│       ├── colors/          # Цветовые палитры
│       ├── common.ts         # Общие стили
│       └── utils.ts          # Утилиты для работы с цветами
├── home/            # Главный экран
└── settings/        # Экран настроек
```

---

## 🔧 Основные концепции

### 1. Конфигурация Unistyles

**Файл:** `src/style/stylesheet.ts`

Первое, что нужно сделать - настроить Unistyles для работы с темами и breakpoints.

```typescript
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
    adaptiveThemes: true,  // Автоматическое переключение тем
  },
});
```

**Зачем это нужно:**
- Подключаем свои темы к TypeScript системе типов
- Настраиваем breakpoints для responsive дизайна
- Включаем автоматическое переключение между светлой и темной темой

---

### 2. Система тем

**Файлы:** `src/style/themes/light.ts`, `src/style/themes/dark.ts`

Темы состоят из общих стилей и цветов:

```typescript
// общие стили для всех тем
export const common = {
  spacings,    // Отступы
  roundings,   // Скругления
  typo,        // Типографика
  components,  // Переиспользуемые компоненты
} as const
```

```typescript
// цвета по умолчанию для светлой темы
export const lightDefault = {
  primary50: 'hsla(239, 100%, 82%, 1)',
  secondary10: 'hsla(240, 26%, 14%, 1)',
  // ... остальные цвета
} as const;

// цвета по умолчанию для темной темы
export const darkDefault = {
  primary50: 'hsla(240, 29%, 53%, 1)',
  secondary10: 'hsla(252, 22%, 95%, 1)',
  // ... остальные цвета
} as const;
```

**Преимущества:**
- Единая система дизайна
- Автоматическое переключение между темами
- TypeScript автодополнение для всех стилей

---

### 3. Responsive дизайн (Breakpoints)

**Файл:** `src/style/themes/breakpoints.ts`

```typescript
// взял из документации
export const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200
}
```

**Использование в компонентах:**

```typescript
const styles = StyleSheet.create((theme, rt) => {
  return {
    container: {
      // Разный цвет фона в зависимости от размера экрана
      backgroundColor: {
        sm: theme.colors.white,
        md: theme.colors.grapefruit50,
      },
    },
    cards: {
      // Вертикальная или горизонтальная ориентация
      flexDirection: rt.isPortrait ? 'column' : 'row',
    },
  };
});
```

**Зачем:**
- Адаптация UI под разные размеры экранов
- Поддержка планшетов и телефонов
- Оптимизация для landscape ориентации

---

### 4. Variants (Пропсы для пересчета стилей)

**Файл:** `src/ui/Button.tsx`

Unistyles поддерживает два типа вариантов:

#### Простые варианты (variants)
Для стилей, зависящих от одного пропса:

```typescript
// для задания стилей зависящих от одного пропса
variants: {
  size: {
    S: { paddingHorizontal: theme.spacings.x2 },
    M: { paddingHorizontal: theme.spacings.x4 },
    L: { paddingHorizontal: theme.spacings.x6 },
  },
  mode: {
    contained: { borderColor: 'transparent' },
    outlined: { backgroundColor: 'transparent' },
    text: { backgroundColor: 'transparent' },
  },
}
```

#### Составные варианты (compoundVariants)
Для стилей, зависящих от нескольких пропсов одновременно:

```typescript
// для задания стилей зависящих от несокльких пропсов
compoundVariants: [
  {
    isDisabled: false,
    style: 'primary',
    styles: {
      backgroundColor: theme.colors.primary50,
      borderColor: theme.colors.primary50,
    },
  },
  {
    isDisabled: true,
    style: 'primary',
    styles: {
      backgroundColor: modifyLight(theme.colors.primary50, 10),
      borderColor: modifyLight(theme.colors.primary50, 10),
    },
  },
]
```

**Применение в компоненте:**

```typescript
// для прокидывания пропсов в стили
styles.useVariants({
  isDisabled,
  style,
  mode,
  size,
});
```

**Результат:**
- Простая верстка компонентов
- Стили полностью отдельно

---

### 5. Интеграция с reanimated

**Файл:** `src/home/HomeScreen.tsx`

Unistyles интегрируется с react-native-reanimated для плавных переходов между темами:

```typescript
// получение анимированного значения цвета
const color = useAnimatedVariantColor(styles.container, 'backgroundColor');
const animatedStyle = useAnimatedStyle(() => {
  return {
    backgroundColor: withTiming(color.value, {
      duration: 500,
    }),
  };
});
```

**Зачем:**
- Плавное переключение между темами
- Анимированные изменения цветов и вообще любых параметров

---

## 🔗 Навигация по файлам

- **[Button.tsx](src/ui/Button.tsx)** - Компонент кнопки с вариантами
- **[HomeScreen.tsx](src/home/HomeScreen.tsx)** - Главный экран с демо
- **[stylesheet.ts](src/style/stylesheet.ts)** - Конфигурация Unistyles
- **[breakpoints.ts](src/style/themes/breakpoints.ts)** - Точки останова
- **[default.ts](src/style/themes/colors/default.ts)** - Цветовые палитры
- **[common.ts](src/style/themes/common.ts)** - Общие стили
- **[Header.tsx](src/ui/Header.tsx)** - Компонент заголовка
- **[Settings.tsx](src/settings/Settings.tsx)** - Экран настроек

---

## 📚 Дополнительные ресурсы

- [Документация Unistyles](https://reactnativeunistyles.com/)
