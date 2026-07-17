import * as React from 'react'

/** Debounces a value with a plain timeout — no external library. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  const latestValueRef = React.useRef(value)
  latestValueRef.current = value

  React.useEffect(() => {
    if (delayMs <= 0) {
      setDebouncedValue(value)
      return
    }

    const handler = setTimeout(() => {
      setDebouncedValue(latestValueRef.current)
    }, delayMs)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delayMs])

  return debouncedValue
}

export const SEARCH_DEBOUNCE_MS = 300

/**
 * Debounces trimmed search text for API queries.
 * `isPending` is true while the user is still typing (keeps current list visible).
 */
export function useDebouncedSearch(value: string, delayMs: number = SEARCH_DEBOUNCE_MS) {
  const trimmed = value.trim()
  const debouncedValue = useDebouncedValue(trimmed, delayMs)
  const isPending = trimmed !== debouncedValue

  return { debouncedValue, isPending }
}
