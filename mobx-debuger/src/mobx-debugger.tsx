import {useState, useEffect} from 'react'
import {useRozeniteDevToolsClient} from '@rozenite/plugin-bridge'
import {StateViewer} from './StateViewer'
import type {MethodInfo} from './collectMethods'
import './globals.css'

export interface PluginEvents extends Record<string, unknown> {
  'stores-list': {stores: {id: string; name: string}[]}
  'select-store': {storeId: string; options?: unknown}
  'request-store-snapshot': {storeId?: string}
  'store-snapshot': {storeId: string; state: unknown}
  STORE_DUMP: {storeId: string; state: unknown}
  'focus-store': {storeId: string}
  'invoke-method': {storeId: string; name: string; args?: unknown[]}
  'patch-state': {storeId: string; path: string; value: unknown}
  'request-methods': {storeId: string}
  'store-methods': {
    storeId: string
    methods: {name: string; kind: 'action' | 'flow' | 'method'; arity: number}[]
  }
  'method-result': {
    storeId: string
    name: string
    result: {ok: boolean; result?: unknown; error?: string}
  }
  'patch-result': {
    storeId: string
    path: string
    result: {ok: boolean; error?: string}
  }
  'request-env': {storeId: string}
  'store-env': {storeId: string; env: unknown}
}

const MobXDebuggerPanel = () => {
  const client = useRozeniteDevToolsClient<PluginEvents>({
    pluginId: 'mobx-debuger',
  })

  const [stores, setStores] = useState<
    {
      id: string
      name: string
    }[]
  >([])

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [selectedStoreState, setSelectedStoreState] = useState<unknown>(null)
  const [selectedStoreEnv, setSelectedStoreEnv] = useState<unknown>(null)
  const [methods, setMethods] = useState<MethodInfo[]>([])

  useEffect(() => {
    if (!client) {
      return
    }

    const subscription = client.onMessage('stores-list', (data) => {
      setStores(data.stores)
    })

    const snapshotSubscription = client.onMessage('store-snapshot', (data) => {
      if (data.storeId === selectedStoreId) {
        setSelectedStoreState(data.state)
      }
    })

    const dumpSubscription = client.onMessage('STORE_DUMP', (data) => {
      if (data.storeId === selectedStoreId) {
        setSelectedStoreState(data.state)
      }
    })

    const methodsSubscription = client.onMessage('store-methods', (data) => {
      if (data.storeId === selectedStoreId) {
        setMethods(data.methods ?? [])
      }
    })

    const envSubscription = client.onMessage('store-env', (data) => {
      if (data.storeId === selectedStoreId) {
        setSelectedStoreEnv(data.env)
      }
    })

    return () => {
      subscription.remove()
      snapshotSubscription.remove()
      dumpSubscription.remove()
      methodsSubscription.remove()
      envSubscription.remove()
    }
  }, [client, selectedStoreId])

  const selectedStore = selectedStoreId
    ? stores.find((s) => s.id === selectedStoreId)
    : null

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId)
    setMethods([])
    setSelectedStoreEnv(null)
    setSelectedStoreState(null)
    if (client) {
      client.send('select-store', {storeId})
      client.send('request-store-snapshot', {storeId})
      client.send('request-methods', {storeId})
      client.send('request-env', {storeId})
    }
  }

  if (!client) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {'MobX Debugger'}
            </h2>
            <p className="text-gray-600">{'Connecting to React Native...'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="flex items-center justify-center py-5 px-5 bg-white border-b border-gray-200">
        <div className="text-center">
          <div className="w-15 h-15 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-3xl">{'🐛'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {'MobX Debugger'}
          </h1>
          <p className="text-sm text-gray-600">
            {stores.length} {'store'}
            {stores.length !== 1 ? 's' : ''} {'connected'}
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-2/5 border-r border-gray-200 bg-white flex flex-col min-h-0">
          <div className="text-base font-semibold text-gray-900 p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            {'Connected Stores'}
          </div>
          {stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8">
              <div className="text-5xl mb-4">{'📦'}</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                {'No stores connected'}
              </h3>
              <p className="text-xs text-gray-500 text-center">
                {'Use connectStore() to register your MobX stores'}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {stores.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedStoreId === item.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                  onClick={() => handleStoreSelect(item.id)}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </span>
                    <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                      <span className="text-xs font-semibold text-green-600">
                        {'Live'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {'ID: '}
                    {item.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white">
          <div className="text-base font-semibold text-gray-900 p-4 bg-gray-50 border-b border-gray-200">
            {selectedStore ? `${selectedStore.name} State` : 'State Viewer'}
          </div>
          <div className="h-full overflow-auto">
            {selectedStore && selectedStoreState ? (
              <StateViewer
                state={selectedStoreState}
                env={selectedStoreEnv}
                methods={methods}
                storeId={selectedStore.id}
                onUpdateValue={(storeId, path, value) => {
                  if (client) {
                    client.send('patch-state', {storeId, path, value})
                  }
                }}
                onCallMethod={(storeId, methodName, parameters) => {
                  if (client) {
                    client.send('invoke-method', {
                      storeId,
                      name: methodName,
                      args: parameters,
                    })
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-5xl mb-4">{'👈'}</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                  {'Select a store to view its state'}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobXDebuggerPanel
