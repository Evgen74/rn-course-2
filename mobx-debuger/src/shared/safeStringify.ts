const DANGEROUS_KEYS = new Set([
  'instance',
  'store',
  'raw',
  'original',
  'target',
  'root',
  'self',
])

function isPlainObject(v: unknown): boolean {
  if (v === null || typeof v !== 'object') {
    return false
  }

  const proto = Object.getPrototypeOf(v)

  return proto === Object.prototype || proto === null
}

type SanitizeOptions = {
  depth?: number
  seen?: WeakSet<object>
  trackComputed?: boolean
}

export function sanitizeForJson(
  input: unknown,
  options: SanitizeOptions = {},
): unknown {
  const {
    depth = 3,
    seen = new WeakSet<object>(),
    trackComputed = true,
  } = options

  if (input === null || input === undefined) {
    return input
  }

  const t = typeof input

  if (t === 'function') {
    return '[fn]'
  }

  if (t === 'symbol') {
    return String(input)
  }

  if (t === 'bigint') {
    return `${String(input)}n`
  }

  if (t !== 'object') {
    return input
  }

  if (seen.has(input)) {
    return '[circular]'
  }

  seen.add(input)

  if (Array.isArray(input)) {
    if (depth <= 0) {
      return '[depth]'
    }

    return input
      .slice(0, 200)
      .map((v) => sanitizeForJson(v, {depth: depth - 1, seen, trackComputed}))
  }

  const ctorName = (input as Record<string, unknown>)?.constructor?.name

  if (!isPlainObject(input)) {
    if (input instanceof Date) {
      return input.toISOString()
    }

    if (input instanceof RegExp) {
      return String(input)
    }

    if (input instanceof Map) {
      const obj: Record<string, unknown> = {}

      for (const [k, v] of input.entries()) {
        obj[String(k)] = sanitizeForJson(v, {
          depth: depth - 1,
          seen,
          trackComputed,
        })
      }

      return obj
    }

    if (input instanceof Set) {
      return Array.from(input.values()).map((v) =>
        sanitizeForJson(v, {depth: depth - 1, seen, trackComputed}),
      )
    }

    if (ctorName && /(Model|Store)$/i.test(ctorName)) {
      return `[ref:${ctorName}]`
    }
  }

  if (depth <= 0) {
    return '[depth]'
  }

  const out: Record<string, unknown> = {}

  for (const k of Object.keys(input)) {
    if (DANGEROUS_KEYS.has(k) || k.startsWith('__')) {
      continue
    }

    try {
      const desc = Object.getOwnPropertyDescriptor(input, k)
      const read = () => (input as Record<string, unknown>)[k]

      if (desc?.get && !desc.set) {
        if (trackComputed) {
          out[k] = sanitizeForJson(read(), {
            depth: depth - 1,
            seen,
            trackComputed,
          })
        } else {
          const {untracked} = require('mobx')
          out[k] = untracked(() =>
            sanitizeForJson(read(), {depth: depth - 1, seen, trackComputed}),
          )
        }
      } else {
        out[k] = sanitizeForJson(read(), {
          depth: depth - 1,
          seen,
          trackComputed,
        })
      }
    } catch {
      out[k] = '[error]'
    }
  }

  return out
}

export function safeStringify(
  value: unknown,
  options: SanitizeOptions = {},
): string {
  try {
    if (typeof value === 'string') {
      return value
    }

    const safe = sanitizeForJson(value, options)

    return JSON.stringify(safe)
  } catch {
    const seen = new WeakSet<object>()

    return JSON.stringify(value, (_k, v) => {
      if (typeof v === 'function') {
        return '[fn]'
      }

      if (typeof v === 'symbol') {
        return String(v)
      }

      if (typeof v === 'bigint') {
        return `${String(v)}n`
      }

      if (v && typeof v === 'object') {
        if (seen.has(v)) {
          return '[circular]'
        }

        seen.add(v)
      }

      return v
    })
  }
}
