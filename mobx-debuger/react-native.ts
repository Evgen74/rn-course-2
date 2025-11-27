import {
  storeRegistry,
  connectStore as _connectStore,
} from './src/store-registry'
import type {useMobXDevTools as _useMobXDevTools} from './src/react-native/useMobXDevTools'

export let useMobXDevTools: typeof _useMobXDevTools
export let connectStore: typeof _connectStore

const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
  useMobXDevTools =
    require('./src/react-native/useMobXDevTools').useMobXDevTools

  connectStore = _connectStore
} else {
  useMobXDevTools = () => null
  connectStore = () => () => {}
}

export {storeRegistry}
