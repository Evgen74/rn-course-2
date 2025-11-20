# Playground

React Native проект для изучения современных подходов к разработке:
- **Unistyles** - современная библиотека для стилизации приложений
- **NitroModules** - создание нативных модулей с TypeScript
- **Keyboard Controller** - работа с клавиатурой

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
yarn install
cd ios && pod install && cd ..
```

### 2. Запуск проекта

#### iOS

```bash
yarn ios
```

#### Android

```bash
yarn android
```

## 📁 Структура проекта

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
├── settings/        # Экран настроек
└── nav/             # Навигация

modules/             # Нативные модули
└── theme-manager/   # NitroModules модуль для управления темами
    ├── src/         # TypeScript код модуля
    │   ├── index.ts
    │   ├── module.ts
    │   ├── native.ts
    │   └── ThemeManager.nitro.ts
    ├── ios/         # iOS реализация (Swift)
    ├── android/     # Android реализация (Kotlin)
    └── nitro.json    # Конфигурация NitroModules
```

## 📚 Документация

Подробную информацию о концепциях и примерах использования можно найти в видео-материалах:

- **[video1.md](./video1.md)** - Знакомство с Unistyles: темы, breakpoints, variants
- **[video2.md](./video2.md)** - Создание NitroModules модуля для управления темами
- **[video3.md](./video3.md)** - Работа с клавиатурой и полезные ресурсы сообщества
