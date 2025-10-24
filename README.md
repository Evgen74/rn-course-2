# Playground

React Native проект для изучения Unistyles - современной библиотеки для стилизации приложений.

... остальное добавлю позже

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
└── settings/        # Экран настроек
```

## 📚 Документация

Подробную информацию о концепциях и примерах использования можно найти в [video1.md](./video1.md).

## 🔗 Полезные ссылки

- [Unistyles документация](https://reactnativeunistyles.com/)
- [React Native документация](https://reactnative.dev/)

