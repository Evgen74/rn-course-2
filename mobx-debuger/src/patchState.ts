import {runInAction} from 'mobx'
import {getAllPropertyDescriptors} from './getAllPropertyDescriptors'

function setNestedProperty(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      current[key] === null
    ) {
      current[key] = {}
    }

    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

export function patchState(instance: any, path: string, value: any) {
  const stateDesc =
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), 'state') ??
    Object.getOwnPropertyDescriptor(instance, 'state')

  const hasStateGetter = !!stateDesc?.get

  return runInAction(() => {
    if (hasStateGetter) {
      const st = instance.state
      if (path === 'state' && value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          ;(st as any)[k] = v
        }

        return
      }

      const [head, ...rest] = path.split('.')
      const targetDesc = Object.getOwnPropertyDescriptor(st, head)
      if (targetDesc?.get && !targetDesc.set && rest.length === 0) {
        throw new Error('read-only computed')
      }

      setNestedProperty(st as any, path.replace(/^state\./, ''), value)
    } else {
      const [head, ...rest] = path.split('.')
      
      const allDescriptors = getAllPropertyDescriptors(instance)
      const targetDesc = allDescriptors.get(head)
      
      if (targetDesc?.get && !targetDesc.set && rest.length === 0) {
        throw new Error(`Cannot modify read-only computed property: ${head}`)
      }

      const cleanPath = path.replace(/^state\./, '')
      
      if (!cleanPath.includes('.')) {
        const propDesc = allDescriptors.get(cleanPath)
        if (propDesc?.get && !propDesc.set) {
          throw new Error(`Cannot modify read-only computed property: ${cleanPath}`)
        }
        instance[cleanPath] = value
      } else {
        setNestedProperty(instance, cleanPath, value)
      }
    }
  })
}
