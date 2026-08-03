import * as React from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    if (delayMs <= 0) return

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delayMs])

  if (delayMs <= 0) return value
  return debouncedValue
}

export const SEARCH_DEBOUNCE_MS = 300

export function useDebouncedSearch(value: string, delayMs: number = SEARCH_DEBOUNCE_MS) {
  const trimmed = value.trim()
  const debouncedValue = useDebouncedValue(trimmed, delayMs)
  const isPending = trimmed !== debouncedValue

  return { debouncedValue, isPending }
}
