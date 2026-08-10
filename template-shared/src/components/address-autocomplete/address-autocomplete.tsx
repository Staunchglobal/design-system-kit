'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/components/crud/use-debounced-value'
import { Input } from '@/components/ui/input'
import { Item, ItemContent, ItemTitle } from '@/components/ui/item'
import {
  fetchPlaceDetails,
  fetchPlacePredictions,
  type PlaceDetails,
  type PlacePrediction,
} from '@/components/address-autocomplete/google-places-client'

type AddressAutocompleteProps = {
  value: string
  onSelect: (details: PlaceDetails) => void
  onValueChange?: (value: string) => void
  country?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

function AddressAutocomplete({
  value,
  onSelect,
  onValueChange,
  country,
  placeholder = 'Start typing an address…',
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const debounced = useDebouncedValue(value, 300)
  const canSearch = Boolean(debounced.trim())
  const [predictions, setPredictions] = React.useState<PlacePrediction[]>([])
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!canSearch) return

    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const results = await fetchPlacePredictions(debounced, { country })
        if (!cancelled) {
          setPredictions(results)
          setOpen(true)
        }
      } catch (err) {
        if (!cancelled) {
          setPredictions([])
          setError(err instanceof Error ? err.message : 'Search failed')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debounced, country, canSearch])

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  async function handleSelect(prediction: PlacePrediction) {
    onValueChange?.(prediction.description)
    setOpen(false)
    try {
      const details = await fetchPlaceDetails(prediction.placeId)
      onSelect(details)
      onValueChange?.(details.formattedAddress || prediction.description)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load place details')
    }
  }

  const visiblePredictions = canSearch ? predictions : []
  const visibleError = canSearch ? error : null
  const visibleLoading = canSearch ? loading : false

  // No client-side "is a key configured" check anymore — the key lives
  // server-side only (see google-places-client.ts's comment), so the
  // client has no key to inspect. An unconfigured server surfaces through
  // the normal error path on the first search instead (visibleError,
  // below), via GOOGLE_PLACES_API_KEY's own "missing" response.

  return (
    <div
      ref={rootRef}
      data-slot="address-autocomplete"
      className={cn('relative', className)}
    >
      <Input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onValueChange?.(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (visiblePredictions.length > 0) setOpen(true)
        }}
      />
      {open && (visiblePredictions.length > 0 || visibleLoading || visibleError) ? (
        <div
          data-slot="address-autocomplete-list"
          className="bg-popover text-popover-foreground ring-foreground/10 absolute z-50 mt-1 w-full overflow-hidden rounded-lg shadow-md ring-1"
        >
          {visibleLoading ? (
            <p className="text-muted-foreground px-3 py-2 text-sm">Searching…</p>
          ) : null}
          {visibleError ? (
            <p className="text-destructive px-3 py-2 text-sm">{visibleError}</p>
          ) : null}
          {!visibleLoading &&
            visiblePredictions.map((p) => (
              <Item
                key={p.placeId}
                size="sm"
                className="hover:bg-muted cursor-pointer rounded-none border-0"
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(p)}
              >
                <ItemContent>
                  <ItemTitle className="line-clamp-2 whitespace-normal">{p.description}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
        </div>
      ) : null}
    </div>
  )
}

export { AddressAutocomplete }
export type { AddressAutocompleteProps }
