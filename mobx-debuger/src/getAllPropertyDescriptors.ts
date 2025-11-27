export function getAllPropertyDescriptors(obj: object) {
  const map = new Map<PropertyKey, PropertyDescriptor>()
  let cur: any = obj
  while (cur && cur !== Object.prototype) {
    for (const key of Reflect.ownKeys(cur)) {
      if (!map.has(key)) {
        const d = Object.getOwnPropertyDescriptor(cur, key)
        if (d) {
          map.set(key, d)
        }
      }
    }

    cur = Object.getPrototypeOf(cur)
  }

  return map
}
