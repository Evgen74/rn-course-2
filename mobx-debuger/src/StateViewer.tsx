import {useState, useMemo, useEffect} from 'react'
import {StateTree} from './ui/StateTree'

interface StateViewerProps {
  state: unknown
  env: unknown
  methods: {
    name: string
    kind: 'action' | 'flow' | 'method'
    arity: number
  }[]
  storeId: string
  onUpdateValue: (storeId: string, path: string, value: unknown) => void
  onCallMethod: (
    storeId: string,
    methodName: string,
    parameters: unknown[],
  ) => void
}

interface CallingMethod {
  name: string
  kind: 'action' | 'flow' | 'method'
  arity: number
}

export const StateViewer = ({
  state,
  env,
  methods,
  storeId,
  onUpdateValue,
  onCallMethod,
}: StateViewerProps) => {
  const [callingMethod, setCallingMethod] = useState<CallingMethod | null>(null)
  const [methodArgs, setMethodArgs] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isEnvExpanded, setIsEnvExpanded] = useState<boolean>(true)

  useEffect(() => {
    setIsEnvExpanded(true)
  }, [storeId])

  const handleMethodClick = (method: {
    name: string
    kind: 'action' | 'flow' | 'method'
    arity: number
  }) => {
    setCallingMethod(method)
    setMethodArgs('')
  }

  const filteredState = useMemo(() => {
    let stateToFilter = state
    if (state && typeof state === 'object' && 'state' in state && !Array.isArray(state)) {
      stateToFilter = (state as any).state
    }
    
    if (stateToFilter && typeof stateToFilter === 'object' && !Array.isArray(stateToFilter)) {
      const filtered: Record<string, unknown> = {}
      const allowedKeys = ['themeMode', 'palette', 'currentTheme']
      
      const keys = Object.keys(stateToFilter)
      
      for (const key of keys) {
        if (
          key.includes('Symbol') || 
          key.startsWith('_') || 
          key.endsWith('_') ||
          key.startsWith('$') ||
          key === 'Symbol(mobx administration)'
        ) {
          continue
        }
        
        if (allowedKeys.includes(key)) {
          filtered[key] = (stateToFilter as Record<string, unknown>)[key]
        }
      }
      
      stateToFilter = filtered
    }
    
    if (!searchTerm) {
      return stateToFilter
    }

    const filterObject = (obj: unknown, path = ''): unknown => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          return obj.map((item, index) =>
            filterObject(item, `${path}[${index}]`),
          )
        }

        const filtered: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key
          if (
            key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            currentPath.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            filtered[key] = value
          } else if (typeof value === 'object' && value !== null) {
            const nested = filterObject(value, currentPath)
            if (Object.keys(nested as Record<string, unknown>).length > 0) {
              filtered[key] = nested
            }
          }
        }

        return filtered
      }

      return obj
    }

    return filterObject(stateToFilter)
  }, [state, searchTerm])

  return (
    <>
        {methods.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              Methods
            </h3>
            <div className="space-y-2">
              {methods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-blue-800">
                        {method.name}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        method.kind === 'action' ? 'bg-green-100 text-green-800' :
                        method.kind === 'flow' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {method.kind}
                      </span>
                      {method.arity > 0 && (
                        <span className="text-xs text-blue-600">
                          ({method.arity} param{method.arity !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMethodClick(method)}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Run
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="m-4 space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search in state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {env !== null && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-yellow-900">
                  Environment
                </h3>
                <button
                  onClick={() => setIsEnvExpanded(!isEnvExpanded)}
                  className="px-2 py-1 text-xs text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100 border border-yellow-300 rounded transition-colors">
                  {isEnvExpanded ? '▼ Collapse' : '▶ Expand'}
                </button>
              </div>
              {isEnvExpanded && (
                <div className="mt-2">
                  <StateTree
                    storeId={`${storeId}-env`}
                    src={env}
                    onPatch={() => {}}
                  />
                </div>
              )}
            </div>
          )}

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div key={storeId}>
            <StateTree
              storeId={storeId}
              src={filteredState}
              onPatch={(path, value) => onUpdateValue(storeId, path, value)}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 Click on any value to edit it inline • Use search to filter large states
          </div>
        </div>
      </div>

      {callingMethod ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Call Method:{' '}
              <span className="font-mono text-sm">{callingMethod.name}</span>
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Argument:
              </label>
              <textarea
                value={methodArgs}
                onChange={(e) => setMethodArgs(e.target.value)}
                className="w-full h-24 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder='light or "light" or 42 or true'
              />
              <div className="mt-1 text-xs text-gray-500">
                Enter a single primitive value. Empty for no arguments.
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCallingMethod(null)
                  setMethodArgs('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!callingMethod) {
                    return
                  }

                  const trimmed = methodArgs.trim()
                  console.log('[MobXDebugger] Raw methodArgs input:', methodArgs)
                  
                  if (trimmed.length === 0) {
                    console.log(
                      '[MobXDebugger] No arguments provided, calling method with []',
                    )
                    onCallMethod(storeId, callingMethod.name, [])
                    setCallingMethod(null)
                    setMethodArgs('')
                    return
                  }

                  let value: any = trimmed

                  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length > 1) {
                    value = trimmed.slice(1, -1)
                  } else if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) {
                    value = trimmed.slice(1, -1)
                  } else {
                    const lower = trimmed.toLowerCase()
                    if (lower === 'true') {
                      value = true
                    } else if (lower === 'false') {
                      value = false
                    } else if (lower === 'null') {
                      value = null
                    } else if (/^-?\d+$/.test(trimmed)) {
                      value = parseInt(trimmed, 10)
                    } else if (/^-?\d+\.\d+$/.test(trimmed)) {
                      value = parseFloat(trimmed)
                    }
                  }

                  console.log(
                    `[MobXDebugger] Parsed argument for ${callingMethod.name}:`,
                    value,
                    `(type: ${value === null ? 'null' : typeof value})`,
                  )

                  onCallMethod(storeId, callingMethod.name, [value])
                  setCallingMethod(null)
                  setMethodArgs('')
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Run Method
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>• Enter a single primitive value: &quot;light&quot;, 42, true, false, null</p>
              <p>• Strings can be with or without quotes: light or &quot;light&quot;</p>
              <p>• Empty for no arguments</p>
              <p>• Examples: light, &quot;dark&quot;, 123, true, false, null</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
