# Видео 4: Создание плагина для Rozenite DevTools

## О чем это видео

В этом видео изучается создание плагина для **Rozenite DevTools** на примере плагина `mobx-debuger`. Rozenite позволяет создавать кастомные панели для отладки React Native приложений, которые работают в браузере и обмениваются данными с мобильным приложением через свой мост на websocket

## Структура плагина

```
mobx-debuger/
├── src/                        # Исходный код плагина
│   ├── mobx-debugger.tsx      # Веб-панель (React компонент)
│   ├── store-registry.ts      # Реестр MobX сторов (общий код)
│   ├── StateViewer.tsx        # Компонент просмотра состояния
│   ├── react-native/          # Код для React Native приложения
│   │   ├── useMobXDevTools.ts # Хук для подключения к DevTools
│   │   └── store-registry.ts  # Реэкспорт реестра
│   └── ui/                    # UI компоненты панели
├── dist/                      # Собранные файлы (генерируется)
├── rozenite.config.ts         # Конфигурация плагина
├── vite.config.ts             # Конфигурация Vite
├── react-native.ts            # Точка входа для RN приложения
└── package.json
```

---

## 🔧 Основные концепции

### 1. Конфигурация плагина

**Файл:** `mobx-debuger/rozenite.config.ts`

Описывает панель, которая появится и откуда брать UI:

```typescript
export default {
  name: 'mobx-debuger',
  panels: [
    {
      name: 'MobX Debugger',
      source: './src/mobx-debugger.tsx',
    },
  ],
};
```

**Зачем это нужно:**
- Определяет имя плагина (используется для идентификации)
- Указывает путь к React компоненту панели

---

### 2. Настройка Vite с Rozenite плагином

**Файл:** `mobx-debuger/vite.config.ts`

Для сборки веб-части плагина используется Vite с специальным плагином, тут все стандартно, генерируется само:

```typescript
import { rozenitePlugin } from '@rozenite/vite-plugin';

export default defineConfig({
  plugins: [rozenitePlugin()],
  build: {
    outDir: './dist',
    // ...
  },
});
```

---

### 3. Создание веб-панели

**Файл:** `mobx-debuger/src/mobx-debugger.tsx`

Веб-панель - это обычный React компонент, который использует `useRozeniteDevToolsClient` для связи с React Native приложением:

```typescript
import {useRozeniteDevToolsClient} from '@rozenite/plugin-bridge'

export interface PluginEvents extends Record<string, unknown> {
  'stores-list': {stores: {id: string; name: string}[]}
  'select-store': {storeId: string}
  'store-snapshot': {storeId: string; state: unknown}
  // ... другие события
}

const MobXDebuggerPanel = () => {
  const client = useRozeniteDevToolsClient<PluginEvents>({
    pluginId: 'mobx-debuger',
  })

  useEffect(() => {
    if (!client) return

    // Подписка на события от React Native
    const subscription = client.onMessage('stores-list', (data) => {
      setStores(data.stores)
    })

    return () => subscription.remove()
  }, [client])

  // Отправка сообщений в React Native
  const handleStoreSelect = (storeId: string) => {
    if (client) {
      client.send('select-store', {storeId})
    }
  }

  return (
    <div className="h-screen bg-gray-100">
      {/* UI панели */}
    </div>
  )
}
```

**Ключевые моменты:**
- `PluginEvents` - TypeScript интерфейс всех событий плагина
- `useRozeniteDevToolsClient` - хук для получения клиента связи
- `client.onMessage()` - подписка на события от RN
- `client.send()` - отправка сообщений в RN
- `pluginId` должен совпадать с именем в `rozenite.config.ts`

---

### 4. React Native часть плагина

**Файл:** `mobx-debuger/react-native.ts`

Этот код скопировал у другиз библиотек, используется для предоставления API в RN:

```typescript
import {storeRegistry, connectStore as _connectStore} from './src/store-registry'
import type {useMobXDevTools as _useMobXDevTools} from './src/react-native/useMobXDevTools'

export let useMobXDevTools: typeof _useMobXDevTools
export let connectStore: typeof _connectStore

const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
  useMobXDevTools = require('./src/react-native/useMobXDevTools').useMobXDevTools
  connectStore = _connectStore
} else {
  useMobXDevTools = () => null
  connectStore = () => () => {}
}

export {storeRegistry}
```

**Зачем:**
- Экспортирует API для использования в приложении
- Отключает функциональность в production сборке

---

### 5. Хук для подключения к DevTools

**Файл:** `mobx-debuger/src/react-native/useMobXDevTools.ts`

Хук устанавливает связь между React Native приложением и веб-панелью:

```typescript
import {useRozeniteDevToolsClient} from '@rozenite/plugin-bridge'

export const useMobXDevTools = () => {
  const client = useRozeniteDevToolsClient<PluginEvents>({
    pluginId: 'mobx-debuger',
  })

  useEffect(() => {
    if (client) {
      // Настройка функции отправки сообщений
      storeRegistry.setSendFunction((event, payload) => {
        client.send(event as keyof PluginEvents, payload as any)
      })
    }
  }, [client])

  useEffect(() => {
    if (!client) return

    // Подписка на события от веб-панели
    const subSelect = client.onMessage('select-store', ({storeId}) => {
      storeRegistry.focusStore(storeId)
    })

    const subInvoke = client.onMessage('invoke-method', async ({storeId, name, args}) => {
      const result = await storeRegistry.callStoreMethod(storeId, name, args)
      client.send('method-result', {storeId, name, result})
    })

    return () => {
      subSelect.remove()
      subInvoke.remove()
    }
  }, [client])

  return client
}
```

**Как работает:**
- Использует тот же `useRozeniteDevToolsClient` с тем же `pluginId`
- Настраивает двустороннюю связь между RN и веб-панелью
- Обрабатывает команды от веб-панели и отправляет результаты обратно

---

### 6. Использование плагина в приложении

**Файл:** `App.tsx` или любой другой компонент

```typescript
import {useMobXDevTools, connectStore} from 'mobx-debuger/react-native'
import {themeStore} from './src/settings/themeStore'

function App() {
  // Подключение к DevTools
  useMobXDevTools()

  return (
    // ...
  )
}

// Потом в любом месте регистрация стора чтобы появился в веб панели
useEffect(() => {
  // Регистрация стора для отладки
  const disconnect = connectStore('ThemeStore', themeStore)
  return disconnect
}, [])
```

**Шаги:**
1. Вызвать `useMobXDevTools()` в корневом компоненте
2. Зарегистрировать сторы через `connectStore(name, store)`
3. Открыть DevTools в браузере и увидеть панель плагина

---

### 7. Реестр сторов (общий код)

**Файл:** `mobx-debuger/src/store-registry.ts`

Реестр управляет зарегистрированными сторами и отслеживает их изменения:

```typescript
class StoreRegistry {
  private stores: Map<string, RegisteredStore> = new Map()
  private sendFunction: ((event: string, payload: any) => void) | null = null

  register(name: string, store: any): () => void {
    const id = `${name}_${Date.now()}`
    
    // Отслеживание изменений через MobX autorun
    const disposer = autorun(() => {
      registered.state = toPlain(store.state)
      this.notifyListeners()
      
      // Отправка обновлений в веб-панель
      if (this.sendFunction) {
        this.sendFunction('STORE_DUMP', {storeId: id, state: registered.state})
      }
    })

    this.stores.set(id, registered)
    return () => {
      disposer()
      this.stores.delete(id)
    }
  }
}

export const storeRegistry = new StoreRegistry()
export const connectStore = (name: string, store: any) =>
  storeRegistry.register(name, store)
```

---

## 🔗 Навигация по файлам

- **[rozenite.config.ts](mobx-debuger/rozenite.config.ts)** - Конфигурация плагина
- **[vite.config.ts](mobx-debuger/vite.config.ts)** - Настройка сборки
- **[mobx-debugger.tsx](mobx-debuger/src/mobx-debugger.tsx)** - Веб-панель DevTools
- **[useMobXDevTools.ts](mobx-debuger/src/react-native/useMobXDevTools.ts)** - Хук для RN приложения
- **[store-registry.ts](mobx-debuger/src/store-registry.ts)** - Реестр сторов
- **[react-native.ts](mobx-debuger/react-native.ts)** - Точка входа для RN
- **[App.tsx](App.tsx)** - Пример использования плагина

---

## 📚 Дополнительные ресурсы

- [Документация Rozenite](https://rozenite.dev/)
- [@rozenite/plugin-bridge](https://www.npmjs.com/package/@rozenite/plugin-bridge) - Библиотека для связи между RN и веб-панелью

