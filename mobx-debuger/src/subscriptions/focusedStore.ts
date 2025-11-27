import {autorun, type IReactionDisposer} from 'mobx'
import {toPlain} from '../toPlain'
import {getAllPropertyDescriptors} from '../getAllPropertyDescriptors'

let disposeFocused: IReactionDisposer | null = null
let rafToken: number | null = null

type SendFunction = (event: string, payload: unknown) => void

const enqueueSend = (send: SendFunction, event: string, payload: unknown) => {
  if (rafToken !== null) {
    return
  }

  rafToken = requestAnimationFrame(() => {
    rafToken = null
    send(event, payload)
  })
}

export function watchFocusedStore(
  instance: any,
  storeId: string,
  send: SendFunction,
) {
  disposeFocused?.()

  const stateDesc =
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), 'state') ??
    Object.getOwnPropertyDescriptor(instance, 'state')

  const hasStateGetter = !!stateDesc?.get

  disposeFocused = autorun(
    () => {
      const stateToWatch = hasStateGetter ? instance.state : instance
      
      if (!hasStateGetter) {
        const descriptors = getAllPropertyDescriptors(stateToWatch)
        for (const [key, desc] of descriptors.entries()) {
          if (key === 'constructor' || typeof desc.value === 'function') {
            continue
          }
          try {
            void stateToWatch[key as string]
          } catch {
          }
        }
      } else {
        const state = instance.state
        if (state && typeof state === 'object') {
          const descriptors = getAllPropertyDescriptors(state)
          for (const [key, desc] of descriptors.entries()) {
            if (key === 'constructor' || typeof desc.value === 'function') {
              continue
            }
            try {
              void state[key as string]
            } catch {
            }
          }
        }
      }
      
      const snapshot = toPlain(stateToWatch, 3)

      enqueueSend(send, 'STORE_DUMP', {storeId, state: snapshot})
    },
    {name: `mobx-debugger:watch:${storeId}`},
  )
}

export function stopWatchingFocusedStore() {
  disposeFocused?.()
  disposeFocused = null

  if (rafToken !== null) {
    cancelAnimationFrame(rafToken)
    rafToken = null
  }
}
