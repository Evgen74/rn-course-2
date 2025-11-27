import type {IReactionDisposer} from 'mobx'
import {autorun} from 'mobx'
import {getAllPropertyDescriptors} from './getAllPropertyDescriptors'
import {toPlain} from './toPlain'
import {collectMethods} from './collectMethods'
import {invokeMethod} from './invokeMethod'
import {patchState} from './patchState'
import {sanitizeForJson} from './shared/safeStringify'
import {
  watchFocusedStore,
  stopWatchingFocusedStore,
} from './subscriptions/focusedStore'

export interface RegisteredStore {
  id: string
  name: string
  store: any
  state: any
  fields?: Record<string, any>
  methods: {name: string; kind: 'action' | 'flow' | 'method'; arity: number}[]
  disposer?: IReactionDisposer
}

export interface StoreDump {
  id: string
  meta: {name: string}
  state?: any
  fields?: Record<string, any>
  methods?: {name: string; kind: 'action' | 'flow' | 'method'; arity: number}[]
}

class StoreRegistry {
  private stores: Map<string, RegisteredStore> = new Map()
  private listeners: Set<() => void> = new Set()
  private currentFocusedStoreId: string | null = null
  private sendFunction: ((event: string, payload: any) => void) | null = null

  setSendFunction(sendFn: (event: string, payload: any) => void) {
    this.sendFunction = sendFn
  }

  private extractMethods(store: any) {
    return collectMethods(store)
  }

  register(name: string, store: any): () => void {
    const id = `${name}_${Date.now()}`

    let state: any
    const fields: Record<string, any> = {}
    const stateDesc = getAllPropertyDescriptors(store).get('state')

    if (stateDesc?.get) {
      try {
        state = toPlain(store.state)
      } catch {
        state = '[error]'
      }
    } else {
      state = toPlain(store)
      const allProps = getAllPropertyDescriptors(store)
      for (const [key, desc] of allProps.entries()) {
        if (key !== 'state' && typeof desc.value !== 'function' && !desc.get) {
          fields[key] = desc.value
        }
      }
    }

    const registered: RegisteredStore = {
      id,
      name,
      store,
      state,
      fields: Object.keys(fields).length > 0 ? fields : undefined,
      methods: this.extractMethods(store),
    }

    const disposer = autorun(
      () => {
        try {
          registered.state = stateDesc?.get
            ? toPlain(store.state)
            : toPlain(store)
        } catch {
          registered.state = '[error]'
        }

        this.notifyListeners()
      },
      {name: `mobx-debugger:store:${id}`},
    )

    registered.disposer = disposer
    this.stores.set(id, registered)
    this.notifyListeners()

    return () => {
      disposer()
      this.stores.delete(id)
      this.notifyListeners()
    }
  }

  getStores(): RegisteredStore[] {
    return Array.from(this.stores.values())
  }

  getStore(id: string): RegisteredStore | undefined {
    return this.stores.get(id)
  }

  updateStoreValue(id: string, path: string, value: any) {
    const store = this.stores.get(id)
    if (!store) {
      return {ok: false, error: 'Store not found'}
    }

    try {
      patchState(store.store, path, value)

      return {ok: true}
    } catch (error) {
      return {ok: false, error: (error as Error).message}
    }
  }

  focusStore(storeId: string) {
    if (this.currentFocusedStoreId === storeId) {
      return
    }

    stopWatchingFocusedStore()

    const store = this.stores.get(storeId)
    if (!store || !this.sendFunction) {
      return
    }

    this.currentFocusedStoreId = storeId
    watchFocusedStore(store.store, storeId, this.sendFunction)
    this.sendFunction('STORE_METHODS', {storeId, methods: store.methods})
  }

  unfocusStore() {
    stopWatchingFocusedStore()
    this.currentFocusedStoreId = null
  }

  getStoreDump(id: string): StoreDump | null {
    const store = this.stores.get(id)
    if (!store) {
      return null
    }

    return sanitizeForJson({
      id: store.id,
      meta: {name: store.name},
      state: store.state,
      fields: store.fields,
      methods: store.methods,
    }) as StoreDump
  }

  async callStoreMethod(id: string, methodName: string, parameters: any[]) {
    const store = this.stores.get(id)
    if (!store) {
      return {ok: false, error: 'Store not found'}
    }

    try {
      const result = await invokeMethod(store.store, methodName, parameters)

      return {ok: true, result: sanitizeForJson(toPlain(result))}
    } catch (error) {
      return {ok: false, error: (error as Error).message}
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)

    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  clear() {
    this.stores.forEach((store) => store.disposer?.())
    this.stores.clear()
    this.notifyListeners()
  }
}

export const storeRegistry = new StoreRegistry()

export const connectStore = (name: string, store: any) =>
  storeRegistry.register(name, store)
