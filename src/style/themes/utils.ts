type HSLA = `hsla(${number}, ${number}%, ${number}%, ${number})`
type HSLAParsed = [number, number, number, number]
type CacheOperationTypes = 'setTransparency' | 'modyfyLight' | 'setLight'
type Cache = Record<string, HSLA>
type Transformed<T extends string[]> = { [I in keyof T]: number }

const HSLA_REGEXP = /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/

const colorsCache: Record<CacheOperationTypes, Cache> = {
  setTransparency: {},
  modyfyLight: {},
  setLight: {},
}

const transformToNumbers = <T extends string[]>(array: [...T]) =>
  array.map((item) => Number(item)) as Transformed<T>

const parseHSLA = (color: HSLA): HSLAParsed => {
  const [, h, s, l, a] = (color.match(HSLA_REGEXP) as unknown) as [
    string,
    string,
    string,
    string,
    string,
  ]

  return transformToNumbers([h, s, l, a])
}

const getCacheKey = (color: HSLA, modyfier: number): string =>
  `${color}_${modyfier}`

const getCachedValue = (
  color: HSLA,
  modyfier: number,
  operationType: CacheOperationTypes,
  computationFn: () => HSLA,
): HSLA => {
  const key = getCacheKey(color, modyfier)
  const cached = colorsCache[operationType][key]

  if (cached) {
    return cached
  }

  const computedValue = computationFn()
  colorsCache[operationType][key] = computedValue

  return computedValue
}

const makeHSLA = (parsed: HSLAParsed): HSLA =>
  `hsla(${parsed[0]}, ${parsed[1]}%, ${parsed[2]}%, ${parsed[3]})` as HSLA

export const modifyLight = (color: HSLA, arg: number): HSLA =>
  getCachedValue(color, arg, 'modyfyLight', () => {
    const parsedColor = parseHSLA(color)
    parsedColor[2] += arg

    return makeHSLA(parsedColor)
  })