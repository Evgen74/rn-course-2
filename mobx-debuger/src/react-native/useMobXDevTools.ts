import {useEffect, useState} from 'react'
import {useRozeniteDevToolsClient} from '@rozenite/plugin-bridge'
import type {PluginEvents} from '../mobx-debugger'
import {storeRegistry} from '../../react-native'
import {sanitizeForJson} from '../shared/safeStringify'

export const useMobXDevTools = () => {
  const client = useRozeniteDevToolsClient<PluginEvents>({
    pluginId: 'mobx-debuger',
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (client) {
      storeRegistry.setSendFunction((event, payload) => {
        client.send(event as keyof PluginEvents, payload as any)
      })
    }
  }, [client])

  useEffect(() => {
    if (!client) {
      return
    }

    const sendStoresList = () => {
      const stores = storeRegistry.getStores()
      const list = stores.map((s: any) => ({
        id: String(s.id ?? s.name),
        name: String(s.name ?? s.constructor?.name ?? 'store'),
      }))

      client.send('stores-list', {stores: list})
    }

    const unsubscribe = storeRegistry.subscribe(sendStoresList)

    sendStoresList()

    return unsubscribe
  }, [client])

  useEffect(() => {
    if (!client) {
      return
    }

    const subSelect = client.onMessage('select-store', ({storeId}) => {
      setSelectedId(storeId)
      storeRegistry.focusStore(storeId)
    })

    const subReq = client.onMessage('request-store-snapshot', ({storeId}) => {
      const id = storeId ?? selectedId
      if (!id) {
        return
      }

      const dump = storeRegistry.getStoreDump(id)
      if (!dump) {
        return
      }

      client.send('store-snapshot', {storeId: id, state: dump.state})
    })

    const subInvoke = client.onMessage(
      'invoke-method',
      async ({storeId, name, args = []}) => {
        const result = await storeRegistry.callStoreMethod(storeId, name, args)
        client.send('method-result', {storeId, name, result})
      },
    )

    const subPatch = client.onMessage(
      'patch-state',
      ({storeId, path, value}) => {
        const result = storeRegistry.updateStoreValue(storeId, path, value)
        client.send('patch-result', {storeId, path, result})
      },
    )

    const subRequestMethods = client.onMessage(
      'request-methods',
      ({storeId}) => {
        const store = storeRegistry.getStore(storeId)
        if (store) {
          client.send('store-methods', {storeId, methods: store.methods})
        }
      },
    )

    const subRequestEnv = client.onMessage('request-env', ({storeId}) => {
      const store = storeRegistry.getStore(storeId)
      if (store && store.store && store.store.env) {
        try {
          const env = sanitizeForJson(store.store.env, {depth: 3})
          client.send('store-env', {storeId, env})
        } catch (error) {
          client.send('store-env', {
            storeId,
            env: {error: (error as Error).message},
          })
        }
      } else {
        client.send('store-env', {storeId, env: null})
      }
    })

    return () => {
      subSelect.remove()
      subReq.remove()
      subInvoke.remove()
      subPatch.remove()
      subRequestMethods.remove()
      subRequestEnv.remove()
    }
  }, [client, selectedId])

  useEffect(
    () => () => {
      storeRegistry.unfocusStore()
    },
    [],
  )

  return client
}
