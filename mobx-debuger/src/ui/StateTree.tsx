import React, {useMemo, useState, useEffect, useCallback} from 'react'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'

type Props = {
  storeId: string
  src: unknown
  onPatch: (path: string, value: unknown) => void
}

const PLACEHOLDER_RX = /^\[(fn|depth|circular|ref:.*)\]$/

const toPath = (namespace: (string | number)[], name?: string | number) =>
  [...namespace, ...(name === undefined ? [] : [name])].map(String).join('.')

export const StateTree = ({storeId, src, onPatch}: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    setExpanded(new Set())
  }, [storeId])

  const shouldCollapse = useCallback(
    (field: {namespace: (string | number)[]; name?: string | number}) => {
      const p = toPath(field.namespace, field.name)

      return !expanded.has(p)
    },
    [expanded],
  )

  const onToggle = useCallback((ev: React.MouseEvent) => {
    const target = ev.target as HTMLElement
    const el = target.closest('[data-jsonview-keypath]') as HTMLElement | null

    if (!el) {
      return
    }

    const p = el.getAttribute('data-jsonview-keypath')

    if (!p) {
      return
    }

    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(p)) {
        next.delete(p)
      } else {
        next.add(p)
      }

      return next
    })
  }, [])

  const onEdit = (edit: {namespace: (string | number)[]; name?: string | number; new_value: unknown}) => {
    const path = toPath(edit.namespace, edit.name)
    const value = edit.new_value

    if (typeof value === 'string' && PLACEHOLDER_RX.test(value)) {
      return false
    }

    onPatch(path, value)

    return true
  }

  const memoSrc = useMemo(() => src, [src])

  return (
    <div className="state-tree">
      <div onClickCapture={onToggle}>
        <JsonView
          src={memoSrc as Record<string, unknown>}
          displayDataTypes={false}
          displayObjectSize={false}
          shouldCollapse={shouldCollapse}
          onEdit={onEdit}
          quotesOnKeys={false}
          groupArraysAfterLength={100}
          collapseStringsAfterLength={160}
          customizeNode={({node, indexOrName}) => {
            const path = toPath([], indexOrName)
            const isPlaceholder = typeof node === 'string' && PLACEHOLDER_RX.test(node)

            return {
              'data-jsonview-keypath': path,
              className: isPlaceholder ? 'json-placeholder' : undefined,
            }
          }}
        />
      </div>
    </div>
  )
}
