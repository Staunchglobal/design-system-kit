import * as React from 'react'

/** Debounces a value with a plain timeout — no external library. */
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

  // No debounce window — return the live value (avoids setState-in-effect sync).
  if (delayMs <= 0) return value
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
