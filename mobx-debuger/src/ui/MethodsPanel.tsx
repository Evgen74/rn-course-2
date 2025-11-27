import React, {useState} from 'react'
import type {MethodInfo} from '../collectMethods'

const JSON_INDENT = 2

type Props = {
  storeId: string
  methods: MethodInfo[]
  invoke: (
    name: string,
    args: unknown[],
  ) => Promise<{ok?: boolean; result?: unknown; error?: string}>
}

export const MethodsPanel = ({methods, invoke}: Props) => {
  const [argsText, setArgsText] = useState<Record<string, string>>({})
  const [last, setLast] = useState<
    Record<string, {ok?: boolean; error?: string; result?: unknown}>
  >({})

  const run = async (m: MethodInfo) => {
    const raw = (argsText[m.name] ?? '').trim()
    let args: unknown[] = []

    if (raw.length) {
      try {
        args = raw.startsWith('[') ? JSON.parse(raw) : [JSON.parse(raw)]
      } catch {
        setLast((prev) => ({...prev, [m.name]: {error: 'Invalid JSON format'}}))

        return
      }
    }

    const res = await invoke(m.name, args)

    setLast((prev) => ({...prev, [m.name]: res}))
  }

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">Methods</h3>
      <div className="space-y-2">
        {methods.map((m) => (
          <div key={m.name} className="method-row">
            <div className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm text-blue-800">
                    {m.name}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      m.kind === 'action'
                        ? 'bg-green-100 text-green-800'
                        : m.kind === 'flow'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                    {m.kind}
                  </span>
                  {m.arity > 0 && (
                    <span className="text-xs text-blue-600">
                      ({m.arity} param{m.arity !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <input
                    className="w-full p-2 text-xs border border-gray-300 rounded font-mono"
                    placeholder={
                      m.arity
                        ? `JSON args, arity ≈ ${m.arity}`
                        : 'JSON arg or [args]'
                    }
                    value={argsText[m.name] ?? ''}
                    onChange={(e) =>
                      setArgsText((p) => ({...p, [m.name]: e.target.value}))
                    }
                  />
                </div>
                {last[m.name] ? (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    {last[m.name].error ? (
                      <div className="text-red-600">
                        Error: {last[m.name].error}
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono">
                        {JSON.stringify(last[m.name].result, null, JSON_INDENT)}
                      </pre>
                    )}
                  </div>
                ) : null}
              </div>
              <button
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
                onClick={() => run(m)}>
                Run
              </button>
            </div>
          </div>
        ))}
        {methods.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            No public methods found.
          </div>
        )}
      </div>
    </div>
  )
}
