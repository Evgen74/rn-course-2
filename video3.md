# Видео 3: RN сообщество и работа с клавиатурой

## Тут про использование react-native-keyboard-controller, в конце ссылке на интересные репозитории

## Установка

```bash
yarn add react-native-keyboard-controller
```

---

## 🔧 Провайдер

### 1. KeyboardProvider

**Файл:** `App.tsx`

Обертываем приложение в `KeyboardProvider` для работы библиотеки:

```typescript
import { KeyboardProvider } from 'react-native-keyboard-controller';

function App() {
  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={styles.container}>
        <Navigation />
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}
```

**Зачем:**
- Инициализирует контекст для работы с клавиатурой
- Предоставляет доступ к событиям клавиатуры во всем приложении

---

### 2. KeyboardAwareScrollView

**Файл:** `src/home/HomeScreen.tsx`

Компонент для автоматической прокрутки при появлении клавиатуры:

```typescript
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const Scroll = Animated.createAnimatedComponent(KeyboardAwareScrollView)

<Scroll
  style={[styles.container, animatedStyle]}
  contentContainerStyle={styles.contentContainer}
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="interactive"
  bottomOffset={60}
  extraKeyboardSpace={60}
>
  {/* Контент с TextInput */}
</Scroll>
```

**Преимущества:**
- Автоматическая прокрутка к активному полю ввода
- Плавные анимации появления/скрытия клавиатуры

---

### 3. KeyboardStickyView

**Файл:** `src/settings/Settings.tsx`

Компонент для элементов, которые должны оставаться видимыми над клавиатурой:

```typescript
import { KeyboardStickyView } from 'react-native-keyboard-controller';

<KeyboardStickyView style={styles.abs}>
  <Button text='Test' onPress={() => { }} style='primary'/>
</KeyboardStickyView>
```

**Зачем:**
- Кнопки и другие элементы остаются доступными при открытой клавиатуре
- Автоматически поднимаются вместе с клавиатурой
- Удобно для форм с кнопками действий

**Использование:**
- Обычно используется с `position: 'absolute'` и `bottom: 0`
- Элемент автоматически поднимается на высоту клавиатуры

---

## 🔗 Навигация по файлам

- **[App.tsx](App.tsx)** - Инициализация KeyboardProvider
- **[HomeScreen.tsx](src/home/HomeScreen.tsx)** - Использование KeyboardAwareScrollView
- **[Settings.tsx](src/settings/Settings.tsx)** - Использование KeyboardStickyView

---

## 📚 Дополнительные ресурсы

- [Документация react-native-keyboard-controller](https://kirillzyusko.github.io/react-native-keyboard-controller/)

## 📚 Для поиска пакетов и вдохновения
- **[React Native Directory](https://reactnative.directory/)** - Каталог проверенных библиотек для React Native с удобным поиском
- **[Software Mansion](https://github.com/software-mansion)** - Создатели Reanimated, Gesture Handler и других популярных библиотек. Высококачественные решения для анимаций и жестов
- **[Software Mansion Labs](https://github.com/software-mansion-labs)** - Экспериментальные проекты и инкубатор новых идей от Software Mansion
- **[Callstack](https://github.com/callstack)** - Официальные репозитории Callstack. Создатели React Native Paper, Repack и других инструментов для разработки
- **[Callstack Incubator](https://github.com/callstackincubator)** - Инкубатор новых проектов от Callstack. Здесь появляются инновационные решения до их официального релиза
