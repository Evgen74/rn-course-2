import {isAction} from 'mobx'
import {getAllPropertyDescriptors} from './getAllPropertyDescriptors'

function detectFlow(fn: Function) {
  if (typeof (fn as any).isMobXFlow === 'boolean') {
    return (fn as any).isMobXFlow
  }

  const s = Function.prototype.toString.call(fn)

  return (
    /yield/.test(s) ||
    /\[native code\].*flow/i.test(s) ||
    /bound.*flow/i.test(fn.name)
  )
}

export type MethodInfo = {
  name: string
  kind: 'action' | 'flow' | 'method'
  arity: number
}

export function collectMethods(instance: any): MethodInfo[] {
  const prototypeMap = getAllPropertyDescriptors(Object.getPrototypeOf(instance))
  const instanceMap = getAllPropertyDescriptors(instance)
  
  const allDescriptors = new Map(prototypeMap)
  for (const [key, desc] of instanceMap.entries()) {
    if (!allDescriptors.has(key)) {
      allDescriptors.set(key, desc)
    }
  }
  
  const out: MethodInfo[] = []

  for (const [key, d] of allDescriptors.entries()) {
    if (key === 'constructor') {
      continue
    }

    const val = d.value
    if (typeof val === 'function') {
      const kind = isAction?.(val)
        ? 'action'
        : detectFlow(val)
          ? 'flow'
          : 'method'

      out.push({name: String(key), kind, arity: val.length})
    }
  }

  return out
}
