import {toJS, untracked, isObservable} from 'mobx'
import {getAllPropertyDescriptors} from './getAllPropertyDescriptors'

const MAX_DEPTH = 3
const MAX_ARRAY_LENGTH = 200

const DANGEROUS_KEYS = new Set([
  'instance',
  'store',
  'raw',
  'original',
  'target',
  'root',
  'self',
])

export function toPlain(
  input: unknown,
  depth = MAX_DEPTH,
  seen = new WeakSet(),
  isRoot = true,
): unknown {
  if (input === null || input === undefined) {
    return input
  }

  if (typeof input === 'function') {
    return '[fn]'
  }

  if (typeof input === 'symbol') {
    return String(input)
  }

  if (typeof input === 'bigint') {
    return `${String(input)}n`
  }

  if (typeof input !== 'object') {
    return input
  }

  if (seen.has(input)) {
    return '[circular]'
  }

  seen.add(input)

  if (isObservable?.(input)) {
    try {
      return toJS(input, {detectCycles: true, exportMapsAsObjects: true})
    } catch {
      /* fallthrough */
    }
  }

  if (Array.isArray(input)) {
    return input
      .slice(0, MAX_ARRAY_LENGTH)
      .map((v) => toPlain(v, depth - 1, seen, false))
  }

  if (depth <= 0) {
    return '[depth]'
  }

  if (input instanceof Date) {
    return input.toISOString()
  }

  if (input instanceof RegExp) {
    return String(input)
  }

  if (input instanceof Map) {
    const obj: Record<string, unknown> = {}
    for (const [k, v] of input.entries()) {
      obj[String(k)] = toPlain(v, depth - 1, seen, false)
    }

    return obj
  }

  if (input instanceof Set) {
    return Array.from(input.values()).map((v) => toPlain(v, depth - 1, seen, false))
  }

  const ctorName = (input as Record<string, unknown>)?.constructor?.name
  if (!isRoot && ctorName && /(Model|Store)$/i.test(ctorName)) {
    return `[ref:${ctorName}]`
  }

  const out: Record<string, unknown> = {}
  
  const allDescriptors = getAllPropertyDescriptors(input as object)

  for (const [key, desc] of allDescriptors.entries()) {
    if (key === 'constructor' || typeof desc.value === 'function') {
      continue
    }

    if (typeof key === 'symbol') {
      continue
    }

    const keyStr = String(key)
    
    if (
      DANGEROUS_KEYS.has(keyStr) || 
      keyStr.startsWith('__') || 
      keyStr.includes('Symbol') ||
      keyStr.endsWith('_') ||
      keyStr.startsWith('$')
    ) {
      continue
    }

    if (desc.get && !desc.set) {
      out[String(key)] = untracked(() => {
        try {
          return toPlain(
            (input as Record<string, unknown>)[key as string],
            depth - 1,
            seen,
            false,
          )
        } catch {
          return '[error]'
        }
      })
    } else if (desc.value !== undefined) {
      try {
        out[String(key)] = toPlain(
          (input as Record<string, unknown>)[key as string],
          depth - 1,
          seen,
          false,
        )
      } catch {
        out[String(key)] = '[error]'
      }
    } else if (desc.get && desc.set) {
      try {
        out[String(key)] = toPlain(
          (input as Record<string, unknown>)[key as string],
          depth - 1,
          seen,
          false,
        )
      } catch {
        out[String(key)] = '[error]'
      }
    }
  }

  return out
}
